/* =====================================================================
   MÓDULO 4 · conferência de vendas com seleção, pendências por grupo,
   totais por categoria com período e filtros no relatório de caixa.
   Regra: o cartão (maquininha) é a verdade.
     Avec + maquininha  -> lança no contas a receber
     só maquininha      -> lança no contas a receber E vira pendência (falta no Avec)
     só Avec (cartão)   -> só pendência (não lança)
     Pix Avec + extrato -> lança · Pix só no Avec -> só pendência
   ===================================================================== */
ST_V.semsipag=['Falta relatório da maquininha','p-n'];
const _conferirM4=conferir;
conferir=function(ym){const R=_conferirM4(ym);if(!R.temSipag)R.av.forEach(a=>{if(a.st==='semcartao')a.st='semsipag'});return R};

/* ---------- linhas da conferência ---------- */
const chaveAv=a=>'av|'+a.d+'|'+a.com+'|'+a.forma+'|'+a.tot;
function sipLancada(s){const ps=s.parcs.filter(p=>p.prev);if(!ps.length)return'aguarda';const n=ps.filter(p=>existeRec(p)).length;return n===ps.length?'sim':n?'parcial':'nao'}
function linhasVenda(ym){const R=conferir(ym);const c=C(),pd=P();const L=[];
 R.av.forEach(a=>{const r={a,d:a.d,quem:(a.com?'Nº '+a.com+' · ':'')+a.cli,forma:a.forma,np:a.np,v:a.tot,tipo:a.tipo};
  if(a.tipo==='cartao'){if(a.st==='ok'){const ls=a.sip.map(sipLancada);r.fonte='ambos';r.sit='Avec e maquininha';r.cls='p-ok';r.lanc=ls.every(x=>x==='sim')?'sim':ls.some(x=>x==='aguarda')&&ls.every(x=>x==='aguarda'||x==='sim')?'aguarda':'nao';r.idvs=a.sip.map(s=>s.idv);r.det=a.sip.map(s=>`${s.band} ${s.forma} ${s.np}x · aut. ${s.aut}`).join(' + ')+(a.obs?' · '+a.obs:'')}
   else if(a.st==='semcartao'){r.fonte='avec';r.sit='Só no Avec';r.cls='p-bad';r.lanc='nunca';r.pend=true;r.det='Não está na maquininha: não lança. Confira se foi lançada errada no Avec.'}
   else{r.fonte='avec';r.sit='Falta relatório da maquininha';r.cls='p-n';r.lanc='nunca';r.det='Importe as vendas realizadas da maquininha deste mês.'}}
  else if(a.tipo==='pix'){if(a.st==='lancado'){r.fonte='ambos';r.sit='Pix lançado';r.cls='p-ok';r.lanc='sim';r.det='Lançado: '+a.lanc.desc}
   else if(a.st==='extrato'){r.fonte='ambos';r.sit='Pix no extrato';r.cls='p-ok';r.lanc='nao';r.det='Extrato '+fd(a.ext.data)+': '+a.ext.desc}
   else if(a.st==='pixfalta'){const temExt=Object.values(c.extratos||{}).flat().some(i=>i.data.slice(0,7)===ym);r.fonte='avec';r.sit='Pix só no Avec';r.cls='p-bad';r.lanc='nunca';r.pend=true;r.det=temExt?'Nenhum Pix de mesmo valor em ±1 dia no extrato nem nos lançamentos. Não lança.':'Não achei nos lançamentos. O extrato deste mês não foi importado: importe para conferir melhor.'}
   else{r.fonte='avec';r.sit='Falta o extrato';r.cls='p-n';r.lanc='nunca';r.det='Importe o extrato do banco deste mês em Conciliação bancária.'}}
  else if(a.tipo==='din'){const dup=ativos().some(l=>l.conta===pd.contaDin&&l.data===a.d&&Math.abs(l.valor-a.tot)<.01);r.fonte='avec';r.sit='Dinheiro';r.cls='p-n';r.lanc=dup?'sim':'nao';r.det='Entra na conta '+pd.contaDin}
  else{r.fonte='avec';r.sit='Outra forma';r.cls='p-n';r.lanc='nunca'}
  r.key=chaveAv(a);L.push(r)});
 R.sobra.forEach(s=>{const lc=sipLancada(s);const sem=!R.temAvec;L.push({sip:s,d:s.dt,quem:sem?'Maquininha (sistema da empresa não importado)':'Sem comanda no Avec',forma:s.band+' '+s.forma,np:s.np,v:s.tot,tipo:'cartao',fonte:'sipag',sit:sem?'Falta relatório do sistema':'Só na maquininha',cls:sem?'p-n':'p-warn',lanc:lc==='sim'?'sim':lc==='aguarda'?'aguarda':'nao',pend:!sem,idvs:[s.idv],key:'sp|'+s.idv,det:`aut. ${s.aut} · ${(C().perfil.estabs[s.est]||{}).nome||s.est} · lança porque o cartão vale, e fica pendente para corrigir o Avec`})});
 L.sort((x,y)=>x.d<y.d?-1:x.d>y.d?1:0);return{R,L}}

/* ---------- tela ---------- */
if(!st.vend.sel)st.vend.sel=new Set();
vVendas=function(){const c=C();if(!st.vend.mes){const ms=[...new Set(c.vendas.avec.map(a=>a.d.slice(0,7)).concat(c.vendas.sipag.map(s=>s.dt.slice(0,7))))].sort();st.vend.mes=ms.pop()||HOJE.slice(0,7)}
 const ym=st.vend.mes;const {R,L}=linhasVenda(ym);st.vend._R=R;st.vend._L=L;
 const ok=c.perfil.pendOk||{};const pendAb=L.filter(r=>r.pend&&!ok[r.key]);
 const paraLancar=L.filter(r=>r.lanc==='nao');[...st.vend.sel].forEach(k=>{if(!paraLancar.some(r=>r.key===k))st.vend.sel.delete(k)});
 const selR=paraLancar.filter(r=>st.vend.sel.has(r.key));const f=st.vend.f||'todos';
 const vis=L.filter(r=>f==='todos'||(f==='lancar'&&r.lanc==='nao')||(f==='lancadas'&&r.lanc==='sim')||(f==='pend'&&r.pend)||(f==='cartao'&&r.tipo==='cartao')||(f==='pix'&&r.tipo==='pix')||(f==='din'&&r.tipo==='din'));
 const soma=a=>a.reduce((x,r)=>x+r.v,0);const tot=soma(L.filter(r=>r.fonte!=='sipag'));
 const LANC={sim:'<span class="pill p-ok">Já lançado</span>',nao:'<span class="pill p-info">Para lançar</span>',aguarda:'<span class="pill p-n">Aguardando a maquininha processar</span>',nunca:'<span class="note">Não lança</span>'};
 const res=st.vend.resultado&&st.vend.resultado.ym===ym?st.vend.resultado:null;
 $('#view').innerHTML=topo('Vendas → contas a receber → pendências','Conferência de vendas',`<div class="monthnav" style="gap:4px"><button class="icobtn" type="button" id="vPrev" aria-label="Mês anterior">‹</button><b>${mNome(ym)}</b><button class="icobtn" type="button" id="vNext" aria-label="Próximo mês">›</button></div>`)+bannerExemplo()+`
 <div class="grid3"><label class="drop" id="dAvec"><b>Vendas do sistema (${esc(cliDe(st.scope).erp||'Avec')})</b><small>Relatório de recebimentos .xlsx · ${c.vendas.avec.length} linhas importadas</small><input type="file" id="dAvec-in" accept=".xlsx,.xls,.csv" multiple hidden></label>
  <label class="drop" id="dSip"><b>Maquininha (${esc(cliDe(st.scope).adq||'Sipag')})</b><small>Vendas realizadas e vendas recebidas .csv · ${c.vendas.sipag.length} parcelas importadas</small><input type="file" id="dSip-in" accept=".csv,.txt" multiple hidden></label>
  <div class="drop" data-go="conciliacao" role="button" tabindex="0"><b>Extrato do banco</b><small>Importado em Conciliação bancária · usado para conferir os Pix</small></div></div>
 ${res?`<div class="panel resultado"><div class="panel-head"><div><h3>Lançado em ${mNome(ym)}</h3><span class="note">${esc(res.txt)}</span></div><div class="scope"><button class="btn" type="button" data-go="abertos">Ver contas a receber</button>${pendAb.length?`<button class="btn" type="button" data-go="pendencias">Ver ${pendAb.length} pendências</button>`:''}<button class="icobtn" type="button" id="resX" aria-label="Fechar aviso">${IX}</button></div></div></div>`:''}
 ${!L.length?`<div class="panel"><p class="note" style="margin:0">Nada importado para ${mNome(ym)}. Suba o relatório do sistema e as vendas da maquininha, ou troque o mês.</p></div>`:`
 <div class="kpis"><div class="kpi"><span class="l">Vendas no sistema</span><span class="v num">${brl(tot)}</span><span class="s">cartão ${brl(soma(L.filter(r=>r.tipo==='cartao'&&r.fonte!=='sipag')))} · Pix ${brl(soma(L.filter(r=>r.tipo==='pix')))} · dinheiro ${brl(soma(L.filter(r=>r.tipo==='din')))}</span></div>
  <div class="kpi"><span class="l">Para lançar</span><span class="v num">${paraLancar.length}</span><span class="s">${brl(soma(paraLancar))} ainda não estão no contas a receber</span></div>
  <div class="kpi"><span class="l">Já lançadas</span><span class="v num pos">${L.filter(r=>r.lanc==='sim').length}</span><span class="s">não serão lançadas de novo</span></div>
  <div class="kpi"><span class="l">Pendências</span><span class="v num ${pendAb.length?'neg':'pos'}">${pendAb.length}</span><span class="s">${L.filter(r=>r.sit==='Só no Avec').length} só no Avec · ${L.filter(r=>r.fonte==='sipag'&&r.pend).length} só na maquininha · ${L.filter(r=>r.sit==='Pix só no Avec').length} Pix</span></div></div>
 <div class="panel" style="padding:0;gap:0">
  <div class="panel-head" style="padding:12px 14px;border-bottom:1px solid var(--line)"><div class="chips">${[['todos','Todas ('+L.length+')'],['lancar','Para lançar ('+paraLancar.length+')'],['lancadas','Já lançadas'],['pend','Pendências ('+L.filter(r=>r.pend).length+')'],['cartao','Cartão'],['pix','Pix'],['din','Dinheiro']].map(([k,l])=>`<button class="chip ${f===k?'':'off'}" type="button" data-vf="${k}">${l}</button>`).join('')}</div></div>
  <div class="lancbar"><label class="switch"><input type="checkbox" id="vTodas" ${paraLancar.length&&selR.length===paraLancar.length?'checked':''} ${paraLancar.length?'':'disabled'}> Selecionar todas para lançar</label><span class="note num">${selR.length} selecionadas · ${brl(soma(selR))}</span><button class="btn primary" type="button" id="vLancar" ${selR.length?'':'disabled'}>Lançar selecionadas no contas a receber</button></div>
  <div class="tbl"><table class="vtbl"><thead><tr><th></th><th>Data</th><th>Venda</th><th>Forma</th><th class="r">Valor</th><th>Onde achou</th><th>Lançamento</th></tr></thead><tbody>
  ${vis.map(r=>`<tr class="${r.pend&&!ok[r.key]?'pendrow':''}"><td>${r.lanc==='nao'?`<input type="checkbox" data-vs="${esc(r.key)}" ${st.vend.sel.has(r.key)?'checked':''} aria-label="Selecionar">`:''}</td><td class="num">${fd(r.d)}</td><td>${esc(r.quem)}${r.np>1?` <span class="tg">${r.np}x</span>`:''}</td><td class="note">${esc(r.forma)}</td><td class="r num">${val(r.v)}</td>
   <td><span class="pill ${r.cls}">${r.sit}</span>${r.pend?(ok[r.key]?' <span class="pill p-n">Pendência resolvida</span>':' <span class="pill p-bad">Pendência</span>'):''}<br><span class="note">${esc(r.det||'')}</span></td><td>${LANC[r.lanc]}</td></tr>`).join('')||'<tr><td colspan="7" class="note">Nada neste filtro.</td></tr>'}
  </tbody></table></div></div>`}
 ${c.vendas.sipag.length?taxasPraticadas():''}`;
 bindScope();bindVendasImports();
 $('#vPrev').onclick=()=>{st.vend.mes=mAdd(ym,-1);st.vend.sel.clear();vVendas()};$('#vNext').onclick=()=>{st.vend.mes=mAdd(ym,1);st.vend.sel.clear();vVendas()};
 $$('[data-vf]').forEach(b=>b.onclick=()=>{st.vend.f=b.dataset.vf;vVendas()});
 if($('#resX'))$('#resX').onclick=()=>{st.vend.resultado=null;vVendas()};
 $$('[data-vs]').forEach(b=>b.onchange=()=>{b.checked?st.vend.sel.add(b.dataset.vs):st.vend.sel.delete(b.dataset.vs);vVendas()});
 if($('#vTodas'))$('#vTodas').onchange=e=>{if(e.target.checked)paraLancar.forEach(r=>st.vend.sel.add(r.key));else st.vend.sel.clear();vVendas()};
 if($('#vLancar'))$('#vLancar').onclick=()=>lancarSelecionadas(ym)};
async function lancarSelecionadas(ym){const L=st.vend._L,R=st.vend._R;const sel=L.filter(r=>r.lanc==='nao'&&st.vend.sel.has(r.key));if(!sel.length)return;
 const cart=sel.filter(r=>r.tipo==='cartao'),pix=sel.filter(r=>r.tipo==='pix'),din=sel.filter(r=>r.tipo==='din');const soma=a=>a.reduce((x,r)=>x+r.v,0);const soMaq=cart.filter(r=>r.fonte==='sipag');
 if(!await confirmar('Lançar no contas a receber',`<p style="margin:0">Lançar <b>${sel.length} vendas</b> de ${mNome(ym)} em <b>${esc(nomeEsc(st.scope))}</b>?</p><div class="kv num"><span>Cartão</span><span>${cart.length} vendas · ${brl(soma(cart))} (cada parcela vira um recebível com a taxa)</span><span>Pix</span><span>${pix.length} · ${brl(soma(pix))}</span><span>Dinheiro</span><span>${din.length} · ${brl(soma(din))}</span></div>${soMaq.length?`<p class="note" style="margin:0">${soMaq.length} delas estão só na maquininha: entram no contas a receber e continuam nas Pendências até o Avec ser corrigido.</p>`:''}<p class="note" style="margin:0">O que já estiver lançado não é lançado de novo.</p>`,'Lançar'))return;
 const idvs=new Set(cart.flatMap(r=>r.idvs||[]));const av=new Set(pix.concat(din).map(r=>r.a));
 const r=gerarReceber(ym,{cart:!!cart.length,pix:!!pix.length,din:!!din.length,idvs,sel:av},R);
 log('Vendas lançadas',mNome(ym)+' · '+r.txt);save();st.vend.sel.clear();st.vend.resultado={ym,txt:r.txt+(soMaq.length?` · ${soMaq.length} vendas só na maquininha seguem nas Pendências`:'')};st.vend.f='todos';toast('Lançado: '+r.txt);vVendas()}

/* ---------- pendências por grupo ---------- */
let _pendCache={k:'',v:null};
function pendVendas(){const c=C();/* só meses em que a maquininha foi importada: são os meses em conferência */const ms=[...new Set(c.vendas.sipag.map(s=>s.dt.slice(0,7)))].sort();const out=[];
 ms.forEach(ym=>{const {L}=linhasVenda(ym);L.filter(r=>r.pend).forEach(r=>out.push({grupo:'vendas',key:r.key,tipo:r.sit,cls:r.cls,data:r.d,desc:r.quem+' · '+r.forma,valor:r.v,det:r.det,acao:'Conferir',go:'vendas',mes:ym,lancado:r.lanc==='sim'}))});return out}
pendencias=function(){const c=C();const k=st.scope+'|'+c.lanc.length+'|'+c.vendas.avec.length+'|'+c.vendas.sipag.length+'|'+Object.values(c.extratos||{}).flat().filter(i=>i.status!=='conciliado').length+'|'+Object.keys(c.perfil.pendOk||{}).length+'|'+c.lanc.filter(l=>l.status==='Pendente').length;
 if(_pendCache.k===k)return _pendCache.v;const it=[];
 pendVendas().forEach(x=>it.push(x));
 Object.entries(c.extratos||{}).forEach(([conta,arr])=>arr.forEach(i=>{if(i.status!=='conciliado')it.push({grupo:'extrato',key:'ex|'+i.id,tipo:'Extrato sem conciliar',cls:'p-warn',data:i.data,desc:conta+' · '+i.desc,valor:i.valor,acao:'Conciliar',go:'conciliacao'})}));
 ativos().forEach(l=>{if((l.status==='Pendente'||l.status==='Agendado')&&l.data<HOJE&&(l.tipo==='Receita'||l.tipo==='Despesa'))it.push({grupo:'atraso',key:'at|'+l.id,tipo:l.valor<0?'Pagamento vencido':ehRecCartao(l)?'Cartão previsto e não recebido':'Recebimento em atraso',cls:'p-bad',data:l.data,desc:l.desc,valor:l.valor,acao:'Abrir',lid:l.id});
  if(!l.cat&&l.tipo!=='Transferência'&&l.tipo!=='Pagamento')it.push({grupo:'semcat',key:'sc|'+l.id,tipo:'Sem categoria',cls:'p-warn',data:l.data,desc:l.desc,valor:l.valor,acao:'Classificar',lid:l.id})});
 contasCartao().forEach(k=>{const ym=HOJE.slice(0,7),f=fatura(k,ym);if(f.itens.length&&!f.pagos.length&&dDiff(f.venc,HOJE)<=7)it.push({grupo:'outros',key:'ft|'+k.nome+ym,tipo:'Fatura a fechar',cls:'p-info',data:f.venc,desc:k.nome+' · '+mNome(ym),valor:f.desp,acao:'Fechar fatura',go:'cartoes'})});
 recorrentes().forEach(r=>{if(!r.temProx)it.push({grupo:'outros',key:'fx|'+r.k,tipo:'Fixa do próximo mês',cls:'p-n',data:mAdd(HOJE.slice(0,7),1)+'-'+pad(Math.min(r.dia,28)),desc:r.nome,valor:r.sinal*r.med,acao:'Agendar',go:'intel'})});
 it.sort((a,b)=>a.data<b.data?-1:1);_pendCache={k,v:it};return it};
pendCount=function(){try{const ok=C().perfil.pendOk||{};return pendencias().filter(i=>(i.grupo==='vendas'||i.grupo==='extrato')&&!ok[i.key]).length}catch(e){return 0}};
const GRUPOS=[['vendas','Vendas'],['extrato','Extrato sem conciliar'],['atraso','Vencidos e atrasados'],['semcat','Sem categoria'],['outros','Faturas e fixas']];
if(!st.pend)st.pend={g:'vendas',resolvidas:false};
vPend=function(){const c=C();c.perfil.pendOk=c.perfil.pendOk||{};const ok=c.perfil.pendOk;const all=pendencias();const g=st.pend.g;
 const doG=all.filter(i=>i.grupo===g&&(st.pend.resolvidas||!ok[i.key]));const cnt=k=>all.filter(i=>i.grupo===k&&!ok[i.key]).length;
 const ajuda={vendas:'Vendas que não bateram entre o sistema da empresa e a maquininha (ou o extrato, no Pix). Só no Avec: não entrou no contas a receber. Só na maquininha: entrou, mas o Avec precisa ser corrigido. Resolva com uma observação depois de acertar.',extrato:'Linhas do extrato que ainda não foram ligadas a um lançamento. Resolva em Conciliação bancária.',atraso:'Lançamentos com data passada que ainda não foram confirmados nem conciliados.',semcat:'Lançamentos sem categoria. Eles não aparecem certo nos relatórios.',outros:'Faturas de cartão perto do vencimento e contas fixas do próximo mês ainda não agendadas.'}[g];
 $('#view').innerHTML=topo(esc(nomeEsc(st.scope)),'Pendências')+`
 <div class="tabs">${GRUPOS.map(([k,l])=>`<button type="button" data-pg="${k}" class="${g===k?'on':''}">${l} (${cnt(k)})</button>`).join('')}</div>
 <div class="panel-head"><p class="note" style="margin:0;max-width:760px">${ajuda}</p>${g==='vendas'?`<label class="switch"><input type="checkbox" id="pRes" ${st.pend.resolvidas?'checked':''}> Mostrar resolvidas</label>`:''}</div>
 <div class="panel"><div class="tbl"><table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th class="r">Valor</th><th></th></tr></thead><tbody>
 ${doG.slice(0,500).map(i=>`<tr><td class="num">${fd(i.data)}</td><td><span class="pill ${i.cls}">${esc(i.tipo)}</span>${i.lancado?' <span class="pill p-ok">já lançada</span>':''}</td><td>${esc(i.desc)}${i.det?`<br><span class="note">${esc(i.det)}</span>`:''}${ok[i.key]?`<br><span class="note">Resolvida por ${esc(ok[i.key].quem)} em ${new Date(ok[i.key].quando).toLocaleDateString('pt-BR')}: ${esc(ok[i.key].obs)}</span>`:''}</td><td class="r num ${i.valor<0?'neg':''}">${val(i.valor)}</td>
  <td class="r" style="white-space:nowrap">${i.lid?`<button class="btn ghost" type="button" data-pl="${i.lid}">${i.acao}</button>`:`<button class="btn ghost" type="button" data-pgo="${i.go}" data-pm="${i.mes||''}">${i.acao}</button>`}${g==='vendas'?(ok[i.key]?`<button class="btn ghost" type="button" data-preab="${esc(i.key)}">Reabrir</button>`:`<button class="btn ghost" type="button" data-pok="${esc(i.key)}">Resolver</button>`):''}</td></tr>`).join('')||'<tr><td colspan="5" class="note">Nenhuma pendência neste grupo.</td></tr>'}
 </tbody></table></div>${doG.length>500?`<p class="note" style="margin:0">Mostrando 500 de ${doG.length}.</p>`:''}</div>`;
 bindScope();$$('[data-pg]').forEach(b=>b.onclick=()=>{st.pend.g=b.dataset.pg;vPend()});if($('#pRes'))$('#pRes').onchange=e=>{st.pend.resolvidas=e.target.checked;vPend()};
 $$('[data-pgo]').forEach(b=>b.onclick=()=>{if(b.dataset.pm)st.vend.mes=b.dataset.pm;st.view=b.dataset.pgo;render()});
 $$('[data-pl]').forEach(b=>b.onclick=()=>{const l=C().lanc.find(x=>x.id===b.dataset.pl);if(l)modalLanc(l)});
 $$('[data-preab]').forEach(b=>b.onclick=()=>{delete ok[b.dataset.preab];save();vPend()});
 $$('[data-pok]').forEach(b=>b.onclick=()=>{const key=b.dataset.pok;abrirModal(`<div class="mhead"><h3>Resolver pendência</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div><form class="mbody form" id="fPok"><label style="display:grid;gap:4px;font-size:13px">O que foi feito?<textarea id="pokO" rows="3" required placeholder="ex.: Avec corrigido, venda lançada em duplicidade no Avec, cliente pagou em dinheiro…"></textarea></label></form><div class="mfoot"><span></span><button class="btn primary" type="submit" form="fPok">Marcar como resolvida</button></div>`);
  $('#fPok').onsubmit=e=>{e.preventDefault();ok[key]={quem:st.user.nome,quando:new Date().toISOString(),obs:$('#pokO').value.trim()};log('Pendência resolvida',key+' · '+ok[key].obs);save();fecharModal();toast('Pendência resolvida');vPend()}})};

/* ---------- totais por categoria com período ---------- */
vTotais=function(){const {meses,ls,T}=evoDados();st.rf._ls=ls;const lista=tp=>Object.entries(T[tp]).map(([p,g])=>({p,v:g.tot.reduce((a,b)=>a+b,0)})).filter(x=>Math.abs(x.v)>.004).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));
 const D_=lista('Despesa'),R_=lista('Receita'),sD=D_.reduce((a,x)=>a+x.v,0),sR=R_.reduce((a,x)=>a+x.v,0);const per=mCurto(meses[0])+' a '+mCurto(meses[meses.length-1]);
 const barras=arr=>{if(!arr.length)return'<p class="note">Sem lançamentos.</p>';const W=360,H=150,mx=Math.max(...arr.map(x=>Math.abs(x.v))),bw=Math.min(30,(W-10)/arr.length*.7);return `<svg viewBox="0 0 ${W} ${H+4}" style="width:100%;max-width:420px;display:block" role="img" aria-label="Totais por categoria">${arr.map((x,i)=>{const h=Math.abs(x.v)/mx*(H-6);const cx=5+(i+.5)*(W-10)/arr.length;return `<rect x="${cx-bw/2}" y="${H-h}" width="${bw}" height="${h}" fill="${PAL[i%PAL.length]}"><title>${esc(x.p)} · ${brl(x.v)}</title></rect>`}).join('')}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--muted)"/></svg>`};
 const leg=(arr,s,tp)=>`<div class="legend num">${arr.map((x,i)=>`<div><i style="background:${PAL[i%PAL.length]}"></i><span><button class="dr" type="button" data-dr="${esc(tp+'|'+x.p+'|*|T')}">${esc(x.p)}</button><em>${(x.v/s*100).toFixed(2).replace('.',',')}%</em></span><span class="${x.v<0?'neg':'pos'}">${brl(x.v)}</span></div>`).join('')}<div><i></i><b style="font-weight:600">Total</b><b class="${s<0?'neg':'pos'}">${brl(s)}</b></div></div>`;
 return `<div class="rep">${relHead('Totais por categoria',per)}<div style="padding:16px;display:grid;gap:16px"><div class="kv num" style="max-width:320px"><span>Receitas</span><span class="pos">${brl(sR)}</span><span>Despesas</span><span class="neg">${brl(sD)}</span><span class="big">Total</span><span class="big ${sR+sD<0?'neg':'pos'}">${brl(sR+sD)}</span></div>
 <div class="grid2">${st.rf.tipo!=='rec'?`<div style="display:grid;gap:10px"><b style="font-weight:500">Despesas</b>${barras(D_)}${leg(D_,sD,'Despesa')}</div>`:''}${st.rf.tipo!=='des'?`<div style="display:grid;gap:10px"><b style="font-weight:500">Receitas</b>${barras(R_)}${leg(R_,sR,'Receita')}</div>`:''}</div><p class="note" style="margin:0">Toque no nome de uma categoria para ver os lançamentos.</p></div></div>`};

/* ---------- relatório de lançamentos de caixa com filtros ---------- */
vRelCaixa=function(){const f=st.rf;const ini=st.rel.cIni,fim=st.rel.cFim;const bancos=contasBanco().filter(b=>!f.contas||f.contas.has(b.nome));const sel=new Set(bancos.map(b=>b.nome));
 const todos=ativos().filter(l=>l.data>=ini&&l.data<=fim&&(sel.has(l.conta)||sel.has(l.ctr))).sort((a,b)=>a.data<b.data?-1:1);
 const passa=l=>{const tr=l.tipo==='Transferência'||l.tipo==='Pagamento';if(tr)return f.tipo==='todos'&&!f.cats&&!f.tags&&!(sel.has(l.conta)&&sel.has(l.ctr));if(f.tipo==='rec'&&l.tipo!=='Receita')return false;if(f.tipo==='des'&&l.tipo!=='Despesa')return false;if(f.status==='real'&&!(l.status==='Confirmado'||l.status==='Conciliado'))return false;if(f.cats&&!f.cats.has(mestre(l.cat)))return false;if(f.tags&&!(l.tags||[]).some(t=>f.tags.has(t)))return false;return true};
 const vis=todos.filter(passa);const sAnt=bancos.reduce((a,b)=>a+saldo(b.nome,dAdd(ini,-1)),0);let run=sAnt,html='';
 [...new Set(todos.map(l=>l.data))].forEach(d=>{todos.filter(l=>l.data===d).forEach(l=>bancos.forEach(b=>run+=efeito(l,b.nome)));const v=vis.filter(l=>l.data===d);if(!v.length)return;html+=v.map(l=>linhaL(l,sel)).join('')+`<div class="dayfoot"><span>${SEM[D(d).getDay()]}, ${fdl(d)}</span><b class="num">${val(run)}</b></div>`});
 const rec=vis.filter(l=>l.tipo==='Receita').reduce((a,l)=>a+l.valor,0),des=vis.filter(l=>l.tipo==='Despesa').reduce((a,l)=>a+l.valor,0);
 return `<div class="rep">${relHead('Lançamentos de caixa',fdl(ini)+' até '+fdl(fim)+(f.contas?' · '+[...f.contas].join(', '):''))}<div class="saldoant"><span class="note">${fd(dAdd(ini,-1)).slice(0,5)}</span><span style="flex:1;padding-left:16px">Saldo anterior</span><b class="num">${val(sAnt)}</b></div><div class="list rel-list">${html||'<p class="note" style="padding:14px">Sem lançamentos com esses filtros.</p>'}</div>
 <div style="padding:14px 16px;display:grid;gap:14px"><table class="sumtbl num"><thead><tr><th></th><th class="r">Confirmado</th><th class="r">Projetado</th></tr></thead><tbody>${bancos.map(b=>`<tr><td>${esc(b.nome)}</td><td class="r">${val(saldo(b.nome,fim,true))}</td><td class="r">${val(saldo(b.nome,fim))}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td class="r">${val(bancos.reduce((a,b)=>a+saldo(b.nome,fim,true),0))}</td><td class="r">${val(bancos.reduce((a,b)=>a+saldo(b.nome,fim),0))}</td></tr></tbody></table>
 <table class="sumtbl num"><tbody><tr><td>Receitas</td><td class="r pos">${val(rec)}</td></tr><tr><td>Despesas</td><td class="r neg">${val(des)}</td></tr><tr class="tot"><td>Resultado</td><td class="r ${rec+des<0?'neg':'pos'}">${val(rec+des)}</td></tr></tbody></table></div></div>`};

/* barra de filtros também em Totais (com período) e em Lançamentos de caixa */
const _vRelM4=vRel;
vRel=function(){const tab=st.rel.tab;if(tab==='totais'){st.rel.mes=st.rf.ate||st.rel.mes}_vRelM4();
 const bar=$('.filtros');if(tab==='totais'&&bar&&!$('#rfDe')){bar.outerHTML=barraFiltros(true);bindFiltros(vRel);const nav=$('#rPrev');if(nav)nav.closest('.monthnav').remove()}
 if(tab==='caixa'&&!$('.filtros')){const ph=$('#view .panel-head');if(ph){ph.insertAdjacentHTML('beforebegin',barraFiltros(false));bindFiltros(vRel)}}
 bindEvo(vRel)};
