/*
 * Camada de dados do Lume Conecta no Firestore.
 *
 * Estrutura no banco:
 *   usuarios/{uid}                 -> { nome, email, perfil, escopo: '*' | [unidades], ativo }
 *   clientes/{clienteId}           -> { nome, unidades: [], banco, erp, adq }
 *   unidades/{cliente|unidade}     -> configurações da unidade (contas, categorias, regras, processo, aprovações, resumo)
 *     lanc/{b00..b31}              -> { l: { idDoLancamento: {...} } }   lançamentos divididos em 32 blocos
 *     extrato/{b00..b15}           -> { e: { idDaLinha: {...} } }        linhas de extrato divididas em 16 blocos
 *     vendas/{avec_AAAA-MM | sipag_AAAA-MM} -> { rows: [...] }           vendas do sistema e da maquininha por mês
 *
 * Cada lançamento é gravado no próprio campo (mergeFields), então duas pessoas
 * mexendo em lançamentos diferentes do mesmo cliente não apagam o trabalho uma da outra.
 */
const BL = 32, BE = 16;
const hashId = s => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const bloco = (id, n) => 'b' + String(hashId(id) % n).padStart(2, '0');
const MAX_OPS = 400, MAX_BYTES = 4_000_000;

export function criarNuvem(fs, db, util) {
  const { doc, getDoc, getDocs, collection, writeBatch, FieldPath, serverTimestamp, deleteField } = fs;
  const { compacta, expande } = util;
  const fotos = new Map(); // unidade -> { L, E, V, M } : o que já está no banco

  const uRef = k => doc(db, 'unidades', k);

  function metaDe(c) {
    return {
      cliente: c.cliente || '', unidade: c.unidade || '', nomeCliente: c.nomeCliente || '',
      contas: c.contas || [], regras: c.regras || [], aprov: c.aprov || {}, cats: c.cats || [],
      perfil: c.perfil || null, log: (c.log || []).slice(0, 300), real: true, exemplo: false, resumo: c.resumo || null,
      catTipo: c.catTipo || {}, tagsCad: c.tagsCad || [], imports: (c.imports || []).slice(0, 300),
    };
  }
  const semResumo = m => JSON.stringify(Object.assign({}, m, { resumo: null }));

  async function carregar(k) {
    const m = await getDoc(uRef(k));
    if (!m.exists()) return null;
    const [ls, es, vs] = await Promise.all([
      getDocs(collection(db, 'unidades', k, 'lanc')),
      getDocs(collection(db, 'unidades', k, 'extrato')),
      getDocs(collection(db, 'unidades', k, 'vendas')),
    ]);
    const foto = { L: new Map(), E: new Map(), V: new Map(), M: '' };
    const lanc = [];
    ls.forEach(d => { const o = d.data().l || {}; for (const id in o) { const l = expande(o[id]); foto.L.set(id, JSON.stringify(compacta(l))); lanc.push(l); } });
    lanc.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
    const extratos = {};
    es.forEach(d => { const o = d.data().e || {}; for (const id in o) { const { conta, ...it } = o[id]; foto.E.set(id, JSON.stringify(Object.assign({}, it, { conta }))); (extratos[conta] = extratos[conta] || []).push(it); } });
    Object.values(extratos).forEach(a => a.sort((x, y) => (x.data < y.data ? -1 : 1)));
    const vendas = { avec: [], sipag: [] };
    vs.forEach(d => { const r = d.data().rows || []; foto.V.set(d.id, JSON.stringify(r)); if (d.id.startsWith('avec_')) vendas.avec.push(...r); else if (d.id.startsWith('sipag_')) vendas.sipag.push(...r); });
    const meta = m.data(); delete meta.atualizado;
    const c = Object.assign({}, meta, { lanc, extratos, vendas });
    foto.M = semResumo(metaDe(c));
    fotos.set(k, foto);
    return c;
  }

  async function gravar(ops) {
    let lote = [], bytes = 0;
    const enviar = async () => { if (!lote.length) return; const b = writeBatch(db); lote.forEach(([r, d, o]) => (o ? b.set(r, d, o) : b.set(r, d))); await b.commit(); lote = []; bytes = 0; };
    for (const op of ops) {
      const t = op[3] || 1000;
      if (lote.length >= MAX_OPS || bytes + t > MAX_BYTES) await enviar();
      lote.push(op); bytes += t;
    }
    await enviar();
  }

  async function salvar(k, c, novo) {
    let foto = fotos.get(k);
    if (!foto || novo) { foto = { L: new Map(), E: new Map(), V: new Map(), M: '' }; fotos.set(k, foto); }
    const ops = [], depois = [];
    // lançamentos
    const bl = {};
    for (const l of c.lanc || []) {
      const cp = compacta(l), j = JSON.stringify(cp);
      if (foto.L.get(l.id) !== j) { (bl[bloco(l.id, BL)] = bl[bloco(l.id, BL)] || {})[l.id] = cp; depois.push(() => foto.L.set(l.id, j)); }
    }
    const vivosL = new Set((c.lanc || []).map(l => l.id));
    for (const id of [...foto.L.keys()]) if (!vivosL.has(id)) { (bl[bloco(id, BL)] = bl[bloco(id, BL)] || {})[id] = deleteField(); depois.push(() => foto.L.delete(id)); }
    for (const b in bl) { const ids = Object.keys(bl[b]); ops.push([doc(db, 'unidades', k, 'lanc', b), { l: bl[b] }, { mergeFields: ids.map(id => new FieldPath('l', id)) }, JSON.stringify(bl[b]).length]); }
    // extratos
    const be = {};
    for (const conta in c.extratos || {}) for (const it of c.extratos[conta]) {
      const o = Object.assign({}, it, { conta }), j = JSON.stringify(o);
      if (foto.E.get(it.id) !== j) { (be[bloco(it.id, BE)] = be[bloco(it.id, BE)] || {})[it.id] = o; depois.push(() => foto.E.set(it.id, j)); }
    }
    const vivosE = new Set(); for (const conta in c.extratos || {}) for (const it of c.extratos[conta]) vivosE.add(it.id);
    for (const id of [...foto.E.keys()]) if (!vivosE.has(id)) { (be[bloco(id, BE)] = be[bloco(id, BE)] || {})[id] = deleteField(); depois.push(() => foto.E.delete(id)); }
    for (const b in be) { const ids = Object.keys(be[b]); ops.push([doc(db, 'unidades', k, 'extrato', b), { e: be[b] }, { mergeFields: ids.map(id => new FieldPath('e', id)) }, JSON.stringify(be[b]).length]); }
    // vendas por mês
    const grupos = {};
    (c.vendas?.avec || []).forEach(a => { const g = 'avec_' + String(a.d).slice(0, 7); (grupos[g] = grupos[g] || []).push(a); });
    (c.vendas?.sipag || []).forEach(s => { const g = 'sipag_' + String(s.dt).slice(0, 7); (grupos[g] = grupos[g] || []).push(s); });
    for (const g of foto.V.keys()) if (!grupos[g] && foto.V.get(g) !== '[]') grupos[g] = [];
    for (const g in grupos) { const j = JSON.stringify(grupos[g]); if (foto.V.get(g) !== j) { ops.push([doc(db, 'unidades', k, 'vendas', g), { rows: grupos[g] }, null, j.length]); depois.push(() => foto.V.set(g, j)); } }
    // configurações da unidade
    const meta = metaDe(c), mj = semResumo(meta);
    if (novo || mj !== foto.M || ops.length) { ops.push([uRef(k), Object.assign({}, meta, { atualizado: serverTimestamp() }), null, mj.length]); depois.push(() => { foto.M = mj; }); }
    await gravar(ops);
    depois.forEach(f => f());
    return ops.length;
  }

  async function existeUnidade(k) { return (await getDoc(uRef(k))).exists(); }

  async function resumos(ks) {
    const out = {};
    await Promise.all(ks.map(async k => { try { const d = await getDoc(uRef(k)); if (d.exists()) { const m = d.data(); out[k] = { resumo: m.resumo || null, aprov: m.aprov || {} }; } } catch (e) { /* sem acesso: fica vazio */ } }));
    return out;
  }

  return { carregar, salvar, existeUnidade, resumos, _fotos: fotos, _bloco: bloco };
}
