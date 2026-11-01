/* ===================================================================
 * Lume Conecta · módulo 5
 * 1) Vencidos em aberto (pendentes/agendados com data passada) entram no
 *    saldo do DIA DE HOJE, como no Meu Dinheiro. Assim o saldo de cada dia
 *    anterior bate com o banco e o saldo de hoje já considera o que falta
 *    pagar/receber.
 * 2) Filtro inverso nos filtros de seleção múltipla (contas, categorias,
 *    tags): "todas menos as marcadas". Busca dentro da lista.
 * =================================================================== */
const m5Real=l=>l.status==='Confirmado'||l.status==='Conciliado';
const m5Atras=l=>!m5Real(l)&&!l.excluido&&l.data<HOJE;
const m5Dia=l=>m5Atras(l)?HOJE:l.data;
const m5Ord=(a,b)=>{const x=m5Dia(a),y=m5Dia(b);if(x!==y)return x<y?-1:1;return a.data<b.data?-1:a.data>b.data?1:0};
function m5Ok(set,inv,vals){if(!set)return true;const hit=vals.some(v=>set.has(v));return inv?!hit:hit}
function m5Venc(html,l){if(!m5Atras(l))return html;const n=Math.round((D(HOJE)-D(l.data))/864e5);return html.replace('<div class="lrow">','<div class="lrow vencido">').replace('</b>',`</b><span class="tg venc">Vencido há ${n} dia${n>1?'s':''}</span>`)}
const m5Sep=()=>`<div class="vencsep">Em aberto de dias anteriores · entram no saldo de hoje (${fd(HOJE).slice(0,5)})</div>`;

/* saldo: confirmado = só realizado até a data; projetado = vencidos em aberto contam hoje */
saldo=function(conta,ate,soConf){const c=contaObj(conta);let s=c?c.saldoIni||0:0;
 ativos().forEach(l=>{if(soConf){if(!m5Real(l)||l.data>ate)return}else if(m5Dia(l)>ate)return;s+=efeito(l,conta)});return r2(s)};

/* ---------- seleção múltipla com busca e filtro inverso ---------- */
const M5_INV={fmC:'contasInv',fmK:'catsInv',fmT:'tagsInv'};
multiSel=function(id,rotulo,opcoes,sel,inv){if(inv===undefined)inv=M5_INV[id]?!!st.rf[M5_INV[id]]:false;const n=sel?sel.size:0;
 const txt=!n?'todas':inv?'todas menos '+n:n+' selecionad'+(n>1?'as':'a');
 return `<details class="msel${inv&&n?' inv':''}" id="${id}"><summary>${rotulo}: <b>${txt}</b></summary><div class="msel-box">
  ${opcoes.length>8?`<input type="search" class="msel-q" data-mq="${id}" placeholder="Filtrar" aria-label="Filtrar ${esc(rotulo)}">`:''}
  <div class="scope"><button class="btn ghost" type="button" data-mall="${id}">Marcar todas</button><button class="btn ghost" type="button" data-mnone="${id}">Limpar</button></div>
  <div class="msel-ops">${opcoes.map(o=>`<label data-mlab="${id}"><input type="checkbox" data-mo="${id}" value="${esc(o)}" ${sel&&sel.has(o)?'checked':''}> <span>${esc(o)}</span></label>`).join('')||'<span class="note">Nenhuma</span>'}</div>
  <div class="msel-foot"><label class="sw" title="Mostra tudo, menos o que estiver marcado"><input type="checkbox" data-minv="${id}" ${inv?'checked':''}> Filtro inverso</label><button class="btn primary" type="button" data-mok="${id}">Aplicar</button></div>
  <p class="note" style="margin:0">Com o filtro inverso ligado, aparece tudo <b>menos</b> o que estiver marcado.</p></div></details>`};

function m5BindMsel(alvo,map,re){
 $$('[data-mq]').forEach(q=>{if(!map[q.dataset.mq])return;q.oninput=()=>{const t=q.value.toLowerCase();$$(`[data-mlab="${q.dataset.mq}"]`).forEach(l=>l.hidden=!l.textContent.toLowerCase().includes(t))}});
 $$('[data-mall]').forEach(b=>{if(!map[b.dataset.mall])return;b.onclick=()=>$$(`[data-mlab="${b.dataset.mall}"]`).forEach(l=>{if(!l.hidden)l.querySelector('input').checked=true})});
 $$('[data-mnone]').forEach(b=>{if(!map[b.dataset.mnone])return;b.onclick=()=>$$(`[data-mo="${b.dataset.mnone}"]`).forEach(x=>x.checked=false)});
 $$('[data-mok]').forEach(b=>{const id=b.dataset.mok,k=map[id];if(!k)return;b.onclick=()=>{const all=$$(`[data-mo="${id}"]`);const on=all.filter(x=>x.checked).map(x=>x.value);const inv=!!$(`[data-minv="${id}"]`)?.checked;
  alvo[k]=(!on.length||(!inv&&on.length===all.length))?null:new Set(on);alvo[k+'Inv']=!!(inv&&alvo[k]);re()}})}

/* relatórios: filtros com inverso */
rfFiltra=function(ls){const f=st.rf;return ls.filter(l=>{if(l.tipo!=='Receita'&&l.tipo!=='Despesa')return false;if(f.tipo==='rec'&&l.tipo!=='Receita')return false;if(f.tipo==='des'&&l.tipo!=='Despesa')return false;
 if(f.status==='real'&&!m5Real(l))return false;return m5Ok(f.contas,f.contasInv,[l.conta])&&m5Ok(f.cats,f.catsInv,[mestre(l.cat)])&&m5Ok(f.tags,f.tagsInv,l.tags||[])})};
const _bindFiltrosM5=bindFiltros;
bindFiltros=function(re){_bindFiltrosM5(re);const f=st.rf;m5BindMsel(f,{fmC:'contas',fmK:'cats',fmT:'tags'},re);
 if($('#rfLimpa'))$('#rfLimpa').onclick=()=>{Object.assign(f,{tipo:'todos',status:'real',contas:null,cats:null,tags:null,contasInv:false,catsInv:false,tagsInv:false});re()}};
const m5TxtInv=h=>{const f=st.rf;if(typeof h!=='string')return h;if(f.contasInv&&f.contas)h=h.replace('Contas: ','Contas (todas menos): ');if(f.catsInv&&f.cats)h=h.replace('Categorias: ','Categorias (todas menos): ');if(f.tagsInv&&f.tags)h=h.replace('Tags: ','Tags (todas menos): ');return h};
const _vEvoM5=vEvo;vEvo=function(){return m5TxtInv(_vEvoM5.apply(this,arguments))};

/* relatório de lançamentos de caixa: filtros com inverso + vencidos no dia de hoje */
vRelCaixa=function(){const f=st.rf;const ini=st.rel.cIni,fim=st.rel.cFim;const bancos=contasBanco().filter(b=>m5Ok(f.contas,f.contasInv,[b.nome]));const sel=new Set(bancos.map(b=>b.nome));
 const todos=ativos().filter(l=>{const d=m5Dia(l);return d>=ini&&d<=fim&&(sel.has(l.conta)||sel.has(l.ctr))}).sort(m5Ord);
 const filtroCat=f.cats||f.tags;
 const passa=l=>{const tr=l.tipo==='Transferência'||l.tipo==='Pagamento';if(tr)return f.tipo==='todos'&&!filtroCat&&!(sel.has(l.conta)&&sel.has(l.ctr));if(f.tipo==='rec'&&l.tipo!=='Receita')return false;if(f.tipo==='des'&&l.tipo!=='Despesa')return false;if(f.status==='real'&&!m5Real(l))return false;return m5Ok(f.cats,f.catsInv,[mestre(l.cat)])&&m5Ok(f.tags,f.tagsInv,l.tags||[])};
 const vis=todos.filter(passa);const sAnt=bancos.reduce((a,b)=>a+saldo(b.nome,dAdd(ini,-1)),0);let run=sAnt,html='';
 [...new Set(todos.map(m5Dia))].forEach(d=>{todos.filter(l=>m5Dia(l)===d).forEach(l=>bancos.forEach(b=>run+=efeito(l,b.nome)));const v=vis.filter(l=>m5Dia(l)===d);if(!v.length)return;
  const venc=v.filter(m5Atras);html+=(venc.length?m5Sep():'')+v.map(l=>m5Venc(linhaL(l,sel),l)).join('')+`<div class="dayfoot"><span>${SEM[D(d).getDay()]}, ${fdl(d)}</span><b class="num">${val(run)}</b></div>`});
 const rec=vis.filter(l=>l.tipo==='Receita').reduce((a,l)=>a+l.valor,0),des=vis.filter(l=>l.tipo==='Despesa').reduce((a,l)=>a+l.valor,0);
 const ctTxt=f.contas?' · '+(f.contasInv?'todas menos ':'')+[...f.contas].join(', '):'';
 return `<div class="rep">${relHead('Lançamentos de caixa',fdl(ini)+' até '+fdl(fim)+ctTxt)}<div class="saldoant"><span class="note">${fd(dAdd(ini,-1)).slice(0,5)}</span><span style="flex:1;padding-left:16px">Saldo anterior</span><b class="num">${val(sAnt)}</b></div><div class="list rel-list">${html||'<p class="note" style="padding:14px">Sem lançamentos com esses filtros.</p>'}</div>
 <div style="padding:14px 16px;display:grid;gap:14px"><table class="sumtbl num"><thead><tr><th></th><th class="r">Confirmado</th><th class="r">Projetado</th></tr></thead><tbody>${bancos.map(b=>`<tr><td>${esc(b.nome)}</td><td class="r">${val(saldo(b.nome,fim,true))}</td><td class="r">${val(saldo(b.nome,fim))}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td class="r">${val(bancos.reduce((a,b)=>a+saldo(b.nome,fim,true),0))}</td><td class="r">${val(bancos.reduce((a,b)=>a+saldo(b.nome,fim),0))}</td></tr></tbody></table>
 <table class="sumtbl num"><tbody><tr><td>Receitas</td><td class="r pos">${val(rec)}</td></tr><tr><td>Despesas</td><td class="r neg">${val(des)}</td></tr><tr class="tot"><td>Resultado</td><td class="r ${rec+des<0?'neg':'pos'}">${val(rec+des)}</td></tr></tbody></table></div></div>`};

/* ---------- LANÇAMENTOS DE CAIXA ---------- */
vCaixa=function(){
 const c=C(),bancos=contasBanco();if(!st.cx.contas)st.cx.contas=new Set(bancos.map(b=>b.nome));
 const sel=st.cx.contas,{ini,fim}=st.cx;
 const noPer=ativos().filter(l=>{const d=m5Dia(l);return d>=ini&&d<=fim&&(sel.has(l.conta)||sel.has(l.ctr))}).sort(m5Ord);
 let ent={rec:0,tr:0},sai={des:0,tr:0};
 noPer.forEach(l=>{if(l.tipo==='Receita'&&sel.has(l.conta))ent.rec+=l.valor;else if(l.tipo==='Despesa'&&sel.has(l.conta))sai.des+=l.valor;else if(l.tipo==='Transferência'||l.tipo==='Pagamento'){const a=Math.abs(l.valor);if(sel.has(l.conta)&&!sel.has(l.ctr))sai.tr-=a;if(sel.has(l.ctr)&&!sel.has(l.conta))ent.tr+=a}});
 const tp=st.cx.tipo||'todos',q=(st.cx.q||'').toLowerCase();
 const vis=noPer.filter(l=>(tp==='todos'||(tp==='rec'&&l.tipo==='Receita')||(tp==='des'&&l.tipo==='Despesa')||(tp==='tr'&&(l.tipo==='Transferência'||l.tipo==='Pagamento')))
  &&st.cx.status.has(l.status)&&(!q||buscaOk(l.desc+' '+l.cat+' '+(l.tags||[]).join(' ')+' '+(l.contato||'')+' '+(l.ndoc||''),l.valor,q))
  &&m5Ok(st.cx.cats,st.cx.catsInv,[l.cat,mestre(l.cat)])&&m5Ok(st.cx.tags,st.cx.tagsInv,l.tags||[]));
 const sAnt=[...sel].reduce((a,n)=>a+saldo(n,dAdd(ini,-1)),0);
 let run=sAnt,html=`<div class="saldoant"><span class="note">${fd(dAdd(ini,-1)).slice(0,5)}</span><span style="flex:1;padding-left:16px">Saldo anterior</span><b class="num ${sAnt<0?'neg':'pos'}">${val(sAnt)}</b></div>`;
 [...new Set(noPer.map(m5Dia))].forEach(d=>{noPer.filter(l=>m5Dia(l)===d).forEach(l=>{[...sel].forEach(n=>run+=efeito(l,n))});const v=vis.filter(l=>m5Dia(l)===d);if(!v.length)return;
  html+=(v.some(m5Atras)?m5Sep():'')+v.map(l=>m5Venc(linhaL(l,sel),l)).join('')+`<div class="dayfoot"><span>${SEM[D(d).getDay()]}, ${fdl(d)}</span><b class="num ${run<0?'neg':''}">${val(run)}</b></div>`});
 const cs=new Set();ativos().forEach(l=>{if(l.cat&&(l.tipo==='Receita'||l.tipo==='Despesa')){cs.add(l.cat);cs.add(mestre(l.cat))}});(c.cats||[]).forEach(x=>{if(x){cs.add(x);cs.add(mestre(x))}});
 const catOps=[...cs].filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt',{numeric:true}));
 const tagOps=listaTags().map(x=>x[0]);
 const nVenc=ativos().filter(l=>m5Atras(l)&&(sel.has(l.conta)||sel.has(l.ctr))).length;
 const temFiltro=st.cx.cats||st.cx.tags||tp!=='todos'||q;
 $('#view').innerHTML=topo('Financeiro · caixa','Lançamentos de caixa',`<button class="btn primary" type="button" id="novoL">+ Novo lançamento</button>`)+bannerExemplo()+`
 <div class="split"><div class="side">
  <div class="panel"><div class="form"><div class="row"><label>Início<input type="date" id="cxIni" value="${ini}"></label><label>Fim<input type="date" id="cxFim" value="${fim}"></label></div>
  <div class="chips"><button class="chip" type="button" data-per="0">Este mês</button><button class="chip" type="button" data-per="-1">Mês anterior</button><button class="chip" type="button" data-per="1">Próximo mês</button></div></div></div>
  <div class="panel"><table class="sumtbl num"><thead><tr><th></th><th class="r">Confirmado</th><th class="r">Projetado</th></tr></thead><tbody>
  ${bancos.map(b=>{const cf=saldo(b.nome,fim,true),pj=saldo(b.nome,fim);return `<tr><td><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-cta="${esc(b.nome)}" ${sel.has(b.nome)?'checked':''}> ${esc(b.nome)}</label></td><td class="r ${cf<0?'neg':'pos'}">${val(cf)}</td><td class="r ${pj<0?'neg':'pos'}">${val(pj)}</td></tr>`}).join('')}
  <tr class="tot"><td>Total</td><td class="r">${val([...sel].reduce((a,n)=>a+saldo(n,fim,true),0))}</td><td class="r">${val([...sel].reduce((a,n)=>a+saldo(n,fim),0))}</td></tr></tbody></table>
  ${nVenc?`<p class="note" style="margin:0">${nVenc} lançamento${nVenc>1?'s':''} vencido${nVenc>1?'s':''} em aberto ${nVenc>1?'estão':'está'} no saldo projetado de hoje.</p>`:''}</div>
  <div class="panel"><div class="note" style="text-align:center">Resultados (R$)</div><table class="sumtbl num"><tbody>
   <tr><td>Entradas</td><td class="r pos">${val(ent.rec+ent.tr)}</td></tr><tr class="sub"><td>Receitas</td><td class="r pos">${val(ent.rec)}</td></tr><tr class="sub"><td>Transferências</td><td class="r">${val(ent.tr)}</td></tr>
   <tr><td>Saídas</td><td class="r neg">${val(sai.des+sai.tr)}</td></tr><tr class="sub"><td>Despesas</td><td class="r neg">${val(sai.des)}</td></tr><tr class="sub"><td>Transferências</td><td class="r">${val(sai.tr)}</td></tr>
   <tr class="tot"><td>Resultado</td><td class="r ${ent.rec+ent.tr+sai.des+sai.tr<0?'neg':'pos'}">${val(ent.rec+ent.tr+sai.des+sai.tr)}</td></tr></tbody></table></div>
 </div>
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:12px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:8px">
  <div class="chips">${['Pendente','Agendado','Confirmado','Conciliado'].map(s=>`<button type="button" class="chip ${st.cx.status.has(s)?'':'off'}" data-stf="${s}">${ICO[s]}${s==='Pendente'?'Pendentes':s+'s'}</button>`).join('')}</div>
  <div class="scope" style="flex-wrap:wrap"><select id="cxTipo" aria-label="Tipo"><option value="todos">Todos os tipos</option><option value="rec" ${tp==='rec'?'selected':''}>Só receitas</option><option value="des" ${tp==='des'?'selected':''}>Só despesas</option><option value="tr" ${tp==='tr'?'selected':''}>Só transferências</option></select>
  ${multiSel('cxK','Categorias',catOps,st.cx.cats,!!st.cx.catsInv)}${multiSel('cxT','Tags',tagOps,st.cx.tags,!!st.cx.tagsInv)}
  <input type="text" id="cxQ" placeholder="Buscar texto ou valor" title="Busca na descrição, categoria, tags, contato e também pelo valor (ex.: 255 ou 1.443,00)" value="${esc(st.cx.q||'')}" style="width:150px">${temFiltro?'<button class="btn ghost" type="button" id="cxLimpa">Limpar filtros</button>':''}<button class="btn" type="button" id="cxExp">Exportar .xlsx</button></div></div>
  <div class="list">${html}${vis.length?'':'<p class="note" style="padding:14px">Nenhum lançamento com esses filtros no período.</p>'}</div></div></div>`;
 bindScope();
 $('#cxIni').onchange=e=>{st.cx.ini=e.target.value;vCaixa()};$('#cxFim').onchange=e=>{st.cx.fim=e.target.value;vCaixa()};
 $$('[data-per]').forEach(b=>b.onclick=()=>{const m=mAdd(HOJE.slice(0,7),+b.dataset.per);st.cx.ini=m+'-01';st.cx.fim=dAdd(mAdd(m,1)+'-01',-1);vCaixa()});
 $$('[data-cta]').forEach(b=>b.onchange=()=>{b.checked?sel.add(b.dataset.cta):sel.delete(b.dataset.cta);vCaixa()});
 $$('[data-stf]').forEach(b=>b.onclick=()=>{const s=b.dataset.stf;st.cx.status.has(s)?st.cx.status.delete(s):st.cx.status.add(s);vCaixa()});
 $('#cxTipo').onchange=e=>{st.cx.tipo=e.target.value;vCaixa()};
 m5BindMsel(st.cx,{cxK:'cats',cxT:'tags'},vCaixa);
 if($('#cxLimpa'))$('#cxLimpa').onclick=()=>{Object.assign(st.cx,{tipo:'todos',cats:null,tags:null,catsInv:false,tagsInv:false,q:''});vCaixa()};
 $('#cxQ').oninput=e=>{st.cx.q=e.target.value;clearTimeout(st._q);st._q=setTimeout(()=>{vCaixa();const q=$('#cxQ');q.focus();q.setSelectionRange(q.value.length,q.value.length)},350)};
 $('#novoL').onclick=()=>modalLanc(null,{conta:bancos[0]?.nome});
 $('#cxExp').onclick=()=>exportarMD(vis,'Lancamentos_caixa_'+ini+'_a_'+fim);
 bindLinhas(vCaixa);
};

/* ===================================================================
 * Tags cadastradas (como categorias) + escolher/criar tag e categoria
 * direto no lançamento + busca também por valor (buscaOk em app.js)
 * =================================================================== */
function listaTags(){const c=C();const n={};ativos().forEach(l=>(l.tags||[]).forEach(t=>{if(t)n[t]=(n[t]||0)+1}));(c.tagsCad||[]).forEach(t=>{if(t&&!(t in n))n[t]=0});
 return Object.entries(n).sort((a,b)=>a[0].localeCompare(b[0],'pt',{numeric:true,sensitivity:'base'}))}
const m5LimpaTag=s=>String(s||'').replace(/,/g,' ').replace(/\s+/g,' ').trim().slice(0,40);
function m5CriaTag(nome){const c=C();const t=m5LimpaTag(nome);if(!t)return'';const ja=listaTags().map(x=>x[0]).find(x=>x.toLowerCase()===t.toLowerCase());if(ja)return ja;
 c.tagsCad=c.tagsCad||[];c.tagsCad.push(t);log('Tag criada',t);save();return t}
function m5TrocaTag(de,para){const c=C();let n=0;const tr=arr=>{if(!Array.isArray(arr)||!arr.includes(de))return arr;n++;const o=arr.filter(x=>x!==de);if(para&&!o.includes(para))o.push(para);return o};
 c.lanc.forEach(l=>{const o=tr(l.tags);if(o!==l.tags)l.tags=o});(c.regras||[]).forEach(r=>{r.tags=tr(r.tags)||r.tags});
 c.tagsCad=(c.tagsCad||[]).filter(x=>x!==de);if(para&&!c.tagsCad.includes(para))c.tagsCad.push(para);return n}

/* tela Categorias ganha a aba Tags */
const _vCatsM5=vCats;
vCats=function(){if(st.cat.tipo==='T')return m5VTags();_vCatsM5();const tabs=$('#view .tabs');if(!tabs)return;
 tabs.insertAdjacentHTML('beforeend',`<button type="button" data-ct2="T">Tags (${listaTags().length})</button>`);$('[data-ct2="T"]').onclick=()=>{st.cat.tipo='T';vCats()}};
function m5VTags(){const {T}=arvoreCats();const tags=listaTags();const pode_=pode.cadastro();
 $('#view').innerHTML=topo('Plano de contas','Categorias',pode_?`<button class="btn primary" type="button" id="tagNova">+ Nova tag</button>`:'')+`
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:10px 14px;border-bottom:1px solid var(--line)"><div class="tabs" style="border:0"><button type="button" data-ct2="D">Despesas (${Object.keys(T.D).length})</button><button type="button" data-ct2="R">Receitas (${Object.keys(T.R).length})</button><button type="button" data-ct2="T" class="on">Tags (${tags.length})</button></div></div>
 <div class="tbl"><table class="cattbl"><thead><tr><th>Tag</th><th class="r">Lançamentos</th><th></th></tr></thead><tbody>
 ${tags.map(([t,n])=>`<tr><td><span class="tg ${tagCls(t)}">${esc(t)}</span></td><td class="r num">${n}</td><td class="r">${pode_?`<button class="btn ghost" type="button" data-tren="${esc(t)}">Renomear</button><button class="btn ghost" type="button" data-tdel="${esc(t)}">Excluir</button>`:''}</td></tr>`).join('')||'<tr><td colspan="3" class="note">Nenhuma tag ainda. Crie aqui ou direto no lançamento.</td></tr>'}
 </tbody></table></div></div>
 <p class="note" style="margin:0">As tags cadastradas aparecem para marcar na hora de lançar. Renomear ou excluir atualiza todos os lançamentos e as regras de classificação.</p>`;
 bindScope();$$('[data-ct2]').forEach(b=>b.onclick=()=>{st.cat.tipo=b.dataset.ct2;vCats()});
 if($('#tagNova'))$('#tagNova').onclick=()=>m5ModalTag('');
 $$('[data-tren]').forEach(b=>b.onclick=()=>m5ModalTag(b.dataset.tren));
 $$('[data-tdel]').forEach(b=>b.onclick=()=>m5ModalDelTag(b.dataset.tdel))}
function m5ModalTag(atual){abrirModal(`<div class="mhead"><h3>${atual?'Renomear tag':'Nova tag'}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fTg"><label>Nome da tag<input type="text" id="tgN" maxlength="40" value="${esc(atual)}" required placeholder="ex.: Fixo, Variável, Sócio"></label>${atual?`<p class="note" style="margin:0">Se já existir uma tag com o novo nome, as duas são unidas.</p>`:''}</form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fTg">${atual?'Salvar':'Criar'}</button></div>`);
 $('#fTg').onsubmit=e=>{e.preventDefault();const t=m5LimpaTag($('#tgN').value);if(!t){toast('Informe o nome');return}
  if(!atual){const r=m5CriaTag(t);fecharModal();toast(r===t?'Tag criada':'Essa tag já existe');return vCats()}
  if(t===atual){fecharModal();return}const ex=listaTags().map(x=>x[0]).find(x=>x.toLowerCase()===t.toLowerCase()&&x!==atual);const n=m5TrocaTag(atual,ex||t);
  log('Tag renomeada',atual+' → '+(ex||t)+' · '+n+' lançamentos');save();fecharModal();toast(n+' lançamentos atualizados');vCats()}}
function m5ModalDelTag(t){const n=(listaTags().find(x=>x[0]===t)||[])[1]||0;const outras=listaTags().map(x=>x[0]).filter(x=>x!==t);
 abrirModal(`<div class="mhead"><h3>Excluir tag “${esc(t)}”</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fTd"><p style="margin:0">${n?`Ela está em <b>${n}</b> lançamento${n>1?'s':''}.`:'Nenhum lançamento usa essa tag.'}</p>
 ${n?`<label>O que fazer com esses lançamentos?<select id="tdD"><option value="">Só tirar a tag</option>${outras.map(o=>`<option value="${esc(o)}">Trocar por “${esc(o)}”</option>`).join('')}</select></label>`:''}</form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fTd">Excluir</button></div>`);
 $('#fTd').onsubmit=e=>{e.preventDefault();const para=$('#tdD')?.value||'';const m=m5TrocaTag(t,para);log('Tag excluída',t+(para?' → '+para:'')+' · '+m+' lançamentos');save();fecharModal();toast('Tag excluída');vCats()}}

/* lançamento: tags para marcar + criar tag + criar categoria */
const _modalLancM5=modalLanc;
modalLanc=function(l,pre){_modalLancM5(l,pre||{});try{m5TagPick();m5CatNova()}catch(e){console.error(e)}};
function m5TagPick(){const inp=$('#mTags');if(!inp)return;const lb=inp.closest('label');const parse=v=>String(v||'').split(',').map(s=>s.trim()).filter(Boolean);let sel=parse(inp.value);
 const div=document.createElement('div');div.className='tagpick';lb.replaceWith(div);const podeCriar=pode.cadastro();
 const draw=()=>{const todas=[...new Set([...listaTags().map(x=>x[0]),...sel])];
  div.innerHTML=`<span class="tp-l">Tags <small>(toque para marcar)</small></span><div class="tp-chips">${todas.map(t=>`<button type="button" class="tpc ${sel.includes(t)?'on':''}" data-tpc="${esc(t)}" aria-pressed="${sel.includes(t)}">${esc(t)}</button>`).join('')||'<span class="note">Nenhuma tag cadastrada.</span>'}${podeCriar?'<button type="button" class="tpc add" id="tpNova">+ Nova tag</button>':''}</div>
  <div id="tpForm" class="tp-form" hidden><input type="text" id="tpNome" placeholder="Nome da nova tag" maxlength="40" aria-label="Nome da nova tag"><button class="btn" type="button" id="tpOk">Criar e marcar</button><button class="btn ghost" type="button" id="tpX">Cancelar</button></div>
  <input type="hidden" id="mTags" value="${esc(sel.join(', '))}">`;
  div.querySelectorAll('[data-tpc]').forEach(b=>b.onclick=()=>{const t=b.dataset.tpc;sel=sel.includes(t)?sel.filter(x=>x!==t):[...sel,t];draw()});
  const nova=div.querySelector('#tpNova');if(nova)nova.onclick=()=>{div.querySelector('#tpForm').hidden=false;div.querySelector('#tpNome').focus()};
  const criar=()=>{const t=m5CriaTag(div.querySelector('#tpNome').value);if(!t){toast('Informe o nome da tag');return}if(!sel.includes(t))sel.push(t);draw();toast('Tag “'+t+'” criada e marcada')};
  div.querySelector('#tpOk').onclick=criar;div.querySelector('#tpX').onclick=()=>{div.querySelector('#tpForm').hidden=true};
  div.querySelector('#tpNome').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();criar()}}};
 div._sync=()=>{sel=parse($('#mTags').value);draw()};draw();
 /* "Usar sugestão" preenche as tags: atualiza as marcações */
 const ligaSug=()=>{const b=$('#mAplS');if(b&&!b._m5){const o=b.onclick;b.onclick=()=>{o&&o();div._sync()};b._m5=1}};
 const d=$('#mDesc');if(d){const o=d.oninput;d.oninput=()=>{o&&o();ligaSug()}}ligaSug()}
function m5CatNova(){if(!pode.cadastro())return;const lb=$('#lbCat');if(!lb)return;
 lb.insertAdjacentHTML('beforeend','<button class="linkbtn" type="button" id="catNovaL">+ Criar nova categoria</button>');
 lb.closest('.row').insertAdjacentHTML('afterend',`<div id="catNovaF" class="catnova" hidden><b>Nova categoria</b><div class="row"><label>Categoria master<select id="cnM"></select></label><label id="lbCnMn">Nome da nova master<input type="text" id="cnMn" placeholder="ex.: 05 - Investimentos"></label><label>Subcategoria (opcional)<input type="text" id="cnS" placeholder="ex.: Equipamentos"></label></div><div class="scope"><button class="btn primary" type="button" id="cnOk">Criar e usar</button><button class="btn ghost" type="button" id="cnX">Cancelar</button></div></div>`);
 const tpAtual=()=>($('[data-tp].on')?.dataset.tp==='Receita')?'R':'D';
 const abrir=()=>{const {T}=arvoreCats();const tp=tpAtual();const atual=mestre($('#mCat').value||'');const ms=Object.keys(T[tp]).sort((a,b)=>a.localeCompare(b,'pt',{numeric:true}));
  $('#cnM').innerHTML=`<option value="">+ Nova categoria master</option>`+ms.map(m=>`<option ${m===atual?'selected':''}>${esc(m)}</option>`).join('');
  $('#lbCnMn').hidden=!!$('#cnM').value;$('#catNovaF').hidden=false;($('#cnM').value?$('#cnS'):$('#cnMn')).focus()};
 $('#catNovaL').onclick=e=>{e.preventDefault();abrir()};$('#cnM').onchange=()=>{$('#lbCnMn').hidden=!!$('#cnM').value};$('#cnX').onclick=()=>{$('#catNovaF').hidden=true};
 const criar=()=>{const c=C();const m=($('#cnM').value||$('#cnMn').value).trim();const s=$('#cnS').value.trim().replace(/\//g,'-');if(!m){toast('Informe a categoria master');return}
  const cat=s?m+'/'+s:m;const tp=tpAtual();c.cats=c.cats||[];if(!c.cats.includes(cat))c.cats.push(cat);if(!c.cats.includes(m))c.cats.push(m);c.catTipo=c.catTipo||{};c.catTipo[cat]=tp;if(!c.catTipo[m])c.catTipo[m]=tp;
  log('Categoria criada',cat);save();const dl=$('#dlCat');if(dl&&![...dl.options].some(o=>o.value===cat))dl.insertAdjacentHTML('beforeend',`<option value="${esc(cat)}">`);
  $('#mCat').value=cat;$('#catNovaF').hidden=true;$('#cnMn').value='';$('#cnS').value='';if($('#mSug'))$('#mSug').hidden=true;toast('Categoria “'+cat+'” criada')};
 $('#cnOk').onclick=criar;['#cnMn','#cnS'].forEach(q=>$(q).onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();criar()}})}

/* ===================================================================
 * Processo do cliente: cada cliente tem o seu. O passo a passo da Lívia
 * (Avec × Sipag × Sicoob) fica só na The Beauty. Os outros começam sem
 * processo, com opção de partir de um modelo básico e editar.
 * =================================================================== */
const PROCESSO_BASICO=[
 {t:'Documentos do mês',go:'conciliacao',i:['Baixar o extrato de todas as contas do cliente (OFX, PDF ou Excel).','Recolher comprovantes, boletos e notas do período.','Baixar o relatório do sistema do cliente (vendas/recebimentos), se houver.']},
 {t:'Contas a receber',go:'abertos',i:['Lançar as receitas do mês com competência e vencimento.','Dar baixa no que já foi recebido.']},
 {t:'Contas a pagar',go:'abertos',i:['Lançar as despesas fixas, parceladas e à vista.','Conferir os vencimentos da semana.']},
 {t:'Conciliação',go:'conciliacao',i:['Importar o extrato e conciliar com o que já está lançado.','Classificar e lançar o que estiver no extrato e ainda não foi lançado.']},
 {t:'Fechamento',go:'relatorios',i:['Conferir as pendências do mês.','Aprovar e liberar os relatórios para o cliente.']}
];
/* compara só títulos e itens (o banco devolve os campos em outra ordem) */
const m5ProcSig=ps=>JSON.stringify((ps||[]).map(x=>[x.t,(x.i||[]).join('|')]));
const m5ProcLivia=p=>m5ProcSig(p.processo)===m5ProcSig(PROCESSO_PADRAO);
const _seedVazioM5=seedVazio;
seedVazio=function(k){const d=_seedVazioM5(k);d.perfil.processo=[];return d};
const _vProcM5=vProcesso;
vProcesso=function(){const c=C(),p=c.perfil;
 /* clientes que receberam o passo a passo da Lívia como padrão começam sem processo */
 if(st.scope!==BEAUTY&&m5ProcLivia(p)){p.processo=[];p.check={};save()}
 _vProcM5();const pode_=pode.cadastro();
 if(!p.processo.length){const pn=$('#view .panel');if(pn)pn.outerHTML=`<div class="panel"><h3>Este cliente ainda não tem processo</h3><p class="note" style="margin:0">Monte o passo a passo de como a Lume trabalha este cliente. Ele vira um checklist mensal para a equipe marcar o que já foi feito.</p>
  ${pode_?`<div class="scope"><button class="btn primary" type="button" id="pModelo">Começar pelo modelo básico</button><button class="btn" type="button" id="pBranco">Escrever do zero</button></div><p class="note" style="margin:0">O modelo básico traz as etapas comuns (documentos, contas a receber, contas a pagar, conciliação e fechamento). Depois é só editar.</p>`:''}</div>`;
  if($('#pModelo'))$('#pModelo').onclick=()=>{p.processo=JSON.parse(JSON.stringify(PROCESSO_BASICO));p.check={};log('Processo criado','modelo básico');save();toast('Processo criado. Edite como quiser lá embaixo.');vProcesso()};
  if($('#pBranco'))$('#pBranco').onclick=()=>{const t=$('#pTxt');if(t){t.value='Primeira etapa\n- primeiro item\n- segundo item';t.focus();t.scrollIntoView({block:'center'})}}}
 /* maquininhas: só mostra o quadro quando o cliente tem */
 if(!Object.keys(p.estabs||{}).length){const h=[...$$('#view h3')].find(x=>x.textContent==='Maquininhas e prazos');if(h)h.parentElement.innerHTML='<h3>Maquininhas e prazos</h3><p class="note" style="margin:0">Nenhuma maquininha configurada para este cliente.</p>'}
 /* excluir particularidade */
 if(pode_){const lis=[...$$('#view .grid2 .panel:first-child li')].filter(li=>!li.classList.contains('note'));lis.forEach((li,i)=>{li.insertAdjacentHTML('beforeend',` <button class="linkbtn" type="button" data-pdel="${i}" aria-label="Excluir particularidade" style="color:var(--muted)">excluir</button>`)});
  $$('[data-pdel]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pdel;const t=p.partic[i];p.partic.splice(i,1);log('Particularidade excluída',t||'');save();vProcesso()})}};

/* ===================================================================
 * Versão do cliente no celular
 * - Portal: números do mês = realizado até hoje; contas vencidas em aberto
 *   aparecem separadas; taxas de cartão do dia viram uma linha só.
 * - Relatórios: o cliente abre direto no último mês liberado.
 * =================================================================== */
vPortal=function(){const c=C(),m=HOJE.slice(0,7),bancos=contasBanco();
 const real=ativos().filter(l=>l.data.slice(0,7)===m&&l.data<=HOJE&&m5Real(l));
 const rec=real.filter(l=>l.tipo==='Receita').reduce((a,l)=>a+l.valor,0),des=real.filter(l=>l.tipo==='Despesa').reduce((a,l)=>a+l.valor,0);
 const abertos=ativos().filter(l=>l.tipo==='Despesa'&&!m5Real(l));
 const venc=abertos.filter(l=>l.data<HOJE),prox=abertos.filter(l=>l.data>=HOJE&&dDiff(l.data,HOJE)<=15);
 const agrupa=ls=>{const out=[],tx={};ls.sort((a,b)=>a.data<b.data?-1:1).forEach(l=>{if(ehTaxaCartao(l)){const g=tx[l.data]||(tx[l.data]={data:l.data,desc:'Taxas de cartão',valor:0,n:0,tx:1});if(!g.n)out.push(g);g.n++;g.valor+=l.valor}else out.push(l)});return out};
 const linhas=ls=>agrupa(ls).map((l,i)=>`<tr${i>=8?' class="mais"':''}><td class="num note">${fd(l.data).slice(0,5)}</td><td>${esc(l.desc)}${l.tx?` <span class="note">(${l.n})</span>`:''}</td><td class="r num neg">${val(l.valor)}</td></tr>`).join('');
 const soma=ls=>ls.reduce((a,l)=>a+l.valor,0);const verMais=ls=>{const n=agrupa(ls.slice()).length;return n>8?`<button class="btn ghost vermais" type="button">Ver todas (${n})</button>`:''};
 const ultAprov=Object.keys(c.aprov||{}).sort().pop();
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Portal do cliente</div><h2>${esc(nomeEsc(st.scope))}</h2></div><div class="scope">${escopos().length>1?scopeSelect():'<span class="note">Você vê somente os dados da sua empresa</span>'}</div></div>
 <div class="kpis"><div class="kpi"><span class="l">Saldo em contas hoje</span><span class="v num">${brl(bancos.reduce((a,b)=>a+saldo(b.nome,HOJE,true),0))}</span><span class="s">${bancos.length} conta${bancos.length>1?'s':''}</span></div>
 <div class="kpi"><span class="l">Receitas de ${MES[+m.slice(5)-1]}</span><span class="v num pos">${brl(rec)}</span><span class="s">recebido até hoje</span></div>
 <div class="kpi"><span class="l">Despesas de ${MES[+m.slice(5)-1]}</span><span class="v num neg">${brl(des)}</span><span class="s">pago até hoje</span></div>
 <div class="kpi"><span class="l">Último relatório liberado</span><span class="v" style="font-size:18px">${ultAprov?mNome(ultAprov):'—'}</span><span class="s">${ultAprov?'<button class="btn ghost" type="button" data-go="relatorios" style="padding:0">Ver relatórios</button>':'Em breve'}</span></div></div>
 <div class="grid2"><div class="panel"><h3>Contas</h3><table class="sumtbl num"><tbody>${bancos.map(b=>`<tr><td>${esc(b.nome)}</td><td class="r">${brl(saldo(b.nome,HOJE,true))}</td></tr>`).join('')}</tbody></table></div>
 <div class="panel"><div class="panel-head"><h3>A pagar nos próximos 15 dias</h3><b class="num neg">${val(soma(prox))}</b></div><div class="tbl"><table class="ptbl"><tbody>${linhas(prox)||'<tr><td class="note">Nada previsto.</td></tr>'}</tbody></table></div>${verMais(prox)}</div>
 ${venc.length?`<div class="panel venc-panel"><div class="panel-head"><h3>Vencidas em aberto</h3><b class="num neg">${val(soma(venc))}</b></div><p class="note" style="margin:0">Contas com data passada que ainda não constam como pagas. A Lume confere na conciliação.</p><div class="tbl"><table class="ptbl"><tbody>${linhas(venc)}</tbody></table></div>${verMais(venc)}</div>`:''}</div>`;
 bindScope();$$('[data-go]').forEach(b=>b.onclick=()=>{st.view=b.dataset.go;render()});
 $$('.vermais').forEach(b=>b.onclick=()=>{const t=b.parentElement.querySelector('.ptbl');const ab=t.classList.toggle('aberta');b.dataset.t=b.dataset.t||b.textContent;b.textContent=ab?'Mostrar menos':b.dataset.t})};

const _vRelM5=vRel;
vRel=function(){if(st.user&&st.user.perfil==='cliente'&&st.rel._cli!==st.scope){const a=Object.keys(C().aprov||{}).sort().pop();st.rel._cli=st.scope;
  if(a){st.rf.ate=a;st.rf.de=mAdd(a,-2);st.rel.mes=a;st.rel.cIni=a+'-01';st.rel.cFim=dAdd(mAdd(a,1)+'-01',-1)}}
 return _vRelM5.apply(this,arguments)};

/* ===================================================================
 * Contas a pagar · Lume (painel do escritório, antigo "Fluxo de Pagamentos")
 * Abre dentro do sistema. Só a Master e quem ela liberar veem.
 * O menu "Contas a receber e pagar" do cliente sai: está tudo em
 * Lançamentos de caixa, com os filtros.
 * =================================================================== */
const m5PodePagar=()=>!!st.user&&(st.user.perfil==='master'||st.user.pagar===true);
const _navM5=navItems;
navItems=function(){let it=_navM5().filter(x=>x[0]!=='abertos');
 if(st.user.perfil!=='cliente'&&m5PodePagar())it=[['','Escritório Lume'],['pagamentos','Contas a pagar · Lume'],...it];return it};
function m5Nav(){$('#nav').innerHTML=navItems().map(([k,l])=>k?`<button type="button" data-v="${k}" class="${st.view===k?'on':''}">${l}</button>`:`<div class="grp">${l}</div>`).join('');
 $('#whoami').innerHTML=`<b>${esc(st.user.nome)}</b><br><span style="color:#9FB0C4">${PERFIL_TXT[st.user.perfil].split(' · ')[0]}</span>`}
function m5AjustaFrame(){const f=$('#pagFrame');if(!f)return;f.style.height=Math.max(420,innerHeight-f.getBoundingClientRect().top-(innerWidth<=860?0:8))+'px'}
addEventListener('resize',m5AjustaFrame);
const _renderM5=render;
render=function(){if(st.user&&st.view==='pagamentos'){if(!m5PodePagar()){st.view='painel';return _renderM5()}
  m5Nav();document.body.classList.add('pag-on');
  if(!$('#pagFrame'))$('#view').innerHTML='<iframe id="pagFrame" class="pagframe" src="/pagamentos.html" title="Contas a pagar · Lume"></iframe>';
  m5AjustaFrame();return}
 document.body.classList.remove('pag-on');return _renderM5()};

/* Usuários e acessos: liberar o painel e os compromissos */
const m5Perm=(u,px)=>`<fieldset class="permbox"><legend>Painéis do escritório</legend>
 <label><input type="checkbox" id="${px}Pag" ${u&&u.pagar?'checked':''}> Contas a pagar · Lume <small>(agenda de pagamentos de todos os clientes)</small></label>
 <label><input type="checkbox" id="${px}Ag" ${u&&u.agenda?'checked':''}> Compromissos <small>(agenda pessoal dentro do painel)</small></label></fieldset>`;
function m5PatchNuvem(){const N=window.LumeNuvem;if(!N||N._m5)return;N._m5=1;
 const cria=N.criarUsuario,salva=N.salvarUsuario;
 const extra=px=>{const p=$('#'+px+'Pag'),a=$('#'+px+'Ag');return p?{pagar:p.checked,agenda:!!(a&&a.checked)}:{}};
 N.criarUsuario=u=>cria.call(N,Object.assign({},u,extra('pm')));
 N.salvarUsuario=(uid,u)=>salva.call(N,uid,Object.assign({},u,extra('eu')))}
const _vUsuM5=vUsuariosNuvem;
vUsuariosNuvem=async function(){await _vUsuM5.apply(this,arguments);if(st.view!=='usuarios')return;m5PatchNuvem();
 const f=$('#fUser');if(f&&!$('#pmPag')){const bt=f.querySelector('button[type="submit"]');(bt?bt.parentElement:f).insertAdjacentHTML('beforebegin',m5Perm(null,'pm'))}
 /* marca na lista quem tem o painel */
 try{(_usuarios||[]).forEach((u,i)=>{const b=$(`[data-eu="${i}"]`);const td=b?b.closest('tr').children[2]:null;if(td&&(u.pagar||u.agenda||u.perfil==='master'))td.insertAdjacentHTML('beforeend',`<br><span class="pill p-n" style="margin-top:4px;display:inline-block">${u.perfil==='master'||u.pagar?'Contas a pagar · Lume':''}${(u.perfil==='master'||u.agenda)&&(u.perfil==='master'||u.pagar)?' + ':''}${u.perfil==='master'||u.agenda?'Compromissos':''}</span>`)})}catch(e){}};
const _modalUsuM5=modalUsuario;
modalUsuario=function(u,todos){_modalUsuM5(u,todos);m5PatchNuvem();const a=$('#euA');if(a&&!$('#euPag'))a.closest('label').insertAdjacentHTML('beforebegin',m5Perm(u,'eu'))};


/* ===================================================================
 * Confirmar pagamento/recebimento pela bolinha: pergunta a data real
 * (e o valor pago, para juros ou desconto). Voltar para em aberto
 * devolve a data prevista.
 * =================================================================== */
const _bindLinhasM5=bindLinhas;
bindLinhas=function(re){_bindLinhasM5(re);
 $$('[data-st]').forEach(b=>b.onclick=()=>{const l=C().lanc.find(x=>x.id===b.dataset.st);if(!l)return;
  if(l.status==='Conciliado'){toast('Lançamento conciliado. Para alterar, desfaça a conciliação na tela de Conciliação.');return}
  if(m5Real(l))m5ModalReabrir(l,re);else m5ModalBaixa(l,re)})};
function m5ModalBaixa(l,re){const rec=l.tipo==='Receita',tr=l.tipo==='Transferência'||l.tipo==='Pagamento';const verbo=rec?'recebimento':tr?'transferência':'pagamento';
 const dPad=l.data<=HOJE?l.data:HOJE;
 abrirModal(`<div class="mhead"><h3>Confirmar ${verbo}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fBx"><div class="banner" style="display:block"><b style="font-weight:500">${esc(l.desc)}</b><br><span class="note">${esc(l.conta)}${l.ctr?' → '+esc(l.ctr):''} · lançado para ${fd(l.data)} · ${brl(Math.abs(l.valor))}</span></div>
 <div class="row"><label>Data em que foi ${rec?'recebido':tr?'feita':'pago'}<input type="date" id="bxD" value="${dPad}" required max="${HOJE}"></label>
 <label>Valor ${rec?'recebido':tr?'transferido':'pago'} (R$)<input type="text" id="bxV" inputmode="decimal" value="${nf(l.valor)}" required></label></div>
 <div class="chips"><button class="chip" type="button" data-bxd="${l.data}">Data do lançamento (${fd(l.data).slice(0,5)})</button><button class="chip" type="button" data-bxd="${HOJE}">Hoje (${fd(HOJE).slice(0,5)})</button><button class="chip" type="button" data-bxd="${dAdd(HOJE,-1)}">Ontem</button></div>
 <p class="note" style="margin:0">O lançamento vai para a data que você escolher, que é quando o dinheiro ${rec?'entrou':'saiu'} de fato. Assim o saldo de cada dia bate com o banco. Se o valor for diferente (juros, multa ou desconto), ajuste aqui.</p></form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fBx">Confirmar ${verbo}</button></div>`);
 $$('[data-bxd]').forEach(b=>b.onclick=()=>{$('#bxD').value=b.dataset.bxd});
 $('#fBx').onsubmit=e=>{e.preventDefault();const d=$('#bxD').value;if(!d){toast('Escolha a data');return}if(d>HOJE){toast('A data não pode ser no futuro. Para pagamento futuro, deixe como agendado.');return}
  const v=Math.abs(parseNum($('#bxV').value));if(!v){toast('Informe o valor');return}
  if(d!==l.data){if(!l.dataPrev)l.dataPrev=l.data;l.data=d}
  const nv=r2(Math.sign(l.valor||(rec?1:-1))*v);if(Math.abs(nv-l.valor)>.004){if(l.valorPrev===undefined)l.valorPrev=l.valor;l.valor=nv}
  l.status='Confirmado';log('Baixa',l.desc+' · '+fd(d)+' · '+brl(Math.abs(l.valor)));save();fecharModal();
  toast((rec?'Recebido':tr?'Transferido':'Pago')+' em '+fd(d)+(l.dataPrev&&l.dataPrev!==d?' (estava para '+fd(l.dataPrev)+')':''));re()}}
function m5ModalReabrir(l,re){const volta=l.dataPrev&&l.dataPrev!==l.data;
 abrirModal(`<div class="mhead"><h3>Voltar para em aberto?</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <div class="mbody"><p style="margin:0"><b style="font-weight:500">${esc(l.desc)}</b> · ${brl(Math.abs(l.valor))}</p><p class="note" style="margin:0">${volta?`Ele volta para a data prevista, <b>${fd(l.dataPrev)}</b>${l.valorPrev!==undefined?', e para o valor previsto de <b>'+brl(Math.abs(l.valorPrev))+'</b>':''}.`:`Ele continua em ${fd(l.data)}, como ${l.data>HOJE?'agendado':'pendente'}.`}</p></div>
 <div class="mfoot"><span></span><button class="btn primary" type="button" id="rbOk">Voltar para em aberto</button></div>`);
 $('#rbOk').onclick=()=>{if(volta){l.data=l.dataPrev}delete l.dataPrev;if(l.valorPrev!==undefined){l.valor=l.valorPrev;delete l.valorPrev}
  l.status=l.data>HOJE?'Agendado':'Pendente';log('Status',l.desc+' → '+l.status);save();fecharModal();toast('Voltou para em aberto');re()}}
const _linhaLM5=linhaL;
linhaL=function(l,sel){const h=_linhaLM5(l,sel);return l.dataPrev&&l.dataPrev!==l.data&&m5Real(l)?h.replace('</b>',`</b><span class="tg" title="Data prevista no lançamento">Previsto ${fd(l.dataPrev).slice(0,5)}</span>`):h};
