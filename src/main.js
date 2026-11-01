import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail,
  createUserWithEmailAndPassword, setPersistence, browserSessionPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, doc, getDoc, getDocs, setDoc, collection, writeBatch, FieldPath, serverTimestamp, deleteField,
  addDoc, updateDoc, deleteDoc, onSnapshot,
} from 'firebase/firestore';
import { criarNuvem } from './nuvem.js';

/* E-mail da Master. Precisa ser o mesmo que está em firestore.rules. */
const MASTER_EMAIL = 'contato@lumefinancas.com.br';

/* Configuração do projeto lume-conecta no Firebase.
   Não é senha: só indica qual banco usar. Quem protege os dados são o login e o firestore.rules.
   Se quiser trocar sem mexer no código, defina as variáveis VITE_FIREBASE_* na Vercel. */
const env = import.meta.env;
const cfg = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDbqaEd4ktQNFu4xauOxyzXxqN8Qi-eoGY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'lume-conecta.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'lume-conecta',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'lume-conecta.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '591845489110',
  appId: env.VITE_FIREBASE_APP_ID || '1:591845489110:web:fff5197c2a08566381cc77',
};

const $ = s => document.querySelector(s);
function aviso(t) { const m = $('#lErr'); m.textContent = t; m.hidden = !t; }
function carregandoLogin(on) { const b = $('#fLogin .go'); if (b) { b.disabled = on; b.textContent = on ? 'Entrando…' : 'Entrar'; } }

if (!cfg.apiKey || !cfg.projectId) {
  aviso('O sistema ainda não está ligado ao Firebase. Confira as variáveis VITE_FIREBASE_* na Vercel e publique de novo.');
} else {
  iniciar();
}

function iniciar() {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  auth.languageCode = 'pt-BR';
  const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
  setPersistence(auth, browserSessionPersistence).catch(() => {});

  const nuvem = criarNuvem(
    { doc, getDoc, getDocs, collection, writeBatch, FieldPath, serverTimestamp, deleteField },
    db,
    { compacta: window.compacta, expande: window.expande },
  );

  /* Ponte para o painel "Contas a pagar · Lume" (public/pagamentos.html), aberto dentro do sistema.
     Ele usa o mesmo login e o mesmo banco protegido; as regras do Firestore conferem a permissão. */
  window.LumePag = criarPonte(db, auth);

  let appCadastro = null; // segunda conexão, só para criar usuários sem derrubar o login da Master

  window.LumeNuvem = {
    carregar: nuvem.carregar,
    salvar: nuvem.salvar,
    existeUnidade: nuvem.existeUnidade,
    resumos: nuvem.resumos,
    async salvarCliente(c) {
      const { id, ...dados } = c;
      await setDoc(doc(db, 'clientes', id), dados);
    },
    async listarUsuarios() {
      const s = await getDocs(collection(db, 'usuarios'));
      const out = []; s.forEach(d => out.push(Object.assign({ uid: d.id }, d.data())));
      return out.sort((a, b) => (a.perfil === 'master' ? -1 : b.perfil === 'master' ? 1 : a.nome.localeCompare(b.nome)));
    },
    async criarUsuario(u) {
      if (!appCadastro) appCadastro = initializeApp(cfg, 'cadastro');
      const authCad = getAuth(appCadastro);
      const senhaTemporaria = crypto.getRandomValues(new Uint32Array(4)).join('-') + 'Aa!';
      const cred = await createUserWithEmailAndPassword(authCad, u.email, senhaTemporaria);
      await setDoc(doc(db, 'usuarios', cred.user.uid), u);
      await signOut(authCad);
      await sendPasswordResetEmail(auth, u.email);
    },
    async salvarUsuario(uid, u) { await setDoc(doc(db, 'usuarios', uid), u); },
    esqueci: email => sendPasswordResetEmail(auth, email),
    sair: () => signOut(auth),
  };

  $('#fLogin').onsubmit = async e => {
    e.preventDefault(); aviso(''); carregandoLogin(true);
    try {
      await signInWithEmailAndPassword(auth, $('#lEmail').value.trim(), $('#lPass').value);
      $('#lPass').value = '';
    } catch (err) {
      carregandoLogin(false);
      const c = err.code || '';
      aviso(c.includes('invalid') || c.includes('wrong-password') || c.includes('user-not-found')
        ? 'E-mail ou senha incorretos.'
        : c.includes('too-many-requests') ? 'Muitas tentativas. Aguarde alguns minutos ou use “Esqueci minha senha”.'
          : c.includes('network') ? 'Sem conexão com a internet.' : 'Não consegui entrar (' + c + ').');
    }
  };
  $('#lEsqueci').onclick = async () => {
    const email = $('#lEmail').value.trim();
    if (!email) { aviso('Digite seu e-mail acima e toque de novo em “Esqueci minha senha”.'); return; }
    try { await sendPasswordResetEmail(auth, email); aviso('Se esse e-mail tiver acesso, chega uma mensagem para criar uma nova senha. Olhe também o spam.'); }
    catch (err) { aviso('Não consegui enviar o e-mail agora.'); }
  };

  onAuthStateChanged(auth, async user => {
    if (!user) { window.LumePag.definirUsuario(null); carregandoLogin(false); $('#app').hidden = true; $('#login').hidden = false; return; }
    try {
      const ref = doc(db, 'usuarios', user.uid);
      let s = await getDoc(ref), u;
      if (!s.exists()) {
        if ((user.email || '').toLowerCase() === MASTER_EMAIL) {
          u = { nome: 'Polyana', email: user.email.toLowerCase(), perfil: 'master', escopo: '*', ativo: true };
          await setDoc(ref, u);
        } else { aviso('Seu acesso ainda não foi liberado. Fale com a Lume.'); await signOut(auth); return; }
      } else u = s.data();
      if (u.ativo === false) { aviso('Seu acesso está desativado. Fale com a Lume.'); await signOut(auth); return; }

      const clientes = [];
      if (u.perfil === 'cliente') {
        for (const k of u.escopo || []) {
          try {
            const m = await getDoc(doc(db, 'unidades', k));
            if (!m.exists()) continue;
            const d = m.data();
            let c = clientes.find(x => x.id === d.cliente);
            if (!c) { c = { id: d.cliente, nome: d.nomeCliente, unidades: [], banco: '', erp: '', adq: '' }; clientes.push(c); }
            c.unidades.push(d.unidade);
          } catch (e) { /* unidade sem acesso */ }
        }
      } else {
        const cs = await getDocs(collection(db, 'clientes'));
        cs.forEach(d => clientes.push(Object.assign({ id: d.id }, d.data())));
        clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
      }
      carregandoLogin(false);
      window.LumePag.definirUsuario(u);
      window.entrarNuvem(Object.assign({ id: user.uid }, u), clientes);
    } catch (err) {
      console.error(err); carregandoLogin(false);
      aviso('Não consegui abrir seu acesso (' + (err.code || err.message) + '). Confira se as regras do Firestore foram publicadas.');
      await signOut(auth);
    }
  });
}

/* Mesma "cara" da biblioteca antiga do Firebase (db.collection(...).doc(...)),
   para o painel de pagamentos funcionar sem reescrever cada tela. */
function criarPonte(db, auth) {
  /* O painel roda numa janela interna (iframe). Objetos criados lá não são aceitos pelo
     Firestore daqui ("invalid-argument"), então copiamos tudo para objetos desta janela. */
  const sentinelas = new WeakSet();
  const plano = v => {
    if (v === null || typeof v !== 'object') return v;
    if (sentinelas.has(v)) return v;
    if (Array.isArray(v)) { const a = []; for (const x of v) a.push(plano(x)); return a; }
    if (typeof v.toDate === 'function' && 'seconds' in v) return new Date(v.toDate().getTime());
    if (typeof v.getTime === 'function') return new Date(v.getTime());
    const o = {}; for (const k of Object.keys(v)) { if (v[k] !== undefined) o[k] = plano(v[k]); } return o;
  };
  const docS = r => ({
    id: r.id, _r: r,
    update: d => updateDoc(r, plano(d)),
    set: (d, o) => setDoc(r, plano(d), plano(o || {})),
    delete: () => deleteDoc(r),
    get: () => getDoc(r).then(x => ({ id: x.id, exists: x.exists(), data: () => x.data() })),
  });
  const snapS = s => {
    const docs = s.docs.map(d => ({ id: d.id, data: () => d.data(), ref: docS(d.ref) }));
    return { docs, size: docs.length, empty: !docs.length, metadata: { fromCache: s.metadata.fromCache, hasPendingWrites: s.metadata.hasPendingWrites }, forEach: f => docs.forEach(f) };
  };
  const colS = n => {
    const c = collection(db, n);
    return {
      doc: id => docS(id ? doc(db, n, id) : doc(c)),
      add: d => addDoc(c, plano(d)).then(docS),
      get: () => getDocs(c).then(snapS),
      onSnapshot: (ok, erro) => onSnapshot(c, s => ok(snapS(s)), erro),
    };
  };
  const dbS = {
    collection: colS,
    batch: () => {
      const b = writeBatch(db);
      return { set: (r, d, o) => { b.set(r._r, plano(d), plano(o || {})); }, update: (r, d) => { b.update(r._r, plano(d)); }, delete: r => { b.delete(r._r); }, commit: () => b.commit() };
    },
  };
  let perfil = null;
  return {
    db: dbS,
    apagarCampo: () => { const f = deleteField(); sentinelas.add(f); return f; },
    definirUsuario: u => { perfil = u; },
    usuario: () => (auth.currentUser && perfil ? { nome: perfil.nome, perfil: perfil.perfil, pagar: perfil.perfil === 'master' || perfil.pagar === true, agenda: perfil.perfil === 'master' || perfil.agenda === true } : null),
  };
}
