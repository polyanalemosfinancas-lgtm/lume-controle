/* =====================================================================
   MÓDULO 3 · importação segura, categorias em árvore, relatórios com filtros,
   ajustes no caixa e menu recolhível. Carregado depois de app.js.
   ===================================================================== */

/* ---------- download de arquivos (sistema publicado) ---------- */
baixar=async function(nome,wb){try{XLSX.writeFile(wb,nome);toast('Arquivo baixado: '+nome)}catch(e){console.error(e);toast('Não consegui gerar o arquivo agora.')}};

/* ---------- confirmação genérica ---------- */
function confirmar(titulo,corpo,botao){return new Promise(res=>{let ok=false;abrirModal(`<div class="mhead"><h3>${titulo}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div><div class="mbody">${corpo}</div><div class="mfoot"><button class="btn" type="button" data-close>Cancelar</button><button class="btn primary" type="button" id="cfOk">${botao||'Confirmar'}</button></div>`);
 const m=$('#modal');const obs=new MutationObserver(()=>{if(m.hidden){obs.disconnect();res(ok)}});obs.observe(m,{attributes:true,attributeFilter:['hidden']});$('#cfOk').onclick=()=>{ok=true;fecharModal()}})}

/* ---------- histórico de importações ---------- */
const TIPO_IMP={md:'Histórico (planilha de lançamentos)',extrato:'Extrato bancário',avec:'Vendas do sistema',sipag:'Maquininha · vendas realizadas',recebidas:'Maquininha · vendas recebidas',gerar:'Contas a receber geradas'};
function novaImp(tipo,arquivos,extra){const c=C();if(!c.imports)c.imports=[];const imp=Object.assign({id:'imp'+nid(),tipo,arquivos,quando:new Date().toISOString(),quem:st.user.nome,n:0},extra||{});c.imports.unshift(imp);return imp}
function marcarNovos(antes,imp){let n=0;C().lanc.forEach(l=>{if(!antes.has(l.id)){l.imp=imp.id;n++}});imp.n=(imp.n||0)+n;return n}
function desfazerImp(id){const c=C();const imp=(c.imports||[]).find(x=>x.id===id);if(!imp||imp.desfeito)return 0;let n=0;
 if(['md','gerar','recebidas'].includes(imp.tipo)){const sai=c.lanc.filter(l=>l.imp===id);sai.forEach(l=>{if(l.extId)desvincularExt(l)});const ids=new Set(sai.map(l=>l.id));c.lanc=c.lanc.filter(l=>!ids.has(l.id));n=sai.length;
  if(imp.saldoAnt)Object.entries(imp.saldoAnt).forEach(([nome,v])=>{const k=c.contas.find(x=>x.nome===nome);if(k)k.saldoIni=v})}
 if(imp.tipo==='extrato'){Object.keys(c.extratos).forEach(conta=>{const arr=c.extratos[conta];arr.filter(i=>i.imp===id).forEach(i=>{(i.lanc||[]).forEach(lid=>{const l=c.lanc.find(x=>x.id===lid);if(!l)return;if(l.obs==='Importado do extrato'||l.card?.kind==='ant'&&String(l.card.key).startsWith('ant|')){c.lanc=c.lanc.filter(x=>x.id!==l.id)}else{l.extId=null;if(l.status==='Conciliado')l.status='Confirmado'}});n++});c.extratos[conta]=arr.filter(i=>i.imp!==id)})}
 if(imp.tipo==='avec'){const a=c.vendas.avec.length;c.vendas.avec=c.vendas.avec.filter(r=>r.imp!==id);n=a-c.vendas.avec.length}
 if(imp.tipo==='sipag'){const a=c.vendas.sipag.length;c.vendas.sipag=c.vendas.sipag.filter(r=>r.imp!==id);n=a-c.vendas.sipag.length}
 imp.desfeito={quando:new Date().toISOString(),quem:st.user.nome,n};log('Importação desfeita',(TIPO_IMP[imp.tipo]||imp.tipo)+' · '+imp.arquivos.join(', ')+' · '+n+' itens');save();return n}
function painelImports(){const c=C();const L=(c.imports||[]).slice(0,60);const pode_=st.user.perfil==='master';
 return `<div class="panel"><div class="panel-head"><div><h3>Histórico de importações</h3><span class="note">Tudo o que foi subido neste cliente. Subiu errado? Desfaça e suba de novo.</span></div></div>
 <div class="tbl"><table><thead><tr><th>Quando</th><th>O quê</th><th>Arquivo</th><th>Quem</th><th class="r">Itens</th><th></th></tr></thead><tbody>
 ${L.map(i=>`<tr><td class="note num">${new Date(i.quando).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}</td><td>${esc(TIPO_IMP[i.tipo]||i.tipo)}${i.conta?`<br><span class="note">Conta ${esc(i.conta)}</span>`:''}${i.mes?`<br><span class="note">${mNome(i.mes)}</span>`:''}</td><td class="note" style="max-width:260px;overflow-wrap:anywhere">${esc(i.arquivos.join(', '))}</td><td>${esc(i.quem)}</td><td class="r num">${i.n||0}</td>
  <td>${i.desfeito?`<span class="pill p-n">Desfeita · ${esc(i.desfeito.quem)}</span>`:pode_?`<button class="btn ghost" type="button" data-desf="${i.id}">Desfazer</button>`:''}</td></tr>`).join('')||'<tr><td colspan="6" class="note">Nenhuma importação registrada ainda.</td></tr>'}</tbody></table></div></div>`}
function bindImports(re){$$('[data-desf]').forEach(b=>b.onclick=async()=>{const c=C();const imp=c.imports.find(x=>x.id===b.dataset.desf);
 const aviso={md:'Os lançamentos que vieram deste arquivo serão removidos, inclusive os que já foram conciliados.',extrato:'As linhas deste extrato saem da conciliação. Lançamentos criados a partir delas são removidos; os demais voltam a ficar sem conciliar.',gerar:'Os recebíveis e taxas gerados nesta ação serão removidos.',recebidas:'Os recebíveis criados por este relatório serão removidos. Datas de recebimento já atualizadas não voltam.',avec:'As vendas deste arquivo saem da conferência.',sipag:'As vendas deste arquivo saem da conferência. Recebíveis já gerados continuam.'}[imp.tipo]||'';
 if(!await confirmar('Desfazer importação',`<p style="margin:0"><b>${esc(TIPO_IMP[imp.tipo]||imp.tipo)}</b> · ${esc(imp.arquivos.join(', '))}<br><span class="note">${new Date(imp.quando).toLocaleString('pt-BR')} · ${esc(imp.quem)} · ${imp.n||0} itens</span></p><p class="note" style="margin:0">${aviso}</p>`,'Desfazer'))return;
 const n=desfazerImp(imp.id);st.cx.contas=null;toast('Importação desfeita · '+n+' itens removidos');re()})}

/* ---------- importar e exportar (Meu Dinheiro / modelo Lume) ---------- */
function modeloImportacao(){const ex=[['Despesa','Confirmado','05/11/2026','',-350,'Aluguel novembro','01 - Despesas Fixas/Aluguel','Sicoob','','','Sem contato','Sem forma pagto.','Sem projeto','','','05/11/2026','','Fixo','','Único','',''],['Receita','Pendente','10/11/2026','',1200,'Cliente X - serviço','02 - Serviço - Pix','Sicoob','','','Sem contato','Sem forma pagto.','Sem projeto','','','10/11/2026','','','','Único','',''],['Transferência','Confirmado','12/11/2026','',-500,'Aplicação','Transferência','Sicoob','Aplicação','','Sem contato','Sem forma pagto.','Sem projeto','','','','','','','Único','','']];
 const ws=XLSX.utils.aoa_to_sheet([MD_COLS,...ex]);ws['!cols']=MD_COLS.map(()=>({wch:16}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Lançamentos');
 const ori=XLSX.utils.aoa_to_sheet([['Como preencher'],['Uma linha por lançamento. Pode apagar as linhas de exemplo.'],['Tipo: Despesa, Receita ou Transferência'],['Status: Pendente, Agendado, Confirmado ou Conciliado'],['Data: dd/mm/aaaa'],['Valor: despesa negativa, receita positiva. Transferência negativa sai da Conta e entra na Conta transferência.'],['Categoria: Categoria/Subcategoria, igual ao plano de contas do cliente'],['Conta: nome exatamente igual ao cadastrado no sistema'],['Tags: separadas por vírgula'],['Repetição: Único, Fixo ou Parcelado'],['ID Único: deixe em branco. O sistema cria sozinho.']]);ori['!cols']=[{wch:100}];XLSX.utils.book_append_sheet(wb,ori,'Como preencher');
 baixar('Modelo_importacao_Lume.xlsx',wb)}
vMD=function(){const c=C();
 $('#view').innerHTML=topo('Trazer e levar dados','Importar e exportar')+`
 <div class="grid2"><div class="panel"><h3>Importar lançamentos</h3><label class="drop" id="dMD"><b>Arraste a planilha de lançamentos (.xlsx ou .csv)</b><small>Aceita o export de lançamentos do Meu Dinheiro (22 colunas) ou o modelo da Lume. Pode mandar vários arquivos de uma vez.</small><input type="file" id="dMD-in" accept=".xlsx,.xls,.csv" multiple hidden></label>
  <div class="scope"><button class="btn" type="button" id="mdModelo">Baixar modelo de importação</button></div>
  <p class="note" style="margin:0">Antes de gravar, o sistema mostra quantos lançamentos vão entrar e em qual cliente. Linhas com o mesmo <b>ID Único</b> não entram duas vezes.</p></div>
 <div class="panel"><h3>Exportar lançamentos</h3><div class="form"><div class="row"><label>De<input type="date" id="mdI" value="${mAdd(HOJE.slice(0,7),-3)}-01"></label><label>Até<input type="date" id="mdF" value="${HOJE}"></label></div></div>
  <div><button class="btn primary" type="button" id="mdExp">Exportar .xlsx</button></div><p class="note" style="margin:0">Mesmas 22 colunas do Meu Dinheiro. Serve de backup mensal e volta para o Meu Dinheiro ou para este sistema.</p></div></div>
 <div class="panel"><div class="kv num"><span>Lançamentos neste cliente</span><span>${ativos().length}</span><span>Período</span><span>${c.lanc.length?fdl(c.lanc.reduce((a,l)=>l.data<a?l.data:a,'9999'))+' a '+fdl(c.lanc.reduce((a,l)=>l.data>a?l.data:a,'0000')):'—'}</span><span>Contas</span><span>${c.contas.map(k=>esc(k.nome)).join(', ')}</span></div></div>
 ${painelImports()}
 ${st.user.perfil==='master'?`<div class="panel zona"><div class="panel-head"><div><h3>Zerar dados deste cliente</h3><span class="note">Apaga todos os lançamentos, extratos, vendas e regras aprendidas de <b>${esc(nomeEsc(st.scope))}</b> e volta ao cadastro inicial. Use quando subiu arquivos na empresa errada. Não dá para desfazer.</span></div><button class="btn perigo" type="button" id="zerar">Zerar dados</button></div></div>`:''}`;
 bindScope();bindImports(vMD);if($('#zerar'))$('#zerar').onclick=zerarCliente;$('#mdModelo').onclick=modeloImportacao;
 $('#mdExp').onclick=()=>exportarMD(ativos().filter(l=>l.data>=$('#mdI').value&&l.data<=$('#mdF').value),'Lancamentos_'+nomeEsc(st.scope).replace(/\W+/g,'_'));
 bindDrop('dMD',async fs=>{const novos=[],sis=[],nomes=[];let dup=0,dupT=0,ruins=[];const ids=new Set(c.lanc.map(l=>String(l.uid)));
  /* transferência entre duas contas aparece no export de cada conta (com ID diferente): conta uma vez só */
  const chT=l=>l.data+'|'+Math.abs(l.valor).toFixed(2)+'|'+[l.conta,l.ctr].sort().join('>');const baseT={};ativos().forEach(l=>{if(l.tipo==='Transferência'){const k=chT(l);baseT[k]=(baseT[k]||0)+1}});const porArq={};
  for(const f of fs){const fi=nomes.length;try{const rows=await lerPlanilha(f);if(!rows.length||!('Tipo' in rows[0])||!('Valor' in rows[0])){ruins.push(f.name);continue}nomes.push(f.name);
   rows.forEach(r=>{const tp=String(r['Tipo']||'').trim();if(/saldo inicial/i.test(tp)){const _k=c.contas.find(x=>x.nome===String(r['Conta']||'').trim());if(_k&&Math.abs((_k.saldoIni||0)-r2(parseNum(r['Valor'])))<.005)return;sis.push({conta:String(r['Conta']||'').trim(),v:r2(parseNum(r['Valor'])),d:toYmd(r['Data'])});return}
    const l=mdParaLanc(r);if(!l)return;mdAjuste(l);if(l.tipo==='Transferência'&&l.valor>0){const t=l.conta;l.conta=l.ctr;l.ctr=t}if(l.tipo==='Transferência')l.valor=Math.abs(l.valor);
    if(!r['ID Único']&&r['ID Único']!==0)l.uid='lume'+nid();if(ids.has(String(l.uid))){dup++;return}
    if(l.tipo==='Transferência'){const k=chT(l);const m=porArq[k]=porArq[k]||{};m[fi]=(m[fi]||0)+1;const outros=Math.max(baseT[k]||0,...Object.entries(m).filter(([x])=>+x!==fi).map(([,n])=>n));if(m[fi]<=outros){dupT++;return}}
    ids.add(String(l.uid));novos.push(l)})}catch(e){console.error(e);ruins.push(f.name)}}
  if(ruins.length)toast('Não reconheci: '+ruins.join(', ')+'. Use o export de lançamentos do Meu Dinheiro ou o modelo da Lume.');
  if(!novos.length&&!sis.length){if(!ruins.length)toast('Nada novo para importar'+(dup?' · '+dup+' lançamentos já existiam':''));return}
  const contasNovas=[...new Set(novos.flatMap(l=>[l.conta,l.ctr]).filter(n=>n&&!c.contas.some(k=>k.nome===n)))];
  const per=novos.length?fdl(novos.reduce((a,l)=>l.data<a?l.data:a,'9999'))+' a '+fdl(novos.reduce((a,l)=>l.data>a?l.data:a,'0000')):'';
  if(!await confirmar('Confirmar importação',`<p style="margin:0">Importar <b>${novos.length} lançamentos</b> em <b>${esc(nomeEsc(st.scope))}</b>?</p><div class="kv"><span>Arquivos</span><span>${esc(nomes.join(', '))}</span><span>Período</span><span>${per||'—'}</span>${dup?`<span>Já existiam (ignorados)</span><span>${dup}</span>`:''}${dupT?`<span>Transferências repetidas entre contas (contadas uma vez)</span><span>${dupT}</span>`:''}${sis.length?`<span>Saldo inicial</span><span>${sis.map(s=>esc(s.conta)+' '+brl(s.v)).join(', ')}</span>`:''}${contasNovas.length?`<span>Contas novas</span><span>${esc(contasNovas.join(', '))}</span>`:''}</div><p class="note" style="margin:0">Se for o cliente errado, cancele e troque o cliente no topo da tela.</p>`,'Importar'))return;
  const imp=novaImp('md',nomes,{saldoAnt:{}});
  sis.forEach(s=>{let k=c.contas.find(x=>x.nome===s.conta);if(!k){k={nome:s.conta,tipo:'banco',saldoIni:0};c.contas.push(k)}imp.saldoAnt[s.conta]=k.saldoIni||0;k.saldoIni=s.v;k.saldoData=s.d});
  novos.forEach(l=>{l.imp=imp.id;c.lanc.push(l);[l.conta,l.ctr].forEach(n=>{if(n&&!c.contas.some(k=>k.nome===n)){const cart=/cart[aã]o/i.test(n)||!!l.venc;c.contas.push(cart?{nome:n,tipo:'cartao',saldoIni:0,fecha:9,vence:10,debito:c.contas.find(k=>k.tipo==='banco')?.nome||''}:{nome:n,tipo:'banco',saldoIni:0})}});if(l.cat&&!c.cats.includes(l.cat))c.cats.push(l.cat)});
  /* conta de dinheiro: se o Meu Dinheiro chama de "Dinheiro" e a padrão está vazia, usa a do Meu Dinheiro */
  const pd=c.perfil&&c.perfil.padroes;if(pd&&pd.contaDin&&pd.contaDin!=='Dinheiro'&&c.contas.some(k=>k.nome==='Dinheiro')&&!c.lanc.some(l=>l.conta===pd.contaDin||l.ctr===pd.contaDin)){c.contas=c.contas.filter(k=>k.nome!==pd.contaDin);pd.contaDin='Dinheiro'}
  imp.n=novos.length;c.exemplo=false;c.lanc.sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0);ativos().forEach(aprender);const en=enriquecerCartoes();log('Importação de lançamentos',novos.length+' · '+nomes.join(', '));save();
  toast(novos.length+' lançamentos importados'+(dup?' · '+dup+' já existiam':'')+(dupT?' · '+dupT+' transferências repetidas ignoradas':'')+(en?' · '+en+' recebíveis ligados à maquininha':''));st.cx.contas=null;vMD()})};

/* ---------- extrato: confirmação e registro ---------- */
const _vConcM3=vConc;
vConc=function(){_vConcM3();const conta=st.conc.conta;if(!$('#dExt'))return;
 bindDrop('dExt',async files=>{const c=C();const ex=extDe(conta);const novos=[],nomes=[],erro=[];let dup=0;const ks=new Set(ex.map(e=>e.k));
  for(const f of files){try{const tx=await lerArquivoExtrato(f);if(!tx.length){erro.push(f.name);continue}nomes.push(f.name);const occ={};
   tx.forEach(t=>{const b=t.data+'|'+t.valor.toFixed(2);occ[b]=(occ[b]||0)+1;const k=b+'|'+occ[b];if(ks.has(k)){dup++;return}ks.add(k);novos.push({id:nid(),k,...t,status:'pendente',arq:f.name})})}catch(e){console.error(e);erro.push(f.name)}}
  if(erro.length)toast('Não consegui ler: '+erro.join(', '));if(!novos.length){if(nomes.length)toast('Nada novo · '+dup+' linhas já estavam no extrato');return}
  const per=fdl(novos.reduce((a,i)=>i.data<a?i.data:a,'9999'))+' a '+fdl(novos.reduce((a,i)=>i.data>a?i.data:a,'0000'));const ent=r2(novos.filter(i=>i.valor>0).reduce((a,i)=>a+i.valor,0)),sai=r2(novos.filter(i=>i.valor<0).reduce((a,i)=>a+i.valor,0));
  if(!await confirmar('Confirmar extrato',`<p style="margin:0">Importar <b>${novos.length} linhas</b> no extrato da conta <b>${esc(conta)}</b> de <b>${esc(nomeEsc(st.scope))}</b>?</p><div class="kv num"><span>Arquivos</span><span>${esc(nomes.join(', '))}</span><span>Período</span><span>${per}</span><span>Entradas</span><span class="pos">${brl(ent)}</span><span>Saídas</span><span class="neg">${brl(sai)}</span>${dup?`<span>Já estavam (ignoradas)</span><span>${dup}</span>`:''}</div><p class="note" style="margin:0">Confira se é a conta certa. Para trocar, cancele e escolha a conta no topo.</p>`,'Importar'))return;
  const imp=novaImp('extrato',nomes,{conta,n:novos.length});novos.forEach(i=>{i.imp=imp.id;ex.push(i)});log('Extrato importado',conta+' · '+novos.length+' linhas');save();toast(novos.length+' linhas importadas'+(dup?' · '+dup+' repetidas ignoradas':''));vConc()})};

/* ---------- vendas: confirmação e registro ---------- */
function bindVendasImports(){const c=C();
 if($('#dAvec'))bindDrop('dAvec',async fs=>{const rows=[],nomes=[];let d=0;const ks=new Set(c.vendas.avec.map(a=>a.d+'|'+a.com+'|'+a.cli+'|'+a.p+'|'+a.forma+'|'+a.v));
  for(const f of fs){try{const r=avecLe(await lerPlanilha(f));if(!r.length){toast(f.name+': não encontrei as colunas Data, Título, Forma de Pagamento e Valor');continue}nomes.push(f.name);r.forEach(a=>{const k=a.d+'|'+a.com+'|'+a.cli+'|'+a.p+'|'+a.forma+'|'+a.v;if(ks.has(k)){d++;return}ks.add(k);rows.push(a)})}catch(e){toast('Não consegui ler '+f.name)}}
  if(!rows.length){if(nomes.length)toast('Nada novo · '+d+' vendas já estavam importadas');return}
  const per=fdl(rows.reduce((a,r)=>r.d<a?r.d:a,'9999'))+' a '+fdl(rows.reduce((a,r)=>r.d>a?r.d:a,'0000'));
  if(!await confirmar('Confirmar vendas do sistema',`<p style="margin:0">Importar <b>${rows.length} vendas</b> em <b>${esc(nomeEsc(st.scope))}</b>?</p><div class="kv num"><span>Arquivos</span><span>${esc(nomes.join(', '))}</span><span>Período</span><span>${per}</span><span>Total</span><span>${brl(rows.reduce((a,r)=>a+r.v,0))}</span>${d?`<span>Já estavam (ignoradas)</span><span>${d}</span>`:''}</div>`,'Importar'))return;
  const imp=novaImp('avec',nomes,{n:rows.length});rows.forEach(r=>{r.imp=imp.id;c.vendas.avec.push(r)});const ms=[...new Set(c.vendas.avec.map(a=>a.d.slice(0,7)))].sort();st.vend.mes=ms[ms.length-1];log('Vendas do sistema importadas',rows.length+' linhas');save();toast(rows.length+' vendas importadas');vVendas()});
 if($('#dSip'))bindDrop('dSip',async fs=>{const lidos=[];for(const f of fs){try{const r=sipagLe(decode(await f.arrayBuffer()));if(!r){toast(f.name+': formato não reconhecido');continue}lidos.push({f,r})}catch(e){toast('Não consegui ler '+f.name)}}
  if(!lidos.length)return;const resumo=lidos.map(({f,r})=>`<span>${r.recebidas?'Vendas recebidas':'Vendas realizadas'}</span><span>${esc(f.name)} · ${r.rows.length} parcelas</span>`).join('');
  if(!await confirmar('Confirmar relatórios da maquininha',`<p style="margin:0">Importar em <b>${esc(nomeEsc(st.scope))}</b>?</p><div class="kv">${resumo}</div>`,'Importar'))return;
  const msg=[];for(const {f,r} of lidos){if(r.recebidas){const antes=new Set(c.lanc.map(l=>l.id));const imp=novaImp('recebidas',[f.name]);const x=aplicarRecebidas(r.rows);marcarNovos(antes,imp);imp.atualizados=x.atual;msg.push('Recebidas: '+x.ja+' já baixadas · '+x.atual+' datas atualizadas ('+x.ant+' antecipadas) · '+x.novos+' recebíveis criados')}
   else{const imp=novaImp('sipag',[f.name]);const ks=new Map(c.vendas.sipag.map((s,i)=>[s.idv+'|'+s.parc,i]));let n=0;r.rows.forEach(s=>{const k=s.idv+'|'+s.parc;if(s.parc===0&&c.vendas.sipag.some(o=>o.idv===s.idv))return;if(ks.has(k)){c.vendas.sipag[ks.get(k)]=Object.assign(s,{imp:c.vendas.sipag[ks.get(k)].imp});return}s.imp=imp.id;ks.set(k,c.vendas.sipag.length);c.vendas.sipag.push(s);n++});
    c.vendas.sipag=c.vendas.sipag.filter(s=>!(s.parc===0&&c.vendas.sipag.some(o=>o.idv===s.idv&&o.parc>0)));imp.n=n;enriquecerCartoes();msg.push('Realizadas: '+n+' parcelas novas')}}
  log('Maquininha importada',msg.join(' · '));save();toast(msg.join(' · '));vVendas()})};
const _gerarM3=gerarReceber;
gerarReceber=function(ym,o,R){const c=C();const antes=new Set(c.lanc.map(l=>l.id));const imp=novaImp('gerar',['Conferência de '+mNome(ym)],{mes:ym});const r=_gerarM3(ym,o,R);const n=marcarNovos(antes,imp);if(!n)c.imports.shift();return r};

/* ---------- categorias em árvore ---------- */
let _catSet=null,_catSetK='';
function catSet(){const c=C();const k=st.scope+'|'+(c.cats||[]).length;if(k!==_catSetK){_catSet=new Set((c.cats||[]).map(x=>String(x).trim()));_catSetK=k}return _catSet}
/* separa "Master/Sub". Se o nome inteiro é uma categoria do plano e o pedaço antes da barra não é, a barra faz parte do nome (ex.: "resgate/aplicação automática"). */
function splitCat(cat){const s=String(cat||'').trim();const i=s.indexOf('/');if(i<0)return[s||'Sem categoria',''];const set=catSet();const p=s.slice(0,i).trim();if(set.has(s)&&!set.has(p)&&![...set].some(x=>x!==s&&x.startsWith(s.slice(0,i+1))))return[s,''];return[p||'Sem categoria',s.slice(i+1).trim()]}
const mestre=c=>splitCat(c)[0];
const filha=c=>splitCat(c)[1];
const chaveCat=c=>{const[m,f]=splitCat(c);return f?m+'/'+f:m};
function variantes(cat){const c=C();const k=chaveCat(cat);return[...new Set([...(c.cats||[]),...ativos().map(l=>l.cat)])].filter(x=>x&&chaveCat(x)===k)}
function tipoCat(cat,cont){const c=C();if(c.catTipo&&c.catTipo[cat])return c.catTipo[cat];const b=CATS_BEAUTY.find(x=>x.c===cat);if(b&&st.scope===BEAUTY)return b.t;const k=cont&&cont[cat];if(k)return k.R>k.D?'R':'D';const m=mestre(cat).toLowerCase();return /receit|servi[cç]o|venda|aporte|rendiment|lucro|dinheiro/.test(m)?'R':'D'}
function arvoreCats(){const c=C();const cont={};const ano=dAdd(HOJE,-365);
 ativos().forEach(l=>{if(!l.cat||l.tipo==='Transferência'||l.tipo==='Pagamento')return;const o=cont[l.cat]||(cont[l.cat]={n:0,R:0,D:0,v:0});o.n++;o[l.tipo==='Receita'?'R':'D']++;if(l.data>=ano&&l.data<=HOJE)o.v+=l.valor});
 const todas=new Set([...(c.cats||[]),...Object.keys(cont)].filter(x=>x&&x!=='Transferência'&&x!=='Pagamento de cartão'));
 const T={R:{},D:{}};todas.forEach(cat=>{const t=tipoCat(cat,cont);const m=mestre(cat),f=filha(cat);const g=T[t][m]||(T[t][m]={nome:m,raw:null,subs:[],n:0,v:0});const k=cont[cat]||{n:0,v:0};
  if(f){let sb=g.subs.find(x=>x.nome===f);if(!sb){sb={cat,nome:f,n:0,v:0,raws:[]};g.subs.push(sb)}sb.raws.push(cat);if(k.n>((cont[sb.cat]||{}).n||0))sb.cat=cat;sb.n+=k.n;sb.v+=k.v}else{if(!g.raw||k.n>((cont[g.raw]||{}).n||0))g.raw=cat}g.n+=k.n;g.v+=k.v});
 Object.values(T).forEach(o=>Object.values(o).forEach(g=>{g.subs.sort((a,b)=>a.nome.localeCompare(b.nome,'pt',{numeric:true}));g.selfN=(cont[g.raw]||{}).n||0}));return{T,cont}}
if(!st.cat)st.cat={tipo:'D',abertos:new Set()};
function vCats(){const c=C();const {T}=arvoreCats();const tp=st.cat.tipo;const grupos=Object.values(T[tp]).sort((a,b)=>a.nome.localeCompare(b.nome,'pt',{numeric:true}));const pode_=pode.cadastro();
 $('#view').innerHTML=topo('Plano de contas','Categorias',pode_?`<button class="btn primary" type="button" id="catNova">+ Nova categoria</button>`:'')+`
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:10px 14px;border-bottom:1px solid var(--line)"><div class="tabs" style="border:0"><button type="button" data-ct2="D" class="${tp==='D'?'on':''}">Despesas (${Object.keys(T.D).length})</button><button type="button" data-ct2="R" class="${tp==='R'?'on':''}">Receitas (${Object.keys(T.R).length})</button></div>
 <div class="scope"><button class="btn ghost" type="button" id="catAbre">Expandir tudo</button><button class="btn ghost" type="button" id="catFecha">Recolher tudo</button></div></div>
 <div class="tbl"><table class="cattbl"><thead><tr><th>Categoria</th><th class="r">Lançamentos</th><th class="r">Últimos 12 meses</th><th></th></tr></thead><tbody>
 ${grupos.map(g=>{const ab=st.cat.abertos.has(g.nome);return `<tr class="cat-m"><td><button class="tgl" type="button" data-cab="${esc(g.nome)}" aria-expanded="${ab}">${g.subs.length?(ab?'▾':'▸'):'·'}</button><b>${esc(g.nome)}</b> <span class="note">${g.subs.length?g.subs.length+' subcategorias':''}</span></td><td class="r num">${g.n}</td><td class="r num ${g.v<0?'neg':g.v>0?'pos':''}">${val(g.v)}</td>
  <td class="r">${pode_?`<button class="btn ghost" type="button" data-csub="${esc(g.nome)}">+ Sub</button><button class="btn ghost" type="button" data-cren="${esc(g.nome)}" data-cm="1">Renomear</button><button class="btn ghost" type="button" data-cdel="${esc(g.nome)}" data-cm="1">Excluir</button>`:''}</td></tr>`+
  (ab?g.subs.map(s=>`<tr class="cat-s"><td>${esc(s.nome)}</td><td class="r num">${s.n}</td><td class="r num ${s.v<0?'neg':s.v>0?'pos':''}">${val(s.v)}</td><td class="r">${pode_?`<button class="btn ghost" type="button" data-cren="${esc(s.cat)}">Renomear</button><button class="btn ghost" type="button" data-cdel="${esc(s.cat)}">Excluir</button>`:''}</td></tr>`).join(''):'')}).join('')||'<tr><td colspan="4" class="note">Nenhuma categoria.</td></tr>'}
 </tbody></table></div></div>
 <p class="note" style="margin:0">Excluir ou renomear move os lançamentos e as regras de classificação para a categoria escolhida. Nada fica sem categoria.</p>`;
 bindScope();$$('[data-ct2]').forEach(b=>b.onclick=()=>{st.cat.tipo=b.dataset.ct2;vCats()});
 $$('[data-cab]').forEach(b=>b.onclick=()=>{const n=b.dataset.cab;st.cat.abertos.has(n)?st.cat.abertos.delete(n):st.cat.abertos.add(n);vCats()});
 $('#catAbre').onclick=()=>{grupos.forEach(g=>st.cat.abertos.add(g.nome));vCats()};$('#catFecha').onclick=()=>{st.cat.abertos.clear();vCats()};
 if($('#catNova'))$('#catNova').onclick=()=>modalNovaCat(tp,'');
 $$('[data-csub]').forEach(b=>b.onclick=()=>modalNovaCat(tp,b.dataset.csub));
 $$('[data-cren]').forEach(b=>b.onclick=()=>modalRenCat(b.dataset.cren,!!b.dataset.cm,T,tp));
 $$('[data-cdel]').forEach(b=>b.onclick=()=>modalDelCat(b.dataset.cdel,!!b.dataset.cm,T,tp))}
function catsDoMestre(m){const c=C();return[...new Set([...(c.cats||[]),...ativos().map(l=>l.cat)])].filter(x=>x&&mestre(x)===m)}
function listaCats(tp){const {T}=arvoreCats();const out=[];Object.values(T[tp]).sort((a,b)=>a.nome.localeCompare(b.nome,'pt',{numeric:true})).forEach(g=>{out.push(g.raw||g.nome);g.subs.forEach(s=>out.push(s.cat))});return[...new Set(out)]}
function modalNovaCat(tp,pai){const {T}=arvoreCats();abrirModal(`<div class="mhead"><h3>Nova categoria</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fNc"><div class="row"><label>Tipo<select id="ncT"><option value="D" ${tp==='D'?'selected':''}>Despesa</option><option value="R" ${tp==='R'?'selected':''}>Receita</option></select></label>
 <label>Categoria master<select id="ncM"><option value="">+ Nova categoria master</option>${[...Object.keys(T.D),...Object.keys(T.R)].filter((x,i,a)=>a.indexOf(x)===i).sort((a,b)=>a.localeCompare(b,'pt',{numeric:true})).map(m=>`<option ${m===pai?'selected':''}>${esc(m)}</option>`).join('')}</select></label></div>
 <div class="row"><label id="lbNcMn" ${pai?'hidden':''}>Nome da nova master<input type="text" id="ncMn" placeholder="ex.: 05 - Investimentos"></label><label>Subcategoria (opcional)<input type="text" id="ncS" placeholder="ex.: Equipamentos"></label></div></form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fNc">Criar</button></div>`);
 $('#ncM').onchange=()=>{$('#lbNcMn').hidden=!!$('#ncM').value};
 $('#fNc').onsubmit=e=>{e.preventDefault();const c=C();const m=($('#ncM').value||$('#ncMn').value).trim();const s=$('#ncS').value.trim();if(!m){toast('Informe a categoria master');return}
  if(s.includes('/')&&false)return;const cat=s?m+'/'+s:m;if(!c.cats.includes(cat))c.cats.push(cat);if(!s&&!c.cats.includes(m))c.cats.push(m);c.catTipo=c.catTipo||{};c.catTipo[cat]=$('#ncT').value;if(!c.catTipo[m])c.catTipo[m]=$('#ncT').value;
  log('Categoria criada',cat);save();fecharModal();st.cat.tipo=$('#ncT').value;st.cat.abertos.add(m);toast('Categoria criada');vCats()}}
function migrarCat(mapa){/* mapa: {catAntiga: catNova} */const c=C();let n=0;
 c.lanc.forEach(l=>{if(mapa[l.cat]!==undefined){l.cat=mapa[l.cat];n++}});
 (c.regras||[]).forEach(r=>{if(mapa[r.cat]!==undefined)r.cat=mapa[r.cat]});
 const pd=c.perfil&&c.perfil.padroes;if(pd)Object.keys(pd).forEach(k=>{if(mapa[pd[k]]!==undefined)pd[k]=mapa[pd[k]]});
 c.cats=[...new Set((c.cats||[]).map(x=>mapa[x]!==undefined?mapa[x]:x).filter(Boolean))];
 c.catTipo=c.catTipo||{};Object.keys(mapa).forEach(k=>{if(c.catTipo[k]&&mapa[k]&&!c.catTipo[mapa[k]])c.catTipo[mapa[k]]=c.catTipo[k];delete c.catTipo[k]});return n}
function modalRenCat(cat,ehMestre,T,tp){const atual=ehMestre?cat:filha(cat);
 abrirModal(`<div class="mhead"><h3>Renomear ${ehMestre?'categoria master':'subcategoria'}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fRc"><div class="row"><label>Nome atual<input type="text" value="${esc(atual)}" disabled></label><label>Novo nome<input type="text" id="rcN" value="${esc(atual)}" required></label></div>
 <p class="note" style="margin:0">Todos os lançamentos${ehMestre?' desta master e das subcategorias':''} passam para o novo nome. Se o nome já existir, as duas se juntam.</p></form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fRc">Renomear</button></div>`);
 $('#fRc').onsubmit=e=>{e.preventDefault();const novo=$('#rcN').value.trim();if(!novo||novo===atual){fecharModal();return}const mapa={};
  if(ehMestre){catsDoMestre(cat).forEach(x=>{const f=filha(x);mapa[x]=f?novo+'/'+f:novo})}else{const base=String(cat).slice(0,String(cat).indexOf('/'));variantes(cat).forEach(x=>mapa[x]=base+'/'+novo)}
  const n=migrarCat(mapa);if(ehMestre){st.cat.abertos.delete(cat);st.cat.abertos.add(novo)}log('Categoria renomeada',atual+' → '+novo+' · '+n+' lançamentos');save();fecharModal();toast('Renomeada · '+n+' lançamentos atualizados');vCats()}}
function modalDelCat(cat,ehMestre,T,tp){const {cont}=arvoreCats();const afet=ehMestre?catsDoMestre(cat):variantes(cat);const n=afet.reduce((a,x)=>a+((cont[x]||{}).n||0),0);
 const destinos=listaCats(tp).filter(x=>!afet.includes(x));
 abrirModal(`<div class="mhead"><h3>Excluir ${ehMestre?'categoria master':'subcategoria'}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fDc"><p style="margin:0"><b>${esc(ehMestre?cat:filha(cat))}</b>${ehMestre&&afet.length>1?` e ${afet.length-1} subcategorias`:''}</p>
 ${n?`<p class="note" style="margin:0">${n} lançamentos usam ${afet.length>1?'essas categorias':'esta categoria'}. Escolha para onde eles vão:</p><div class="row"><label>Mover lançamentos para<select id="dcD" required><option value="">Escolha…</option>${destinos.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label></div>`:'<p class="note" style="margin:0">Nenhum lançamento usa esta categoria.</p>'}</form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fDc">${n?'Mover e excluir':'Excluir'}</button></div>`);
 $('#fDc').onsubmit=e=>{e.preventDefault();const dest=n?$('#dcD').value:'';if(n&&!dest){toast('Escolha a categoria de destino');return}const mapa={};afet.forEach(x=>mapa[x]=dest);
  const c=C();const m=migrarCat(mapa);c.cats=c.cats.filter(x=>x&&!afet.includes(x));log('Categoria excluída',(ehMestre?cat:cat)+(dest?' → '+dest:'')+' · '+m+' lançamentos');save();fecharModal();toast(dest?m+' lançamentos movidos para '+dest:'Categoria excluída');vCats()}}

/* ---------- relatórios com período livre, filtros, recolher e detalhamento ---------- */
if(!st.rf)st.rf={de:null,ate:null,tipo:'todos',status:'real',contas:null,cats:null,tags:null,fech:new Set()};
function rfInit(){if(!st.rf.de){const m=HOJE.slice(0,7);st.rf.de=mAdd(m,-3);st.rf.ate=m}}
function rfMeses(){rfInit();const out=[];let m=st.rf.de;if(st.rf.ate<m)st.rf.ate=m;while(m<=st.rf.ate&&out.length<36){out.push(m);m=mAdd(m,1)}return out}
function rfFiltra(ls){const f=st.rf;return ls.filter(l=>{if(l.tipo!=='Receita'&&l.tipo!=='Despesa')return false;if(f.tipo==='rec'&&l.tipo!=='Receita')return false;if(f.tipo==='des'&&l.tipo!=='Despesa')return false;
 if(f.status==='real'&&!(l.status==='Confirmado'||l.status==='Conciliado'))return false;if(f.contas&&!f.contas.has(l.conta))return false;if(f.cats&&!f.cats.has(mestre(l.cat)))return false;if(f.tags&&!(l.tags||[]).some(t=>f.tags.has(t)))return false;return true})}
function multiSel(id,rotulo,opcoes,sel){const n=sel?sel.size:0;return `<details class="msel" id="${id}"><summary>${rotulo}: <b>${n?n+' selecionad'+(n>1?'as':'a'):'todas'}</b></summary><div class="msel-box"><div class="scope"><button class="btn ghost" type="button" data-mall="${id}">Todas</button><button class="btn ghost" type="button" data-mnone="${id}">Limpar</button></div>${opcoes.map(o=>`<label><input type="checkbox" data-mo="${id}" value="${esc(o)}" ${sel&&sel.has(o)?'checked':''}> ${esc(o)}</label>`).join('')||'<span class="note">Nenhuma</span>'}<div><button class="btn primary" type="button" data-mok="${id}">Aplicar</button></div></div></details>`}
function barraFiltros(comPeriodo){rfInit();const f=st.rf;const a=ativos();const contas=C().contas.map(k=>k.nome);const cats=[...new Set(a.filter(l=>l.tipo==='Receita'||l.tipo==='Despesa').map(l=>mestre(l.cat)))].sort((x,y)=>x.localeCompare(y,'pt',{numeric:true}));const tags=[...new Set(a.flatMap(l=>l.tags||[]))].sort();
 return `<div class="filtros">${comPeriodo?`<label class="note">De <input type="month" id="rfDe" value="${f.de}"></label><label class="note">Até <input type="month" id="rfAte" value="${f.ate}"></label>
  <div class="chips">${[[-2,'3 meses'],[-5,'6 meses'],[-11,'12 meses'],['ano','Este ano']].map(([k,l])=>`<button class="chip" type="button" data-rfp="${k}">${l}</button>`).join('')}</div>`:''}
  <select id="rfTipo" aria-label="Tipo"><option value="todos" ${f.tipo==='todos'?'selected':''}>Receitas e despesas</option><option value="rec" ${f.tipo==='rec'?'selected':''}>Só receitas</option><option value="des" ${f.tipo==='des'?'selected':''}>Só despesas</option></select>
  <select id="rfSt" aria-label="Status"><option value="real" ${f.status==='real'?'selected':''}>Realizado (confirmados e conciliados)</option><option value="tudo" ${f.status==='tudo'?'selected':''}>Realizado + previsto</option></select>
  ${multiSel('fmC','Contas',contas,f.contas)}${multiSel('fmK','Categorias',cats,f.cats)}${multiSel('fmT','Tags',tags,f.tags)}
  ${(f.contas||f.cats||f.tags||f.tipo!=='todos'||f.status!=='real')?'<button class="btn ghost" type="button" id="rfLimpa">Limpar filtros</button>':''}</div>`}
function bindFiltros(re){const f=st.rf;
 if($('#rfDe'))$('#rfDe').onchange=e=>{if(e.target.value){f.de=e.target.value;if(f.ate<f.de)f.ate=f.de;re()}};if($('#rfAte'))$('#rfAte').onchange=e=>{if(e.target.value){f.ate=e.target.value;if(f.ate<f.de)f.de=f.ate;re()}};
 $$('[data-rfp]').forEach(b=>b.onclick=()=>{const m=HOJE.slice(0,7);const k=b.dataset.rfp;if(k==='ano'){f.de=m.slice(0,4)+'-01';f.ate=m}else{f.ate=m;f.de=mAdd(m,+k)}re()});
 $('#rfTipo').onchange=e=>{f.tipo=e.target.value;re()};$('#rfSt').onchange=e=>{f.status=e.target.value;re()};
 const map={fmC:'contas',fmK:'cats',fmT:'tags'};
 $$('[data-mall]').forEach(b=>b.onclick=()=>$$(`[data-mo="${b.dataset.mall}"]`).forEach(x=>x.checked=true));$$('[data-mnone]').forEach(b=>b.onclick=()=>$$(`[data-mo="${b.dataset.mnone}"]`).forEach(x=>x.checked=false));
 $$('[data-mok]').forEach(b=>b.onclick=()=>{const id=b.dataset.mok;const all=$$(`[data-mo="${id}"]`);const on=all.filter(x=>x.checked).map(x=>x.value);f[map[id]]=(!on.length||on.length===all.length)?null:new Set(on);re()});
 if($('#rfLimpa'))$('#rfLimpa').onclick=()=>{Object.assign(f,{tipo:'todos',status:'real',contas:null,cats:null,tags:null});re()}}
function evoDados(){const meses=rfMeses();const ls=rfFiltra(ativos()).filter(l=>meses.includes(mesEf(l)));const T={Receita:{},Despesa:{}};
 ls.forEach(l=>{const i=meses.indexOf(mesEf(l));const m=mestre(l.cat),f=filha(l.cat)||m;const g=T[l.tipo][m]||(T[l.tipo][m]={tot:Array(meses.length).fill(0),f:{}});g.tot[i]+=l.valor;(g.f[f]=g.f[f]||Array(meses.length).fill(0))[i]+=l.valor});
 return{meses,ls,T}}
vEvo=function(){const {meses,ls,T}=evoDados();st.rf._ls=ls;const n=meses.length;const soma=a=>a.reduce((x,y)=>x+y,0);const f=st.rf;
 const tipos=f.tipo==='rec'?['Receita']:f.tipo==='des'?['Despesa']:['Receita','Despesa'];
 const totT=tp=>meses.map((_,i)=>Object.values(T[tp]).reduce((a,g)=>a+g.tot[i],0));const tr=totT('Receita'),td=totT('Despesa');
 const pc=(v,i)=>tr[i]?`<span class="pc">${(Math.abs(v)/tr[i]*100).toFixed(2).replace('.',',')}%</span>`:'';const pcT=v=>soma(tr)?`<span class="pc">${(Math.abs(v)/soma(tr)*100).toFixed(2).replace('.',',')}%</span>`:'';
 const cel=(v,k,i,comPc)=>`<td class="r num ${v<0?'neg':v>0?'pos':''}"><button class="dr" type="button" data-dr="${esc(k)}|${i}">${val(v)}</button>${comPc&&f.tipo==='todos'?(i==='T'||i==='M'?pcT(i==='M'?v*n:v):pc(v,i)):''}</td>`;
 let corpo='';tipos.forEach(tp=>{const tot=tp==='Receita'?tr:td;const des=tp==='Despesa';
  corpo+=`<tr class="grp ${des?'des':'rec'}"><td>${tp==='Receita'?'Receitas':'Despesas'}</td>${tot.map((v,i)=>cel(v,tp+'|*|*',i,des)).join('')}${cel(soma(tot)/n,tp+'|*|*','M',des)}${cel(soma(tot),tp+'|*|*','T',des)}</tr>`;
  Object.entries(T[tp]).sort((a,b)=>a[0].localeCompare(b[0],'pt',{numeric:true})).forEach(([m,g])=>{const fechado=f.fech.has(tp+'|'+m);const subs=Object.entries(g.f).filter(([s])=>s!==m||Object.keys(g.f).length>1);
   corpo+=`<tr class="par"><td><button class="tgl" type="button" data-rtg="${esc(tp+'|'+m)}">${subs.length?(fechado?'▸':'▾'):'·'}</button>${esc(m)}</td>${g.tot.map((v,i)=>cel(v,tp+'|'+m+'|*',i,des)).join('')}${cel(soma(g.tot)/n,tp+'|'+m+'|*','M',des)}${cel(soma(g.tot),tp+'|'+m+'|*','T',des)}</tr>`;
   if(!fechado)subs.forEach(([s,a])=>{corpo+=`<tr class="ch"><td>• ${esc(s)}</td>${a.map((v,i)=>cel(v,tp+'|'+m+'|'+s,i,false)).join('')}${cel(soma(a)/n,tp+'|'+m+'|'+s,'M',false)}${cel(soma(a),tp+'|'+m+'|'+s,'T',false)}</tr>`})})});
 if(tipos.length===2){const res=meses.map((_,i)=>tr[i]+td[i]);corpo+=`<tr class="res"><td>Resultado</td>${res.map((v,i)=>cel(v,'*|*|*',i)).join('')}${cel(soma(res)/n,'*|*|*','M')}${cel(soma(res),'*|*|*','T')}</tr>`}
 const filtrosTxt=[f.status==='real'?'Status: confirmados/conciliados':'Status: realizado + previsto',f.contas?'Contas: '+[...f.contas].join(', '):'',f.cats?'Categorias: '+[...f.cats].join(', '):'',f.tags?'Tags: '+[...f.tags].join(', '):''].filter(Boolean).join(' · ');
 return `<div class="rep">${relHead('Relatório de evolução por categoria',mCurto(meses[0])+' até '+mCurto(meses[n-1])+' · Regime: caixa')}<div class="note" style="padding:8px 16px;border-bottom:1px solid var(--line)">${esc(filtrosTxt)} · <button class="btn ghost" type="button" id="rfAbre" style="padding:0 6px">Expandir tudo</button><button class="btn ghost" type="button" id="rfFecha" style="padding:0 6px">Recolher tudo</button> · toque em qualquer valor para ver o que compõe</div>
 <div class="tbl"><table class="evo"><thead><tr><th></th>${meses.map(m=>`<th class="r">${mCurto(m)}</th>`).join('')}<th class="r">Média</th><th class="r">Total</th></tr></thead><tbody>${corpo||`<tr><td colspan="${n+3}" class="note">Nenhum lançamento com esses filtros.</td></tr>`}</tbody></table></div></div>`};
function bindEvo(re){$$('[data-rtg]').forEach(b=>b.onclick=()=>{const k=b.dataset.rtg;st.rf.fech.has(k)?st.rf.fech.delete(k):st.rf.fech.add(k);re()});
 if($('#rfAbre'))$('#rfAbre').onclick=()=>{st.rf.fech.clear();re()};
 if($('#rfFecha'))$('#rfFecha').onclick=()=>{const {T}=evoDados();Object.keys(T).forEach(tp=>Object.keys(T[tp]).forEach(m=>st.rf.fech.add(tp+'|'+m)));re()};
 $$('[data-dr]').forEach(b=>b.onclick=()=>detalhar(b.dataset.dr))}
function detalhar(chave){const [tp,m,s,i]=chave.split('|');const meses=rfMeses();const ls=(st.rf._ls||[]).filter(l=>(tp==='*'||l.tipo===tp)&&(m==='*'||mestre(l.cat)===m)&&(s==='*'||(filha(l.cat)||mestre(l.cat))===s)&&(i==='T'||i==='M'||mesEf(l)===meses[+i])).sort((a,b)=>a.data<b.data?-1:1);
 const tot=r2(ls.reduce((a,l)=>a+l.valor,0));const titulo=[tp==='*'?'Resultado':tp==='Receita'?'Receitas':'Despesas',m!=='*'?m:'',s!=='*'&&s!==m?s:''].filter(Boolean).join(' › ');const per=(i==='T'||i==='M')?mCurto(meses[0])+' a '+mCurto(meses[meses.length-1]):mNome(meses[+i]);
 abrirModal(`<div class="mhead"><h3>${esc(titulo)}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <div class="mbody"><div class="kv num"><span>Período</span><span>${per}</span><span>Lançamentos</span><span>${ls.length}</span><span class="big">Total</span><span class="big ${tot<0?'neg':'pos'}">${brl(tot)}</span>${i==='M'?`<span>Média mensal</span><span>${brl(tot/meses.length)}</span>`:''}</div>
 <div class="tbl" style="max-height:52vh;overflow:auto"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th class="r">Valor</th></tr></thead><tbody>${ls.map(l=>`<tr><td class="num note">${fd(dataEf(l))}</td><td>${st.user.perfil!=='cliente'?`<button class="dr" type="button" data-dl="${l.id}" style="text-align:left">${esc(l.desc)}</button>`:esc(l.desc)}${l.status!=='Conciliado'&&l.status!=='Confirmado'?` <span class="pill p-warn">${l.status}</span>`:''}</td><td class="note">${esc(l.cat)}</td><td class="note">${esc(l.conta)}</td><td class="r num ${l.valor<0?'neg':'pos'}">${val(l.valor)}</td></tr>`).join('')||'<tr><td colspan="5" class="note">Nenhum lançamento.</td></tr>'}</tbody></table></div></div>
 <div class="mfoot"><span class="note">Toque na descrição para abrir o lançamento</span><button class="btn" type="button" id="drExp">Exportar .xlsx</button></div>`);
 $$('[data-dl]').forEach(b=>b.onclick=()=>{const l=C().lanc.find(x=>x.id===b.dataset.dl);if(l)modalLanc(l)});
 $('#drExp').onclick=()=>exportarMD(ls,'Detalhe_'+titulo.replace(/\W+/g,'_'))}
const _vTotaisM3=vTotais;
vTotais=function(){const _a=arvore;arvore=(ls,m)=>_a(rfFiltra(ls),m);try{return _vTotaisM3()}finally{arvore=_a}};
vRel=function(){const isCli=st.user.perfil==='cliente',c=C(),tab=st.rel.tab;rfInit();const mesRef=tab==='evo'?st.rf.ate:tab==='totais'?st.rel.mes:st.rel.cFim.slice(0,7);
 const aprov=!!c.aprov[mesRef];const pode_ver=!isCli||aprov;
 const ctrl=tab==='totais'?`<div class="monthnav" style="gap:4px"><button class="icobtn" type="button" id="rPrev" aria-label="Mês anterior">‹</button><b>${mNome(st.rel.mes)}</b><button class="icobtn" type="button" id="rNext" aria-label="Próximo mês">›</button></div>`:tab==='caixa'?`<label class="note">Início <input type="date" id="rCi" value="${st.rel.cIni}"></label><label class="note">Fim <input type="date" id="rCf" value="${st.rel.cFim}"></label>`:'';
 $('#view').innerHTML=topo(isCli?'Relatórios liberados pela Lume':'Fechamento e envio ao cliente','Relatórios')+`
 <div class="tabs"><button type="button" data-rt="evo" class="${tab==='evo'?'on':''}">Fluxo de caixa · evolução por categoria</button><button type="button" data-rt="totais" class="${tab==='totais'?'on':''}">Totais por categoria</button><button type="button" data-rt="caixa" class="${tab==='caixa'?'on':''}">Lançamentos de caixa</button></div>
 ${tab!=='caixa'&&pode_ver?barraFiltros(tab==='evo'):''}
 <div class="panel-head"><div class="scope">${ctrl}</div><div class="scope">${!isCli?`<span class="pill ${aprov?'p-ok':'p-warn'}">${mNome(mesRef)} · ${aprov?'liberado ao cliente':'em conferência'}</span>`:''}${!isCli&&pode.aprovar()?(aprov?`<button class="btn" type="button" id="rRev">Recolher do cliente</button>`:`<button class="btn primary" type="button" id="rApr">Aprovar e liberar ${mNome(mesRef)}</button>`):''}${pode_ver?'<button class="btn" type="button" id="rExp">Exportar .xlsx</button>':''}</div></div>
 ${!isCli&&!pode.aprovar()&&!aprov?'<p class="note" style="margin:0">Somente a Master aprova e libera relatórios ao cliente.</p>':''}
 ${pode_ver?(tab==='evo'?vEvo():tab==='totais'?vTotais():vRelCaixa()):`<div class="banner">O relatório de ${mNome(mesRef)} ainda está em conferência pela Lume. Ele aparece aqui assim que for liberado.</div>`}`;
 bindScope();if(st.user.perfil!=='cliente')bindLinhas(vRel);if($('#rfTipo'))bindFiltros(vRel);bindEvo(vRel);$$('[data-rt]').forEach(b=>b.onclick=()=>{st.rel.tab=b.dataset.rt;vRel()});
 if($('#rPrev'))$('#rPrev').onclick=()=>{st.rel.mes=mAdd(st.rel.mes,-1);vRel()};if($('#rNext'))$('#rNext').onclick=()=>{st.rel.mes=mAdd(st.rel.mes,1);vRel()};
 if($('#rCi'))$('#rCi').onchange=e=>{st.rel.cIni=e.target.value;vRel()};if($('#rCf'))$('#rCf').onchange=e=>{st.rel.cFim=e.target.value;vRel()};
 if($('#rApr'))$('#rApr').onclick=()=>{c.aprov[mesRef]=true;log('Relatório liberado',mNome(mesRef));save();toast('Relatórios de '+mNome(mesRef)+' liberados. O cliente já vê no portal.');vRel()};
 if($('#rRev'))$('#rRev').onclick=()=>{delete c.aprov[mesRef];log('Relatório recolhido',mNome(mesRef));save();vRel()};
 if($('#rExp'))$('#rExp').onclick=()=>exportarRel(tab)};
const _expRelM3=exportarRel;
exportarRel=function(tab){if(tab==='totais'){const _a=arvore;arvore=(ls,m)=>_a(rfFiltra(ls),m);try{return _expRelM3(tab)}finally{arvore=_a}}if(tab!=='evo')return _expRelM3(tab);
 const {meses,T}=evoDados();const n=meses.length;const soma=a=>a.reduce((x,y)=>x+y,0);const rows=[['',...meses.map(mCurto),'Média','Total']];
 ['Receita','Despesa'].forEach(tp=>{if(!Object.keys(T[tp]).length)return;const tot=meses.map((_,i)=>Object.values(T[tp]).reduce((a,g)=>a+g.tot[i],0));rows.push([tp+'s',...tot.map(r2),r2(soma(tot)/n),r2(soma(tot))]);
  Object.entries(T[tp]).sort((a,b)=>a[0].localeCompare(b[0],'pt',{numeric:true})).forEach(([m,g])=>{rows.push([m,...g.tot.map(r2),r2(soma(g.tot)/n),r2(soma(g.tot))]);Object.entries(g.f).forEach(([s,a])=>{if(s!==m)rows.push(['   • '+s,...a.map(r2),r2(soma(a)/n),r2(soma(a))])})})});
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'Evolução por categoria');baixar('Evolucao_por_categoria_'+nomeEsc(st.scope).replace(/\W+/g,'_')+'_'+meses[0]+'_a_'+meses[n-1]+'.xlsx',wb)};

/* ---------- caixa: filtros de tipo e tag ---------- */
const _vCaixaM3=vCaixa;
vCaixa=function(){_vCaixaM3();const tags=[...new Set(ativos().flatMap(l=>l.tags||[]))].sort();const alvo=$('#cxCat');if(!alvo)return;
 alvo.insertAdjacentHTML('beforebegin',`<select id="cxTipo" aria-label="Tipo"><option value="todos">Todos os tipos</option><option value="rec" ${st.cx.tipo==='rec'?'selected':''}>Só receitas</option><option value="des" ${st.cx.tipo==='des'?'selected':''}>Só despesas</option><option value="tr" ${st.cx.tipo==='tr'?'selected':''}>Só transferências</option></select><select id="cxTag" aria-label="Tag"><option value="">Todas as tags</option>${tags.map(t=>`<option ${t===st.cx.tag?'selected':''}>${esc(t)}</option>`).join('')}</select>`);
 $('#cxTipo').onchange=e=>{st.cx.tipo=e.target.value;vCaixa()};$('#cxTag').onchange=e=>{st.cx.tag=e.target.value;vCaixa()}};

/* ---------- navegação ---------- */
const _navM3=navItems;
navItems=function(){const it=_navM3().map(x=>x[0]==='cadastros'?['cadastros','Contas']:x[0]==='meudinheiro'?['meudinheiro','Importar e exportar']:x);if(st.user.perfil!=='cliente'){const i=it.findIndex(x=>x[0]==='cadastros');it.splice(i+1,0,['categorias','Categorias'])}return it};
const _renderM3=render;
render=function(){if(st.user&&st.view==='categorias'&&st.scope&&NUVEM.carregado.has(st.scope)){_renderNav();return vCats()}return _renderM3()};
function _renderNav(){const pc=st.user.perfil==='cliente'?0:pendCount();$('#nav').innerHTML=navItems().map(([k,l])=>k?`<button type="button" data-v="${k}" class="${st.view===k?'on':''}">${l}${k==='pendencias'&&pc?`<span class="count">${pc}</span>`:''}</button>`:`<div class="grp">${l}</div>`).join('');$('#whoami').innerHTML=`<b>${esc(st.user.nome)}</b><br><span style="color:#9FB0C4">${PERFIL_TXT[st.user.perfil].split(' · ')[0]}</span>`}

/* ---------- menu recolhível ---------- */
(function(){const b=$('#menuTog');if(!b)return;let mini=false;try{mini=localStorage.getItem('lumeMenuMini')==='1'}catch(e){}
 const apl=()=>{document.body.classList.toggle('menu-mini',mini);b.textContent=mini?'›':'‹';b.setAttribute('aria-label',mini?'Abrir menu':'Recolher menu');b.title=mini?'Abrir menu':'Recolher menu'};apl();
 b.onclick=()=>{mini=!mini;try{localStorage.setItem('lumeMenuMini',mini?'1':'0')}catch(e){}apl()}})();

/* ---------- zerar cliente (Master) ---------- */
async function zerarCliente(){const k=st.scope,c=C();const nome=nomeEsc(k);const n=ativos().length,ne=Object.values(c.extratos||{}).flat().length;
 const ok=await confirmar('Zerar '+esc(nome),`<p style="margin:0">Isto apaga de <b>${esc(nome)}</b>:</p><div class="kv num"><span>Lançamentos</span><span>${n}</span><span>Linhas de extrato</span><span>${ne}</span><span>Vendas importadas</span><span>${(c.vendas.avec||[]).length+(c.vendas.sipag||[]).length}</span><span>Regras aprendidas</span><span>${(c.regras||[]).length}</span></div>
  <p class="note" style="margin:0">Contas e categorias voltam ao cadastro inicial do cliente. Os outros clientes não são afetados. Não dá para desfazer.</p>
  <label style="display:grid;gap:4px;font-size:13px">Para confirmar, digite <b>ZERAR</b><input type="text" id="zTxt" autocomplete="off"></label>`,'Zerar dados');
 if(!ok)return;if(window._zTxt!=='ZERAR'){toast('Não zerei: era preciso digitar ZERAR');return}
 const novo=seed(k);novo.log=[{quando:new Date().toISOString(),quem:st.user.nome,acao:'Cliente zerado',desc:n+' lançamentos e '+ne+' linhas de extrato apagados'}].concat(c.log||[]).slice(0,300);
 DB[k]=novo;st.cx.contas=null;st.conc.conta=null;st.conc.sel=null;st.cc.cartao=null;save();toast(nome+' foi zerado · '+n+' lançamentos apagados');vMD()}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='zTxt')window._zTxt=e.target.value.trim().toUpperCase()});
document.addEventListener('click',e=>{if(e.target&&e.target.id==='zerar')window._zTxt=''},true);
