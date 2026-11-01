/* Lume Conecta · aplicação (núcleo + conferência de vendas + nuvem) */

/* ===================== CADASTRO BASE (exemplo) ===================== */
const CLIENTES=[
 {id:'inplace',nome:'Academia In Place',unidades:['Gutierrez','Barreiro'],banco:'Santander',erp:'Pacto',adq:'Stone'},
 {id:'studio',nome:'Studio 360 Fit',unidades:['Matriz','Filial'],banco:'Inter',erp:'Meu Dinheiro',adq:'Rede'},
 {id:'rahme',nome:'Clínica Rahme',unidades:['Única'],banco:'Inter',erp:'Feegow',adq:'SumUp'},
 {id:'divina',nome:'Divina Embalagem',unidades:['Única'],banco:'Inter',erp:'Olist Tiny',adq:'Marketplaces'},
 {id:'sala',nome:'Sala Conceito',unidades:['Única'],banco:'Sicoob',erp:'Meu Dinheiro',adq:'Stone'},
 {id:'enoque',nome:'Enoque Advocacia',unidades:['Única'],banco:'Inter',erp:'Meu Dinheiro',adq:'—'},
 {id:'dentatech',nome:'Dentatech',unidades:['Única'],banco:'C6',erp:'Meu Dinheiro',adq:'Stone'},
 {id:'haus',nome:'Haus Private',unidades:['Única'],banco:'Itaú',erp:'Meu Dinheiro',adq:'Stone'},
 {id:'beauty',nome:'Salão The Beauty',unidades:['Única'],banco:'Nubank',erp:'Avec',adq:'Stone'},
 {id:'beor',nome:'BE.OR',unidades:['Única'],banco:'Inter',erp:'Meu Dinheiro',adq:'Stone'},
];
const USUARIOS=[
 {id:'u1',nome:'Polyana',email:'contato@lumefinancas.com.br',perfil:'master',escopo:'*'},
 {id:'u2',nome:'Viviane',email:'viviane@lumefinancas.com.br',perfil:'operador',escopo:['inplace|Gutierrez','inplace|Barreiro','studio|Matriz','studio|Filial','enoque|Única']},
 {id:'u3',nome:'Driely',email:'driely@lumefinancas.com.br',perfil:'operador',escopo:['rahme|Única','divina|Única','sala|Única']},
 {id:'u5',nome:'Miguel',email:'miguel@lumefinancas.com.br',perfil:'estagiario',escopo:['inplace|Gutierrez','inplace|Barreiro']},
 {id:'u4',nome:'Gerente In Place Gutierrez',email:'gutierrez@exemplo.com.br',perfil:'cliente',escopo:['inplace|Gutierrez']},
 {id:'u7',nome:'Sócio Studio 360 Fit',email:'socio@studio360.exemplo',perfil:'cliente',escopo:['studio|Matriz','studio|Filial']},
];
const PERFIL_TXT={master:'Master · acesso total',operador:'Operadora · clientes atribuídos',estagiario:'Estagiário · lança e concilia, sem aprovar nem excluir',cliente:'Cliente · somente a própria empresa'};
const STATUS={};
(function(){let s=7;const r=()=>{s=(s*9301+49297)%233280;return s/233280};
 CLIENTES.forEach(c=>c.unidades.forEach(u=>{STATUS[c.id+'|'+u]={conc:Math.round(55+r()*45),pend:Math.round(r()*28),receber:Math.round(8000+r()*90000),etapa:['Importação','Conciliação','Conferência','Aprovado'][Math.floor(r()*4)]}}));})();

/* ===================== UTILITÁRIOS ===================== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const D=s=>{const[a,b,c]=String(s).split('-').map(Number);return new Date(a,b-1,c||1)};
const HOJE=ymd(new Date());
const fd=s=>{if(!s)return'';const d=D(s);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(2)};
const fdl=s=>{if(!s)return'';const d=D(s);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()};
const MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const MESC=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const SEM=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const mAdd=(ym,n)=>{const d=D(ym+'-01');d.setMonth(d.getMonth()+n);return ymd(d).slice(0,7)};
const mNome=ym=>MES[+ym.slice(5,7)-1]+' '+ym.slice(0,4);
const mCurto=ym=>MESC[+ym.slice(5,7)-1]+'/'+ym.slice(2,4);
const dAdd=(s,n)=>{const d=D(s);d.setDate(d.getDate()+n);return ymd(d)};
const dDiff=(a,b)=>Math.round((D(a)-D(b))/864e5);
function buscaOk(t,v,q){q=String(q||'').trim().toLowerCase();if(!q)return true;if(String(t||'').toLowerCase().includes(q))return true;if(!/\d/.test(q)||/[a-z]/i.test(q.replace(/r\$/,'')))return false;const a=Math.abs(+v||0);const qq=q.replace(/r\$|\s|^-|^\+/g,'');const fs=[nf(a),nf(a).replace(/\./g,'')];if(fs.some(f=>f.includes(qq)))return true;const n=parseFloat(qq.replace(/\./g,'').replace(',','.'));return isFinite(n)&&Math.abs(n-a)<.005}
const nf=v=>Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const brl=v=>(v<-0.004?'-':'')+'R$ '+nf(v);
const val=v=>(v<-0.004?'-':'')+nf(v);
const r2=v=>Math.round(v*100)/100;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,3200)}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function rng(seed){let s=seed||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%100000)/100000}}
const ICO={
 Pendente:'<svg class="ico s-Pendente" viewBox="0 0 20 20" aria-label="Pendente"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 5.5v5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14.2" r="1.2" fill="currentColor"/></svg>',
 Agendado:'<svg class="ico s-Agendado" viewBox="0 0 20 20" aria-label="Agendado"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 5.5V10l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 Confirmado:'<svg class="ico s-Confirmado" viewBox="0 0 20 20" aria-label="Confirmado"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6.3 10.3l2.6 2.6 4.9-5.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 Conciliado:'<svg class="ico s-Conciliado" viewBox="0 0 20 20" aria-label="Conciliado"><path d="M10 1.8l2 1.5 2.5-.2.8 2.4 2.1 1.4-.8 2.4.8 2.4-2.1 1.4-.8 2.4-2.5-.2-2 1.5-2-1.5-2.5.2-.8-2.4-2.1-1.4.8-2.4-.8-2.4 2.1-1.4.8-2.4 2.5.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.6 10.2l2.3 2.3 4.4-4.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
const IREP='<svg class="ico" viewBox="0 0 20 20" aria-label="Repetição"><path d="M4 8h10l-3-3M16 12H6l3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const IMORE='<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="4.5" r="1.6" fill="currentColor"/><circle cx="10" cy="10" r="1.6" fill="currentColor"/><circle cx="10" cy="15.5" r="1.6" fill="currentColor"/></svg>';
const IX='<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const tagCls=t=>/^fixo$/i.test(t)?'fixo':/^vari[aá]vel$/i.test(t)?'var':'o';

/* ===================== ESTADO E PERSISTÊNCIA ===================== */
const LS='lumeConecta_v2';
let DB={};
function save(){}
const st={user:null,view:'painel',scope:null,cx:null,cc:null,conc:{conta:null,sel:null,tab:'class',filtro:'todos',q:''},rel:{tab:'evo',ini:null,n:4,mes:null,cIni:null,cFim:null},stone:{},intel:'fixas'};
function escopos(){if(!st.user)return[];if(st.user.escopo==='*')return CLIENTES.flatMap(c=>c.unidades.map(u=>c.id+'|'+u));return st.user.escopo}
function nomeEsc(k){const[c,u]=k.split('|');const cl=CLIENTES.find(x=>x.id===c);return cl.nome+(u!=='Única'?' · '+u:'')}
function cliDe(k){return CLIENTES.find(x=>x.id===k.split('|')[0])}
const pode={aprovar:()=>st.user.perfil==='master',excluir:()=>['master','operador'].includes(st.user.perfil),cadastro:()=>['master','operador'].includes(st.user.perfil)};
function C(){const k=st.scope;if(!DB[k])DB[k]=seed(k);return DB[k]}
function log(acao,desc){const c=C();c.log.unshift({quando:new Date().toISOString(),quem:st.user.nome,acao,desc});if(c.log.length>400)c.log.length=400}
let UID=0;const nid=()=>'l'+Date.now().toString(36)+(UID++).toString(36)+Math.random().toString(36).slice(2,6);
function novoL(o){return Object.assign({id:nid(),uid:900000000+Math.floor(Math.random()*9e7),tipo:'Despesa',status:'Pendente',data:HOJE,venc:'',valor:0,desc:'',cat:'',conta:'',ctr:'',centro:'',contato:'Sem contato',forma:'Sem forma pagto.',projeto:'Sem projeto',ndoc:'',obs:'',comp:'',tags:[],cartao:'',rep:'Único',meta:'',criado:ymd(new Date()),extId:null,excluido:false},o)}
const contasBanco=()=>C().contas.filter(c=>c.tipo==='banco');
const contasCartao=()=>C().contas.filter(c=>c.tipo==='cartao');
const contaObj=n=>C().contas.find(c=>c.nome===n);
const ativos=()=>C().lanc.filter(l=>!l.excluido);
function efeito(l,conta){if(l.excluido)return 0;if(l.tipo==='Despesa'||l.tipo==='Receita')return l.conta===conta?l.valor:0;const a=Math.abs(l.valor);return(l.conta===conta?-a:0)+(l.ctr===conta?a:0)}
function dataEf(l){return l.venc&&contaObj(l.conta)?.tipo==='cartao'?l.venc:l.data}
function saldo(conta,ate,soConf){const c=contaObj(conta);let s=c?c.saldoIni||0:0;ativos().forEach(l=>{if(l.data>ate)return;if(soConf&&!(l.status==='Confirmado'||l.status==='Conciliado'))return;s+=efeito(l,conta)});return r2(s)}
function faturaDe(data,cart,parc){const d=D(data);let m=ymd(d).slice(0,7);m=mAdd(m,d.getDate()<=cart.fecha?1:2);if(parc)m=mAdd(m,parc);return m+'-'+pad(cart.vence)}

/* ===================== INTELIGÊNCIA: palavras, similaridade, regras ===================== */
const STOP=new Set('pix enviado enviada recebido recebida entrada saida pagamento pagto pag pgto transacao transferencia via com chave para pelo pela de da do das dos em no na nos nas ted doc boleto deb debito cred credito aut automatico compra cartao parcela ltda eireli the and conta corrente valor cpf cnpj sob ref'.split(' '));
function tokens(s){return String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/\(parcela[^)]*\)/g,' ').replace(/\d+\s*\/\s*\d+/g,' ').replace(/[^a-z ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w))}
const chave=s=>[...new Set(tokens(s))].join(' ');
function sim(a,b){const A=new Set(tokens(a)),B=new Set(tokens(b));if(!A.size||!B.size)return 0;let i=0;A.forEach(x=>{if(B.has(x))i++});if(!i)return 0;return(i/Math.min(A.size,B.size))*Math.pow(i/Math.max(A.size,B.size),.35)}
function aprender(l){if(!l.cat||l.tipo==='Transferência'||l.tipo==='Pagamento')return;const t=[...new Set(tokens(l.desc))].slice(0,3);if(!t.length)return;const c=C();let r=c.regras.find(r=>r.pal.join(' ')===t.join(' '));
 if(r){r.cat=l.cat;r.tags=l.tags||[];r.nome=l.desc.replace(/\s*\d+\/\d+\s*$/,'').trim();r.usos=(r.usos||0)+1}else c.regras.push({id:nid(),pal:t,cat:l.cat,tags:l.tags||[],nome:l.desc.replace(/\s*\d+\/\d+\s*$/,'').trim(),usos:1,auto:true})}
function sugerir(desc,valor){const c=C();const t=tokens(desc);
 const regra=c.regras.filter(r=>r.pal.length&&r.pal.every(p=>t.includes(p))).sort((a,b)=>b.pal.length-a.pal.length)[0];
 if(regra)return{cat:regra.cat,tags:regra.tags||[],desc:regra.nome||desc,conf:.95,motivo:'Regra: contém “'+regra.pal.join(' ')+'”'};
 let bs=0,bl=null;ativos().forEach(l=>{if(!l.cat||l.tipo==='Transferência'||l.tipo==='Pagamento'||Math.sign(l.valor)!==Math.sign(valor))return;let s=sim(desc,l.desc);if(s&&Math.abs(Math.abs(l.valor)-Math.abs(valor))<.01)s+=.15;if(s>bs){bs=s;bl=l}});
 if(bl&&bs>=.45)return{cat:bl.cat,tags:bl.tags||[],desc:bl.desc.replace(/\s*\d+\/\d+\s*$/,'').trim(),conf:Math.min(.94,bs),motivo:'Parecido com “'+bl.desc.trim()+'” de '+fd(bl.data)};
 return null}

/* ===================== DADOS DE EXEMPLO POR CLIENTE ===================== */
function seed(k){
 const cl=cliDe(k),R=rng(hash(k)),banco=cl.banco,stone=cl.adq==='Stone',cartao=banco+' Cartão';
 const contas=[{nome:banco,tipo:'banco',saldoIni:r2(8000+R()*9000)}];
 if(stone)contas.push({nome:'Stone',tipo:'banco',saldoIni:0});
 contas.push({nome:'Aplicação CDB',tipo:'banco',saldoIni:r2(20000+R()*30000)});
 contas.push({nome:cartao,tipo:'cartao',saldoIni:0,fecha:9,vence:10,debito:banco});
 const c={contas,lanc:[],regras:[],extratos:{},log:[],aprov:{'2026-09':true},exemplo:true,cats:[]};
 const L=c.lanc,add=o=>{const l=novoL(Object.assign({criado:'2026-06-01'},o));l.tipo=o.tipo||(l.valor<0?'Despesa':'Receita');L.push(l);return l};
 const stt=(d,fixo)=>d>HOJE?(fixo?'Agendado':'Pendente'):(d.slice(0,7)===HOJE.slice(0,7)?(R()<.9?'Confirmado':'Pendente'):(R()<.94?'Conciliado':'Confirmado'));
 const FIX=[[1,'Tarifa pacote de serviços','4 - Impostos e Tarifas/Tarifas Bancárias',()=>-45.9,'Fixo'],[5,'Aluguel sala comercial','1 - Despesas Fixas/Aluguel',()=>-2500,'Fixo'],[5,'Salário recepcionista','2 - Funcionários/Salários',()=>-1850,'Fixo'],[5,'Vale transporte','2 - Funcionários/Vale Transporte',()=>-264,'Fixo'],[5,'Pró-labore sócio','0 - Retirada Sócios/Pró-labore',()=>-3000,'Fixo'],[10,'Energia CEMIG','1 - Despesas Fixas/Energia',()=>-r2(360+R()*140),'Variável'],[10,'Contabilidade','1 - Despesas Fixas/Contabilidade',()=>-650,'Fixo'],[10,'Lume Finanças - BPO financeiro','1 - Despesas Fixas/Financeiro',()=>-1290,'Fixo'],[12,'Internet Vivo Fibra','1 - Despesas Fixas/Internet e Telefone',()=>-189.9,'Fixo'],[20,'DAS Simples Nacional','4 - Impostos e Tarifas/Simples Nacional',()=>-r2(1800+R()*900),'Variável']];
 const NOMES=['Ana Paula R.','Bruno Lima','Carla Mendes','Diego Souza','Elaine Costa','Fábio Rocha','Gabriela N.','Helena Prado','Igor Matos','Júlia Freitas','Lucas Teixeira','Marina Alves'];
 for(let mi=6;mi<=11;mi++){const ym='2026-'+pad(mi+1);
  FIX.forEach(([d,desc,cat,v,tag])=>{const dt=ym+'-'+pad(d);add({data:dt,valor:v(),desc,cat,conta:banco,rep:'Fixo',tags:[tag],status:stt(dt,true),comp:dt})});
  for(let d=1;d<=28;d+=1){const dt=ym+'-'+pad(d);if(dt>HOJE)break;
   if(stone&&D(dt).getDay()%6!==0&&R()<.55)add({data:dt,valor:r2(700+R()*1900),desc:'Recebimento Stone',cat:'1 - Receitas/Cartão Stone',conta:'Stone',status:stt(dt)});
   if(R()<.32)add({data:dt,valor:r2([150,180,220,250,300,350][Math.floor(R()*6)]),desc:'PIX recebido '+NOMES[Math.floor(R()*NOMES.length)],cat:'1 - Receitas/Mensalidades',conta:banco,status:stt(dt)});}
  if(stone)[14,28].forEach(d=>{const dt=ym+'-'+pad(d);if(dt>HOJE)return;add({tipo:'Transferência',data:dt,valor:r2(5000+R()*4000),desc:'Transferência Stone para '+banco,cat:'Transferência',conta:'Stone',ctr:banco,status:stt(dt)})});
  const dt8=ym+'-08';if(dt8<=HOJE&&R()<.5)add({data:dt8,valor:-r2(120+R()*260),desc:'Material de limpeza - Atacadão',cat:'3 - Operacional/Material de Limpeza',conta:banco,status:stt(dt8),tags:['Variável']});
  const dt22=ym+'-22';if(dt22<=HOJE)add({data:dt22,valor:r2(40+R()*90),desc:'Rendimento aplicação',cat:'Outras Receitas/Rendimentos',conta:'Aplicação CDB',status:stt(dt22)});
 }
 const cart=contas.find(x=>x.tipo==='cartao');
 for(let mi=5;mi<=9;mi++){const ym='2026-'+pad(mi+1);
  [[3,'Combustível - Posto Ipiranga','3 - Operacional/Combustível',()=>-r2(150+R()*120),['Variável']],[7,'Sistema de agendamento','1 - Despesas Fixas/Sistemas',()=>-149.9,['Fixo']],[15,'Mercado Livre - Material escritório','3 - Operacional/Material de Escritório',()=>-r2(60+R()*180),[]],[24,'Uber - deslocamento','3 - Operacional/Combustível',()=>-r2(18+R()*40),['Variável']]].forEach(([d,desc,cat,v,tags])=>{const dt=ym+'-'+pad(d);if(dt>HOJE)return;const l=add({data:dt,valor:v(),desc,cat,conta:cartao,tags,venc:faturaDe(dt,cart),rep:tags[0]==='Fixo'?'Fixo':'Único'});l.status=l.venc.slice(0,7)<=HOJE.slice(0,7)&&l.venc<HOJE?'Conciliado':'Confirmado'})}
 for(let p=1;p<=10;p++){const l=add({data:'2026-04-18',valor:-389.9,desc:'Notebook Dell (Parcela '+pad(p)+' de 10)',cat:'5 - Investimentos/Equipamentos',conta:cartao,rep:'Parcelado',venc:faturaDe('2026-04-18',cart,p-1),tags:['Variável']});l.status=l.venc<HOJE?'Conciliado':'Confirmado'}
 // pagamentos de fatura já vencidas
 const fats=[...new Set(L.filter(l=>l.conta===cartao&&l.venc).map(l=>l.venc))].sort();
 fats.forEach(v=>{if(v>=HOJE)return;const tot=r2(L.filter(l=>l.conta===cartao&&l.venc===v).reduce((a,l)=>a+l.valor,0));add({tipo:'Pagamento',data:v,valor:tot,desc:'Pagamento cartão '+cartao,cat:'Pagamento de cartão',conta:banco,ctr:cartao,venc:v,status:'Conciliado'})});
 L.sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0);
 return c}

/* ===================== LOGIN / NAVEGAÇÃO ===================== */
function renderUserList(){$('#userList').innerHTML=USUARIOS.map(u=>`<button class="user-opt" data-u="${u.id}" type="button"><span class="avatar">${esc(u.nome[0])}</span><span><b>${esc(u.nome)}</b><small>${esc(u.email)} · ${PERFIL_TXT[u.perfil].split(' · ')[0]}</small></span></button>`).join('')}
renderUserList();
$('#userList').onclick=e=>{const b=e.target.closest('[data-u]');if(!b)return;$('#lEmail').value=USUARIOS.find(x=>x.id===b.dataset.u).email;$('#lPass').focus()};
$('#fLogin').onsubmit=e=>{e.preventDefault();const em=$('#lEmail').value.trim().toLowerCase();const u=USUARIOS.find(x=>x.email.toLowerCase()===em);const m=$('#lErr');
 if(!u){m.textContent='E-mail não cadastrado. Peça seu acesso à Lume.';m.hidden=false;return}
 if($('#lPass').value!=='lume2026'){m.textContent='Senha incorreta. Confira e tente de novo.';m.hidden=false;return}
 m.hidden=true;st.user=u;st.scope=escopos()[0];resetViews();if(u.perfil==='cliente'){const a=Object.keys(C().aprov).sort().pop();if(a){st.rel.ini=mAdd(a,-3);st.rel.mes=a;st.rel.cIni=a+'-01';st.rel.cFim=dAdd(mAdd(a,1)+'-01',-1)}}st.view=u.perfil==='cliente'?'portal':'painel';$('#login').hidden=true;$('#app').hidden=false;$('#lPass').value='';render()};
$('#logout').onclick=()=>{st.user=null;$('#app').hidden=true;$('#login').hidden=false;fecharModal()};
function resetViews(){const m=HOJE.slice(0,7);st.cx={ini:m+'-01',fim:dAdd(mAdd(m,1)+'-01',-1),contas:null,status:new Set(['Pendente','Agendado','Confirmado','Conciliado']),q:'',cat:''};st.cc={cartao:null,mes:mAdd(m,0),filtro:'todos'};st.conc={conta:null,sel:null,tab:'class',filtro:'todos',q:''};st.rel={tab:'evo',ini:mAdd(m,-3),n:4,mes:m,cIni:m+'-01',cFim:HOJE}}
function navItems(){const p=st.user.perfil;
 if(p==='cliente')return[['','Minha empresa'],['portal','Meu painel'],['relatorios','Relatórios']];
 const it=[['','Carteira'],['painel','Visão geral'],['pendencias','Pendências'],['','Financeiro do cliente'],['caixa','Lançamentos de caixa'],['cartoes','Cartões de crédito'],['conciliacao','Conciliação bancária'],['intel','Fixas e regras'],['stone','Recebíveis Stone'],['relatorios','Relatórios'],['','Configuração'],['cadastros','Contas e categorias'],['meudinheiro','Meu Dinheiro']];
 if(p==='master')it.push(['usuarios','Usuários e acessos']);return it}
function render(){
 const pc=st.user.perfil==='cliente'?0:pendCount();
 $('#nav').innerHTML=navItems().map(([k,l])=>k?`<button type="button" data-v="${k}" class="${st.view===k?'on':''}">${l}${k==='pendencias'&&pc?`<span class="count">${pc}</span>`:''}</button>`:`<div class="grp">${l}</div>`).join('');
 $('#whoami').innerHTML=`<b>${esc(st.user.nome)}</b><br><span style="color:#9FB0C4">${PERFIL_TXT[st.user.perfil].split(' · ')[0]}</span>`;
 ({painel:vPainel,pendencias:vPend,caixa:vCaixa,cartoes:vCartoes,conciliacao:vConc,intel:vIntel,stone:vStone,relatorios:vRel,cadastros:vCad,meudinheiro:vMD,usuarios:vUsers,portal:vPortal})[st.view]();
}
$('#nav').onclick=e=>{const b=e.target.closest('[data-v]');if(b){st.view=b.dataset.v;render();window.scrollTo(0,0)}};
function scopeSelect(){const e=escopos();if(e.length<2)return `<span class="note">${esc(nomeEsc(st.scope))}</span>`;return `<select id="scopeSel" aria-label="Cliente e unidade">${e.map(k=>`<option value="${k}" ${k===st.scope?'selected':''}>${esc(nomeEsc(k))}</option>`).join('')}</select>`}
function bindScope(){const s=$('#scopeSel');if(s)s.onchange=()=>{st.scope=s.value;st.cx.contas=null;st.cc.cartao=null;st.conc.conta=null;st.conc.sel=null;render()}}
function topo(eyebrow,titulo,extra=''){return `<div class="top"><div><div class="eyebrow">${eyebrow}</div><h2>${titulo}</h2></div><div class="scope">${scopeSelect()}${extra}</div></div>`}
function bannerExemplo(){return C().exemplo?`<div class="banner"><span>Este cliente está com <b>dados de exemplo</b>. Importe o export do Meu Dinheiro para trabalhar com os dados reais.</span><button class="btn" type="button" data-go="meudinheiro">Importar do Meu Dinheiro</button></div>`:''}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){st.view=g.dataset.go;render();window.scrollTo(0,0)}});

/* ===================== MODAL ===================== */
function abrirModal(html){const m=$('#modal');m.innerHTML=`<div class="mbox" role="dialog" aria-modal="true">${html}</div>`;m.hidden=false;const f=m.querySelector('input,select,textarea,button');if(f)f.focus();m.onclick=e=>{if(e.target===m||e.target.closest('[data-close]'))fecharModal()}}
function fecharModal(){const m=$('#modal');m.hidden=true;m.innerHTML=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)fecharModal()});

/* ===================== VISÃO GERAL ===================== */
function vPainel(){
 const e=escopos();const tot=e.reduce((a,k)=>{const s=STATUS[k];a.c+=s.conc;a.p+=s.pend;a.r+=s.receber;return a},{c:0,p:0,r:0});
 const ord=[...e].sort((a,b)=>STATUS[a].conc-STATUS[b].conc);
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">${mNome(HOJE.slice(0,7))} · indicadores de exemplo</div><h2>Visão geral da carteira</h2></div><div class="note">${e.length} unidades no seu acesso</div></div>
 <div class="kpis"><div class="kpi"><span class="l">Conciliação média</span><span class="v num">${Math.round(tot.c/e.length)}%</span><span class="s">do mês até hoje</span></div>
 <div class="kpi"><span class="l">Pendências abertas</span><span class="v num">${tot.p}</span><span class="s">lançar, revisar ou cobrar</span></div>
 <div class="kpi"><span class="l">Cartão a receber · 30 dias</span><span class="v num">${brl(tot.r).replace(/,\d\d$/,'')}</span><span class="s">agenda das adquirentes</span></div>
 <div class="kpi"><span class="l">Relatórios aguardando</span><span class="v num">${e.filter(k=>STATUS[k].etapa==='Conferência').length}</span><span class="s">sua conferência</span></div></div>
 <div class="panel"><div class="panel-head"><h3>Andamento por unidade</h3><span class="note">Ordenado pelo que mais precisa de atenção</span></div>
 <div class="tbl"><table><thead><tr><th>Cliente / unidade</th><th>Banco · Sistema · Adquirente</th><th>Conciliado</th><th class="r">Pendências</th><th class="r">A receber</th><th>Etapa</th><th></th></tr></thead><tbody>
 ${ord.map(k=>{const s=STATUS[k],c=cliDe(k);const cls=s.conc>=90?'p-ok':s.conc>=70?'p-warn':'p-bad';const et={'Aprovado':'p-ok','Conferência':'p-warn'}[s.etapa]||'p-n';
  return `<tr><td><b style="font-weight:500">${esc(nomeEsc(k))}</b></td><td class="note">${c.banco} · ${c.erp} · ${c.adq}</td><td><div style="display:flex;gap:8px;align-items:center"><div class="bar"><i style="width:${s.conc}%"></i></div><span class="pill ${cls} num">${s.conc}%</span></div></td><td class="r num">${s.pend}</td><td class="r num">${brl(s.receber)}</td><td><span class="pill ${et}">${s.etapa}</span></td><td><button class="btn ghost" type="button" data-abrir="${k}">Abrir</button></td></tr>`}).join('')}
 </tbody></table></div></div>`;
 $$('[data-abrir]').forEach(b=>b.onclick=()=>{st.scope=b.dataset.abrir;st.cx.contas=null;st.cc.cartao=null;st.conc.conta=null;st.view='caixa';render()});
}

/* ===================== LANÇAMENTOS DE CAIXA ===================== */
function vCaixa(){
 const c=C(),bancos=contasBanco();if(!st.cx.contas)st.cx.contas=new Set(bancos.map(b=>b.nome));
 const sel=st.cx.contas,{ini,fim}=st.cx;
 const noPer=ativos().filter(l=>l.data>=ini&&l.data<=fim&&(sel.has(l.conta)||sel.has(l.ctr))).sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0);
 let ent={rec:0,tr:0},sai={des:0,tr:0};
 noPer.forEach(l=>{if(l.tipo==='Receita'&&sel.has(l.conta))ent.rec+=l.valor;else if(l.tipo==='Despesa'&&sel.has(l.conta))sai.des+=l.valor;else if(l.tipo==='Transferência'||l.tipo==='Pagamento'){const a=Math.abs(l.valor);if(sel.has(l.conta)&&!sel.has(l.ctr))sai.tr-=a;if(sel.has(l.ctr)&&!sel.has(l.conta))ent.tr+=a}});
 const vis=noPer.filter(l=>(!st.cx.tipo||st.cx.tipo==='todos'||(st.cx.tipo==='rec'&&l.tipo==='Receita')||(st.cx.tipo==='des'&&l.tipo==='Despesa')||(st.cx.tipo==='tr'&&(l.tipo==='Transferência'||l.tipo==='Pagamento')))&&(!st.cx.tag||(l.tags||[]).includes(st.cx.tag))&&st.cx.status.has(l.status)&&(!st.cx.q||(l.desc+' '+l.cat+' '+l.tags.join(' ')).toLowerCase().includes(st.cx.q.toLowerCase()))&&(!st.cx.cat||l.cat.startsWith(st.cx.cat)));
 const sAnt=[...sel].reduce((a,n)=>a+saldo(n,dAdd(ini,-1)),0);
 let run=sAnt,html=`<div class="saldoant"><span class="note">${fd(dAdd(ini,-1)).slice(0,5)}</span><span style="flex:1;padding-left:16px">Saldo anterior</span><b class="num ${sAnt<0?'neg':'pos'}">${val(sAnt)}</b></div>`;
 const dias=[...new Set(noPer.map(l=>l.data))];
 dias.forEach(d=>{const doDia=noPer.filter(l=>l.data===d);doDia.forEach(l=>{[...sel].forEach(n=>run+=efeito(l,n))});const v=vis.filter(l=>l.data===d);if(!v.length)return;
  html+=v.map(l=>linhaL(l,sel)).join('')+`<div class="dayfoot"><span>${SEM[D(d).getDay()]}, ${fdl(d)}</span><b class="num ${run<0?'neg':''}">${val(run)}</b></div>`});
 const cats=[...new Set(ativos().map(l=>l.cat.split('/')[0].trim()).filter(Boolean))].sort();
 $('#view').innerHTML=topo('Financeiro · caixa','Lançamentos de caixa',`<button class="btn primary" type="button" id="novoL">+ Novo lançamento</button>`)+bannerExemplo()+`
 <div class="split"><div class="side">
  <div class="panel"><div class="form"><div class="row"><label>Início<input type="date" id="cxIni" value="${ini}"></label><label>Fim<input type="date" id="cxFim" value="${fim}"></label></div>
  <div class="chips"><button class="chip" type="button" data-per="0">Este mês</button><button class="chip" type="button" data-per="-1">Mês anterior</button><button class="chip" type="button" data-per="1">Próximo mês</button></div></div></div>
  <div class="panel"><table class="sumtbl num"><thead><tr><th></th><th class="r">Confirmado</th><th class="r">Projetado</th></tr></thead><tbody>
  ${bancos.map(b=>{const cf=saldo(b.nome,fim,true),pj=saldo(b.nome,fim);return `<tr><td><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-cta="${esc(b.nome)}" ${sel.has(b.nome)?'checked':''}> ${esc(b.nome)}</label></td><td class="r ${cf<0?'neg':'pos'}">${val(cf)}</td><td class="r ${pj<0?'neg':'pos'}">${val(pj)}</td></tr>`}).join('')}
  <tr class="tot"><td>Total</td><td class="r">${val([...sel].reduce((a,n)=>a+saldo(n,fim,true),0))}</td><td class="r">${val([...sel].reduce((a,n)=>a+saldo(n,fim),0))}</td></tr></tbody></table></div>
  <div class="panel"><div class="note" style="text-align:center">Resultados (R$)</div><table class="sumtbl num"><tbody>
   <tr><td>Entradas</td><td class="r pos">${val(ent.rec+ent.tr)}</td></tr><tr class="sub"><td>Receitas</td><td class="r pos">${val(ent.rec)}</td></tr><tr class="sub"><td>Transferências</td><td class="r">${val(ent.tr)}</td></tr>
   <tr><td>Saídas</td><td class="r neg">${val(sai.des+sai.tr)}</td></tr><tr class="sub"><td>Despesas</td><td class="r neg">${val(sai.des)}</td></tr><tr class="sub"><td>Transferências</td><td class="r">${val(sai.tr)}</td></tr>
   <tr class="tot"><td>Resultado</td><td class="r ${ent.rec+ent.tr+sai.des+sai.tr<0?'neg':'pos'}">${val(ent.rec+ent.tr+sai.des+sai.tr)}</td></tr></tbody></table></div>
 </div>
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:12px 14px;border-bottom:1px solid var(--line)">
  <div class="chips">${['Pendente','Agendado','Confirmado','Conciliado'].map(s=>`<button type="button" class="chip ${st.cx.status.has(s)?'':'off'}" data-stf="${s}">${ICO[s]}${s==='Pendente'?'Pendentes':s+'s'}</button>`).join('')}</div>
  <div class="scope"><select id="cxCat" aria-label="Categoria"><option value="">Todas as categorias</option>${cats.map(x=>`<option ${x===st.cx.cat?'selected':''}>${esc(x)}</option>`).join('')}</select><input type="text" id="cxQ" placeholder="Buscar" value="${esc(st.cx.q)}" style="width:150px"><button class="btn" type="button" id="cxExp">Exportar .xlsx</button></div></div>
  <div class="list">${html}${vis.length?'':'<p class="note" style="padding:14px">Nenhum lançamento com esses filtros no período.</p>'}</div></div></div>`;
 bindScope();
 $('#cxIni').onchange=e=>{st.cx.ini=e.target.value;vCaixa()};$('#cxFim').onchange=e=>{st.cx.fim=e.target.value;vCaixa()};
 $$('[data-per]').forEach(b=>b.onclick=()=>{const m=mAdd(HOJE.slice(0,7),+b.dataset.per);st.cx.ini=m+'-01';st.cx.fim=dAdd(mAdd(m,1)+'-01',-1);vCaixa()});
 $$('[data-cta]').forEach(b=>b.onchange=()=>{b.checked?sel.add(b.dataset.cta):sel.delete(b.dataset.cta);vCaixa()});
 $$('[data-stf]').forEach(b=>b.onclick=()=>{const s=b.dataset.stf;st.cx.status.has(s)?st.cx.status.delete(s):st.cx.status.add(s);vCaixa()});
 $('#cxCat').onchange=e=>{st.cx.cat=e.target.value;vCaixa()};
 $('#cxQ').oninput=e=>{st.cx.q=e.target.value;clearTimeout(st._q);st._q=setTimeout(()=>{vCaixa();const q=$('#cxQ');q.focus();q.setSelectionRange(q.value.length,q.value.length)},350)};
 $('#novoL').onclick=()=>modalLanc(null,{conta:bancos[0]?.nome});
 $('#cxExp').onclick=()=>exportarMD(noPer,'Lancamentos_caixa_'+ini+'_a_'+fim);
 bindLinhas(vCaixa);
}
function linhaL(l,sel){const cta=l.tipo==='Transferência'||l.tipo==='Pagamento'?`${esc(l.conta)} → ${esc(l.ctr)}`:esc(l.conta);
 let v=l.valor;if(sel&&(l.tipo==='Transferência'||l.tipo==='Pagamento')){const a=Math.abs(l.valor);v=(sel.has(l.ctr)?a:0)-(sel.has(l.conta)?a:0)}
 const cli=st.user.perfil==='cliente';
 return `<div class="lrow">${cli?`<span class="icobtn st" title="${l.status}">${ICO[l.status]}</span>`:`<button class="icobtn st" type="button" data-st="${l.id}" title="${l.status} · tocar para confirmar ou voltar">${ICO[l.status]}</button>`}<span class="d num">${fd(l.data)}</span>
 <span class="t"><b>${esc(l.desc)}</b><span class="tg">${cta}</span>${l.cat?`<span class="tg">${esc(l.cat)}</span>`:'<span class="tg o">Sem categoria</span>'}${(l.tags||[]).map(t=>`<span class="tg ${tagCls(t)}">${esc(t)}</span>`).join('')}${l.venc&&contaObj(l.conta)?.tipo==='cartao'?`<span class="tg">Fatura ${fd(l.venc)}</span>`:''}</span>
 <span class="flags">${l.rep!=='Único'?IREP:''}</span><span class="v num ${v<0?'neg':'pos'}">${val(v)}</span>${cli?'<span></span>':`<button class="icobtn" type="button" data-ed="${l.id}" aria-label="Editar">${IMORE}</button>`}</div>`}
function bindLinhas(re){$$('[data-ed]').forEach(b=>b.onclick=()=>modalLanc(C().lanc.find(l=>l.id===b.dataset.ed)));
 $$('[data-st]').forEach(b=>b.onclick=()=>{const l=C().lanc.find(x=>x.id===b.dataset.st);if(l.status==='Conciliado'){toast('Lançamento conciliado. Para alterar, desfaça a conciliação na tela de Conciliação.');return}l.status=(l.status==='Confirmado')?(l.data>HOJE?'Agendado':'Pendente'):'Confirmado';log('Status',l.desc+' → '+l.status);save();re()})}

/* ===================== MODAL DE LANÇAMENTO ===================== */
function modalLanc(l,pre={}){const c=C(),novo=!l;
 const x=l?{...l,tags:[...(l.tags||[])]}:novoL(Object.assign({tipo:'Despesa',status:'Confirmado',conta:contasBanco()[0]?.nome},pre));
 const contaOpts=(v,soBanco)=>c.contas.filter(k=>!soBanco||k.tipo==='banco').map(k=>`<option ${k.nome===v?'selected':''}>${esc(k.nome)}</option>`).join('');
 const catList=[...new Set([...c.cats,...ativos().map(l=>l.cat)].filter(Boolean))].sort();
 const tipos=['Despesa','Receita','Transferência'];
 abrirModal(`<div class="mhead"><h3>${novo?'Novo lançamento':'Editar lançamento'}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fL">
  <div class="seg" role="group" aria-label="Tipo">${tipos.map(t=>`<button type="button" data-tp="${t}" class="${x.tipo===t||(x.tipo==='Pagamento'&&t==='Transferência')?'on':''}">${t.toLowerCase()}</button>`).join('')}</div>
  <div class="row"><label>Valor (R$)<input type="text" id="mV" inputmode="decimal" value="${x.valor?nf(x.valor):''}" placeholder="0,00" required></label><label>Data<input type="date" id="mD" value="${x.data}" required></label>
   <label>Repetição<select id="mRep" ${novo?'':'disabled'}><option value="Único" ${x.rep==='Único'?'selected':''}>Única</option><option value="Fixo" ${x.rep==='Fixo'?'selected':''}>Fixa (todo mês)</option><option value="Parcelado" ${x.rep==='Parcelado'?'selected':''}>Parcelada</option></select></label>
   <label id="lbParc" hidden>Parcelas<input type="number" id="mParc" min="2" max="48" value="2"></label></div>
  <div class="row"><label>Descrição<input type="text" id="mDesc" value="${esc(x.desc)}" required autocomplete="off"></label><label>Conta<select id="mConta">${contaOpts(x.conta)}</select></label><label id="lbCtr" hidden>Conta destino<select id="mCtr">${contaOpts(x.ctr)}</select></label></div>
  <div id="mSug" class="sugbox" hidden></div>
  <div class="row"><label id="lbCat">Categoria<input type="text" id="mCat" list="dlCat" value="${esc(x.cat)}" placeholder="Pai/Filha, ex.: 1 - Despesas Fixas/Aluguel"><datalist id="dlCat">${catList.map(k=>`<option value="${esc(k)}">`).join('')}</datalist></label><label>Tags<input type="text" id="mTags" value="${esc((x.tags||[]).join(', '))}" placeholder="Fixo, Variável…"></label></div>
  <div class="row"><label>Contato<input type="text" id="mCont" value="${esc(x.contato==='Sem contato'?'':x.contato)}"></label><label>Nº documento<input type="text" id="mDoc" value="${esc(x.ndoc)}"></label><label>Competência<input type="date" id="mComp" value="${x.comp||''}"></label></div>
  <label style="display:grid;gap:3px;font-size:12.5px;color:var(--muted)">Observações<textarea id="mObs" rows="2" maxlength="2000">${esc(x.obs)}</textarea></label>
  <div id="mDel" hidden></div>
 </form>
 <div class="mfoot"><label class="switch"><input type="checkbox" id="mConf" ${x.status==='Confirmado'||x.status==='Conciliado'?'checked':''} ${x.status==='Conciliado'?'disabled':''}> ${x.status==='Conciliado'?'Conciliado':'Pagamento já confirmado'}</label>
  <div class="scope">${!novo&&pode.excluir()?'<button class="btn" type="button" id="mExc">Excluir</button>':''}<button class="btn primary" type="submit" form="fL">Salvar</button></div></div>`);
 let tipo=x.tipo==='Pagamento'?'Transferência':x.tipo;
 const upd=()=>{$('#lbCtr').hidden=tipo!=='Transferência';$('#lbCat').hidden=tipo==='Transferência';$('#lbParc').hidden=$('#mRep').value!=='Parcelado'||!novo;$$('[data-tp]').forEach(b=>b.classList.toggle('on',b.dataset.tp===tipo))};
 $$('[data-tp]').forEach(b=>b.onclick=()=>{tipo=b.dataset.tp;upd()});$('#mRep').onchange=upd;upd();
 $('#mDesc').oninput=()=>{const d=$('#mDesc').value;if(d.length<3||tipo==='Transferência'){$('#mSug').hidden=true;return}const s=sugerir(d,tipo==='Despesa'?-1:1);const box=$('#mSug');
  if(!s||s.cat===$('#mCat').value){box.hidden=true;return}box.hidden=false;box.innerHTML=`<span><b style="font-weight:500">Sugestão:</b> ${esc(s.cat)}${s.tags.length?' · '+esc(s.tags.join(', ')):''}</span><span class="note">${esc(s.motivo)}</span><div><button class="btn" type="button" id="mAplS">Usar sugestão</button></div>`;$('#mAplS').onclick=()=>{$('#mCat').value=s.cat;$('#mTags').value=s.tags.join(', ');box.hidden=true}};
 if(!x.cat&&x.desc)$('#mDesc').oninput();
 if($('#mExc'))$('#mExc').onclick=()=>{const d=$('#mDel');d.hidden=false;d.innerHTML=`<div class="banner"><span>Excluir “${esc(x.desc)}”? Ele sai dos saldos e relatórios, mas fica guardado no histórico.</span><span class="scope"><button class="btn" type="button" id="mExN">Cancelar</button><button class="btn primary" type="button" id="mExS">Excluir</button></span></div>`;
  $('#mExN').onclick=()=>d.hidden=true;$('#mExS').onclick=()=>{l.excluido=true;if(l.extId)desvincularExt(l);log('Exclusão',l.desc+' '+brl(l.valor));save();fecharModal();toast('Lançamento excluído');render()}};
 $('#fL').onsubmit=e=>{e.preventDefault();let v=Math.abs(parseNum($('#mV').value));if(!v){toast('Informe um valor diferente de zero');return}
  const desc=$('#mDesc').value.trim(),data=$('#mD').value,conta=$('#mConta').value;
  if(tipo==='Transferência'&&$('#mCtr').value===conta){toast('Escolha uma conta destino diferente da origem');return}
  const cartObj=contaObj(conta);const conf=$('#mConf').checked;
  const base={tipo:x.tipo==='Pagamento'&&tipo==='Transferência'?'Pagamento':tipo,desc,data,conta,ctr:tipo==='Transferência'?$('#mCtr').value:'',cat:tipo==='Transferência'?(x.tipo==='Pagamento'?'Pagamento de cartão':'Transferência'):$('#mCat').value.trim(),tags:$('#mTags').value.split(',').map(s=>s.trim()).filter(Boolean),contato:$('#mCont').value.trim()||'Sem contato',ndoc:$('#mDoc').value.trim(),comp:$('#mComp').value,obs:$('#mObs').value};
  base.valor=tipo==='Despesa'?-v:(x.tipo==='Pagamento'?-v:v);
  const stOf=d=>x.status==='Conciliado'?'Conciliado':conf?'Confirmado':(d>HOJE?'Agendado':'Pendente');
  if(!novo){Object.assign(l,base,{status:stOf(data)});if(cartObj?.tipo==='cartao'&&!l.venc)l.venc=faturaDe(data,cartObj);aprender(l);log('Edição',l.desc+' '+brl(l.valor));save();fecharModal();toast('Lançamento salvo');render();return}
  const rep=$('#mRep').value,n=rep==='Parcelado'?Math.max(2,+$('#mParc').value||2):rep==='Fixo'?12:1;
  for(let i=0;i<n;i++){const d=i?ymd(new Date(D(data).getFullYear(),D(data).getMonth()+i,Math.min(D(data).getDate(),28))):data;
   const ln=novoL(Object.assign({},base,{id:nid(),data:cartObj?.tipo==='cartao'&&rep==='Parcelado'?data:d,rep,status:i?(d>HOJE?'Agendado':'Pendente'):stOf(d)}));
   if(rep==='Parcelado'){ln.desc=desc+(cartObj?.tipo==='cartao'?' (Parcela '+pad(i+1)+' de '+pad(n)+')':' '+(i+1)+'/'+n);ln.valor=r2(base.valor/n)}
   if(cartObj?.tipo==='cartao')ln.venc=rep==='Parcelado'?faturaDe(data,cartObj,i):faturaDe(d,cartObj);
   c.lanc.push(ln);if(!i)aprender(ln)}
  log('Inclusão',desc+' '+brl(base.valor)+(n>1?' ('+n+'x)':''));save();fecharModal();toast(n>1?n+' lançamentos criados':'Lançamento criado');render()};
}
function parseNum(s){if(typeof s==='number')return s;s=String(s??'').trim().replace(/R\$\s?/,'').replace(/\s/g,'');if(!s)return NaN;let neg=/^-|^\(|-$|D$/i.test(s);s=s.replace(/[()\-DC]/gi,'');if(/,\d{1,2}$/.test(s))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'');const v=parseFloat(s);return neg?-v:v}

/* ===================== CARTÕES DE CRÉDITO ===================== */
function fatura(cart,ym){const c=C();const v=ym+'-'+pad(cart.vence);
 const itens=ativos().filter(l=>l.conta===cart.nome&&(l.tipo==='Despesa'||l.tipo==='Receita')&&l.venc&&l.venc.slice(0,7)===ym).sort((a,b)=>a.data<b.data?-1:1);
 const desp=r2(itens.reduce((a,l)=>a+l.valor,0));
 const pagos=ativos().filter(l=>l.ctr===cart.nome&&l.venc&&l.venc.slice(0,7)===ym);
 return{venc:v,fech:mAdd(ym,-1)+'-'+pad(cart.fecha),itens,desp,pagos,pago:r2(pagos.reduce((a,l)=>a+Math.abs(l.valor),0))}}
function vCartoes(){const cs=contasCartao();
 if(!cs.length){$('#view').innerHTML=topo('Financeiro · cartões','Cartões de crédito')+`<div class="panel"><p class="note" style="margin:0">Nenhum cartão cadastrado para este cliente.</p><div><button class="btn primary" type="button" data-go="cadastros">Cadastrar cartão</button></div></div>`;bindScope();return}
 if(!st.cc.cartao||!contaObj(st.cc.cartao))st.cc.cartao=cs[0].nome;const cart=contaObj(st.cc.cartao),ym=st.cc.mes;
 const f=fatura(cart,ym),ant=fatura(cart,mAdd(ym,-1));
 const saldoAnt=r2(ant.desp),total=r2(saldoAnt+ant.pago+f.desp),fechada=f.pagos.length>0;
 const conc=r2(f.itens.filter(l=>l.status==='Conciliado').reduce((a,l)=>a+l.valor,0)),fixas=r2(f.itens.filter(l=>l.rep==='Fixo'||(l.tags||[]).includes('Fixo')).reduce((a,l)=>a+l.valor,0));
 const futuras=ativos().filter(l=>l.conta===cart.nome&&l.venc&&l.venc.slice(0,7)>ym);
 const vis=f.itens.filter(l=>st.cc.filtro==='todos'||(st.cc.filtro==='conc'?l.status==='Conciliado':l.status!=='Conciliado'));
 $('#view').innerHTML=topo('Financeiro · cartões','Cartões de crédito',`<button class="btn" type="button" id="ccImp">Importar fatura</button><button class="btn primary" type="button" id="ccNovo">+ Nova compra</button>`)+bannerExemplo()+`
 <div class="split"><div class="side">
  <div class="panel"><select id="ccSel" aria-label="Cartão">${cs.map(k=>`<option ${k.nome===cart.nome?'selected':''}>${esc(k.nome)}</option>`).join('')}</select>
   <div class="monthnav"><button class="icobtn" type="button" id="ccPrev" aria-label="Mês anterior">‹</button><b>${mNome(ym)}</b><button class="icobtn" type="button" id="ccNext" aria-label="Próximo mês">›</button></div></div>
  <div class="panel"><div class="note" style="text-align:center">Fatura (R$) · ${fechada?'<span class="pill p-ok">Fechada</span>':'<span class="pill p-warn">Aberta</span>'}</div>
   <div class="kv num"><span>Fechamento</span><span>${fdl(f.fech)}</span><span>Vencimento</span><span>${fdl(f.venc)}</span><span>Saldo anterior</span><span class="${saldoAnt<0?'neg':''}">${val(saldoAnt)}</span><span>Total pago</span><span class="pos">${val(ant.pago)}</span><span class="big">Total</span><span class="big ${total<0?'neg':''}">${val(total)}</span><span class="big">Valor a pagar</span><span class="big ${total<0?'neg':''}">${val(fechada?0:total)}</span></div>
   <div class="scope" style="justify-content:center">${fechada?`<button class="btn ghost" type="button" id="ccReab">Reabrir esta fatura</button>`:`<button class="btn primary" type="button" id="ccFech" ${f.itens.length?'':'disabled'}>Fechar fatura</button>`}</div>
   <div class="note" style="text-align:center">Detalhamento</div>
   <div class="kv num"><span>Despesas</span><span class="neg">${val(f.desp)}</span><span>Total conciliado</span><span>${val(conc)}</span><span>Total não conciliado</span><span class="${f.desp-conc<0?'neg':''}">${val(f.desp-conc)}</span><span>Despesas fixas</span><span>${val(fixas)}</span><span>Parcelas futuras</span><span>${val(futuras.reduce((a,l)=>a+l.valor,0))}</span></div></div>
 </div>
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:12px 14px;border-bottom:1px solid var(--line)">
  <div class="chips"><button class="chip ${st.cc.filtro==='nao'?'':'off'}" type="button" data-ccf="nao">${ICO.Confirmado}Não conciliados</button><button class="chip ${st.cc.filtro==='conc'?'':'off'}" type="button" data-ccf="conc">${ICO.Conciliado}Conciliados</button></div>
  <span class="note">${f.itens.length} lançamentos na fatura</span></div>
  <div class="list">${vis.map(l=>linhaL(l)).join('')||'<p class="note" style="padding:14px">Nenhuma compra nesta fatura.</p>'}</div></div></div>`;
 bindScope();
 $('#ccSel').onchange=e=>{st.cc.cartao=e.target.value;vCartoes()};
 $('#ccPrev').onclick=()=>{st.cc.mes=mAdd(ym,-1);vCartoes()};$('#ccNext').onclick=()=>{st.cc.mes=mAdd(ym,1);vCartoes()};
 $$('[data-ccf]').forEach(b=>b.onclick=()=>{st.cc.filtro=st.cc.filtro===b.dataset.ccf?'todos':b.dataset.ccf;vCartoes()});
 $('#ccNovo').onclick=()=>modalLanc(null,{conta:cart.nome,status:'Confirmado'});
 $('#ccImp').onclick=()=>{st.conc.conta=cart.nome;st.conc.sel=null;st.view='conciliacao';render()};
 if($('#ccFech'))$('#ccFech').onclick=()=>modalFechar(cart,ym,total);
 if($('#ccReab'))$('#ccReab').onclick=()=>{f.pagos.forEach(p=>p.excluido=true);log('Fatura reaberta',cart.nome+' '+mNome(ym));save();toast('Fatura reaberta');vCartoes()};
 bindLinhas(vCartoes);
}
function modalFechar(cart,ym,total){const v=Math.abs(total);
 abrirModal(`<div class="mhead"><h3>Fechar fatura ${esc(cart.nome)}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <div class="mbody form"><div style="text-align:center"><div class="neg num" style="font-size:30px">-${brl(v).replace('-','')}</div><div class="note">${fdl(ym+'-'+pad(cart.vence))}</div></div>
 <div class="banner">Antes de confirmar, verifique se o valor confere com a fatura do banco.</div>
 <div class="row"><label>Valor do pagamento<input type="text" id="fV" value="${nf(v)}"></label><label>Data do pagamento<input type="date" id="fD" value="${ym}-${pad(cart.vence)}"></label></div>
 <div class="row"><label>Conta de débito<select id="fC">${contasBanco().map(k=>`<option ${k.nome===cart.debito?'selected':''}>${esc(k.nome)}</option>`).join('')}</select></label></div>
 <label class="switch"><input type="checkbox" id="fConf" checked> Pagamento já confirmado</label></div>
 <div class="mfoot"><span class="note">Gera o pagamento na conta de débito</span><button class="btn primary" type="button" id="fOk">Fechar fatura</button></div>`);
 $('#fOk').onclick=()=>{const x=Math.abs(parseNum($('#fV').value));const d=$('#fD').value;C().lanc.push(novoL({tipo:'Pagamento',data:d,valor:-x,desc:'Pagamento cartão '+cart.nome,cat:'Pagamento de cartão',conta:$('#fC').value,ctr:cart.nome,venc:ym+'-'+pad(cart.vence),status:$('#fConf').checked?'Confirmado':(d>HOJE?'Agendado':'Pendente')}));log('Fatura fechada',cart.nome+' '+mNome(ym)+' '+brl(-x));save();fecharModal();toast('Fatura fechada e pagamento lançado');render()}}

/* ===================== LEITURA DE EXTRATOS (OFX / PDF / CSV) ===================== */
function decode(buf){let t=new TextDecoder('utf-8').decode(buf);if(t.includes(String.fromCharCode(65533)))t=new TextDecoder('windows-1252').decode(buf);return t}
function tag(b,t){const m=b.match(new RegExp('<'+t+'>([^<\\r\\n]*)','i'));return m?m[1].trim():''}
function parseOFX(text){const out=[];text.split(/<STMTTRN>/i).slice(1).forEach(b=>{b=b.split(/<\/STMTTRN>/i)[0];const v=parseFloat(tag(b,'TRNAMT').replace(',','.'));const dt=tag(b,'DTPOSTED').match(/(\d{4})(\d{2})(\d{2})/);if(isNaN(v)||!dt)return;
 out.push({data:dt[1]+'-'+dt[2]+'-'+dt[3],valor:r2(v),desc:(tag(b,'MEMO')||tag(b,'NAME')||'').replace(/\s+/g,' ').trim(),fitid:tag(b,'FITID')})});return out}
const MESES_PT={janeiro:1,fevereiro:2,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12,jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
async function pdfLinhas(buf){if(!window.pdfjsLib)throw new Error('pdf');const pdf=await pdfjsLib.getDocument({data:buf,isEvalSupported:false}).promise;const linhas=[];
 for(let p=1;p<=pdf.numPages;p++){const tc=await(await pdf.getPage(p)).getTextContent();const rows={};tc.items.forEach(it=>{if(!it.str.trim())return;const y=Math.round(it.transform[5]/3);(rows[y]=rows[y]||[]).push(it)});
  Object.keys(rows).map(Number).sort((a,b)=>b-a).forEach(y=>linhas.push(rows[y].sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim()))}
 return linhas}
function parsePdfExtrato(linhas){const out=[];const ano=(linhas.join(' ').match(/\b(20\d\d)\b/)||[])[1]||HOJE.slice(0,4);let cur=null;
 const RV=/(-\s?)?R?\$?\s?\d{1,3}(?:\.\d{3})*,\d{2}(\s?[DC](?![a-z]))?(\s?-)?/gi;
 linhas.forEach(L=>{const l=L.normalize('NFD').replace(/\p{M}/gu,'');
  const h=l.match(/(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})/i);if(h&&MESES_PT[h[2].toLowerCase()]&&!RV.test(l)){cur=h[3]+'-'+pad(MESES_PT[h[2].toLowerCase()])+'-'+pad(+h[1]);RV.lastIndex=0;return}RV.lastIndex=0;
  if(/saldo/i.test(l))return;
  let m=L.match(/^(\d{2})[\/.-](\d{2})(?:[\/.-](\d{2,4}))?\s+(.*)$/);let data=cur,resto=L;
  if(m){const y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):ano;data=y+'-'+m[2]+'-'+m[1];resto=m[4]}
  if(!data)return;const vals=[...resto.matchAll(RV)];if(!vals.length)return;
  const vtxt=vals.length>1?vals[vals.length-2][0]:vals[0][0];let v=parseNum(vtxt.replace(/\s/g,''));if(isNaN(v)||!v)return;
  const desc=resto.slice(0,resto.indexOf(vals[0][0])).replace(/\s+/g,' ').trim();if(!desc)return;
  if(v>0&&!/[+C]/.test(vtxt)&&/(enviad|pagament|pagto|debito|tarifa|saque|compra|boleto|iof|juros|darf|das )/i.test(l))v=-v;
  out.push({data,valor:r2(v),desc,fitid:'',pdf:true})});return out}
async function lerArquivoExtrato(f){const buf=await f.arrayBuffer();
 if(/\.pdf$/i.test(f.name)){const ls=await pdfLinhas(buf);return parsePdfExtrato(ls)}
 if(/\.(ofx|qfx)$/i.test(f.name)||/<OFX>|OFXHEADER/i.test(decode(buf.slice(0,600))))return parseOFX(decode(buf));
 const rows=await lerPlanilha(f,buf);return rows.map(r=>({data:toYmd(pick(r,['data'])),valor:r2(parseNum(pick(r,['valor']))),desc:String(pick(r,['descricao','historico','lancamento'])||'').trim(),fitid:''})).filter(x=>x.data&&!isNaN(x.valor)&&x.valor)}
function normKey(s){return String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function pick(row,cands){const ks=Object.keys(row);for(const c of cands){const k=ks.find(k=>normKey(k)===c)||ks.find(k=>normKey(k).includes(c));if(k!==undefined&&row[k]!==''&&row[k]!=null)return row[k]}return undefined}
function toYmd(v){if(Object.prototype.toString.call(v)==='[object Date]'){if(isNaN(v))return'';return ymd(new Date(Math.round(v.getTime()/60000)*60000))}if(typeof v==='number'){const d=new Date(Math.round((v-25569)*864e5));return ymd(new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()))}
 const s=String(v??'').trim();let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);if(m){let y=+m[3];if(y<100)y+=2000;return y+'-'+pad(+m[2])+'-'+pad(+m[1])}m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[1]+'-'+m[2]+'-'+m[3];return''}
async function lerPlanilha(f,buf){buf=buf||await f.arrayBuffer();let wb;
 if(/\.(csv|txt)$/i.test(f.name)){const t=decode(buf);const l0=t.split('\n')[0];wb=XLSX.read(t,{type:'string',FS:(l0.match(/;/g)||[]).length>(l0.match(/,/g)||[]).length?';':',',raw:true})}else wb=XLSX.read(buf,{type:'array',cellDates:true});
 const ws=wb.Sheets[wb.SheetNames[0]];const aoa=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:true});let h=aoa.findIndex(r=>r.filter(c=>typeof c==='string'&&c.trim()).length>=3);if(h<0)h=0;
 const head=aoa[h].map(x=>String(x).trim());return aoa.slice(h+1).filter(r=>r.some(c=>c!==''&&c!=null)).map(r=>Object.fromEntries(head.map((k,i)=>[k,r[i]])))}

/* ===================== CONCILIAÇÃO BANCÁRIA ===================== */
function extDe(conta){const c=C();return c.extratos[conta]=c.extratos[conta]||[]}
function candidatos(it,conta,janela=7,todos=false){return ativos().filter(l=>{if(!todos&&(l.status==='Conciliado'||l.extId))return false;const e=efeito(l,conta);if(!e||Math.sign(e)!==Math.sign(it.valor))return false;return Math.abs(dDiff(l.data,it.data))<=janela}).map(l=>({l,dv:Math.abs(efeito(l,conta)-it.valor),dd:Math.abs(dDiff(l.data,it.data))})).sort((a,b)=>a.dv-b.dv||a.dd-b.dd)}
function vincular(it,ls){it.status='conciliado';it.lanc=ls.map(l=>l.id);ls.forEach(l=>{l.status='Conciliado';l.extId=it.id})}
function desvincularExt(l){const c=C();Object.values(c.extratos).forEach(arr=>arr.forEach(it=>{if(it.id===l.extId){it.lanc=(it.lanc||[]).filter(x=>x!==l.id);if(!it.lanc.length){it.status='pendente';it.sug=null}}}));l.extId=null}
function autoConciliar(conta){const arr=extDe(conta).filter(i=>i.status!=='conciliado');let n=0,s=0;
 [[.005,0],[.005,3],[.005,6],[1.01,1]].forEach(([tol,dj])=>arr.forEach(it=>{if(it.status==='conciliado')return;const c=candidatos(it,conta,dj).find(x=>x.dv<=tol);if(c){vincular(it,[c.l]);n++}}));
 arr.forEach(it=>{if(it.status==='conciliado')return;const sg=sugerir(it.desc,it.valor);it.sug=sg;if(sg&&sg.conf>=.6){it.status='sugerido';s++}else it.status='pendente'});
 return{n,s}}
function criarDoExtrato(it,conta,dados){const isCart=contaObj(conta)?.tipo==='cartao';
 const l=novoL({tipo:it.valor<0?'Despesa':'Receita',data:it.data,valor:it.valor,desc:dados.desc||it.desc,cat:dados.cat||'',tags:dados.tags||[],conta,status:'Conciliado',obs:'Importado do extrato',contato:dados.contato||'Sem contato'});
 if(isCart)l.venc=faturaDe(it.data,contaObj(conta));
 C().lanc.push(l);vincular(it,[l]);aprender(l);return l}
function vConc(){const c=C(),todas=c.contas;if(!todas.length){$('#view').innerHTML=topo('Financeiro','Conciliação bancária')+'<div class="panel"><p class="note" style="margin:0">Cadastre uma conta primeiro.</p><div><button class="btn primary" type="button" data-go="cadastros">Cadastrar conta</button></div></div>';bindScope();return}if(!st.conc.conta||!contaObj(st.conc.conta))st.conc.conta=todas[0].nome;const conta=st.conc.conta,arr=extDe(conta);
 const pend=arr.filter(i=>i.status!=='conciliado'),sugs=arr.filter(i=>i.status==='sugerido');
 const q=st.conc.q.toLowerCase();const vis=arr.filter(i=>(st.conc.filtro==='todos'||i.status!=='conciliado')&&(!q||buscaOk(i.desc,i.valor,q))).sort((a,b)=>a.data<b.data?-1:1);
 const sel=arr.find(i=>i.id===st.conc.sel)||vis.find(i=>i.status!=='conciliado')||null;if(sel)st.conc.sel=sel.id;
 const icoE=i=>i.status==='conciliado'?ICO.Conciliado:i.status==='sugerido'?ICO.Agendado:ICO.Pendente;
 const per=arr.length?fd(arr.reduce((a,i)=>i.data<a?i.data:a,arr[0].data))+' a '+fd(arr.reduce((a,i)=>i.data>a?i.data:a,arr[0].data)):'';
 $('#view').innerHTML=topo('Financeiro · extrato × lançamentos','Conciliação bancária',`<select id="ccConta" aria-label="Conta">${todas.map(k=>`<option ${k.nome===conta?'selected':''} value="${esc(k.nome)}">${esc(k.nome)}${k.tipo==='cartao'?' (cartão)':''}</option>`).join('')}</select>`)+bannerExemplo()+`
 <div class="grid2"><label class="drop" id="dExt"><b>Importar extrato ${contaObj(conta).tipo==='cartao'?'ou fatura ':''}de ${esc(conta)}</b><small>OFX, PDF ou planilha (.xlsx/.csv) · vários arquivos de uma vez · lançamentos repetidos são ignorados</small><input type="file" id="dExt-in" accept=".ofx,.qfx,.pdf,.xlsx,.xls,.csv" multiple hidden></label>
 <div class="panel"><div class="kv num"><span>Lançamentos no extrato</span><span>${arr.length}${per?' · '+per:''}</span><span>Conciliados</span><span class="pos">${arr.length-pend.length}</span><span>Com sugestão</span><span>${sugs.length}</span><span>Sem par</span><span class="${pend.length-sugs.length?'neg':''}">${pend.length-sugs.length}</span></div>
 <div class="scope"><button class="btn primary" type="button" id="cAuto" ${pend.length?'':'disabled'}>Conciliar automaticamente</button><button class="btn" type="button" id="cApl" ${sugs.length?'':'disabled'}>Aplicar ${sugs.length} sugestões</button></div></div></div>
 ${arr.length?`<div class="conc">
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:10px 12px;border-bottom:1px solid var(--line)"><div class="chips"><button class="chip ${st.conc.filtro==='todos'?'':'off'}" type="button" data-cf="todos">Todos (${arr.length})</button><button class="chip ${st.conc.filtro==='pend'?'':'off'}" type="button" data-cf="pend">Pendentes (${pend.length})</button></div><input type="text" id="cQ" placeholder="Buscar no extrato" value="${esc(st.conc.q)}" style="width:170px"></div>
  <div class="list">${vis.map(i=>`<div class="erow ${sel&&sel.id===i.id?'sel':''}" data-ei="${i.id}" tabindex="0"><span>${icoE(i)}</span><span class="num note">${fdl(i.data)}</span><span class="t"><b>${esc(i.desc)}</b>${i.status==='sugerido'?`<span class="tg o">${esc(i.sug.cat)}</span>`:''}${i.status==='conciliado'?`<span class="tg">${(i.lanc||[]).length} lançamento(s)</span>`:''}${i.pdf?'<span class="tg">lido do PDF</span>':''}</span><span class="num ${i.valor<0?'neg':'pos'}" style="text-align:right">${val(i.valor)}</span><span></span></div>`).join('')||'<p class="note" style="padding:14px">Nada pendente neste extrato.</p>'}</div></div>
 <div class="panel" id="cDet">${sel?detalheExt(sel,conta):'<p class="note" style="margin:0">Selecione um lançamento do extrato.</p>'}</div></div>`:`<div class="panel"><p class="note" style="margin:0">Importe o extrato desta conta. O sistema casa o extrato com os lançamentos e sugere categorias pelo histórico.</p></div>`}`;
 bindScope();
 $('#ccConta').onchange=e=>{st.conc.conta=e.target.value;st.conc.sel=null;vConc()};
 bindDrop('dExt',async files=>{let n=0,dup=0,erro=[];for(const f of files){try{const tx=await lerArquivoExtrato(f);if(!tx.length){erro.push(f.name);continue}const ex=extDe(conta);
   const occ={};tx.forEach(t=>{const b=t.data+'|'+t.valor.toFixed(2);occ[b]=(occ[b]||0)+1;const k=b+'|'+occ[b];if(ex.some(e=>e.k===k)){dup++;return}ex.push({id:nid(),k,...t,status:'pendente',arq:f.name});n++})}catch(e){erro.push(f.name)}}
  log('Extrato importado',conta+' · '+n+' lançamentos');save();toast(n+' lançamentos importados'+(dup?' · '+dup+' repetidos ignorados':'')+(erro.length?' · não consegui ler: '+erro.join(', '):''));vConc()});
 if($('#cDemo'))$('#cDemo').onclick=()=>{demoExtrato(conta);vConc()};
 $('#cAuto').onclick=()=>{const r=autoConciliar(conta);log('Conciliação automática',conta+' · '+r.n+' conciliados');save();st.conc.sel=null;toast(r.n+' conciliados automaticamente · '+r.s+' com sugestão de categoria');vConc()};
 $('#cApl').onclick=()=>{sugs.forEach(i=>criarDoExtrato(i,conta,i.sug));log('Sugestões aplicadas',conta+' · '+sugs.length);save();st.conc.sel=null;toast(sugs.length+' lançamentos criados e conciliados');vConc()};
 $$('[data-cf]').forEach(b=>b.onclick=()=>{st.conc.filtro=b.dataset.cf;vConc()});
 if($('#cQ'))$('#cQ').oninput=e=>{st.conc.q=e.target.value;clearTimeout(st._q);st._q=setTimeout(()=>{vConc();const q=$('#cQ');q.focus();q.setSelectionRange(q.value.length,q.value.length)},350)};
 $$('[data-ei]').forEach(r=>{r.onclick=()=>{st.conc.sel=r.dataset.ei;vConc()};r.onkeydown=e=>{if(e.key==='Enter')r.click()}});
 if(sel){bindDetalhe(sel,conta);bindLinhas(vConc)}
}
function detalheExt(it,conta){
 const head=`<div class="panel-head"><div><div class="note num">${fdl(it.data)}</div><b style="font-weight:500">${esc(it.desc)}</b></div><b class="num ${it.valor<0?'neg':'pos'}" style="font-size:18px">${val(it.valor)}</b></div>`;
 if(it.status==='conciliado'){const ls=(it.lanc||[]).map(id=>C().lanc.find(l=>l.id===id)).filter(Boolean);return head+`<div class="banner info"><span>Conciliado com:</span></div><div class="list">${ls.map(l=>linhaL(l)).join('')}</div><div><button class="btn" type="button" id="cDesf">Desfazer conciliação</button></div>`}
 const sg=it.sug||sugerir(it.desc,it.valor);const cats=[...new Set([...C().cats,...ativos().map(l=>l.cat)].filter(Boolean))].sort();
 const outras=C().contas.filter(k=>k.nome!==conta);
 const cands=candidatos(it,conta,st.conc.jan||10,st.conc.mostrarConc).slice(0,25);
 return head+`<div class="tabs"><button type="button" data-ct="class" class="${st.conc.tab==='class'?'on':''}">Classificar para importação</button><button type="button" data-ct="esc" class="${st.conc.tab==='esc'?'on':''}">Escolher lançamentos para conciliar (${cands.length})</button></div>
 ${st.conc.tab==='class'?`<div class="form">
  ${sg?`<div class="sugbox"><span><b style="font-weight:500">Sugestão ${Math.round(sg.conf*100)}%</b> · ${esc(sg.cat)}${sg.tags.length?' · '+esc(sg.tags.join(', ')):''}</span><span class="note">${esc(sg.motivo)}</span></div>`:'<div class="sugbox"><span class="note">Sem histórico parecido. Ao classificar, o sistema aprende para as próximas vezes.</span></div>'}
  <div class="row"><label>Descrição<input type="text" id="kDesc" value="${esc(sg?sg.desc:it.desc)}"></label></div>
  <div class="row"><label>Categoria<input type="text" id="kCat" list="dlCat2" value="${esc(sg?sg.cat:'')}"><datalist id="dlCat2">${cats.map(k=>`<option value="${esc(k)}">`).join('')}</datalist></label><label>Tags<input type="text" id="kTags" value="${esc(sg?sg.tags.join(', '):'')}"></label></div>
  <div class="scope"><button class="btn primary" type="button" id="kOk">Importar como ${it.valor<0?'despesa':'receita'}</button></div>
  <div class="note">É uma transferência entre contas?</div>
  <div class="scope"><select id="kTr" aria-label="Conta da transferência">${outras.map(k=>`<option value="${esc(k.nome)}">${it.valor<0?'Para':'De'} ${esc(k.nome)}</option>`).join('')}</select><button class="btn" type="button" id="kTrOk">Importar como transferência</button></div></div>`
 :`<div class="scope"><label class="switch"><input type="checkbox" id="kMos" ${st.conc.mostrarConc?'checked':''}> Exibir conciliados</label><select id="kJan" aria-label="Janela de datas"><option value="3" ${st.conc.jan==3?'selected':''}>± 3 dias</option><option value="10" ${!st.conc.jan||st.conc.jan==10?'selected':''}>± 10 dias</option><option value="35" ${st.conc.jan==35?'selected':''}>± 35 dias</option></select></div>
  <div>${cands.map(({l,dv})=>`<label class="cand"><input type="checkbox" data-cd="${l.id}" data-v="${efeito(l,conta)}" ${dv<.005&&cands.filter(c=>c.dv<.005).length===1?'checked':''}><span class="num note">${fd(l.data)}</span><span style="min-width:0"><span style="display:flex;gap:6px;align-items:center">${ICO[l.status]}<b style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.desc)}</b></span><span class="tg">${esc(l.cat||l.tipo)}</span>${(l.tags||[]).map(t=>`<span class="tg ${tagCls(t)}">${esc(t)}</span>`).join('')}</span><span class="num ${efeito(l,conta)<0?'neg':'pos'}" style="text-align:right">${val(efeito(l,conta))}</span></label>`).join('')||'<p class="note">Nenhum lançamento compatível nessa janela. Aumente a janela ou classifique para importação.</p>'}</div>
  <div class="panel-head"><span class="note num" id="kSoma">Selecionado: R$ 0,00 · diferença ${val(it.valor)}</span><button class="btn primary" type="button" id="kConc" disabled>Conciliar selecionados</button></div>`}`}
function bindDetalhe(it,conta){const re=()=>vConc();
 $$('[data-ct]').forEach(b=>b.onclick=()=>{st.conc.tab=b.dataset.ct;re()});
 if($('#cDesf'))$('#cDesf').onclick=()=>{(it.lanc||[]).forEach(id=>{const l=C().lanc.find(x=>x.id===id);if(!l)return;if(l.obs==='Importado do extrato')l.excluido=true;else{l.status='Confirmado'}l.extId=null});it.lanc=[];it.status='pendente';it.sug=null;log('Conciliação desfeita',it.desc);save();re()};
 if($('#kOk'))$('#kOk').onclick=()=>{const cat=$('#kCat').value.trim();if(!cat){toast('Informe a categoria');$('#kCat').focus();return}criarDoExtrato(it,conta,{desc:$('#kDesc').value.trim(),cat,tags:$('#kTags').value.split(',').map(s=>s.trim()).filter(Boolean)});log('Importado do extrato',it.desc);save();st.conc.sel=null;toast('Lançamento criado e conciliado');re()};
 if($('#kTrOk'))$('#kTrOk').onclick=()=>{const out=$('#kTr').value,a=Math.abs(it.valor);const l=novoL({tipo:'Transferência',data:it.data,valor:a,desc:it.desc,cat:'Transferência',conta:it.valor<0?conta:out,ctr:it.valor<0?out:conta,status:'Conciliado',obs:'Importado do extrato'});C().lanc.push(l);vincular(it,[l]);log('Transferência do extrato',it.desc);save();st.conc.sel=null;toast('Transferência lançada e conciliada');re()};
 if($('#kMos'))$('#kMos').onchange=e=>{st.conc.mostrarConc=e.target.checked;re()};
 if($('#kJan'))$('#kJan').onchange=e=>{st.conc.jan=+e.target.value;re()};
 const upd=()=>{const ck=$$('[data-cd]:checked');const s=r2(ck.reduce((a,b)=>a+(+b.dataset.v),0));const dif=r2(it.valor-s);const k=$('#kSoma');if(!k)return;k.textContent='Selecionado: '+brl(s)+' · diferença '+val(dif);k.className='note num '+(Math.abs(dif)<.05&&ck.length?'pos':'');$('#kConc').disabled=!ck.length;$('#kConc').textContent=Math.abs(dif)<.05?'Conciliar selecionados':'Conciliar com diferença'};
 $$('[data-cd]').forEach(b=>b.onchange=upd);if($('#kConc')){upd();$('#kConc').onclick=()=>{const ls=$$('[data-cd]:checked').map(b=>C().lanc.find(l=>l.id===b.dataset.cd));ls.forEach(l=>{if(l.extId){desvincularExt(l)}});vincular(it,ls);log('Conciliação manual',it.desc+' ↔ '+ls.length+' lançamento(s)');save();st.conc.sel=null;toast('Conciliado');re()}}}
function demoExtrato(conta){const ex=extDe(conta),m=HOJE.slice(0,7);
 const base=ativos().filter(l=>efeito(l,conta)&&l.data.slice(0,7)===m&&l.data<=HOJE&&l.status!=='Agendado');
 const bancoTxt=l=>{const d=l.desc.toUpperCase();if(l.tipo==='Transferência')return'TED/PIX ENTRE CONTAS '+d;if(/stone/i.test(d))return'CRED STONE PAGAMENTOS';if(/pix recebido/i.test(d))return'PIX RECEBIDO '+d.replace(/PIX RECEBIDO /,'');if(/tarifa/i.test(d))return'TARIFA PACOTE SERVICOS';return(l.valor<0?'PAGAMENTO ':'CREDITO ')+d};
 base.forEach(l=>{if(R01()<.12)return;const v=efeito(l,conta);const dd=R01()<.25?1:0;ex.push({id:nid(),k:'d'+l.id,data:dAdd(l.data,dd),valor:r2(v+(R01()<.06?-.4:0)),desc:bancoTxt(l),fitid:'',status:'pendente',arq:'exemplo.ofx'})});
 const extras=[[-12.37,'IOF SOBRE SALDO DEVEDOR'],[-89.9,'DEB AUT VIVO FIBRA EMPRESAS'],[-640,'PIX ENVIADO MANUTENCAO EQUIPAMENTOS LTDA'],[275,'PIX RECEBIDO MARINA ALVES']];
 extras.forEach(([v,d],i)=>ex.push({id:nid(),k:'x'+i+conta,data:dAdd(m+'-01',3+i*4)>HOJE?HOJE:dAdd(m+'-01',3+i*4),valor:v,desc:d,fitid:'',status:'pendente',arq:'exemplo.ofx'}));
 log('Extrato de exemplo',conta);save();toast(ex.length+' lançamentos de exemplo no extrato')}
let _r=7;const R01=()=>{_r=(_r*9301+49297)%233280;return _r/233280};
function bindDrop(id,fn){const z=$('#'+id),inp=$('#'+id+'-in');if(!z)return;inp.onchange=()=>{fn([...inp.files]);inp.value=''};
 z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');z.ondrop=e=>{e.preventDefault();z.classList.remove('over');fn([...e.dataTransfer.files])}}

/* ===================== FIXAS E REGRAS (importação inteligente) ===================== */
function recorrentes(){const g={};ativos().forEach(l=>{if(l.tipo!=='Despesa'&&l.tipo!=='Receita')return;const k=chave(l.desc);if(!k)return;(g[k]=g[k]||[]).push(l)});
 const prox=mAdd(HOJE.slice(0,7),1);
 return Object.entries(g).map(([k,ls])=>{const meses=[...new Set(ls.map(l=>l.data.slice(0,7)))].sort();if(meses.length<3)return null;
  const passados=ls.filter(l=>l.data<=HOJE);const vs=passados.map(l=>Math.abs(l.valor));if(vs.length<3)return null;const med=vs.reduce((a,b)=>a+b,0)/vs.length;const sd=Math.sqrt(vs.reduce((a,b)=>a+(b-med)**2,0)/vs.length);const cv=med?sd/med:1;
  const porMes=passados.length/meses.filter(m=>m<=HOJE.slice(0,7)).length;if(porMes>2.5)return null;
  const dias=passados.map(l=>D(l.data).getDate()).sort((a,b)=>a-b);const dia=dias[Math.floor(dias.length/2)];
  const ult=ls.sort((a,b)=>a.data<b.data?-1:1)[ls.length-1];const cats={};ls.forEach(l=>cats[l.cat]=(cats[l.cat]||0)+1);const cat=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0][0];
  const temProx=ls.some(l=>l.data.slice(0,7)===prox);
  return{k,nome:ult.desc.replace(/\s*\d+\/\d+\s*$/,'').trim(),cat,conta:ult.conta,tipo:ult.tipo,tags:ult.tags,meses:meses.length,med:r2(med),ult:Math.abs(ult.valor),cv,dia,tipoRec:cv<.02?'Fixa · valor igual':cv<.25?'Fixa · valor varia':'Recorrente · valor muda',marcada:ls.some(l=>l.rep==='Fixo'),temProx,sinal:Math.sign(ult.valor)}}).filter(Boolean).sort((a,b)=>a.dia-b.dia)}
function vIntel(){const c=C();const recs=recorrentes();const prox=mAdd(HOJE.slice(0,7),1);
 $('#view').innerHTML=topo('Importação inteligente','Fixas e regras')+bannerExemplo()+`
 <div class="tabs"><button type="button" data-it="fixas" class="${st.intel==='fixas'?'on':''}">Contas que se repetem (${recs.length})</button><button type="button" data-it="regras" class="${st.intel==='regras'?'on':''}">Regras de classificação (${c.regras.length})</button><button type="button" data-it="log" class="${st.intel==='log'?'on':''}">Histórico de alterações</button></div>
 ${st.intel==='fixas'?`<div class="panel"><div class="panel-head"><div><h3>Detectadas no histórico</h3><span class="note">Nomes que aparecem em 3 meses ou mais. O valor previsto é a média ou o último valor, se for fixo.</span></div>
  <button class="btn primary" type="button" id="iAg">Agendar marcadas em ${mNome(prox)}</button></div>
  <div class="tbl"><table><thead><tr><th></th><th>Lançamento</th><th>Categoria</th><th>Tipo</th><th class="r">Dia</th><th class="r">Meses</th><th class="r">Valor previsto</th><th>${mNome(prox)}</th></tr></thead><tbody>
  ${recs.map((r,i)=>`<tr><td><input type="checkbox" data-ri="${i}" ${r.temProx?'disabled':'checked'} aria-label="Agendar ${esc(r.nome)}"></td><td><b style="font-weight:500">${esc(r.nome)}</b><br><span class="note">${esc(r.conta)}</span></td><td class="note">${esc(r.cat)}</td><td><span class="pill ${r.cv<.02?'p-ok':r.cv<.25?'p-warn':'p-n'}">${r.tipoRec}</span></td><td class="r num">${r.dia}</td><td class="r num">${r.meses}</td><td class="r num ${r.sinal<0?'neg':'pos'}">${val(r.sinal*(r.cv<.02?r.ult:r.med))}</td><td>${r.temProx?'<span class="pill p-ok">Já lançada</span>':'<span class="pill p-bad">Falta lançar</span>'}</td></tr>`).join('')||'<tr><td colspan="8" class="note">Ainda não há histórico suficiente. Importe pelo menos 3 meses do Meu Dinheiro.</td></tr>'}
  </tbody></table></div></div>`:''}
 ${st.intel==='regras'?`<div class="panel"><div class="panel-head"><div><h3>Como o sistema classifica o extrato</h3><span class="note">Cada vez que alguém classifica um lançamento, a regra é aprendida. Você também pode criar regras.</span></div><button class="btn" type="button" id="iHist">Aprender com todo o histórico</button></div>
  <form id="fRg" class="form"><div class="row"><label>Se a descrição contém<input type="text" id="rgP" placeholder="ex.: cemig" required></label><label>Categoria<input type="text" id="rgC" list="dlCat3" required><datalist id="dlCat3">${[...new Set(ativos().map(l=>l.cat).filter(Boolean))].sort().map(k=>`<option value="${esc(k)}">`).join('')}</datalist></label><label>Tags<input type="text" id="rgT" placeholder="Fixo"></label></div><div><button class="btn primary" type="submit">Criar regra</button></div></form>
  <div class="tbl"><table><thead><tr><th>Contém as palavras</th><th>Descrição padrão</th><th>Categoria</th><th>Tags</th><th class="r">Usos</th><th></th></tr></thead><tbody>
  ${c.regras.map(r=>`<tr><td><b style="font-weight:500">${esc(r.pal.join(' + '))}</b>${r.auto?' <span class="pill p-n">aprendida</span>':''}</td><td>${esc(r.nome)}</td><td class="note">${esc(r.cat)}</td><td>${(r.tags||[]).map(t=>`<span class="tg ${tagCls(t)}">${esc(t)}</span>`).join('')}</td><td class="r num">${r.usos||0}</td><td><button class="btn ghost" type="button" data-rd="${r.id}">Remover</button></td></tr>`).join('')||'<tr><td colspan="6" class="note">Nenhuma regra ainda.</td></tr>'}</tbody></table></div></div>`:''}
 ${st.intel==='log'?`<div class="panel"><h3>Quem fez o quê</h3><div class="tbl"><table><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhe</th></tr></thead><tbody>${c.log.slice(0,200).map(g=>`<tr><td class="num note">${new Date(g.quando).toLocaleString('pt-BR')}</td><td>${esc(g.quem)}</td><td>${esc(g.acao)}</td><td>${esc(g.desc)}</td></tr>`).join('')||'<tr><td colspan="4" class="note">Nenhuma alteração registrada ainda.</td></tr>'}</tbody></table></div></div>`:''}`;
 bindScope();$$('[data-it]').forEach(b=>b.onclick=()=>{st.intel=b.dataset.it;vIntel()});
 if($('#iAg'))$('#iAg').onclick=()=>{const marc=$$('[data-ri]:checked').map(b=>recs[+b.dataset.ri]);if(!marc.length){toast('Marque ao menos uma conta');return}
  marc.forEach(r=>{const d=prox+'-'+pad(Math.min(r.dia,28));C().lanc.push(novoL({tipo:r.tipo,data:d,valor:r.sinal*(r.cv<.02?r.ult:r.med),desc:r.nome,cat:r.cat,conta:r.conta,tags:r.tags,rep:'Fixo',status:'Agendado',obs:r.cv<.02?'':'Valor estimado pela média'}))});log('Fixas agendadas',marc.length+' em '+mNome(prox));save();toast(marc.length+' lançamentos agendados em '+mNome(prox));vIntel()};
 if($('#iHist'))$('#iHist').onclick=()=>{const antes=c.regras.length;ativos().forEach(aprender);c.regras.forEach(r=>r.usos=Math.max(1,r.usos||0));save();toast((c.regras.length-antes)+' regras novas aprendidas');vIntel()};
 if($('#fRg'))$('#fRg').onsubmit=e=>{e.preventDefault();const pal=tokens($('#rgP').value);if(!pal.length){toast('Use palavras com 3 letras ou mais');return}c.regras.unshift({id:nid(),pal,cat:$('#rgC').value.trim(),tags:$('#rgT').value.split(',').map(s=>s.trim()).filter(Boolean),nome:$('#rgP').value.trim(),usos:0,auto:false});log('Regra criada',pal.join(' '));save();vIntel()};
 $$('[data-rd]').forEach(b=>b.onclick=()=>{c.regras=c.regras.filter(r=>r.id!==b.dataset.rd);save();vIntel()});
}

/* ===================== RECEBÍVEIS STONE ===================== */
const CONTRATO={'Débito':1.12,'Crédito à vista':3.19,'Crédito parcelado':4.99};
function parseStone(rows){return rows.map(r=>({venda:toYmd(pick(r,['datadavenda','datavenda','datadatransacao','data'])),prev:toYmd(pick(r,['previsao','datadopagamento','datapagamento','datadorecebimento','vencimento','liquidacao'])),bandeira:String(pick(r,['bandeira'])||''),produto:String(pick(r,['produto','modalidade','tipo'])||''),bruto:parseNum(pick(r,['valorbruto','bruto'])),liquido:parseNum(pick(r,['valorliquido','liquido']))})).filter(x=>!isNaN(x.bruto)||!isNaN(x.liquido)).map(x=>({...x,liquido:isNaN(x.liquido)?x.bruto:x.liquido,bruto:isNaN(x.bruto)?x.liquido:x.bruto}))}
function demoStone(){const v=[];const creds=ativos().filter(l=>l.tipo==='Receita'&&/stone/i.test(l.desc)&&l.data.slice(0,7)>=mAdd(HOJE.slice(0,7),-1));
 creds.forEach((l,j)=>{const p1=r2(l.valor*.58),p2=r2(l.valor-p1);v.push({venda:dAdd(l.data,-1),prev:l.data,bandeira:j%2?'Mastercard':'Visa',produto:'Débito',bruto:r2(p1/.9888),liquido:p1});v.push({venda:dAdd(l.data,-30),prev:l.data,bandeira:j%3?'Elo':'Visa',produto:j%4===0?'Crédito parcelado':'Crédito à vista',bruto:r2(p2/(j%5===0?.955:j%4===0?.9501:.9681)),liquido:p2})});
 v.push({venda:dAdd(HOJE,-6),prev:dAdd(HOJE,-5),bandeira:'Visa',produto:'Débito',bruto:890,liquido:880.03});
 for(let i=1;i<=20;i++)v.push({venda:dAdd(HOJE,-28+i),prev:dAdd(HOJE,i+1),bandeira:['Visa','Mastercard','Elo'][i%3],produto:i%2?'Crédito parcelado':'Crédito à vista',bruto:[1200,860,2300,540,1780,990,1430][i%7],liquido:r2([1200,860,2300,540,1780,990,1430][i%7]*(i%2?.9501:.9681))});
 return v}
function conciliarStone(vendas){const porDia={};vendas.forEach(v=>{if(!v.prev)return;(porDia[v.prev]=porDia[v.prev]||{data:v.prev,itens:[],liq:0}).itens.push(v);porDia[v.prev].liq=r2(porDia[v.prev].liq+v.liquido)});
 const creds=ativos().filter(l=>l.valor>0&&(l.conta==='Stone'||/stone/i.test(l.desc))&&l.tipo==='Receita');const us=new Set();
 const lotes=Object.values(porDia).sort((a,b)=>a.data<b.data?-1:1).map(lt=>{const c=creds.find(c=>!us.has(c.id)&&Math.abs(dDiff(c.data,lt.data))<=1&&Math.abs(c.valor-lt.liq)<=.03);if(c)us.add(c.id);return{...lt,cred:c,status:c?'Recebido':lt.data>=HOJE?'Previsto':'Não recebido'}});
 const taxa=vendas.filter(v=>v.bruto>0).map(v=>({...v,tx:(1-v.liquido/v.bruto)*100}));return{lotes,taxa}}
function vStone(){const k=st.scope;const vend=st.stone[k]||[];const r=vend.length?conciliarStone(vend):null;
 $('#view').innerHTML=topo('Vendas × agenda × lançamentos','Recebíveis Stone','')+`
 <div class="grid2"><label class="drop" id="dSt"><b>Relatório de recebíveis ou vendas da Stone</b><small>.xlsx ou .csv exportado do portal · Data da venda, Previsão de pagamento, Bandeira, Produto, Valor bruto e Valor líquido</small><input type="file" id="dSt-in" accept=".xlsx,.xls,.csv" multiple hidden></label>
 <div class="panel"><h3>Taxas contratadas</h3><div class="kv num">${Object.entries(CONTRATO).map(([p,t])=>`<span>${p}</span><span>${t.toFixed(2).replace('.',',')}%</span>`).join('')}</div><p class="note" style="margin:0">A agenda é comparada com os lançamentos de “Recebimento Stone”. Na versão final, os dados podem vir direto da API de conciliação da Stone.</p></div></div>
 ${r?stoneRes(r):'<div class="panel"><p class="note" style="margin:0">Envie o relatório de recebíveis da Stone.</p></div>'}`;
 bindScope();bindDrop('dSt',async fs=>{let all=[];for(const f of fs){try{all=all.concat(parseStone(await lerPlanilha(f)))}catch(e){toast('Não consegui ler '+f.name)}}if(all.length){st.stone[k]=(st.stone[k]||[]).concat(all);toast(all.length+' vendas importadas')}else toast('Não reconheci as colunas de valor');vStone()});
 if($('#sDemo'))$('#sDemo').onclick=()=>{st.stone[k]=demoStone();vStone()};}
function stoneRes(r){const prev=r.lotes.filter(l=>l.status==='Previsto'),nr=r.lotes.filter(l=>l.status==='Não recebido'),rec=r.lotes.filter(l=>l.status==='Recebido');const acima=r.taxa.filter(v=>CONTRATO[v.produto]&&v.tx>CONTRATO[v.produto]+.05);
 return `<div class="kpis"><div class="kpi"><span class="l">Recebido e conferido</span><span class="v num">${brl(rec.reduce((a,l)=>a+l.liq,0))}</span><span class="s">${rec.length} dias batendo</span></div>
 <div class="kpi"><span class="l">Não recebido</span><span class="v num ${nr.length?'neg':''}">${brl(nr.reduce((a,l)=>a+l.liq,0))}</span><span class="s">${nr.length} dia(s) sem crédito</span></div>
 <div class="kpi"><span class="l">A receber</span><span class="v num">${brl(prev.reduce((a,l)=>a+l.liq,0))}</span><span class="s">próximos ${prev.length} dias</span></div>
 <div class="kpi"><span class="l">Taxa acima do contrato</span><span class="v num ${acima.length?'neg':''}">${acima.length}</span><span class="s num">${brl(acima.reduce((a,v)=>a+v.bruto*(v.tx-CONTRATO[v.produto])/100,0))} a mais</span></div></div>
 <div class="panel"><div class="panel-head"><h3>Projeção de recebimento</h3><span class="note">Líquido por dia</span></div>${chartLotes(r.lotes)}</div>
 <div class="grid2"><div class="panel"><h3>Agenda × lançamentos</h3><div class="tbl"><table><thead><tr><th>Previsto</th><th class="r">Líquido</th><th>Situação</th></tr></thead><tbody>${r.lotes.map(l=>`<tr><td class="num">${fd(l.data)} <span class="note">· ${l.itens.length} vendas</span></td><td class="r num">${brl(l.liq)}</td><td><span class="pill ${l.status==='Recebido'?'p-ok':l.status==='Previsto'?'p-n':'p-bad'}">${l.status}</span></td></tr>`).join('')}</tbody></table></div></div>
 <div class="panel"><h3>Vendas com taxa fora do contrato</h3><div class="tbl"><table><thead><tr><th>Venda</th><th>Produto</th><th class="r">Bruto</th><th class="r">Taxa</th></tr></thead><tbody>${acima.map(v=>`<tr><td class="num">${fd(v.venda)} <span class="note">${esc(v.bandeira)}</span></td><td>${esc(v.produto)}</td><td class="r num">${brl(v.bruto)}</td><td class="r num neg">${v.tx.toFixed(2).replace('.',',')}%</td></tr>`).join('')||'<tr><td colspan="4" class="note">Todas dentro do contrato.</td></tr>'}</tbody></table></div></div></div>`}
function chartLotes(lotes){if(!lotes.length)return'';const W=900,H=230,pl=60,pb=30,pt=12,pr=10;const max=Math.max(...lotes.map(l=>l.liq))*1.1;const step=Math.ceil(max/4/500)*500||500,top=step*4;
 const bw=Math.min(30,(W-pl-pr)/lotes.length*.7),x=i=>pl+(i+.5)*(W-pl-pr)/lotes.length,y=v=>pt+(H-pt-pb)*(1-v/top);const col={Recebido:'var(--ok)','Não recebido':'var(--bad)',Previsto:'var(--gold)'};
 let g='';for(let i=0;i<=4;i++){const v=step*i;g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl-8}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${(v/1000).toLocaleString('pt-BR')} mil</text>`}
 const ev=Math.ceil(lotes.length/12);
 return `<div class="tbl"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:560px;display:block" role="img" aria-label="Projeção de recebimento por dia">${g}${lotes.map((l,i)=>`<rect x="${x(i)-bw/2}" y="${y(l.liq)}" width="${bw}" height="${Math.max(0,y(0)-y(l.liq))}" rx="3" fill="${col[l.status]}"><title>${fd(l.data)} · ${brl(l.liq)} · ${l.status}</title></rect>${i%ev===0?`<text x="${x(i)}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--muted)">${fd(l.data).slice(0,5)}</text>`:''}`).join('')}</svg></div>
 <div class="chips note"><span style="color:var(--ok)">■ Recebido</span><span style="color:var(--bad)">■ Não recebido</span><span style="color:var(--gold-deep)">■ Previsto</span></div>`}

/* ===================== PENDÊNCIAS ===================== */
function pendencias(){const c=C(),it=[];
 ativos().forEach(l=>{if(l.status==='Pendente'&&l.data<HOJE)it.push({tipo:l.valor<0?'Pagamento vencido':'Recebimento em atraso',cls:'p-bad',data:l.data,desc:l.desc,valor:l.valor,acao:'Confirmar ou cobrar',go:'caixa'});if(!l.cat&&l.tipo!=='Transferência'&&l.tipo!=='Pagamento')it.push({tipo:'Sem categoria',cls:'p-warn',data:l.data,desc:l.desc,valor:l.valor,acao:'Classificar',go:'caixa'})});
 Object.entries(c.extratos).forEach(([conta,arr])=>arr.forEach(i=>{if(i.status!=='conciliado')it.push({tipo:'Extrato sem conciliação',cls:'p-warn',data:i.data,desc:conta+' · '+i.desc,valor:i.valor,acao:'Conciliar',go:'conciliacao'})}));
 contasCartao().forEach(k=>{const ym=HOJE.slice(0,7),f=fatura(k,ym);if(f.itens.length&&!f.pagos.length&&dDiff(f.venc,HOJE)<=7)it.push({tipo:'Fatura a fechar',cls:'p-info',data:f.venc,desc:k.nome+' · '+mNome(ym),valor:f.desp,acao:'Fechar fatura',go:'cartoes'})});
 recorrentes().forEach(r=>{if(!r.temProx)it.push({tipo:'Fixa do próximo mês',cls:'p-n',data:mAdd(HOJE.slice(0,7),1)+'-'+pad(Math.min(r.dia,28)),desc:r.nome,valor:r.sinal*r.med,acao:'Agendar',go:'intel'})});
 return it.sort((a,b)=>a.data<b.data?-1:1)}
function pendCount(){try{return pendencias().filter(i=>i.cls!=='p-n').length}catch(e){return 0}}
function vPend(){const it=pendencias();const grupos={};it.forEach(i=>grupos[i.tipo]=(grupos[i.tipo]||0)+1);
 $('#view').innerHTML=topo(esc(nomeEsc(st.scope)),'Pendências')+`<div class="chips">${Object.entries(grupos).map(([k,v])=>`<span class="pill p-n">${k} · ${v}</span>`).join('')}</div>
 <div class="panel"><div class="tbl"><table><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th class="r">Valor</th><th></th></tr></thead><tbody>
 ${it.map(i=>`<tr><td class="num">${fd(i.data)}</td><td><span class="pill ${i.cls}">${i.tipo}</span></td><td>${esc(i.desc)}</td><td class="r num ${i.valor<0?'neg':''}">${val(i.valor)}</td><td><button class="btn ghost" type="button" data-go="${i.go}">${i.acao}</button></td></tr>`).join('')||'<tr><td colspan="5" class="note">Nenhuma pendência para esta unidade.</td></tr>'}
 </tbody></table></div></div>`;bindScope()}

/* ===================== RELATÓRIOS (padrão Meu Dinheiro) ===================== */
const PAL=['#1FB58F','#3B82F6','#E3C13B','#C04BD6','#F08A3C','#8A8F98','#53D3C2','#6C9BE0','#D9D24E','#E079D6','#E39A55','#9AA3AE'];
function mesEf(l){return dataEf(l).slice(0,7)}
function arvore(ls,meses){const t={Receita:{},Despesa:{}};ls.forEach(l=>{if(l.tipo!=='Receita'&&l.tipo!=='Despesa')return;const m=meses.indexOf(mesEf(l));if(m<0)return;const cat=l.cat||'Sem categoria';const [p,...r]=cat.split('/');const pai=p.trim(),filho=(r.join('/').trim()||pai);
 const g=t[l.tipo];g[pai]=g[pai]||{tot:Array(meses.length).fill(0),f:{}};g[pai].tot[m]+=l.valor;g[pai].f[filho]=g[pai].f[filho]||Array(meses.length).fill(0);g[pai].f[filho][m]+=l.valor});return t}
function relHead(titulo,sub){const cl=nomeEsc(st.scope);return `<div class="rep-head"><img src="/marca.png" alt=""><div><b>${esc(cl)}</b><small>${titulo} · ${sub}</small></div></div>`}
function vEvo(){const n=st.rel.n,meses=Array.from({length:n},(_,i)=>mAdd(st.rel.ini,i));const t=arvore(ativos(),meses);
 const soma=a=>a.reduce((x,y)=>x+y,0),tot=g=>meses.map((_,i)=>Object.values(g).reduce((a,p)=>a+p.tot[i],0));
 const tr=tot(t.Receita),td=tot(t.Despesa);const pct=(v,i)=>tr[i]?`<span class="pc">${(Math.abs(v)/tr[i]*100).toFixed(2).replace('.',',')}%</span>`:'<span class="pc">-</span>';
 const pctT=v=>soma(tr)?`<span class="pc">${(Math.abs(v)/soma(tr)*100).toFixed(2).replace('.',',')}%</span>`:'';
 const cell=(v,cls,i)=>`<td class="r num ${v<0?'neg':v>0?'pos':''}">${val(v)}${cls==='d'&&i!=null?pct(v,i):''}</td>`;
 const linhas=(g,cls)=>Object.entries(g).sort((a,b)=>a[0].localeCompare(b[0],'pt',{numeric:true})).map(([p,o])=>`<tr class="par"><td>${esc(p)}</td>${o.tot.map((v,i)=>cell(v,cls,i)).join('')}${cell(soma(o.tot)/n,cls)}<td class="r num ${soma(o.tot)<0?'neg':'pos'}">${val(soma(o.tot))}${cls==='d'?pctT(soma(o.tot)):''}</td></tr>`+Object.entries(o.f).filter(([f])=>f!==p||Object.keys(o.f).length>1).map(([f,a])=>`<tr class="ch"><td>• ${esc(f)}</td>${a.map((v,i)=>cell(v,cls,i)).join('')}${cell(soma(a)/n,cls)}<td class="r num ${soma(a)<0?'neg':'pos'}">${val(soma(a))}</td></tr>`).join('')).join('');
 const res=meses.map((_,i)=>tr[i]+td[i]);
 return `<div class="rep">${relHead('Relatório de evolução por categoria',mCurto(meses[0])+' até '+mCurto(meses[n-1])+' · Regime: caixa')}<div class="tbl"><table class="evo"><thead><tr><th></th>${meses.map(m=>`<th class="r">${mCurto(m)}</th>`).join('')}<th class="r">Média</th><th class="r">Total</th></tr></thead><tbody>
 <tr class="grp rec"><td>Receitas</td>${tr.map(v=>`<td class="r num pos">${val(v)}</td>`).join('')}<td class="r num pos">${val(soma(tr)/n)}</td><td class="r num pos">${val(soma(tr))}</td></tr>${linhas(t.Receita,'r')}
 <tr class="grp des"><td>Despesas</td>${td.map((v,i)=>`<td class="r num neg">${val(v)}${pct(v,i)}</td>`).join('')}<td class="r num neg">${val(soma(td)/n)}</td><td class="r num neg">${val(soma(td))}${pctT(soma(td))}</td></tr>${linhas(t.Despesa,'d')}
 <tr class="res"><td>Resultado</td>${res.map(v=>`<td class="r num ${v<0?'neg':'pos'}">${val(v)}</td>`).join('')}<td class="r num">${val(soma(res)/n)}</td><td class="r num ${soma(res)<0?'neg':'pos'}">${val(soma(res))}</td></tr></tbody></table></div></div>`}
function vTotais(){const m=st.rel.mes;const t=arvore(ativos(),[m]);const lista=g=>Object.entries(g).map(([p,o])=>({p,v:o.tot[0]})).filter(x=>Math.abs(x.v)>.004).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));
 const D_=lista(t.Despesa),R_=lista(t.Receita),sD=D_.reduce((a,x)=>a+x.v,0),sR=R_.reduce((a,x)=>a+x.v,0);
 const barras=(arr)=>{if(!arr.length)return'<p class="note">Sem lançamentos.</p>';const W=360,H=150,mx=Math.max(...arr.map(x=>Math.abs(x.v))),bw=Math.min(30,(W-10)/arr.length*.7);return `<svg viewBox="0 0 ${W} ${H+4}" style="width:100%;max-width:420px;display:block" role="img" aria-label="Totais por categoria">${arr.map((x,i)=>{const h=Math.abs(x.v)/mx*(H-6);const cx=5+(i+.5)*(W-10)/arr.length;return `<rect x="${cx-bw/2}" y="${H-h}" width="${bw}" height="${h}" fill="${PAL[i%PAL.length]}"><title>${esc(x.p)} · ${brl(x.v)}</title></rect>`}).join('')}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--muted)"/></svg>`};
 const leg=(arr,s)=>`<div class="legend num">${arr.map((x,i)=>`<div><i style="background:${PAL[i%PAL.length]}"></i><span>${esc(x.p)}<em>${(x.v/s*100).toFixed(2).replace('.',',')}%</em></span><span class="${x.v<0?'neg':'pos'}">${brl(x.v)}</span></div>`).join('')}<div><i></i><b style="font-weight:600">Total</b><b class="${s<0?'neg':'pos'}">${brl(s)}</b></div></div>`;
 return `<div class="rep">${relHead('Totais por categoria',mNome(m))}<div style="padding:16px;display:grid;gap:16px"><div class="kv num" style="max-width:320px"><span>Receitas</span><span class="pos">${brl(sR)}</span><span>Despesas</span><span class="neg">${brl(sD)}</span><span class="big">Total</span><span class="big ${sR+sD<0?'neg':'pos'}">${brl(sR+sD)}</span></div>
 <div class="grid2"><div style="display:grid;gap:10px"><b style="font-weight:500">Despesas</b>${barras(D_)}${leg(D_,sD)}</div><div style="display:grid;gap:10px"><b style="font-weight:500">Receitas</b>${barras(R_)}${leg(R_,sR)}</div></div></div></div>`}
function vRelCaixa(){const ini=st.rel.cIni,fim=st.rel.cFim,bancos=contasBanco(),sel=new Set(bancos.map(b=>b.nome));
 const ls=ativos().filter(l=>l.data>=ini&&l.data<=fim&&(sel.has(l.conta)||sel.has(l.ctr))).sort((a,b)=>a.data<b.data?-1:1);
 const sAnt=bancos.reduce((a,b)=>a+saldo(b.nome,dAdd(ini,-1)),0);let run=sAnt,html='';const dias=[...new Set(ls.map(l=>l.data))];
 let rec=0,des=0,tri=0,tro=0;ls.forEach(l=>{if(l.tipo==='Receita')rec+=l.valor;else if(l.tipo==='Despesa')des+=l.valor});
 dias.forEach(d=>{const v=ls.filter(l=>l.data===d);v.forEach(l=>bancos.forEach(b=>run+=efeito(l,b.nome)));html+=v.filter(l=>!(l.tipo==='Transferência'&&sel.has(l.conta)&&sel.has(l.ctr))).map(l=>linhaL(l,sel)).join('')+`<div class="dayfoot"><span>${SEM[D(d).getDay()]}, ${fdl(d)}</span><b class="num">${val(run)}</b></div>`});
 return `<div class="rep">${relHead('Lançamentos de caixa',fdl(ini)+' até '+fdl(fim))}<div class="saldoant"><span class="note">${fd(dAdd(ini,-1)).slice(0,5)}</span><span style="flex:1;padding-left:16px">Saldo anterior</span><b class="num">${val(sAnt)}</b></div><div class="list rel-list">${html||'<p class="note" style="padding:14px">Sem lançamentos no período.</p>'}</div>
 <div style="padding:14px 16px;display:grid;gap:14px"><table class="sumtbl num"><thead><tr><th></th><th class="r">Confirmado</th><th class="r">Projetado</th></tr></thead><tbody>${bancos.map(b=>`<tr><td>${esc(b.nome)}</td><td class="r">${val(saldo(b.nome,fim,true))}</td><td class="r">${val(saldo(b.nome,fim))}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td class="r">${val(bancos.reduce((a,b)=>a+saldo(b.nome,fim,true),0))}</td><td class="r">${val(bancos.reduce((a,b)=>a+saldo(b.nome,fim),0))}</td></tr></tbody></table>
 <table class="sumtbl num"><tbody><tr><td>Entradas</td><td class="r pos">${val(rec)}</td></tr><tr class="sub"><td>Receitas</td><td class="r">${val(rec)}</td></tr><tr><td>Saídas</td><td class="r neg">${val(des)}</td></tr><tr class="sub"><td>Despesas</td><td class="r">${val(des)}</td></tr><tr class="tot"><td>Resultado</td><td class="r ${rec+des<0?'neg':'pos'}">${val(rec+des)}</td></tr></tbody></table></div></div>`}
function vRel(){const isCli=st.user.perfil==='cliente',c=C(),tab=st.rel.tab;const mesRef=tab==='evo'?mAdd(st.rel.ini,st.rel.n-1):tab==='totais'?st.rel.mes:st.rel.cFim.slice(0,7);
 const aprov=!!c.aprov[mesRef];const pode_ver=!isCli||aprov;
 const ctrl=tab==='evo'?`<label class="note">Início <input type="month" id="rIni" value="${st.rel.ini}"></label><label class="note">Período <select id="rN">${[3,4,6,12].map(n=>`<option value="${n}" ${n===st.rel.n?'selected':''}>${n} meses</option>`).join('')}</select></label>`
  :tab==='totais'?`<div class="monthnav" style="gap:4px"><button class="icobtn" type="button" id="rPrev" aria-label="Mês anterior">‹</button><b>${mNome(st.rel.mes)}</b><button class="icobtn" type="button" id="rNext" aria-label="Próximo mês">›</button></div>`
  :`<label class="note">Início <input type="date" id="rCi" value="${st.rel.cIni}"></label><label class="note">Fim <input type="date" id="rCf" value="${st.rel.cFim}"></label>`;
 $('#view').innerHTML=topo(isCli?'Relatórios liberados pela Lume':'Fechamento e envio ao cliente','Relatórios')+`
 <div class="tabs"><button type="button" data-rt="evo" class="${tab==='evo'?'on':''}">Fluxo de caixa · evolução por categoria</button><button type="button" data-rt="totais" class="${tab==='totais'?'on':''}">Totais por categoria</button><button type="button" data-rt="caixa" class="${tab==='caixa'?'on':''}">Lançamentos de caixa</button></div>
 <div class="panel-head"><div class="scope">${ctrl}</div><div class="scope">${!isCli?`<span class="pill ${aprov?'p-ok':'p-warn'}">${mNome(mesRef)} · ${aprov?'liberado ao cliente':'em conferência'}</span>`:''}${!isCli&&pode.aprovar()?(aprov?`<button class="btn" type="button" id="rRev">Recolher do cliente</button>`:`<button class="btn primary" type="button" id="rApr">Aprovar e liberar ${mNome(mesRef)}</button>`):''}${pode_ver?'<button class="btn" type="button" id="rExp">Exportar .xlsx</button>':''}</div></div>
 ${!isCli&&!pode.aprovar()&&!aprov?'<p class="note" style="margin:0">Somente a Master aprova e libera relatórios ao cliente.</p>':''}
 ${pode_ver?(tab==='evo'?vEvo():tab==='totais'?vTotais():vRelCaixa()):`<div class="banner">O relatório de ${mNome(mesRef)} ainda está em conferência pela Lume. Ele aparece aqui assim que for liberado.</div>`}`;
 bindScope();if(st.user.perfil!=='cliente')bindLinhas(vRel);$$('[data-rt]').forEach(b=>b.onclick=()=>{st.rel.tab=b.dataset.rt;vRel()});
 if($('#rIni'))$('#rIni').onchange=e=>{if(e.target.value){st.rel.ini=e.target.value;vRel()}};if($('#rN'))$('#rN').onchange=e=>{st.rel.n=+e.target.value;vRel()};
 if($('#rPrev'))$('#rPrev').onclick=()=>{st.rel.mes=mAdd(st.rel.mes,-1);vRel()};if($('#rNext'))$('#rNext').onclick=()=>{st.rel.mes=mAdd(st.rel.mes,1);vRel()};
 if($('#rCi'))$('#rCi').onchange=e=>{st.rel.cIni=e.target.value;vRel()};if($('#rCf'))$('#rCf').onchange=e=>{st.rel.cFim=e.target.value;vRel()};
 if($('#rApr'))$('#rApr').onclick=()=>{c.aprov[mesRef]=true;log('Relatório liberado',mNome(mesRef));save();toast('Relatórios de '+mNome(mesRef)+' liberados. O cliente já vê no portal.');vRel()};
 if($('#rRev'))$('#rRev').onclick=()=>{delete c.aprov[mesRef];log('Relatório recolhido',mNome(mesRef));save();vRel()};
 if($('#rExp'))$('#rExp').onclick=()=>exportarRel(tab);}
async function baixar(nome,wb){try{const dl=null;if(!dl){XLSX.writeFile(wb,nome);toast('Arquivo baixado: '+nome);return}const data=XLSX.write(wb,{type:'array',bookType:'xlsx'});await dl.save({filename:nome,data:new Uint8Array(data)});toast('Arquivo salvo')}catch(e){if(e&&e.code==='declined')toast('Download cancelado');else toast('Não foi possível salvar o arquivo agora')}}
function exportarRel(tab){const wb=XLSX.utils.book_new();
 if(tab==='evo'){const n=st.rel.n,meses=Array.from({length:n},(_,i)=>mAdd(st.rel.ini,i));const t=arvore(ativos(),meses);const rows=[['',...meses.map(mCurto),'Média','Total']];
  ['Receita','Despesa'].forEach(tp=>{const g=t[tp];const tot=meses.map((_,i)=>Object.values(g).reduce((a,p)=>a+p.tot[i],0));rows.push([tp+'s',...tot.map(r2),r2(tot.reduce((a,b)=>a+b,0)/n),r2(tot.reduce((a,b)=>a+b,0))]);
   Object.entries(g).sort((a,b)=>a[0].localeCompare(b[0],'pt',{numeric:true})).forEach(([p,o])=>{rows.push([p,...o.tot.map(r2),r2(o.tot.reduce((a,b)=>a+b,0)/n),r2(o.tot.reduce((a,b)=>a+b,0))]);Object.entries(o.f).forEach(([f,a])=>{if(f!==p)rows.push(['   • '+f,...a.map(r2),r2(a.reduce((x,y)=>x+y,0)/n),r2(a.reduce((x,y)=>x+y,0))])})})});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'Evolução por categoria');baixar('Evolucao_por_categoria_'+nomeEsc(st.scope).replace(/\W+/g,'_')+'.xlsx',wb);return}
 if(tab==='totais'){const t=arvore(ativos(),[st.rel.mes]);const rows=[['Tipo','Categoria','Valor']];['Despesa','Receita'].forEach(tp=>Object.entries(t[tp]).forEach(([p,o])=>rows.push([tp,p,r2(o.tot[0])])));XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'Totais por categoria');baixar('Totais_por_categoria_'+st.rel.mes+'.xlsx',wb);return}
 exportarMD(ativos().filter(l=>l.data>=st.rel.cIni&&l.data<=st.rel.cFim),'Lancamentos_de_caixa_'+st.rel.cIni+'_a_'+st.rel.cFim)}

/* ===================== MEU DINHEIRO: IMPORTAR / EXPORTAR ===================== */
const MD_COLS=['Tipo','Status','Data','Venc. Fatura','Valor','Descrição','Categoria','Conta','Conta transferência','Centro','Contato','Forma','Projeto','N. Documento','Observações','Data competência','ID Único','Tags','Cartão','Repetição','Meta de Economia','Data de criação'];
function lancParaMD(l){const dt=s=>s?D(s):null;return[l.tipo,l.status,dt(l.data),dt(l.venc),r2(l.valor),l.desc,l.cat,l.conta,l.ctr||null,l.centro||null,l.contato||'Sem contato',l.forma||'Sem forma pagto.',l.projeto||'Sem projeto',l.ndoc||null,l.obs||null,dt(l.comp),l.uid,(l.tags||[]).join(',')||null,l.cartao||null,l.rep||'Único',l.meta||null,l.criado?D(l.criado):null]}
function exportarMD(ls,nome){const rows=[MD_COLS,...ls.filter(l=>!l.excluido).sort((a,b)=>a.data<b.data?-1:1).map(lancParaMD)];const ws=XLSX.utils.aoa_to_sheet(rows,{dateNF:'dd/mm/yyyy'});
 Object.keys(ws).forEach(k=>{if(k[0]==='!')return;const c=ws[k];if(c.t==='d')c.z='dd/mm/yyyy';if(c.t==='n'&&/^E\d/.test(k))c.z='0.00'});ws['!cols']=MD_COLS.map(()=>({wch:13}));
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Lançamentos');baixar(nome+'.xlsx',wb)}
function mdParaLanc(r){const g=k=>r[k];const tipo=String(g('Tipo')||'').trim();if(!['Despesa','Receita','Transferência','Pagamento'].includes(tipo))return null;
 const d=toYmd(g('Data'));if(!d)return null;
 return novoL({tipo,status:['Pendente','Agendado','Confirmado','Conciliado'].includes(String(g('Status')).trim())?String(g('Status')).trim():'Confirmado',data:d,venc:toYmd(g('Venc. Fatura')),valor:r2(parseNum(g('Valor'))),desc:String(g('Descrição')||'').trim(),cat:String(g('Categoria')||'').trim(),conta:String(g('Conta')||'').trim(),ctr:String(g('Conta transferência')||'').trim(),centro:String(g('Centro')||''),contato:String(g('Contato')||'Sem contato'),forma:String(g('Forma')||'Sem forma pagto.'),projeto:String(g('Projeto')||'Sem projeto'),ndoc:String(g('N. Documento')||''),obs:String(g('Observações')||''),comp:toYmd(g('Data competência')),uid:g('ID Único')||undefined,tags:String(g('Tags')||'').split(',').map(s=>s.trim()).filter(Boolean),cartao:String(g('Cartão')||''),rep:String(g('Repetição')||'Único'),meta:String(g('Meta de Economia')||''),criado:toYmd(g('Data de criação'))||ymd(new Date())})}
function mdAjuste(l){if(l.tipo==='Pagamento'&&!l.venc)l.venc=l.data;return l}
function vMD(){const c=C();
 $('#view').innerHTML=topo('Compatibilidade total','Meu Dinheiro')+`
 <div class="grid2"><div class="panel"><h3>Importar histórico do Meu Dinheiro</h3><label class="drop" id="dMD"><b>Arraste o export de lançamentos (.xlsx)</b><small>Relatórios › Lançamentos › exportar. Contas, categorias, tags, repetições e status entram como estão.</small><input type="file" id="dMD-in" accept=".xlsx,.xls,.csv" multiple hidden></label>
  <label class="switch"><input type="checkbox" id="mdSub" ${c.exemplo?'checked':''}> Apagar os dados de exemplo antes de importar</label>
  <p class="note" style="margin:0">Lançamentos com o mesmo <b>ID Único</b> não entram duas vezes. Depois de importar, o sistema aprende as regras de categoria com o histórico.</p></div>
 <div class="panel"><h3>Exportar no formato do Meu Dinheiro</h3><div class="form"><div class="row"><label>De<input type="date" id="mdI" value="${mAdd(HOJE.slice(0,7),-3)}-01"></label><label>Até<input type="date" id="mdF" value="${HOJE}"></label></div></div>
  <div><button class="btn primary" type="button" id="mdExp">Exportar .xlsx</button></div>
  <p class="note" style="margin:0">Mesmas 22 colunas e mesma ordem do export do Meu Dinheiro, para guardar backup ou voltar para lá se precisar.</p></div></div>
 <div class="panel"><h3>Colunas compatíveis</h3><div class="chips">${MD_COLS.map(k=>`<span class="tg">${k}</span>`).join('')}</div></div>`;
 bindScope();
 bindDrop('dMD',async fs=>{let novos=0,dup=0,contasN=new Set();if($('#mdSub').checked&&c.exemplo){c.lanc=[];c.extratos={};c.regras=[];c.contas=[];c.exemplo=false;c.aprov={}}
  for(const f of fs){try{const rows=await lerPlanilha(f);if(!rows.length||!('Tipo' in rows[0])){toast(f.name+': não parece um export do Meu Dinheiro');continue}const ids=new Set(c.lanc.map(l=>String(l.uid)));
   rows.forEach(r=>{const l=mdParaLanc(r);if(!l)return;mdAjuste(l);if(ids.has(String(l.uid))){dup++;return}ids.add(String(l.uid));c.lanc.push(l);novos++;[l.conta,l.ctr].forEach(n=>{if(n&&!c.contas.some(k=>k.nome===n)){const cart=/cart[aã]o/i.test(n)||!!l.venc;c.contas.push(cart?{nome:n,tipo:'cartao',saldoIni:0,fecha:9,vence:10,debito:c.contas.find(k=>k.tipo==='banco')?.nome||''}:{nome:n,tipo:'banco',saldoIni:0});contasN.add(n)}})})}catch(e){toast('Não consegui ler '+f.name)}}
  c.exemplo=false;ativos().forEach(aprender);log('Importação Meu Dinheiro',novos+' lançamentos');save();
  toast(novos+' lançamentos importados'+(dup?' · '+dup+' já existiam':'')+(contasN.size?' · contas criadas: '+[...contasN].join(', ')+' (ajuste os saldos iniciais em Contas e categorias)':''));st.cx.contas=null;vMD()});
 $('#mdExp').onclick=()=>exportarMD(ativos().filter(l=>l.data>=$('#mdI').value&&l.data<=$('#mdF').value),'Meu_Dinheiro_'+nomeEsc(st.scope).replace(/\W+/g,'_'))}

/* ===================== CONTAS E CATEGORIAS ===================== */
function vCad(){const c=C();const cats=[...new Set([...c.cats,...ativos().map(l=>l.cat)].filter(x=>x&&x!=='Transferência'&&x!=='Pagamento de cartão'))].sort((a,b)=>a.localeCompare(b,'pt',{numeric:true}));
 $('#view').innerHTML=topo('Cadastro do cliente','Contas e categorias')+`
 <div class="panel"><div class="panel-head"><h3>Contas bancárias, aplicações e cartões</h3><span class="note">${c.contas.length} contas</span></div>
 <div class="tbl"><table><thead><tr><th>Conta</th><th>Tipo</th><th class="r">Saldo inicial</th><th>Cartão: fecha · vence · débito</th><th class="r">Saldo hoje</th></tr></thead><tbody>
 ${c.contas.map((k,i)=>`<tr><td><b style="font-weight:500">${esc(k.nome)}</b></td><td><span class="pill ${k.tipo==='cartao'?'p-info':'p-n'}">${k.tipo==='cartao'?'Cartão de crédito':'Conta'}</span></td><td class="r"><input type="text" data-si="${i}" value="${nf(k.saldoIni||0)}" style="width:110px;text-align:right" ${pode.cadastro()?'':'disabled'} aria-label="Saldo inicial ${esc(k.nome)}"></td><td class="note">${k.tipo==='cartao'?`dia ${k.fecha} · dia ${k.vence} · ${esc(k.debito||'—')}`:'—'}</td><td class="r num ${saldo(k.nome,HOJE)<0?'neg':''}">${val(saldo(k.nome,HOJE))}</td></tr>`).join('')}</tbody></table></div>
 ${pode.cadastro()?`<form id="fCta" class="form"><div class="row"><label>Nome da conta<input type="text" id="ctN" required placeholder="ex.: Sicoob, Asaas, Nubank Cartão"></label><label>Tipo<select id="ctT"><option value="banco">Conta bancária / aplicação</option><option value="cartao">Cartão de crédito</option></select></label><label>Saldo inicial<input type="text" id="ctS" value="0,00"></label></div>
 <div class="row" id="ctCart" hidden><label>Dia do fechamento<input type="number" id="ctF" min="1" max="28" value="9"></label><label>Dia do vencimento<input type="number" id="ctV" min="1" max="28" value="10"></label><label>Conta de débito<select id="ctD">${contasBanco().map(k=>`<option>${esc(k.nome)}</option>`).join('')}</select></label></div><div><button class="btn primary" type="submit">Adicionar conta</button></div></form>`:''}</div>
 <div class="panel"><div class="panel-head"><h3>Plano de contas (categorias)</h3><span class="note">Formato do Meu Dinheiro: Categoria/Subcategoria</span></div>
 ${pode.cadastro()?`<form id="fCat" class="scope"><input type="text" id="caN" placeholder="ex.: 1 - Despesas Fixas/Seguro" style="flex:1 1 260px" required><button class="btn" type="submit">Adicionar categoria</button></form>`:''}
 <div class="chips">${cats.map(k=>`<span class="tg">${esc(k)}</span>`).join('')}</div></div>
 `;
 bindScope();
 $$('[data-si]').forEach(i=>i.onchange=()=>{const k=c.contas[+i.dataset.si];k.saldoIni=r2(parseNum(i.value)||0);log('Saldo inicial',k.nome+' '+brl(k.saldoIni));save();vCad()});
 if($('#ctT'))$('#ctT').onchange=e=>{$('#ctCart').hidden=e.target.value!=='cartao'};
 if($('#fCta'))$('#fCta').onsubmit=e=>{e.preventDefault();const n=$('#ctN').value.trim();if(c.contas.some(k=>k.nome.toLowerCase()===n.toLowerCase())){toast('Já existe uma conta com esse nome');return}const t=$('#ctT').value;c.contas.push(t==='cartao'?{nome:n,tipo:'cartao',saldoIni:0,fecha:+$('#ctF').value||9,vence:+$('#ctV').value||10,debito:$('#ctD').value}:{nome:n,tipo:'banco',saldoIni:r2(parseNum($('#ctS').value)||0)});log('Conta criada',n);save();st.cx.contas=null;toast('Conta '+n+' criada');vCad()};
 if($('#fCat'))$('#fCat').onsubmit=e=>{e.preventDefault();const n=$('#caN').value.trim();if(n&&!c.cats.includes(n))c.cats.push(n);save();vCad()};
 if($('#rst'))$('#rst').onclick=()=>{$('#rstBox').innerHTML=`<div class="banner"><span>Apagar os dados deste cliente e recriar o exemplo?</span><span class="scope"><button class="btn" type="button" id="rstN">Cancelar</button><button class="btn primary" type="button" id="rstS">Restaurar</button></span></div>`;$('#rstN').onclick=vCad;$('#rstS').onclick=()=>{DB[st.scope]=seed(st.scope);save();st.cx.contas=null;toast('Exemplo restaurado');vCad()}};}

/* ===================== PORTAL DO CLIENTE ===================== */
function vPortal(){const c=C(),m=HOJE.slice(0,7),bancos=contasBanco();const doMes=ativos().filter(l=>l.data.slice(0,7)===m);
 const rec=doMes.filter(l=>l.tipo==='Receita').reduce((a,l)=>a+l.valor,0),des=doMes.filter(l=>l.tipo==='Despesa').reduce((a,l)=>a+l.valor,0);
 const aPagar=ativos().filter(l=>l.valor<0&&(l.status==='Pendente'||l.status==='Agendado')&&l.data>=HOJE&&dDiff(l.data,HOJE)<=15).sort((a,b)=>a.data<b.data?-1:1);
 const ultAprov=Object.keys(c.aprov).sort().pop();
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Portal do cliente</div><h2>${esc(nomeEsc(st.scope))}</h2></div><div class="scope">${escopos().length>1?scopeSelect():'<span class="note">Você vê somente os dados da sua empresa</span>'}</div></div>
 <div class="kpis"><div class="kpi"><span class="l">Saldo em contas hoje</span><span class="v num">${brl(bancos.reduce((a,b)=>a+saldo(b.nome,HOJE,true),0))}</span><span class="s">${bancos.length} contas</span></div>
 <div class="kpi"><span class="l">Receitas de ${MES[+m.slice(5)-1]}</span><span class="v num pos">${brl(rec)}</span><span class="s">até hoje</span></div>
 <div class="kpi"><span class="l">Despesas de ${MES[+m.slice(5)-1]}</span><span class="v num neg">${brl(des)}</span><span class="s">até hoje</span></div>
 <div class="kpi"><span class="l">Último relatório liberado</span><span class="v" style="font-size:18px">${ultAprov?mNome(ultAprov):'—'}</span><span class="s"><button class="btn ghost" type="button" data-go="relatorios" style="padding:0">Ver relatórios</button></span></div></div>
 <div class="grid2"><div class="panel"><h3>Contas</h3><table class="sumtbl num"><tbody>${bancos.map(b=>`<tr><td>${esc(b.nome)}</td><td class="r">${brl(saldo(b.nome,HOJE,true))}</td></tr>`).join('')}</tbody></table></div>
 <div class="panel"><h3>A pagar nos próximos 15 dias</h3><div class="tbl"><table><tbody>${aPagar.map(l=>`<tr><td class="num note">${fd(l.data)}</td><td>${esc(l.desc)}</td><td class="r num neg">${val(l.valor)}</td></tr>`).join('')||'<tr><td class="note">Nada previsto.</td></tr>'}</tbody></table></div></div></div>`;
 bindScope()}

/* ===================== USUÁRIOS ===================== */
function vUsers(){const todos=CLIENTES.flatMap(c=>c.unidades.map(u=>c.id+'|'+u));
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Somente Master</div><h2>Usuários e acessos</h2></div></div>
 <div class="panel"><div class="tbl"><table><thead><tr><th>Usuário</th><th>Perfil</th><th>Acesso</th></tr></thead><tbody>
 ${USUARIOS.map(u=>`<tr><td><b style="font-weight:500">${esc(u.nome)}</b><br><span class="note">${esc(u.email)}</span></td><td><span class="pill ${u.perfil==='master'?'p-ok':u.perfil==='cliente'?'p-warn':'p-n'}">${PERFIL_TXT[u.perfil].split(' · ')[0]}</span></td><td class="note">${u.escopo==='*'?'Todos os clientes e unidades':u.escopo.map(nomeEsc).join(' · ')}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="panel"><h3>Novo usuário</h3><form id="fUser" class="form"><div class="row"><label>Nome<input type="text" id="nNome" required></label><label>E-mail de acesso<input type="email" id="nEmail" required></label><label>Perfil<select id="nPerfil"><option value="operador">Operadora</option><option value="estagiario">Estagiário</option><option value="cliente">Cliente</option></select></label></div>
 <label style="display:grid;gap:3px;font-size:12.5px;color:var(--muted)">Unidades liberadas (Ctrl ou Cmd para marcar várias)<select id="nEsc" multiple size="6">${todos.map(k=>`<option value="${k}">${esc(nomeEsc(k))}</option>`).join('')}</select></label>
 <div><button class="btn primary" type="submit">Criar acesso</button></div></form></div>`;
 $('#fUser').onsubmit=e=>{e.preventDefault();const es=[...$('#nEsc').selectedOptions].map(o=>o.value);if(!es.length){toast('Marque ao menos uma unidade');return}
  if($('#nPerfil').value==='cliente'&&new Set(es.map(x=>x.split('|')[0])).size>1){toast('Um usuário cliente só pode ver unidades da própria empresa');return}
  if(USUARIOS.some(u=>u.email.toLowerCase()===$('#nEmail').value.trim().toLowerCase())){toast('Esse e-mail já tem acesso');return}
  USUARIOS.push({id:'u'+Date.now(),nome:$('#nNome').value.trim(),email:$('#nEmail').value.trim(),perfil:$('#nPerfil').value,escopo:es});renderUserList();toast('Acesso criado. Na versão final, a pessoa recebe um convite por e-mail para criar a senha.');vUsers()}}

/* =====================================================================
   MÓDULO 2 · Conferência de vendas, contas a receber/pagar, processo do cliente
   (carregado depois do núcleo; redefine algumas funções do núcleo)
   ===================================================================== */

const DEF_L={tipo:'Despesa',status:'Pendente',venc:'',desc:'',cat:'',conta:'',ctr:'',centro:'',contato:'Sem contato',forma:'Sem forma pagto.',projeto:'Sem projeto',ndoc:'',obs:'',comp:'',cartao:'',rep:'Único',meta:'',extId:null,excluido:false};
function compacta(l){const o={};for(const k in l){const v=l[k];if(k in DEF_L&&v===DEF_L[k])continue;if(k==='tags'&&(!v||!v.length))continue;o[k]=v}return o}
function expande(o){const l=Object.assign({},DEF_L,{tags:[]},o);return l}

let _avisoCheio=false;

const BEAUTY='beauty|Única';
const CATS_BEAUTY=[{"c": "01 - Despesas Fixas", "t": "D"}, {"c": "01 - Despesas Fixas/Água Mineral", "t": "D"}, {"c": "01 - Despesas Fixas/Alimentação/Copa", "t": "D"}, {"c": "01 - Despesas Fixas/Aluguel", "t": "D"}, {"c": "01 - Despesas Fixas/Condominio ", "t": "D"}, {"c": "01 - Despesas Fixas/Contabilidade", "t": "D"}, {"c": "01 - Despesas Fixas/Copasa", "t": "D"}, {"c": "01 - Despesas Fixas/Empréstimo", "t": "D"}, {"c": "01 - Despesas Fixas/Energia", "t": "D"}, {"c": "01 - Despesas Fixas/Faxina", "t": "D"}, {"c": "01 - Despesas Fixas/IPTU", "t": "D"}, {"c": "01 - Despesas Fixas/MEI - Cabeleleiras ", "t": "D"}, {"c": "01 - Despesas Fixas/Plano de Saúde", "t": "D"}, {"c": "01 - Despesas Fixas/Registro de Marca", "t": "D"}, {"c": "01 - Despesas Fixas/SESC", "t": "D"}, {"c": "01 - Despesas Fixas/Sistema Avec", "t": "D"}, {"c": "01 - Despesas Fixas/Telefonia", "t": "D"}, {"c": "02 - Despesas com Pessoal", "t": "D"}, {"c": "02 - Despesas com Pessoal/Aniversário mês", "t": "D"}, {"c": "02 - Despesas com Pessoal/Auxilio Saude (Federação)", "t": "D"}, {"c": "02 - Despesas com Pessoal/Cabeleleira", "t": "D"}, {"c": "02 - Despesas com Pessoal/Comissão Carolina", "t": "D"}, {"c": "02 - Despesas com Pessoal/Comissão Livia ", "t": "D"}, {"c": "02 - Despesas com Pessoal/Comissão Marina", "t": "D"}, {"c": "02 - Despesas com Pessoal/Comissão Paloma", "t": "D"}, {"c": "02 - Despesas com Pessoal/Comissão Renata", "t": "D"}, {"c": "02 - Despesas com Pessoal/Estéticista ", "t": "D"}, {"c": "02 - Despesas com Pessoal/Financeiro", "t": "D"}, {"c": "02 - Despesas com Pessoal/Pró-Labore", "t": "D"}, {"c": "02 - Despesas com Pessoal/Recepção", "t": "D"}, {"c": "02 - Despesas com Pessoal/Retirada", "t": "D"}, {"c": "02 - Despesas com Pessoal/Serviços prestados/Freelancer", "t": "D"}, {"c": "02 - Despesas com Pessoal/Vale Alimentação", "t": "D"}, {"c": "02 - Despesas com Pessoal/Vale Transporte", "t": "D"}, {"c": "03 - Impostos", "t": "D"}, {"c": "03 - Impostos/FGTS", "t": "D"}, {"c": "03 - Impostos/INSS", "t": "D"}, {"c": "03 - Impostos/Simples", "t": "D"}, {"c": "03 - Impostos/Taxa TFLF-TFS", "t": "D"}, {"c": "04 - Despesas Variáveis ", "t": "D"}, {"c": "04 - Despesas Variáveis /Certificado Digital ", "t": "D"}, {"c": "04 - Despesas Variáveis /Curso", "t": "D"}, {"c": "04 - Despesas Variáveis /Decoração de Natal", "t": "D"}, {"c": "04 - Despesas Variáveis /Deslocamento", "t": "D"}, {"c": "04 - Despesas Variáveis /Eventos", "t": "D"}, {"c": "04 - Despesas Variáveis /Lavanderia Toalhas", "t": "D"}, {"c": "04 - Despesas Variáveis /Manutenção Equipamentos", "t": "D"}, {"c": "04 - Despesas Variáveis /Marketing/Publicidade", "t": "D"}, {"c": "04 - Despesas Variáveis /Material de Limpeza", "t": "D"}, {"c": "04 - Despesas Variáveis /Melhorias", "t": "D"}, {"c": "04 - Despesas Variáveis /Mimo para Clientes", "t": "D"}, {"c": "04 - Despesas Variáveis /Móveis e utensilhos", "t": "D"}, {"c": "04 - Despesas Variáveis /Produtos", "t": "D"}, {"c": "04 - Despesas Variáveis /Revenda", "t": "D"}, {"c": "04 - Despesas Variáveis /Seguro Predial", "t": "D"}, {"c": "04 - Despesas Variáveis /Supermercado", "t": "D"}, {"c": "04 - Despesas Variáveis /Taxa Cartão", "t": "D"}, {"c": "Caixinha Mega Hair", "t": "D"}, {"c": "Comissão - Carlos", "t": "D"}, {"c": "Consultoria", "t": "D"}, {"c": "Estorno", "t": "D"}, {"c": "Investimentos", "t": "D"}, {"c": "Investimentos/Custos operacionais", "t": "D"}, {"c": "Juros", "t": "D"}, {"c": "Não Identificado", "t": "D"}, {"c": "Outras Despesas", "t": "D"}, {"c": "Reformas", "t": "D"}, {"c": "Seguro cartão", "t": "D"}, {"c": "Tarifa Plano Bancário ", "t": "D"}, {"c": "Tarifa Plano Bancário /Anuidade do Cartão", "t": "D"}, {"c": "taxa cartão - antecipacao", "t": "D"}, {"c": "Transferência entre contas - resgate/aplicação automática", "t": "D"}, {"c": "Transporte", "t": "D"}, {"c": "01 - Serviços Cartão", "t": "R"}, {"c": "01 - Serviços Cartão/Arredondamento", "t": "R"}, {"c": "02 - Serviço - Pix", "t": "R"}, {"c": "Aporte - Sócia", "t": "R"}, {"c": "Dinheiro", "t": "R"}, {"c": "Investimentos", "t": "R"}, {"c": "Investimentos/Rendimentos", "t": "R"}, {"c": "Lucros", "t": "R"}, {"c": "Serviços Cartões ", "t": "R"}, {"c": "Serviços Cartões /Crédito", "t": "R"}, {"c": "Serviços Cartões /Débito", "t": "R"}, {"c": "Transferência entre contas - resgate/aplicação automática", "t": "R"}];
(()=>{const c=CLIENTES.find(x=>x.id==='beauty');Object.assign(c,{nome:'The Beauty · Lívia',banco:'Sicoob',erp:'Avec',adq:'Sipag'})})();

const PROCESSO_PADRAO=[
 {t:'Vendas',go:'vendas',i:['Baixar o relatório de vendas do sistema do cliente (Avec: recebimentos do período).','Baixar os relatórios da maquininha: vendas realizadas e vendas recebidas (Sipag).','Baixar o extrato do banco (Sicoob) em OFX: nele conferimos os Pix, os cartões recebidos e os pagamentos.','Conferir cada venda: se foi cartão, tem que estar nas vendas realizadas da maquininha; se foi Pix, tem que estar no extrato; dinheiro fica no caixa.']},
 {t:'Contas a receber',go:'vendas',i:['Com as vendas conferidas, lançar o contas a receber de cada venda.','Data de competência = data da venda. Vencimento = quando vamos receber (Pix no dia, débito em 1 dia, crédito em 30 dias, parcelado 30/60/90…).','O recebível fica na conta do banco até a baixa.','O relatório de vendas recebidas confronta o que está lançado no contas a receber, inclusive antecipações.']},
 {t:'Contas a pagar',go:'abertos',i:['Toda venda de cartão tem taxa: ao lançar o recebível, lançar junto a taxa (e a de cada parcela), para que recebível − taxa = valor líquido que cai no banco.','Lançar os demais pagamentos: fixos (repetem todo mês), parcelados e à vista.']},
 {t:'Conciliação',go:'conciliacao',i:['Subir o extrato bancário e marcar o que concilia com o que já está lançado.','O que estiver no extrato e não estiver lançado: classificar e lançar.','Os lotes de cartão do banco baixam vários recebíveis de uma vez (valor líquido por dia, bandeira e maquininha).']},
 {t:'Fechamento',go:'relatorios',i:['Conferir as pendências do mês.','Aprovar e liberar os relatórios para o cliente.']}
];
function perfilPadrao(){return{estabs:{},padroes:{catCred:'Serviços Cartões /Crédito',catDeb:'Serviços Cartões /Débito',catTaxa:'04 - Despesas Variáveis /Taxa Cartão',catAnt:'taxa cartão - antecipacao',catPix:'02 - Serviço - Pix',catDin:'Dinheiro',tagRec:'Conferência de Vendas',tagTaxa:'Taxa Cartão',contaRec:'',contaDin:'Caixa dinheiro'},processo:JSON.parse(JSON.stringify(PROCESSO_PADRAO)),partic:[],check:{}}}
function seedBeauty(){const p=perfilPadrao();p.padroes.contaRec='Sicoob';
 p.estabs={'CB-116701020001':{nome:'Maquininha terminal 21173459',prazo:'Recebe em 1 a 4 dias, inclusive parcelado (antecipação automática no contrato)'},'CB-113118040001':{nome:'Maquininha terminal 21016318',prazo:'Recebe cada parcela em 30, 60, 90… dias'},'CB-113791150001':{nome:'Terminal 91150001',prazo:'Recebe cada parcela em 30, 60, 90… dias'}};
 p.partic=['A Sipag tem 3 estabelecimentos. O terminal 21173459 recebe tudo em 1 a 4 dias, até o parcelado. Os outros dois recebem em 30/60/90 dias.','O Sicoob credita os cartões em lotes: um valor líquido por dia, bandeira e maquininha (ex.: “CR COMPRAS VISA · SIPAG_Cred._Visa”). A baixa é de vários recebíveis de uma vez.','“CR ANTECIPAÇÃO …” no extrato são parcelas antecipadas avulsas. Para separar a taxa extra, importe o relatório de vendas recebidas do mesmo período. A diferença vai para “taxa cartão - antecipacao”.','Às vezes a cliente paga uma comanda com dois cartões. No Avec aparece uma venda e na Sipag aparecem duas.','O Sicoob faz aplicação e resgate automático em RDC. Hoje isso é lançado na categoria “Transferência entre contas - resgate/aplicação automática”.','Vendas em dinheiro do Avec entram na conta Caixa dinheiro (não passam pelo banco).'];
 return{contas:[{nome:'Sicoob',tipo:'banco',saldoIni:0},{nome:'Caixa dinheiro',tipo:'banco',saldoIni:0}],lanc:[],regras:[],extratos:{},log:[],aprov:{},exemplo:false,real:true,cats:CATS_BEAUTY.map(x=>x.c),perfil:p,vendas:{avec:[],sipag:[]}}}
const _seedNucleo=seed;
seed=function(k){if(k===BEAUTY)return seedBeauty();const c=_seedNucleo(k);c.perfil=perfilPadrao();c.perfil.padroes.contaRec=c.contas[0].nome;c.vendas={avec:[],sipag:[]};return c};
C=function(){const k=st.scope;if(!DB[k])DB[k]=seed(k);const c=DB[k];if(!c.perfil){c.perfil=perfilPadrao();c.perfil.padroes.contaRec=(c.contas[0]||{}).nome||''}if(!c.vendas)c.vendas={avec:[],sipag:[]};if(!c.cats)c.cats=[];return c};
bannerExemplo=function(){const c=C();if(c.exemplo)return `<div class="banner"><span>Este cliente está com <b>dados de exemplo</b>. Importe o export do Meu Dinheiro para trabalhar com os dados reais.</span><button class="btn" type="button" data-go="meudinheiro">Importar do Meu Dinheiro</button></div>`;
 if(c.real&&!c.lanc.length)return `<div class="banner info"><span><b>Cliente pronto para receber os dados.</b> Contas, categorias, maquininhas e processo já estão configurados. Comece importando o histórico do Meu Dinheiro.</span><button class="btn" type="button" data-go="processo">Ver passo a passo</button></div>`;return''};

/* ---------- utilidades de cartão ---------- */
const P=()=>C().perfil.padroes;
function normBand(s){s=String(s||'').toLowerCase();if(/master|maestro/.test(s))return'Mastercard';if(/visa|electron/.test(s))return'Visa';if(/\belo\b|_elo|elo$/.test(s))return'Elo';if(/amex|american/.test(s))return'Amex';if(/hiper/.test(s))return'Hipercard';return''}
function infoBancoCartao(desc){const s=String(desc||'').toUpperCase();if(!/SIPAG|CR COMPRAS|CR ANTECIPA|STONE|GETNET|CIELO|REDE |REDECARD|SUMUP|PAGSEGURO/.test(s))return null;
 const t=/ANTECIPA|_ANT\./.test(s)?'Ant':/_DEB\.|MAESTRO|ELECTRON|D[EÉ]BITO/.test(s)?'Débito':'Crédito';return{t,band:normBand(s.replace(/CRE OUTRAS BANDEIRAS/,''))}}
const ehRecCartao=l=>!l.excluido&&l.tipo==='Receita'&&(l.card?.kind==='rec'||/servi[cç]os cart|cart[aã]o/i.test(l.cat)&&!/pix/i.test(l.cat));
const ehTaxaCartao=l=>!l.excluido&&l.tipo==='Despesa'&&(l.card&&l.card.kind!=='rec'||/taxa cart|antecipa/i.test(l.cat));
function chaveCartao(l){return l.card?.key||(l.ndoc+'|'+(l.obs||'')+'|'+(l.comp||''))}
function sipagLe(texto){const L=texto.replace(/^﻿/,'').split(/\r?\n/);const h=L.findIndex(x=>/Data da transa/i.test(x));if(h<0)return null;const head=L[h].split(';').map(s=>s.trim());
 const rows=[];for(let i=h+1;i<L.length;i++){if(!L[i].trim())continue;const c=L[i].split(';');if(/^total/i.test(c[0]))continue;const o={};head.forEach((k,j)=>o[k]=(c[j]||'').trim());rows.push(o)}
 const g=(o,k)=>{const kk=Object.keys(o).find(x=>normKey(x)===normKey(k));return kk?o[kk]:''};const dmy=s=>{const m=String(s).match(/(\d{2})\/(\d{2})\/(\d{4})/);return m?m[3]+'-'+m[2]+'-'+m[1]:''};const num=s=>{const v=parseNum(String(s).replace('R$',''));return isNaN(v)?0:v};
 const recebidas=head.some(k=>/Data do pagamento/i.test(k));
 return{recebidas,rows:rows.map(o=>({est:g(o,'Nº do estabelecimento'),dt:dmy(g(o,'Data da transação')),hr:(g(o,'Data da transação').split(' ')[1]||''),idv:g(o,'ID Venda')||g(o,'Nº da transação'),band:normBand(g(o,'Bandeira'))||g(o,'Bandeira'),forma:/d[eé]bito/i.test(g(o,'Forma de Pagamento'))?'Débito':'Crédito',plano:g(o,'Plano de venda'),parc:+g(o,'Parcela')||0,np:+g(o,'Total de parcela')||1,aut:g(o,'Número da autorização'),prev:dmy(g(o,'Data prevista de liquidação')),st:g(o,'Status'),pago:dmy(g(o,'Data do pagamento')),bruto:num(g(o,'Valor parcela bruto')),desc:num(g(o,'Desconto parcela')),liq:num(g(o,'Valor parcela liquido')),tot:num(g(o,'Total plano de venda'))})).filter(r=>r.dt)}}
function avecLe(rows){return rows.map(r=>{const tit=String(pick(r,['titulo'])||'');const m=tit.match(/Comanda\s*N[ºo°]?\s*(\d+)\s*-\s*(.*?)\s*\((\d+)\/(\d+)\)\s*$/i);const forma=String(pick(r,['formadepagamento','forma'])||'').trim();
 return{d:toYmd(pick(r,['data'])),com:m?m[1]:'',cli:m?m[2]:tit,p:m?+m[3]:1,np:m?+m[4]:1,forma,v:r2(parseNum(pick(r,['valor']))),st:String(pick(r,['status'])||'')}}).filter(x=>x.d&&!isNaN(x.v)&&x.v)}
function tipoForma(f){f=f.toLowerCase();if(/pix|transfer/.test(f))return'pix';if(/dinheiro|esp[eé]cie/.test(f))return'din';if(/cart|cr[eé]dito|d[eé]bito/.test(f))return'cartao';return'outro'}

/* ---------- conferência de vendas ---------- */
function vendasSipag(){const S={};C().vendas.sipag.forEach(r=>{const s=S[r.idv]||(S[r.idv]={idv:r.idv,dt:r.dt,band:r.band,forma:r.forma,np:r.np,tot:r.tot,est:r.est,aut:r.aut,parcs:[],pend:false});s.parcs.push(r);if(!r.prev)s.pend=true});return Object.values(S)}
function conferir(ym){const c=C();const G={};
 c.vendas.avec.filter(a=>a.d.slice(0,7)===ym).forEach(a=>{const k=a.d+'|'+a.com+'|'+a.forma+'|'+(a.com?'':a.cli);const g=G[k]||(G[k]={d:a.d,com:a.com,cli:a.cli,forma:a.forma,np:a.np,tot:0,tipo:tipoForma(a.forma),band:normBand(a.forma),cd:/d[eé]bito/i.test(a.forma)?'Débito':'Crédito'});g.tot=r2(g.tot+a.v)});
 const av=Object.values(G).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:(+a.com)-(+b.com));
 const sv=vendasSipag().filter(s=>s.dt>=dAdd(ym+'-01',-2)&&s.dt<=dAdd(mAdd(ym,1)+'-01',1));const usado=new Set();
 const cart=av.filter(a=>a.tipo==='cartao');
 [0,1].forEach(jan=>cart.forEach(a=>{if(a.st)return;const cs=sv.filter(s=>!usado.has(s.idv)&&s.forma===a.cd&&Math.abs(s.tot-a.tot)<.05&&Math.abs(dDiff(s.dt,a.d))<=jan);const s=cs.find(x=>x.band===a.band)||cs[0];if(s){usado.add(s.idv);a.st='ok';a.sip=[s];if(s.band!==a.band&&a.band)a.obs='Bandeira na maquininha: '+s.band;if(s.np!==a.np)a.obs=(a.obs?a.obs+' · ':'')+'Parcelas na maquininha: '+s.np}}));
 cart.forEach(a=>{if(a.st)return;const cs=sv.filter(s=>!usado.has(s.idv)&&s.dt===a.d);for(let i=0;i<cs.length&&!a.st;i++)for(let j=i+1;j<cs.length&&!a.st;j++){if(Math.abs(cs[i].tot+cs[j].tot-a.tot)<.05){a.st='ok';a.sip=[cs[i],cs[j]];a.obs='Pago com 2 cartões';usado.add(cs[i].idv);usado.add(cs[j].idv)}for(let k=j+1;k<cs.length&&!a.st;k++)if(Math.abs(cs[i].tot+cs[j].tot+cs[k].tot-a.tot)<.05){a.st='ok';a.sip=[cs[i],cs[j],cs[k]];a.obs='Pago com 3 cartões';[i,j,k].forEach(x=>usado.add(cs[x].idv))}}if(!a.st)a.st='semcartao'});
 const conta=P().contaRec;const ext=(c.extratos[conta]||[]).filter(i=>i.valor>0&&/PIX|TRANSF|TED|CRED\.TRANSF/i.test(i.desc));const usaE=new Set(),usaL=new Set();
 const recPix=ativos().filter(l=>l.tipo==='Receita'&&!ehRecCartao(l));
 av.filter(a=>a.tipo==='pix').forEach(a=>{const lc=recPix.find(l=>!usaL.has(l.id)&&Math.abs(l.valor-a.tot)<.01&&Math.abs(dDiff(l.data,a.d))<=1&&(a.com&&new RegExp('Comanda\\s*N[ºo°]?\\s*'+a.com+'\\b','i').test(l.desc)))||recPix.find(l=>!usaL.has(l.id)&&Math.abs(l.valor-a.tot)<.01&&l.data===a.d);
  if(lc){usaL.add(lc.id);a.st='lancado';a.lanc=lc;return}const e=ext.find(i=>!usaE.has(i.id)&&Math.abs(i.valor-a.tot)<.01&&Math.abs(dDiff(i.data,a.d))<=1);if(e){usaE.add(e.id);a.st='extrato';a.ext=e;return}a.st=ext.length||recPix.some(l=>l.data.slice(0,7)===ym)?'pixfalta':'pixsemext'});
 av.filter(a=>a.tipo==='din').forEach(a=>a.st='dinheiro');av.filter(a=>a.tipo==='outro').forEach(a=>a.st='outro');
 const sobra=sv.filter(s=>!usado.has(s.idv)&&s.dt.slice(0,7)===ym);
 return{av,sobra,temAvec:c.vendas.avec.some(a=>a.d.slice(0,7)===ym),temSipag:c.vendas.sipag.some(s=>s.dt.slice(0,7)===ym)}}
const ST_V={ok:['Cartão conferido','p-ok'],lancado:['Pix já lançado','p-ok'],extrato:['Pix no extrato','p-ok'],dinheiro:['Dinheiro','p-n'],outro:['Outra forma','p-n'],semcartao:['Não está na maquininha','p-bad'],pixfalta:['Pix não encontrado','p-bad'],pixsemext:['Pix · falta o extrato','p-warn']};
if(!st.vend)st.vend={mes:null,f:'todos'};
function vVendas(){const c=C();if(!st.vend.mes){const ms=[...new Set(c.vendas.avec.map(a=>a.d.slice(0,7)))].sort();st.vend.mes=ms.pop()||HOJE.slice(0,7)}const ym=st.vend.mes,R=conferir(ym);
 const cnt=k=>R.av.filter(a=>a.st===k).length,sum=f=>r2(R.av.filter(f).reduce((x,a)=>x+a.tot,0));
 const div=R.av.filter(a=>['semcartao','pixfalta'].includes(a.st)).length+R.sobra.length;const okN=R.av.filter(a=>['ok','lancado','extrato','dinheiro'].includes(a.st)).length;
 const vis=st.vend.f==='todos'?R.av:st.vend.f==='div'?R.av.filter(a=>['semcartao','pixfalta','pixsemext'].includes(a.st)):R.av.filter(a=>a.tipo===st.vend.f);
 const recM=vendasSipag().filter(s=>s.dt.slice(0,7)===ym);const jaGer=recM.filter(s=>s.parcs.every(p=>!p.prev||existeRec(p))).length;
 $('#view').innerHTML=topo('Passo 1 e 2 · vendas → contas a receber','Conferência de vendas',`<div class="monthnav" style="gap:4px"><button class="icobtn" type="button" id="vPrev" aria-label="Mês anterior">‹</button><b>${mNome(ym)}</b><button class="icobtn" type="button" id="vNext" aria-label="Próximo mês">›</button></div>`)+bannerExemplo()+`
 <div class="grid3">
  <label class="drop" id="dAvec"><b>Vendas do sistema (${esc(cliDe(st.scope).erp)})</b><small>Relatório de recebimentos .xlsx · ${c.vendas.avec.length} linhas importadas</small><input type="file" id="dAvec-in" accept=".xlsx,.xls,.csv" multiple hidden></label>
  <label class="drop" id="dSip"><b>Maquininha (${esc(cliDe(st.scope).adq)})</b><small>Vendas realizadas e vendas recebidas .csv · ${c.vendas.sipag.length} parcelas importadas</small><input type="file" id="dSip-in" accept=".csv,.txt" multiple hidden></label>
  <div class="drop" data-go="conciliacao" role="button" tabindex="0"><b>Extrato do banco</b><small>Importado em Conciliação bancária · usado para conferir os Pix</small></div></div>
 ${!R.temAvec?`<div class="panel"><p class="note" style="margin:0">Sem vendas do sistema em ${mNome(ym)}. Importe o relatório do ${esc(cliDe(st.scope).erp)} para conferir.${R.temSipag?' As vendas da maquininha deste mês já podem virar contas a receber:':''}</p>${R.temSipag?`<div class="scope"><label class="switch"><input type="checkbox" id="gCart" checked> Cartões</label><input type="checkbox" id="gPix" hidden><input type="checkbox" id="gDin" hidden><button class="btn primary" type="button" id="gOk">Gerar contas a receber da maquininha</button></div>`:''}</div>`:`
 <div class="kpis"><div class="kpi"><span class="l">Vendas no sistema</span><span class="v num">${brl(sum(()=>true))}</span><span class="s">${R.av.length} recebimentos · cartão ${brl(sum(a=>a.tipo==='cartao'))} · Pix ${brl(sum(a=>a.tipo==='pix'))} · dinheiro ${brl(sum(a=>a.tipo==='din'))}</span></div>
  <div class="kpi"><span class="l">Conferidas</span><span class="v num ${okN===R.av.length?'pos':''}">${R.av.length?Math.round(okN/R.av.length*100):0}%</span><span class="s">${okN} de ${R.av.length}</span></div>
  <div class="kpi"><span class="l">Divergências</span><span class="v num ${div?'neg':'pos'}">${div}</span><span class="s">${cnt('semcartao')} sem cartão · ${cnt('pixfalta')} Pix · ${R.sobra.length} só na maquininha</span></div>
  <div class="kpi"><span class="l">Contas a receber</span><span class="v num">${jaGer}/${recM.length}</span><span class="s">vendas de cartão já lançadas</span></div></div>
 <div class="panel"><div class="panel-head"><div><h3>Gerar contas a receber de ${mNome(ym)}</h3><span class="note">Cada parcela vira um recebível (competência = venda, vencimento = previsão da maquininha) com a taxa lançada junto. O que já existe não é duplicado.</span></div>
  <div class="scope"><label class="switch"><input type="checkbox" id="gCart" checked> Cartões</label><label class="switch"><input type="checkbox" id="gPix" checked> Pix ainda não lançados</label><label class="switch"><input type="checkbox" id="gDin" checked> Dinheiro (Caixa dinheiro)</label><button class="btn primary" type="button" id="gOk" ${R.temSipag||R.av.some(a=>a.tipo!=='cartao')?'':'disabled'}>Gerar lançamentos</button></div></div></div>
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:12px 14px;border-bottom:1px solid var(--line)"><div class="chips">${[['todos','Todas ('+R.av.length+')'],['div','Divergências ('+R.av.filter(a=>['semcartao','pixfalta','pixsemext'].includes(a.st)).length+')'],['cartao','Cartão'],['pix','Pix'],['din','Dinheiro']].map(([k,l])=>`<button class="chip ${st.vend.f===k?'':'off'}" type="button" data-vf="${k}">${l}</button>`).join('')}</div><span class="note">Comandas do ${esc(cliDe(st.scope).erp)}</span></div>
 <div class="tbl"><table><thead><tr><th>Data</th><th>Comanda</th><th>Forma</th><th class="r">Valor</th><th>Conferência</th><th>Onde achou</th></tr></thead><tbody>
 ${vis.map(a=>`<tr><td class="num">${fd(a.d)}</td><td>${a.com?'Nº '+esc(a.com)+' · ':''}${esc(a.cli)}${a.np>1?` <span class="tg">${a.np}x</span>`:''}</td><td class="note">${esc(a.forma)}</td><td class="r num">${val(a.tot)}</td><td><span class="pill ${ST_V[a.st][1]}">${ST_V[a.st][0]}</span>${a.obs?`<br><span class="note">${esc(a.obs)}</span>`:''}</td>
  <td class="note">${a.sip?a.sip.map(s=>`${esc(s.band)} ${esc(s.forma)} ${s.np}x · aut. ${esc(s.aut)} · ${esc((C().perfil.estabs[s.est]||{}).nome||s.est)}${s.pend?' · aguardando processamento':''}`).join('<br>'):a.lanc?'Lançado: '+esc(a.lanc.desc)+' · '+fd(a.lanc.data):a.ext?'Extrato '+fd(a.ext.data)+': '+esc(a.ext.desc):a.st==='semcartao'?'Nenhuma venda de mesmo valor e dia na maquininha':a.st==='pixfalta'?'Nenhum Pix de mesmo valor em ±1 dia':''}</td></tr>`).join('')||'<tr><td colspan="6" class="note">Nada neste filtro.</td></tr>'}
 </tbody></table></div></div>
 <div class="panel"><div class="panel-head"><h3>Na maquininha, mas não no sistema (${R.sobra.length})</h3><span class="note">Venda passada no cartão sem comanda correspondente no ${esc(cliDe(st.scope).erp)}</span></div>
 <div class="tbl"><table><thead><tr><th>Data</th><th>Cartão</th><th>Maquininha</th><th>Autorização</th><th class="r">Valor</th></tr></thead><tbody>${R.sobra.map(s=>`<tr><td class="num">${fd(s.dt)}</td><td>${esc(s.band)} ${esc(s.forma)} ${s.np}x</td><td class="note">${esc((C().perfil.estabs[s.est]||{}).nome||s.est)}</td><td class="note">${esc(s.aut)}</td><td class="r num">${val(s.tot)}</td></tr>`).join('')||'<tr><td colspan="5" class="note">Nenhuma. Tudo o que passou na maquininha está no sistema.</td></tr>'}</tbody></table></div></div>`}
 ${c.vendas.sipag.length?taxasPraticadas():''}`;
 bindScope();
 $('#vPrev').onclick=()=>{st.vend.mes=mAdd(ym,-1);vVendas()};$('#vNext').onclick=()=>{st.vend.mes=mAdd(ym,1);vVendas()};
 $$('[data-vf]').forEach(b=>b.onclick=()=>{st.vend.f=b.dataset.vf;vVendas()});
 bindDrop('dAvec',async fs=>{let n=0,d=0;for(const f of fs){try{const rows=avecLe(await lerPlanilha(f));if(!rows.length){toast(f.name+': não encontrei as colunas Data, Título, Forma de Pagamento e Valor');continue}const ks=new Set(c.vendas.avec.map(a=>a.d+'|'+a.com+'|'+a.cli+'|'+a.p+'|'+a.forma+'|'+a.v));rows.forEach(a=>{const k=a.d+'|'+a.com+'|'+a.cli+'|'+a.p+'|'+a.forma+'|'+a.v;if(ks.has(k)){d++;return}ks.add(k);c.vendas.avec.push(a);n++})}catch(e){toast('Não consegui ler '+f.name)}}
  const ms=[...new Set(c.vendas.avec.map(a=>a.d.slice(0,7)))].sort();if(n)st.vend.mes=ms[ms.length-1];log('Vendas do sistema importadas',n+' linhas');save();toast(n+' vendas importadas'+(d?' · '+d+' repetidas ignoradas':''));vVendas()});
 bindDrop('dSip',async fs=>{let msg=[];for(const f of fs){try{const r=sipagLe(decode(await f.arrayBuffer()));if(!r){msg.push(f.name+': formato não reconhecido');continue}
   if(r.recebidas){const x=aplicarRecebidas(r.rows);msg.push('Recebidas: '+x.ja+' já baixadas · '+x.atual+' datas de recebimento atualizadas ('+x.ant+' antecipadas) · '+x.novos+' recebíveis criados')}
   else{const ks=new Map(c.vendas.sipag.map((s,i)=>[s.idv+'|'+s.parc,i]));let n=0;r.rows.forEach(s=>{const k=s.idv+'|'+s.parc;if(s.parc===0){const k2=[...ks.keys()].find(x=>x.startsWith(s.idv+'|'));if(k2)return}if(ks.has(k)){c.vendas.sipag[ks.get(k)]=s;return}ks.set(k,c.vendas.sipag.length);c.vendas.sipag.push(s);n++});
    c.vendas.sipag=c.vendas.sipag.filter(s=>!(s.parc===0&&c.vendas.sipag.some(o=>o.idv===s.idv&&o.parc>0)));enriquecerCartoes();msg.push('Realizadas: '+n+' parcelas novas')}}catch(e){console.error(e);msg.push('Não consegui ler '+f.name)}}
  log('Maquininha importada',msg.join(' · '));save();toast(msg.join(' · '));vVendas()});
 const g=$('#gOk');if(g)g.onclick=()=>{const r=gerarReceber(ym,{cart:$('#gCart').checked,pix:$('#gPix').checked,din:$('#gDin').checked},R);log('Contas a receber geradas',mNome(ym)+' · '+r.txt);save();toast(r.txt);vVendas()};
}
function taxasPraticadas(){const T={};C().vendas.sipag.filter(s=>s.bruto>0&&s.prev).forEach(s=>{const k=(C().perfil.estabs[s.est]||{}).nome||s.est;const kk=k+'|'+s.forma+'|'+(s.np>1?s.np+'x':'à vista');const t=s.desc/s.bruto*100;const o=T[kk]||(T[kk]={est:k,forma:s.forma,plano:s.np>1?s.np+'x':'à vista',min:99,max:0,n:0,tot:0});o.min=Math.min(o.min,t);o.max=Math.max(o.max,t);o.n++;o.tot+=s.desc});
 const L=Object.values(T).sort((a,b)=>a.est.localeCompare(b.est)||a.forma.localeCompare(b.forma)||parseInt(a.plano)-parseInt(b.plano));const f=v=>v.toFixed(2).replace('.',',')+'%';
 return `<div class="panel"><div class="panel-head"><h3>Taxas praticadas pela maquininha</h3><span class="note">Calculadas das vendas importadas. Variação grande na mesma linha merece conferir o contrato.</span></div><div class="tbl"><table><thead><tr><th>Maquininha</th><th>Forma</th><th>Plano</th><th class="r">Taxa</th><th class="r">Parcelas</th><th class="r">Total de taxas</th></tr></thead><tbody>${L.map(o=>`<tr><td>${esc(o.est)}</td><td>${o.forma}</td><td>${o.plano}</td><td class="r num ${o.max-o.min>.5?'neg':''}">${Math.abs(o.max-o.min)<.01?f(o.min):f(o.min)+' a '+f(o.max)}</td><td class="r num">${o.n}</td><td class="r num">${brl(-o.tot)}</td></tr>`).join('')}</tbody></table></div></div>`}
const nAut=x=>String(x||'').trim().toUpperCase().replace(/^0+/,'');const temAut=(l,aut)=>!!aut&&String(l.ndoc||'').split(',').map(nAut).includes(nAut(aut));
const temParc=(l,p)=>String(l.obs||'').split(',').map(x=>x.trim()).includes(String(p));
function existeRec(p){return ativos().some(l=>ehRecCartao(l)&&(l.card?.key===p.idv+'|'+p.parc))}
function ligarExistentes(){/* liga recebíveis do Meu Dinheiro às parcelas da maquininha, 1 para 1 */const c=C();const livres=ativos().filter(l=>ehRecCartao(l)&&!l.card&&l.ndoc);const usados=new Set();let n=0;
 const parcs=c.vendas.sipag.filter(p=>p.aut&&p.parc>0).sort((a,b)=>a.dt<b.dt?-1:1);
 const ja=new Set(ativos().filter(l=>l.card).map(l=>l.card.key));
 [2,1,0].forEach(nivel=>parcs.forEach(p=>{const key=p.idv+'|'+p.parc;if(ja.has(key))return;
  const cs=livres.filter(l=>!usados.has(l.id)&&Math.abs(l.valor-p.bruto)<.02&&(nivel===0?(l.comp&&Math.abs(dDiff(l.comp,p.dt))<=1&&(!p.prev||Math.abs(dDiff(l.data,p.prev))<=5)):(temAut(l,p.aut)&&(nivel<2||temParc(l,p.parc))&&(!l.comp||Math.abs(dDiff(l.comp,p.dt))<=1))));
  const l=cs.sort((x,y)=>Math.abs(dDiff(x.data,p.prev||x.data))-Math.abs(dDiff(y.data,p.prev||y.data)))[0];if(l)ja.add(key);
  if(l){usados.add(l.id);l.card={key,kind:'rec',band:p.band,tipo:p.forma,est:p.est,aut:p.aut,parc:p.parc,np:p.np,prevOrig:p.prev,md:true};n++}}));return n}
function enriquecerCartoes(){return ligarExistentes()}
function gerarReceber(ym,o,R){const c=C(),pd=P(),conta=pd.contaRec||contasBanco()[0]?.nome;let nr=0,nt=0,np=0,nd=0,ja=0;ligarExistentes();
 const cliPor=new Map();R.av.forEach(a=>(a.sip||[]).forEach(s=>cliPor.set(s.idv,a)));
 if(o.cart)vendasSipag().filter(s=>s.dt.slice(0,7)===ym&&(!o.idvs||o.idvs.has(s.idv))).forEach(s=>s.parcs.filter(p=>p.prev).forEach(p=>{const key=p.idv+'|'+p.parc;
  if(ativos().some(l=>ehRecCartao(l)&&l.card?.key===key)){ja++;return}
  const a=cliPor.get(p.idv);const stt=p.prev>HOJE?'Agendado':'Pendente';const card={key,kind:'rec',band:p.band,tipo:p.forma,est:p.est,aut:p.aut,parc:p.parc,np:p.np,prevOrig:p.prev,gen:true};
  c.lanc.push(novoL({tipo:'Receita',status:stt,data:p.prev,comp:p.dt,valor:p.bruto,desc:`${p.forma} ${p.band}${p.np>1?' '+p.parc+'/'+p.np:''}${a?' · Comanda Nº'+a.com+' - '+a.cli:''}`,cat:p.forma==='Débito'?pd.catDeb:pd.catCred,conta,ndoc:p.aut,obs:String(p.parc),tags:[pd.tagRec],rep:p.np>1?'Parcelado':'Único',card}));nr++;
  if(p.desc>0){c.lanc.push(novoL({tipo:'Despesa',status:stt,data:p.prev,comp:p.dt,valor:-p.desc,desc:'Taxa cartão '+p.band+(p.np>1?' '+p.parc+'/'+p.np:''),cat:pd.catTaxa,conta,ndoc:p.aut,obs:String(p.parc),tags:[pd.tagTaxa],card:Object.assign({},card,{kind:'taxa'})}));nt++}}));
 if(o.pix)R.av.filter(a=>a.tipo==='pix'&&a.st==='extrato'&&(!o.sel||o.sel.has(a))).forEach(a=>{const l=novoL({tipo:'Receita',status:'Pendente',data:a.d,comp:a.d,valor:a.tot,desc:`Comanda Nº${a.com} - ${a.cli}`,cat:pd.catPix,conta,ndoc:'Pix',tags:['Receita']});c.lanc.push(l);if(a.ext&&a.ext.status!=='conciliado'){vincular(a.ext,[l])}np++});
 if(o.din){if(!contaObj(pd.contaDin))c.contas.push({nome:pd.contaDin,tipo:'banco',saldoIni:0});R.av.filter(a=>a.tipo==='din'&&(!o.sel||o.sel.has(a))).forEach(a=>{const dup=ativos().some(l=>l.conta===pd.contaDin&&l.data===a.d&&Math.abs(l.valor-a.tot)<.01);if(dup)return;c.lanc.push(novoL({tipo:'Receita',status:'Confirmado',data:a.d,comp:a.d,valor:a.tot,desc:`Comanda Nº${a.com} - ${a.cli}`,cat:pd.catDin,conta:pd.contaDin,tags:['Receita']}));nd++})}
 st.cx.contas=null;return{txt:`${nr} recebíveis de cartão + ${nt} taxas · ${np} Pix · ${nd} dinheiro`+(ja?` · ${ja} parcelas já existiam`:'')}}
function aplicarRecebidas(rows){const c=C(),pd=P(),conta=pd.contaRec;let atual=0,ant=0,novos=0,ja=0;
 const salvaSip=c.vendas.sipag;const extra=rows.filter(r=>!salvaSip.some(s=>s.idv===r.idv&&s.parc===r.parc));c.vendas.sipag=salvaSip.concat(extra.map(r=>Object.assign({},r,{prev:r.prev||r.pago,soRecebida:true})));ligarExistentes();
 rows.filter(r=>r.pago).forEach(r=>{const key=r.idv+'|'+r.parc;const rec=ativos().find(l=>ehRecCartao(l)&&l.card?.key===key);if(rec&&rec.status==='Conciliado'){ja++;return}
  if(!rec){const card={key,kind:'rec',band:r.band,tipo:r.forma,est:r.est,aut:r.aut,parc:r.parc,np:r.np,prevOrig:r.prev};c.lanc.push(novoL({tipo:'Receita',status:'Pendente',data:r.pago,comp:r.dt,valor:r.bruto,desc:`${r.forma} ${r.band}${r.np>1?' '+r.parc+'/'+r.np:''}`,cat:r.forma==='Débito'?pd.catDeb:pd.catCred,conta,ndoc:r.aut,obs:String(r.parc),tags:[pd.tagRec],card}));
   if(r.desc>0)c.lanc.push(novoL({tipo:'Despesa',status:'Pendente',data:r.pago,comp:r.dt,valor:-r.desc,desc:'Taxa cartão '+r.band,cat:pd.catTaxa,conta,ndoc:r.aut,obs:String(r.parc),tags:[pd.tagTaxa],card:Object.assign({},card,{kind:'taxa'})}));novos++;return}
  if(!rec.card)rec.card={key,kind:'rec',band:r.band,tipo:r.forma,est:r.est,aut:r.aut,parc:r.parc,np:r.np,prevOrig:r.prev};
  const tx=taxasDe(rec);
  if(rec.data!==r.pago){if(r.pago<rec.data){rec.card.antecipada=true;ant++}rec.data=r.pago;tx.forEach(t=>t.data=r.pago);atual++}
  const taxaAtual=-tx.filter(t=>t.card?.kind!=='ant').reduce((a,t)=>a+t.valor,0);const extra=r2(r.desc-taxaAtual);const jaAnt=tx.find(t=>t.card?.kind==='ant');
  if(extra>.009&&!jaAnt){c.lanc.push(novoL({tipo:'Despesa',status:'Pendente',data:r.pago,comp:rec.comp,valor:-extra,desc:'Taxa antecipação cartão '+r.band+(r.np>1?' '+r.parc+'/'+r.np:''),cat:pd.catAnt,conta,ndoc:r.aut,obs:String(r.parc),tags:[pd.tagTaxa],card:Object.assign({},rec.card,{kind:'ant'})}))}});
 return{atual,ant,novos,ja}}

/* ---------- conciliação: lotes de cartão ---------- */
const chavePar=l=>l.card?.gen?l.card.key:(l.ndoc+'|'+String(l.obs).trim()+'|'+l.comp+'|'+l.data);
function parearTaxas(recs,txs){const rm=new Map(),tm=new Map();recs.forEach(r=>{const k=chavePar(r);(rm.get(k)||rm.set(k,[]).get(k)).push(r)});txs.forEach(t=>{const k=chavePar(t);(tm.get(k)||tm.set(k,[]).get(k)).push(t)});const out=new Map();
 rm.forEach((rs,k)=>{const ts=(tm.get(k)||[]).slice();const ant=ts.filter(t=>t.card?.kind==='ant'),base=ts.filter(t=>t.card?.kind!=='ant');rs.forEach((r,i)=>{const mine=[];if(rs.length===1){mine.push(...base,...ant)}else{if(base[i])mine.push(base[i]);ant.filter(a=>a.card?.parc===r.card?.parc).forEach(a=>mine.push(a))}out.set(r.id,mine)})});return out}
function taxasDe(rec){const txs=ativos().filter(l=>ehTaxaCartao(l)&&l.conta===rec.conta&&chavePar(l)===chavePar(rec));const rs=ativos().filter(l=>ehRecCartao(l)&&chavePar(l)===chavePar(rec));return parearTaxas(rs,txs).get(rec.id)||[]}
function unidadesCartao(conta){const rec=ativos().filter(l=>l.conta===conta&&ehRecCartao(l)&&!l.extId);const tx=ativos().filter(l=>l.conta===conta&&ehTaxaCartao(l)&&!l.extId);
 const par=parearTaxas(rec,tx);
 return rec.map(r=>{const ts=par.get(r.id)||[];return{ls:[r,...ts],net:r2(r.valor+ts.reduce((a,t)=>a+t.valor,0)),data:r.data,band:r.card?.band||'',tipo:r.card?.tipo||(/d[eé]bito/i.test(r.cat+r.desc)?'Débito':'Crédito'),est:r.card?.est||'',ant:!!r.card?.antecipada}}).filter(u=>u.net>0)}
function somaSubconjunto(items,alvo,tol=3,max=45){const T=Math.round(alvo*100);const its=items.slice(0,max);const reach=new Map([[0,null]]);
 for(let i=0;i<its.length;i++){const v=Math.round(its[i].net*100);const novos=[];for(const s of reach.keys()){const ns=s+v;if(ns<=T+tol&&!reach.has(ns))novos.push([ns,[s,i]])}novos.forEach(([a,b])=>{if(!reach.has(a))reach.set(a,b)});
  for(let k=T-tol;k<=T+tol;k++)if(reach.has(k)&&k){const out=[];let s=k;while(s){const [p,idx]=reach.get(s);out.push(its[idx]);s=p}return out}if(reach.size>400000)break}return null}
function conciliarLotesCartao(conta){const arr=extDe(conta).filter(i=>i.status!=='conciliado');let n=0;const us=new Set();
 const ord=arr.map(it=>({it,inf:infoBancoCartao(it.desc)})).filter(x=>x.inf).sort((a,b)=>(a.inf.t==='Ant')-(b.inf.t==='Ant')||(a.it.data<b.it.data?-1:1));
 let U=unidadesCartao(conta);
 ord.forEach(({it,inf})=>{let achou=null;
  for(const jan of [0,1,3]){const cand=U.filter(u=>!us.has(u)&&(inf.t==='Ant'?(u.tipo==='Crédito'&&(u.ant||u.data>=it.data)):u.tipo===inf.t)&&(!u.band||!inf.band||u.band===inf.band)&&(inf.t==='Ant'&&jan>0&&!U.some(x=>x.ant)?u.data>=it.data&&dDiff(u.data,it.data)<=120:Math.abs(dDiff(u.data,it.data))<=jan)).sort((a,b)=>Math.abs(dDiff(a.data,it.data))-Math.abs(dDiff(b.data,it.data))||(b.band?1:0)-(a.band?1:0));
   if(!cand.length)continue;const ests=[...new Set(cand.map(u=>u.est))];
   for(const e of ests){const g=cand.filter(u=>u.est===e&&Math.abs(dDiff(u.data,it.data))<=jan);if(g.length&&Math.abs(g.reduce((a,u)=>a+u.net,0)-it.valor)<.04){achou=g;break}}
   if(!achou)achou=somaSubconjunto(cand,it.valor);if(achou)break}
  if(achou){achou.forEach(u=>us.add(u));const ls=achou.flatMap(u=>u.ls);vincular(it,ls);ls.forEach(l=>{l.data=it.data});it.sug=null;it.lote=achou.length;n++}
  else{it.status='pendente';it.sug=null;it.cartao=inf}});
 return n}
const _autoNucleo=autoConciliar;
autoConciliar=function(conta){const lotes=conciliarLotesCartao(conta);const r=_autoNucleo(conta);extDe(conta).forEach(i=>{if(i.status!=='conciliado'&&infoBancoCartao(i.desc)){i.status='pendente';i.sug=null}});return{n:r.n+lotes,s:extDe(conta).filter(i=>i.status==='sugerido').length,lotes}};
candidatos=function(it,conta,janela=7,todos=false){return ativos().filter(l=>{if(l.extId&&!todos)return false;if(!todos&&l.status==='Conciliado'&&l.desc==='')return false;const e=efeito(l,conta);if(!e||Math.sign(e)!==Math.sign(it.valor))return false;return Math.abs(dDiff(l.data,it.data))<=janela}).map(l=>({l,dv:Math.abs(efeito(l,conta)-it.valor),dd:Math.abs(dDiff(l.data,it.data))})).sort((a,b)=>a.dv-b.dv||a.dd-b.dd)};
const _detNucleo=detalheExt,_sugNucleo=sugerir;let _semSug=false;
sugerir=function(d,v){return _semSug?null:_sugNucleo(d,v)};
detalheExt=function(it,conta){const inf=infoBancoCartao(it.desc);_semSug=!!inf;if(inf&&(!st.conc._sel||st.conc._sel!==it.id)){st.conc._sel=it.id;st.conc.tab='esc';st.conc.jan=inf.t==='Ant'?35:3}let h;try{h=_detNucleo(it,conta)}finally{_semSug=false}
 if(inf&&it.status!=='conciliado'){h=h.replace('<div class="tabs">',`<div class="banner"><span>Lote de cartão · ${esc(inf.band||'bandeira ?')} · ${inf.t==='Ant'?'antecipação':inf.t.toLowerCase()}. Nenhuma combinação de recebíveis lançados bateu com ${brl(it.valor)}. ${inf.t==='Ant'?'Importe o relatório de vendas recebidas do período, ou marque abaixo as parcelas antecipadas: a diferença vira taxa de antecipação.':'Confira se as vendas desse período foram importadas, ou marque abaixo os recebíveis do lote.'}</span></div><div class="tabs">`)}
 if(it.status==='conciliado'&&it.lote)h=h.replace('<div class="banner info"><span>Conciliado com:</span></div>',`<div class="banner info"><span>Lote de cartão: ${it.lote} recebíveis com as taxas, baixados em ${fdl(it.data)}.</span></div>`);return h};
/* extrato: OFX com MEMO + NAME, planilha do Sicoob */
parseOFX=function(text){const out=[];text.split(/<STMTTRN>/i).slice(1).forEach(b=>{b=b.split(/<\/STMTTRN>/i)[0];const v=parseFloat(tag(b,'TRNAMT').replace(',','.'));const dt=tag(b,'DTPOSTED').match(/(\d{4})(\d{2})(\d{2})/);if(isNaN(v)||!dt)return;const memo=tag(b,'MEMO').replace(/\s+/g,' ').trim(),name=tag(b,'NAME').replace(/\s+/g,' ').trim();
 out.push({data:dt[1]+'-'+dt[2]+'-'+dt[3],valor:r2(v),desc:[memo,name].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).join(' · '),fitid:tag(b,'FITID')})});return out};
const _lerExtNucleo=lerArquivoExtrato;
lerArquivoExtrato=async function(f){if(/\.(xlsx|xls|csv)$/i.test(f.name)){const rows=await lerPlanilha(f);if(rows.length&&Object.keys(rows[0]).some(k=>/hist/i.test(k))){
  return rows.map(r=>{const h=String(pick(r,['historico'])||'').trim(),inf=String(pick(r,['informacoescomplementares','complemento'])||'').replace(/\s+/g,' ').trim();return{data:toYmd(pick(r,['data'])),valor:r2(parseNum(pick(r,['valor']))),desc:[h,inf].filter(Boolean).join(' · '),fitid:'',doc:String(pick(r,['documento'])||'')}}).filter(x=>x.data&&!isNaN(x.valor)&&x.valor&&!/^SALDO/i.test(x.desc))}}
 return _lerExtNucleo(f)};
/* tokens: CPF/CNPJ do Pix viram chave forte nas regras */
const _tokNucleo=tokens;
tokens=function(s){const t=_tokNucleo(s);const docs=String(s||'').match(/\d{2,3}\.\d{3}\.\d{3}[\s\/]?\d{4}-?\d{2}|\*{3}\.\d{3}\.\d{3}-\*{2}/g)||[];docs.forEach(d=>t.push('doc'+d.replace(/\D/g,'')));return t};
criarDoExtrato=function(it,conta,dados){const isCart=contaObj(conta)?.tipo==='cartao';
 const l=novoL({tipo:it.valor<0?'Despesa':'Receita',data:it.data,valor:it.valor,desc:dados.desc||it.desc,cat:dados.cat||'',tags:dados.tags||[],conta,status:'Conciliado',obs:'Importado do extrato',contato:dados.contato||'Sem contato'});
 if(isCart)l.venc=faturaDe(it.data,contaObj(conta));C().lanc.push(l);vincular(it,[l]);aprender(l);aprender(Object.assign({},l,{desc:it.desc,id:'x'}));const c=C();const r=c.regras.find(r=>r.pal.join(' ')===[...new Set(tokens(it.desc))].slice(0,3).join(' '));if(r)r.nome=l.desc;return l};
aprender=function(l){if(!l.cat||l.tipo==='Transferência'||l.tipo==='Pagamento'||ehRecCartao(l)||ehTaxaCartao(l))return;const tk=[...new Set(tokens(l.desc))];const docs=tk.filter(x=>x.startsWith('doc'));const t=(docs.length?docs:tk).slice(0,3);if(!t.length)return;const c=C();let r=c.regras.find(r=>r.pal.join(' ')===t.join(' '));
 const nome=String(l.desc).replace(/\s*\d+\/\d+\s*$/,'').trim();if(r){r.cat=l.cat;r.tags=l.tags||[];if(l.id!=='x')r.nome=nome;r.usos=(r.usos||0)+1}else c.regras.push({id:nid(),pal:t,cat:l.cat,tags:l.tags||[],nome,usos:1,auto:true})};

/* ---------- Meu Dinheiro: CSV, saldo inicial, cartões ---------- */
vMD=function(){const c=C();
 $('#view').innerHTML=topo('Compatibilidade total','Meu Dinheiro')+`
 <div class="grid2"><div class="panel"><h3>Importar histórico do Meu Dinheiro</h3><label class="drop" id="dMD"><b>Arraste o export de lançamentos (.xlsx ou .csv)</b><small>Pode mandar vários anos de uma vez. Contas, categorias, tags, repetições, status e saldo inicial entram como estão.</small><input type="file" id="dMD-in" accept=".xlsx,.xls,.csv" multiple hidden></label>
  ${c.exemplo?`<label class="switch"><input type="checkbox" id="mdSub" checked> Apagar os dados de exemplo antes de importar</label>`:''}
  <p class="note" style="margin:0">Lançamentos com o mesmo <b>ID Único</b> não entram duas vezes. Depois de importar, o sistema aprende as regras de categoria e liga os recebíveis de cartão às vendas da maquininha.</p></div>
 <div class="panel"><h3>Exportar no formato do Meu Dinheiro</h3><div class="form"><div class="row"><label>De<input type="date" id="mdI" value="${mAdd(HOJE.slice(0,7),-3)}-01"></label><label>Até<input type="date" id="mdF" value="${HOJE}"></label></div></div>
  <div><button class="btn primary" type="button" id="mdExp">Exportar .xlsx</button></div><p class="note" style="margin:0">Mesmas 22 colunas e mesma ordem do Meu Dinheiro, para backup ou para voltar para lá.</p></div></div>
 <div class="panel"><div class="kv num"><span>Lançamentos neste cliente</span><span>${ativos().length}</span><span>Período</span><span>${c.lanc.length?fdl(c.lanc.reduce((a,l)=>l.data<a?l.data:a,'9999'))+' a '+fdl(c.lanc.reduce((a,l)=>l.data>a?l.data:a,'0000')):'—'}</span><span>Contas</span><span>${c.contas.map(k=>esc(k.nome)).join(', ')}</span></div></div>`;
 bindScope();
 bindDrop('dMD',async fs=>{let novos=0,dup=0,si=[];const contasN=new Set();if($('#mdSub')?.checked&&c.exemplo){c.lanc=[];c.extratos={};c.regras=[];c.contas=[];c.exemplo=false;c.aprov={}}
  const ids=new Set(c.lanc.map(l=>String(l.uid)));
  for(const f of fs){try{const rows=await lerPlanilha(f);if(!rows.length||!('Tipo' in rows[0])){toast(f.name+': não parece um export do Meu Dinheiro');continue}
   rows.forEach(r=>{const tp=String(r['Tipo']||'').trim();if(/saldo inicial/i.test(tp)){const n=String(r['Conta']||'').trim();let k=c.contas.find(x=>x.nome===n);if(!k){k={nome:n,tipo:'banco',saldoIni:0};c.contas.push(k)}k.saldoIni=r2(parseNum(r['Valor']));k.saldoData=toYmd(r['Data']);si.push(n);return}
    const l=mdParaLanc(r);if(!l)return;mdAjuste(l);if(l.tipo==='Transferência'&&l.valor>0){const t=l.conta;l.conta=l.ctr;l.ctr=t}if(l.tipo==='Transferência')l.valor=Math.abs(l.valor);if(ids.has(String(l.uid))){dup++;return}ids.add(String(l.uid));c.lanc.push(l);novos++;
    [l.conta,l.ctr].forEach(n=>{if(n&&!c.contas.some(k=>k.nome===n)){const cart=/cart[aã]o/i.test(n)||!!l.venc;c.contas.push(cart?{nome:n,tipo:'cartao',saldoIni:0,fecha:9,vence:10,debito:c.contas.find(k=>k.tipo==='banco')?.nome||''}:{nome:n,tipo:'banco',saldoIni:0});contasN.add(n)}});
    if(l.cat&&!c.cats.includes(l.cat))c.cats.push(l.cat)})}catch(e){console.error(e);toast('Não consegui ler '+f.name)}}
  c.exemplo=false;c.lanc.sort((a,b)=>a.data<b.data?-1:a.data>b.data?1:0);ativos().forEach(aprender);const en=enriquecerCartoes();log('Importação Meu Dinheiro',novos+' lançamentos');save();
  toast(novos+' lançamentos importados'+(dup?' · '+dup+' já existiam':'')+(si.length?' · saldo inicial de '+si.join(', '):'')+(contasN.size?' · contas criadas: '+[...contasN].join(', '):'')+(en?' · '+en+' recebíveis ligados à maquininha':''));st.cx.contas=null;vMD()});
 $('#mdExp').onclick=()=>exportarMD(ativos().filter(l=>l.data>=$('#mdI').value&&l.data<=$('#mdF').value),'Meu_Dinheiro_'+nomeEsc(st.scope).replace(/\W+/g,'_'))};

/* ---------- contas a receber e a pagar ---------- */
if(!st.ab)st.ab={tab:'rec',ate:30,q:''};
function vAbertos(){const lim=dAdd(HOJE,st.ab.ate),rec=st.ab.tab==='rec';
 const base=ativos().filter(l=>(l.tipo==='Receita'||l.tipo==='Despesa')&&l.status!=='Conciliado'&&l.status!=='Confirmado'&&contaObj(l.conta)?.tipo!=='cartao');
 const lst=base.filter(l=>(rec?l.valor>0||ehTaxaCartao(l):l.valor<0&&!ehTaxaCartao(l))&&l.data<=lim&&(!st.ab.q||buscaOk(l.desc+' '+l.cat+' '+(l.tags||[]).join(' ')+' '+(l.contato||''),l.valor,st.ab.q))).sort((a,b)=>a.data<b.data?-1:1);
 const soma=(f)=>r2(base.filter(f).reduce((a,l)=>a+l.valor,0));const venc=l=>l.data<HOJE,ate7=l=>l.data>=HOJE&&l.data<=dAdd(HOJE,7),ate30=l=>l.data>=HOJE&&l.data<=dAdd(HOJE,30);
 const R=l=>l.valor>0||ehTaxaCartao(l),Pg=l=>l.valor<0&&!ehTaxaCartao(l);
 const dias=[...new Set(lst.map(l=>l.data))];
 $('#view').innerHTML=topo('Passo 2 e 3','Contas a receber e a pagar',`<button class="btn primary" type="button" id="abNovo">+ Novo lançamento</button>`)+bannerExemplo()+`
 <div class="kpis"><div class="kpi"><span class="l">A receber · 7 dias (líquido)</span><span class="v num pos">${brl(soma(l=>R(l)&&ate7(l)))}</span><span class="s">30 dias: ${brl(soma(l=>R(l)&&ate30(l)))}</span></div>
 <div class="kpi"><span class="l">A pagar · 7 dias</span><span class="v num neg">${brl(soma(l=>Pg(l)&&ate7(l)))}</span><span class="s">30 dias: ${brl(soma(l=>Pg(l)&&ate30(l)))}</span></div>
 <div class="kpi"><span class="l">Recebimentos atrasados</span><span class="v num ${soma(l=>R(l)&&venc(l))?'neg':''}">${brl(soma(l=>R(l)&&venc(l)))}</span><span class="s">previsto e não baixado</span></div>
 <div class="kpi"><span class="l">Pagamentos vencidos</span><span class="v num ${soma(l=>Pg(l)&&venc(l))?'neg':''}">${brl(soma(l=>Pg(l)&&venc(l)))}</span><span class="s">sem baixa</span></div></div>
 <div class="panel" style="padding:0;gap:0"><div class="panel-head" style="padding:10px 14px;border-bottom:1px solid var(--line)"><div class="tabs" style="border:0"><button type="button" data-ab="rec" class="${rec?'on':''}">A receber (com taxas)</button><button type="button" data-ab="pag" class="${rec?'':'on'}">A pagar</button></div>
 <div class="scope"><select id="abAte" aria-label="Horizonte">${[[7,'Até 7 dias'],[30,'Até 30 dias'],[90,'Até 90 dias'],[400,'Tudo']].map(([v,t])=>`<option value="${v}" ${+st.ab.ate===v?'selected':''}>${t}</option>`).join('')}</select><input type="text" id="abQ" placeholder="Buscar" value="${esc(st.ab.q)}" style="width:150px"></div></div>
 <div class="list">${dias.map(d=>{const v=lst.filter(l=>l.data===d);const t=r2(v.reduce((a,l)=>a+l.valor,0));return v.map(l=>linhaL(l)).join('')+`<div class="dayfoot"><span>${d<HOJE?'<b class="neg" style="min-width:0">vencido</b> · ':''}${SEM[D(d).getDay()]}, ${fdl(d)} · ${v.length} lançamentos</span><b class="num ${t<0?'neg':'pos'}">${val(t)}</b></div>`}).join('')||'<p class="note" style="padding:14px">Nada em aberto nesse horizonte.</p>'}</div></div>`;
 bindScope();$$('[data-ab]').forEach(b=>b.onclick=()=>{st.ab.tab=b.dataset.ab;vAbertos()});$('#abAte').onchange=e=>{st.ab.ate=+e.target.value;vAbertos()};
 $('#abQ').oninput=e=>{st.ab.q=e.target.value;clearTimeout(st._q);st._q=setTimeout(()=>{vAbertos();const q=$('#abQ');q.focus();q.setSelectionRange(q.value.length,q.value.length)},350)};
 $('#abNovo').onclick=()=>modalLanc(null,{conta:P().contaRec||contasBanco()[0]?.nome,tipo:rec?'Receita':'Despesa',status:'Pendente'});bindLinhas(vAbertos)}

/* ---------- processo do cliente ---------- */
function vProcesso(){const c=C(),p=c.perfil,ym=st.procMes||HOJE.slice(0,7),ck=p.check[ym]||{};const pode_=pode.cadastro();
 const tot=p.processo.reduce((a,s)=>a+s.i.length,0),feitos=Object.values(ck).filter(Boolean).length;
 $('#view').innerHTML=topo('Como trabalhamos este cliente','Processo do cliente',`<div class="monthnav" style="gap:4px"><button class="icobtn" type="button" id="pPrev" aria-label="Mês anterior">‹</button><b>${mNome(ym)}</b><button class="icobtn" type="button" id="pNext" aria-label="Próximo mês">›</button></div>`)+`
 <div class="panel"><div class="panel-head"><div><h3>Checklist de ${mNome(ym)}</h3><span class="note">Marque cada etapa ao concluir. Fica registrado por mês.</span></div><span class="pill ${feitos===tot?'p-ok':'p-warn'} num">${feitos} de ${tot}</span></div>
 <div style="display:grid;gap:14px">${p.processo.map((s,si)=>`<div style="display:grid;gap:6px"><div class="panel-head"><b style="font-weight:600">${si+1}. ${esc(s.t)}</b>${s.go?`<button class="btn ghost" type="button" data-go="${s.go}">Abrir</button>`:''}</div>
  ${s.i.map((t,ii)=>`<label style="display:grid;grid-template-columns:20px 1fr;gap:8px;align-items:start;font-size:14.5px"><input type="checkbox" data-ck="${si}.${ii}" ${ck[si+'.'+ii]?'checked':''} style="margin-top:4px"><span ${ck[si+'.'+ii]?'class="note" style="text-decoration:line-through"':''}>${esc(t)}</span></label>`).join('')}</div>`).join('')}</div></div>
 <div class="grid2"><div class="panel"><h3>Particularidades deste cliente</h3><ul style="margin:0;padding-left:18px;display:grid;gap:6px;font-size:14.5px">${p.partic.map(x=>`<li>${esc(x)}</li>`).join('')||'<li class="note">Nenhuma anotada.</li>'}</ul>
  ${pode_?`<form id="fPart" class="scope"><input type="text" id="ptT" placeholder="Nova particularidade" style="flex:1 1 220px" required><button class="btn" type="submit">Anotar</button></form>`:''}</div>
 <div class="panel"><h3>Maquininhas e prazos</h3><div class="tbl"><table><thead><tr><th>Estabelecimento</th><th>Nome</th><th>Prazo de recebimento</th></tr></thead><tbody>${Object.entries(p.estabs).map(([k,v])=>`<tr><td class="note num">${esc(k)}</td><td>${esc(v.nome)}</td><td class="note">${esc(v.prazo)}</td></tr>`).join('')||'<tr><td colspan="3" class="note">Nenhuma cadastrada.</td></tr>'}</tbody></table></div>
  <div class="kv"><span>Conta que recebe as vendas</span><span>${esc(p.padroes.contaRec||'—')}</span><span>Categoria crédito / débito</span><span>${esc(p.padroes.catCred)} · ${esc(p.padroes.catDeb)}</span><span>Categoria da taxa</span><span>${esc(p.padroes.catTaxa)}</span><span>Taxa de antecipação</span><span>${esc(p.padroes.catAnt)}</span><span>Categoria Pix</span><span>${esc(p.padroes.catPix)}</span></div></div></div>
 ${pode_?`<div class="panel"><div class="panel-head"><h3>Editar o passo a passo</h3><span class="note">Uma etapa por bloco: título na primeira linha, itens nas linhas seguintes começando com “-”.</span></div><textarea id="pTxt" rows="12">${esc(p.processo.map(s=>s.t+'\n'+s.i.map(x=>'- '+x).join('\n')).join('\n\n'))}</textarea><div><button class="btn primary" type="button" id="pSalvar">Salvar passo a passo</button></div></div>`:''}`;
 bindScope();$('#pPrev').onclick=()=>{st.procMes=mAdd(ym,-1);vProcesso()};$('#pNext').onclick=()=>{st.procMes=mAdd(ym,1);vProcesso()};
 $$('[data-ck]').forEach(b=>b.onchange=()=>{p.check[ym]=p.check[ym]||{};p.check[ym][b.dataset.ck]=b.checked;if(b.checked)log('Checklist',mNome(ym)+' · etapa '+b.dataset.ck);save();vProcesso()});
 if($('#fPart'))$('#fPart').onsubmit=e=>{e.preventDefault();p.partic.push($('#ptT').value.trim());save();vProcesso()};
 if($('#pSalvar'))$('#pSalvar').onclick=()=>{const gs=$('#pTxt').value.split(/\n\s*\n/).map(b=>b.split('\n').map(x=>x.trim()).filter(Boolean)).filter(b=>b.length);const antes=p.processo;p.processo=gs.map(b=>({t:b[0].replace(/^-\s*/,''),go:(antes.find(s=>s.t===b[0])||{}).go||'',i:b.slice(1).map(x=>x.replace(/^-\s*/,''))}));p.check={};log('Processo editado','');save();toast('Passo a passo salvo');vProcesso()}}

/* ---------- navegação ---------- */
navItems=function(){const p=st.user.perfil;
 if(p==='cliente')return[['','Minha empresa'],['portal','Meu painel'],['relatorios','Relatórios']];
 const it=[['','Carteira'],['painel','Visão geral'],['pendencias','Pendências'],['','Financeiro do cliente'],['processo','Processo do cliente'],['vendas','Conferência de vendas'],['abertos','Contas a receber e pagar'],['caixa','Lançamentos de caixa'],['cartoes','Cartões de crédito'],['conciliacao','Conciliação bancária'],['intel','Fixas e regras']];
 if(st.scope&&cliDe(st.scope).adq==='Stone')it.push(['stone','Recebíveis Stone']);
 it.push(['relatorios','Relatórios'],['','Configuração'],['cadastros','Contas e categorias'],['meudinheiro','Meu Dinheiro']);if(p==='master')it.push(['usuarios','Usuários e acessos']);return it};
render=function(){const pc=st.user.perfil==='cliente'?0:pendCount();
 $('#nav').innerHTML=navItems().map(([k,l])=>k?`<button type="button" data-v="${k}" class="${st.view===k?'on':''}">${l}${k==='pendencias'&&pc?`<span class="count">${pc}</span>`:''}</button>`:`<div class="grp">${l}</div>`).join('');
 $('#whoami').innerHTML=`<b>${esc(st.user.nome)}</b><br><span style="color:#9FB0C4">${PERFIL_TXT[st.user.perfil].split(' · ')[0]}</span>`;
 ({painel:vPainel,pendencias:vPend,caixa:vCaixa,cartoes:vCartoes,conciliacao:vConc,intel:vIntel,stone:vStone,relatorios:vRel,cadastros:vCad,meudinheiro:vMD,usuarios:vUsers,portal:vPortal,vendas:vVendas,abertos:vAbertos,processo:vProcesso}[st.view]||vPainel)()};
const _pendNucleo=pendencias;
pendencias=function(){const it=_pendNucleo().filter(i=>!(i.tipo==='Pagamento vencido'&&false));const c=C();const ms=[...new Set(c.vendas.avec.map(a=>a.d.slice(0,7)))].sort().slice(-2);
 ms.forEach(ym=>{const R=conferir(ym);R.av.filter(a=>['semcartao','pixfalta'].includes(a.st)).forEach(a=>it.push({tipo:a.st==='semcartao'?'Venda sem cartão na maquininha':'Pix da venda não encontrado',cls:'p-bad',data:a.d,desc:'Comanda Nº'+a.com+' - '+a.cli+' · '+a.forma,valor:a.tot,acao:'Conferir',go:'vendas'}));R.sobra.forEach(s=>it.push({tipo:'Cartão sem venda no sistema',cls:'p-warn',data:s.dt,desc:s.band+' '+s.forma+' '+s.np+'x · aut. '+s.aut,valor:s.tot,acao:'Conferir',go:'vendas'}))});
 return it.sort((a,b)=>a.data<b.data?-1:1)};
/* pendências: recebíveis de cartão atrasados aparecem como "Recebimento em atraso" pelo núcleo */


const _bindDetNucleo=bindDetalhe;
bindDetalhe=function(it,conta){_bindDetNucleo(it,conta);const inf=infoBancoCartao(it.desc);const b=$('#kConc');if(!inf||!b)return;
 const upd=()=>{const ck=$$('[data-cd]:checked');const s=r2(ck.reduce((a,x)=>a+(+x.dataset.v),0));const dif=r2(it.valor-s);if(ck.length&&dif<-.04)b.textContent='Conciliar e lançar '+brl(dif)+' de taxa de antecipação'};$$('[data-cd]').forEach(x=>x.addEventListener('change',upd));upd();
 b.onclick=()=>{const ls=$$('[data-cd]:checked').map(x=>C().lanc.find(l=>l.id===x.dataset.cd));const s=r2(ls.reduce((a,l)=>a+efeito(l,conta),0));const dif=r2(it.valor-s);
  ls.forEach(l=>{if(l.extId)desvincularExt(l)});const extra=[];
  ls.filter(l=>ehRecCartao(l)).forEach(r=>taxasDe(r).forEach(t=>{if(!ls.includes(t)&&!t.extId)extra.push(t)}));
  let todos=ls.concat(extra);const s2=r2(todos.reduce((a,l)=>a+efeito(l,conta),0));let dif2=r2(it.valor-s2);
  if(Math.abs(dif2)>Math.abs(dif)){todos=ls;dif2=dif}
  if(dif2<-.04){const t=novoL({tipo:'Despesa',status:'Conciliado',data:it.data,comp:it.data,valor:dif2,desc:'Taxa antecipação cartão '+(inf.band||''),cat:P().catAnt,conta,tags:[P().tagTaxa],card:{kind:'ant',key:'ant|'+it.id}});C().lanc.push(t);todos.push(t)}
  vincular(it,todos);todos.forEach(l=>l.data=it.data);it.lote=todos.filter(l=>ehRecCartao(l)).length;log('Lote de cartão conciliado',it.desc+' · '+todos.length+' lançamentos');save();st.conc.sel=null;toast('Lote conciliado'+(dif2<-.04?' com '+brl(dif2)+' de taxa de antecipação':''));vConc()}};

/* =====================================================================
   NUVEM · liga o app ao Firebase (login, banco de dados, usuários, clientes)
   As funções de acesso ao Firebase ficam em window.LumeNuvem (src/main.js).
   ===================================================================== */
CLIENTES.length=0;USUARIOS.length=0;DB={};
const NUVEM={carregado:new Set(),carregando:new Map(),falhou:new Set(),sujos:new Set(),timer:null,salvando:false};
const NV=()=>window.LumeNuvem;
const CLIENTES_INICIAIS=[
 {id:'inplace',nome:'Academia In Place',unidades:['Gutierrez','Barreiro'],banco:'Santander',erp:'Pacto',adq:'Getnet'},
 {id:'studio',nome:'Studio 360 Fit',unidades:['Matriz','Filial'],banco:'',erp:'',adq:'Rede'},
 {id:'rahme',nome:'Clínica Rahme',unidades:['Única'],banco:'Inter',erp:'Feegow',adq:'SumUp'},
 {id:'divina',nome:'Divina Embalagem',unidades:['Única'],banco:'',erp:'Olist Tiny',adq:'Marketplaces'},
 {id:'sala',nome:'Sala Conceito',unidades:['Única'],banco:'Sicoob',erp:'',adq:''},
 {id:'enoque',nome:'Enoque Advocacia',unidades:['Única'],banco:'Inter',erp:'',adq:''},
 {id:'dentatech',nome:'Dentatech',unidades:['Única'],banco:'',erp:'',adq:''},
 {id:'haus',nome:'Haus Private',unidades:['Única'],banco:'',erp:'',adq:''},
 {id:'beauty',nome:'The Beauty · Lívia',unidades:['Única'],banco:'Sicoob',erp:'Avec',adq:'Sipag'},
 {id:'beor',nome:'BE.OR',unidades:['Única'],banco:'',erp:'',adq:''}];
function statusNuvem(t,cls){const e=$('#nuvem');if(e){e.textContent=t;e.className='nuvem '+(cls||'')}}
function seedVazio(k){const cl=cliDe(k);const p=perfilPadrao();const banco=(cl&&cl.banco)||'Conta principal';p.padroes.contaRec=banco;
 return{contas:[{nome:banco,tipo:'banco',saldoIni:0}],lanc:[],regras:[],extratos:{},log:[],aprov:{},exemplo:false,real:true,cats:[],perfil:p,vendas:{avec:[],sipag:[]}}}
seed=function(k){const d=k===BEAUTY?seedBeauty():seedVazio(k);const cl=cliDe(k);d.cliente=k.split('|')[0];d.unidade=k.split('|')[1];d.nomeCliente=cl?cl.nome:'';return d};
C=function(){const k=st.scope;const c=DB[k];if(!c)return seedVazio(k);if(!c.perfil)c.perfil=perfilPadrao();if(!c.vendas)c.vendas={avec:[],sipag:[]};if(!c.cats)c.cats=[];if(!c.extratos)c.extratos={};if(!c.regras)c.regras=[];if(!c.log)c.log=[];if(!c.aprov)c.aprov={};return c};
escopos=function(){if(!st.user)return[];const todos=CLIENTES.flatMap(c=>(c.unidades||[]).map(u=>c.id+'|'+u));if(st.user.escopo==='*')return todos;return(st.user.escopo||[]).filter(k=>todos.includes(k))};
function carregarUnidade(k){if(!k||NUVEM.carregado.has(k))return Promise.resolve();if(NUVEM.carregando.has(k))return NUVEM.carregando.get(k);
 const p=NV().carregar(k).then(async d=>{if(!d){if(st.user.perfil!=='master')throw new Error('sem-unidade');d=seed(k);DB[k]=d;NUVEM.carregado.add(k);await NV().salvar(k,d,true)}else{DB[k]=d;NUVEM.carregado.add(k)}NUVEM.falhou.delete(k)})
  .catch(e=>{console.error(e);NUVEM.falhou.add(k);toast(e.message==='sem-unidade'?'Esta unidade ainda não foi criada pela Master.':'Não consegui carregar os dados deste cliente. Verifique a internet e tente de novo.')})
  .finally(()=>{NUVEM.carregando.delete(k);if(st.user)render()});
 NUVEM.carregando.set(k,p);return p}
save=function(){if(!st.scope||!DB[st.scope])return;NUVEM.sujos.add(st.scope);statusNuvem('Salvando…','w');clearTimeout(NUVEM.timer);NUVEM.timer=setTimeout(sincronizar,900)};
async function sincronizar(){if(NUVEM.salvando){clearTimeout(NUVEM.timer);NUVEM.timer=setTimeout(sincronizar,700);return}const ks=[...NUVEM.sujos];if(!ks.length)return;NUVEM.salvando=true;NUVEM.sujos.clear();
 try{for(const k of ks){const c=DB[k];if(!c)continue;c.resumo=resumoDe(k);await NV().salvar(k,c)}statusNuvem('Tudo salvo','ok')}
 catch(e){console.error(e);ks.forEach(k=>NUVEM.sujos.add(k));statusNuvem('Sem conexão · tentando salvar de novo','bad');clearTimeout(NUVEM.timer);NUVEM.timer=setTimeout(sincronizar,6000)}
 finally{NUVEM.salvando=false}}
window.addEventListener('beforeunload',e=>{if(NUVEM.sujos.size||NUVEM.salvando){e.preventDefault();e.returnValue=''}});
function resumoDe(k){const s0=st.scope;st.scope=k;try{const a=ativos();const ext=Object.values(C().extratos||{}).flat();const ab=l=>l.status==='Pendente'||l.status==='Agendado';
 return{n:a.length,extPend:ext.filter(i=>i.status!=='conciliado').length,recAtraso:r2(a.filter(l=>l.tipo==='Receita'&&ab(l)&&l.data<HOJE).reduce((x,l)=>x+l.valor,0)),pagVenc:r2(a.filter(l=>l.tipo==='Despesa'&&ab(l)&&l.data<HOJE).reduce((x,l)=>x+l.valor,0)),semCat:a.filter(l=>!l.cat&&l.tipo!=='Transferência'&&l.tipo!=='Pagamento').length,quando:new Date().toISOString(),por:st.user?st.user.nome:''}}finally{st.scope=s0}}
function recarregar(){const k=st.scope;if(!k)return;const go=()=>{delete DB[k];NUVEM.carregado.delete(k);NUVEM.falhou.delete(k);render()};if(NUVEM.sujos.size||NUVEM.salvando){toast('Salvando antes de recarregar…');sincronizar().then(()=>setTimeout(go,300))}else go()}

/* entrada e saída */
function entrarNuvem(u,clientes){CLIENTES.length=0;clientes.forEach(c=>CLIENTES.push(c));st.user=u;DB={};NUVEM.carregado.clear();NUVEM.falhou.clear();st.scope=escopos()[0]||null;resetViews();
 st.view=u.perfil==='cliente'?'portal':(u.perfil==='master'&&!CLIENTES.length?'clientes':'painel');$('#login').hidden=true;$('#app').hidden=false;statusNuvem('Conectado','ok');render()}
window.entrarNuvem=entrarNuvem;
function sairApp(){const fim=()=>{st.user=null;DB={};CLIENTES.length=0;NUVEM.carregado.clear();$('#app').hidden=true;$('#login').hidden=false;fecharModal();NV().sair()};if(NUVEM.sujos.size||NUVEM.salvando){toast('Salvando antes de sair…');sincronizar().then(()=>setTimeout(fim,300))}else fim()}
$('#logout').onclick=sairApp;
document.addEventListener('click',e=>{if(e.target.closest('#recarregar'))recarregar()});

/* render com carregamento por cliente */
render=function(){if(!st.user)return;const semCli=['painel','usuarios','clientes'].includes(st.view);const pronto=st.scope&&NUVEM.carregado.has(st.scope);
 const pc=(st.user.perfil==='cliente'||!pronto)?0:pendCount();
 $('#nav').innerHTML=navItems().map(([k,l])=>k?`<button type="button" data-v="${k}" class="${st.view===k?'on':''}">${l}${k==='pendencias'&&pc?`<span class="count">${pc}</span>`:''}</button>`:`<div class="grp">${l}</div>`).join('');
 $('#whoami').innerHTML=`<b>${esc(st.user.nome)}</b><br><span style="color:#9FB0C4">${PERFIL_TXT[st.user.perfil].split(' · ')[0]}</span>`;
 if(!semCli&&!st.scope){$('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Lume Conecta</div><h2>Nenhum cliente no seu acesso</h2></div></div><div class="panel"><p class="note" style="margin:0">${st.user.perfil==='master'?'Cadastre o primeiro cliente em Clientes.':'Peça à Master para liberar os clientes que você atende.'}</p>${st.user.perfil==='master'?'<div><button class="btn primary" type="button" data-go="clientes">Abrir Clientes</button></div>':''}</div>`;return}
 if(!semCli&&!pronto){const falhou=NUVEM.falhou.has(st.scope);$('#view').innerHTML=topo(falhou?'Não carregou':'Carregando',esc(nomeEsc(st.scope)))+`<div class="panel"><p class="note" style="margin:0">${falhou?'Não consegui buscar os dados deste cliente.':'Buscando os dados deste cliente…'}</p>${falhou?'<div><button class="btn primary" type="button" id="recarregar">Tentar de novo</button></div>':''}</div>`;bindScope();if(!falhou)carregarUnidade(st.scope);return}
 ({painel:vPainelNuvem,pendencias:vPend,caixa:vCaixa,cartoes:vCartoes,conciliacao:vConc,intel:vIntel,stone:vStone,relatorios:vRel,cadastros:vCad,meudinheiro:vMD,usuarios:vUsuariosNuvem,portal:vPortal,vendas:vVendas,abertos:vAbertos,processo:vProcesso,clientes:vClientes}[st.view]||vPainelNuvem)()};
const _navApp=navItems;
navItems=function(){const it=_navApp();if(st.user.perfil==='master'){const i=it.findIndex(x=>x[0]==='usuarios');it.splice(i,0,['clientes','Clientes'])}return it};

/* visão geral real */
async function vPainelNuvem(){const e=escopos();$('#view').innerHTML=`<div class="top"><div><div class="eyebrow">${mNome(HOJE.slice(0,7))}</div><h2>Visão geral da carteira</h2></div><div class="note">${e.length} unidades no seu acesso</div></div><div class="panel"><p class="note" style="margin:0">Buscando o resumo dos clientes…</p></div>`;
 let metas={};try{metas=await NV().resumos(e)}catch(err){console.error(err);$('#view').querySelector('.panel').innerHTML='<p class="note" style="margin:0">Não consegui buscar o resumo. Verifique a internet.</p>';return}
 if(st.view!=='painel')return;const mes=HOJE.slice(0,7);const linhas=e.map(k=>({k,m:metas[k]||null})).sort((a,b)=>((b.m?.resumo?.extPend||0)+(b.m?.resumo?.semCat||0))-((a.m?.resumo?.extPend||0)+(a.m?.resumo?.semCat||0)));
 const tot=f=>linhas.reduce((a,x)=>a+(x.m?.resumo?.[f]||0),0);
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">${mNome(mes)}</div><h2>Visão geral da carteira</h2></div><div class="note">${e.length} unidades no seu acesso</div></div>
 <div class="kpis"><div class="kpi"><span class="l">Extrato sem conciliar</span><span class="v num ${tot('extPend')?'neg':'pos'}">${tot('extPend')}</span><span class="s">linhas em todos os clientes</span></div>
 <div class="kpi"><span class="l">Recebimentos atrasados</span><span class="v num">${brl(tot('recAtraso'))}</span><span class="s">previstos e não baixados</span></div>
 <div class="kpi"><span class="l">Pagamentos vencidos</span><span class="v num">${brl(tot('pagVenc'))}</span><span class="s">sem baixa</span></div>
 <div class="kpi"><span class="l">Relatórios de ${MES[+mes.slice(5)-1]} liberados</span><span class="v num">${linhas.filter(x=>x.m?.aprov?.[mes]).length}/${e.length}</span><span class="s">aprovados pela Master</span></div></div>
 <div class="panel"><div class="panel-head"><h3>Andamento por unidade</h3><span class="note">Os números são atualizados cada vez que alguém salva no cliente</span></div>
 <div class="tbl"><table><thead><tr><th>Cliente / unidade</th><th>Banco · Sistema · Maquininha</th><th class="r">Lançamentos</th><th class="r">Extrato sem conciliar</th><th class="r">Sem categoria</th><th class="r">Receb. atrasados</th><th>Relatório do mês</th><th>Última atualização</th><th></th></tr></thead><tbody>
 ${linhas.map(({k,m})=>{const c=cliDe(k),r=m?.resumo;return `<tr><td><b style="font-weight:500">${esc(nomeEsc(k))}</b></td><td class="note">${esc([c.banco,c.erp,c.adq].filter(Boolean).join(' · ')||'—')}</td>
  <td class="r num">${r?r.n:'—'}</td><td class="r num ${r?.extPend?'neg':''}">${r?r.extPend:'—'}</td><td class="r num">${r?r.semCat:'—'}</td><td class="r num">${r?brl(r.recAtraso):'—'}</td>
  <td>${m?.aprov?.[mes]?'<span class="pill p-ok">Liberado</span>':'<span class="pill p-warn">Em aberto</span>'}</td><td class="note">${r?.quando?new Date(r.quando).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})+' · '+esc(r.por||''):(m?'—':'Ainda não aberto')}</td><td><button class="btn ghost" type="button" data-abrir="${esc(k)}">Abrir</button></td></tr>`}).join('')||'<tr><td colspan="9" class="note">Nenhuma unidade no seu acesso.</td></tr>'}
 </tbody></table></div></div>`;
 $$('[data-abrir]').forEach(b=>b.onclick=()=>{st.scope=b.dataset.abrir;st.cx.contas=null;st.cc.cartao=null;st.conc.conta=null;st.conc.sel=null;st.view='caixa';render()})}

/* clientes (Master) */
function slug(s){return String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,24)||'cliente'}
function vClientes(){if(st.user.perfil!=='master'){st.view='painel';return render()}
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Somente Master</div><h2>Clientes</h2></div></div>
 ${!CLIENTES.length?`<div class="panel"><div class="panel-head"><div><h3>Começar com a carteira atual</h3><span class="note">Cria os ${CLIENTES_INICIAIS.length} clientes da Lume. The Beauty já vem configurada (contas, categorias, maquininhas e processo). Bancos e sistemas em branco você completa depois.</span></div><button class="btn primary" type="button" id="clIni">Criar clientes iniciais</button></div></div>`:''}
 <div class="panel"><div class="tbl"><table><thead><tr><th>Cliente</th><th>Unidades</th><th>Banco</th><th>Sistema</th><th>Maquininha</th><th></th></tr></thead><tbody>
 ${CLIENTES.map((c,i)=>`<tr><td><b style="font-weight:500">${esc(c.nome)}</b></td><td>${(c.unidades||[]).map(esc).join(', ')}</td><td>${esc(c.banco||'—')}</td><td>${esc(c.erp||'—')}</td><td>${esc(c.adq||'—')}</td><td><button class="btn ghost" type="button" data-ecl="${i}">Editar</button></td></tr>`).join('')||'<tr><td colspan="6" class="note">Nenhum cliente cadastrado.</td></tr>'}</tbody></table></div></div>
 <div class="panel"><h3>Novo cliente</h3><form id="fCl" class="form"><div class="row"><label>Nome<input type="text" id="clN" required></label><label>Unidades (separe por vírgula)<input type="text" id="clU" value="Única" required></label></div>
 <div class="row"><label>Banco principal<input type="text" id="clB" placeholder="Sicoob, Inter, Santander…"></label><label>Sistema da empresa<input type="text" id="clE" placeholder="Avec, Pacto, Feegow…"></label><label>Maquininha<input type="text" id="clA" placeholder="Sipag, Stone, Rede…"></label></div><div><button class="btn primary" type="submit">Cadastrar cliente</button></div></form></div>`;
 if($('#clIni'))$('#clIni').onclick=async()=>{$('#clIni').disabled=true;try{for(const c of CLIENTES_INICIAIS){await criarCliente(Object.assign({},c))}toast(CLIENTES.length+' clientes criados');st.scope=escopos()[0];vClientes();render()}catch(e){console.error(e);toast('Não consegui criar os clientes. Verifique a internet.');$('#clIni').disabled=false}};
 $('#fCl').onsubmit=async e=>{e.preventDefault();const nome=$('#clN').value.trim();let id=slug(nome);while(CLIENTES.some(c=>c.id===id))id+='x';const c={id,nome,unidades:$('#clU').value.split(',').map(s=>s.trim()).filter(Boolean),banco:$('#clB').value.trim(),erp:$('#clE').value.trim(),adq:$('#clA').value.trim()};if(!c.unidades.length)c.unidades=['Única'];
  try{await criarCliente(c);toast('Cliente '+nome+' cadastrado');if(!st.scope)st.scope=escopos()[0];render()}catch(err){console.error(err);toast('Não consegui salvar. Verifique a internet.')}};
 $$('[data-ecl]').forEach(b=>b.onclick=()=>modalCliente(CLIENTES[+b.dataset.ecl]))}
async function criarCliente(c){await NV().salvarCliente(c);if(!CLIENTES.some(x=>x.id===c.id))CLIENTES.push(c);for(const u of c.unidades){const k=c.id+'|'+u;if(await NV().existeUnidade(k))continue;const d=seed(k);await NV().salvar(k,d,true)}}
function modalCliente(c){abrirModal(`<div class="mhead"><h3>Editar ${esc(c.nome)}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fEc"><div class="row"><label>Nome<input type="text" id="ecN" value="${esc(c.nome)}" required></label></div><div class="row"><label>Banco principal<input type="text" id="ecB" value="${esc(c.banco||'')}"></label><label>Sistema<input type="text" id="ecE" value="${esc(c.erp||'')}"></label><label>Maquininha<input type="text" id="ecA" value="${esc(c.adq||'')}"></label></div>
 <div class="row"><label>Nova unidade (opcional)<input type="text" id="ecU" placeholder="ex.: Filial Centro"></label></div><p class="note" style="margin:0">Unidades existentes: ${(c.unidades||[]).map(esc).join(', ')}. O nome de uma unidade não muda depois de criada.</p></form>
 <div class="mfoot"><span></span><button class="btn primary" type="submit" form="fEc">Salvar</button></div>`);
 $('#fEc').onsubmit=async e=>{e.preventDefault();const nu=$('#ecU').value.trim();Object.assign(c,{nome:$('#ecN').value.trim(),banco:$('#ecB').value.trim(),erp:$('#ecE').value.trim(),adq:$('#ecA').value.trim()});if(nu&&!c.unidades.includes(nu))c.unidades.push(nu);
  try{await criarCliente(c);fecharModal();toast('Cliente salvo');render()}catch(err){console.error(err);toast('Não consegui salvar. Verifique a internet.')}}}

/* usuários (Master) */
let _usuarios=[];
async function vUsuariosNuvem(){if(st.user.perfil!=='master'){st.view='painel';return render()}
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Somente Master</div><h2>Usuários e acessos</h2></div></div><div class="panel"><p class="note" style="margin:0">Buscando usuários…</p></div>`;
 try{_usuarios=await NV().listarUsuarios()}catch(e){console.error(e);$('#view .panel').innerHTML='<p class="note" style="margin:0">Não consegui buscar os usuários.</p>';return}
 if(st.view!=='usuarios')return;const todos=CLIENTES.flatMap(c=>c.unidades.map(u=>c.id+'|'+u));
 $('#view').innerHTML=`<div class="top"><div><div class="eyebrow">Somente Master</div><h2>Usuários e acessos</h2></div></div>
 <div class="panel"><div class="tbl"><table><thead><tr><th>Usuário</th><th>Perfil</th><th>Acesso</th><th>Situação</th><th></th></tr></thead><tbody>
 ${_usuarios.map((u,i)=>`<tr><td><b style="font-weight:500">${esc(u.nome)}</b><br><span class="note">${esc(u.email)}</span></td><td><span class="pill ${u.perfil==='master'?'p-ok':u.perfil==='cliente'?'p-warn':'p-n'}">${(PERFIL_TXT[u.perfil]||u.perfil).split(' · ')[0]}</span></td><td class="note">${u.escopo==='*'?'Todos os clientes e unidades':(u.escopo||[]).filter(k=>cliDe(k)).map(nomeEsc).join(' · ')||'—'}</td><td>${u.ativo===false?'<span class="pill p-bad">Desativado</span>':'<span class="pill p-ok">Ativo</span>'}</td><td>${u.uid!==st.user.id?`<button class="btn ghost" type="button" data-eu="${i}">Editar</button>`:''}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="panel"><h3>Novo usuário</h3><form id="fUser" class="form"><div class="row"><label>Nome<input type="text" id="nNome" required></label><label>E-mail de acesso<input type="email" id="nEmail" required></label><label>Perfil<select id="nPerfil"><option value="operador">Operadora</option><option value="estagiario">Estagiário</option><option value="cliente">Cliente</option><option value="master">Master</option></select></label></div>
 <label style="display:grid;gap:3px;font-size:12.5px;color:var(--muted)">Unidades liberadas (Ctrl ou Cmd para marcar várias · Master vê tudo)<select id="nEsc" multiple size="7">${todos.map(k=>`<option value="${esc(k)}">${esc(nomeEsc(k))}</option>`).join('')}</select></label>
 <div><button class="btn primary" type="submit">Criar acesso e enviar convite</button></div><p class="note" style="margin:0">A pessoa recebe um e-mail para criar a própria senha. Peça para olhar também o spam.</p></form></div>`;
 $('#fUser').onsubmit=async e=>{e.preventDefault();const perfil=$('#nPerfil').value;const es=perfil==='master'?'*':[...$('#nEsc').selectedOptions].map(o=>o.value);
  if(perfil!=='master'&&!es.length){toast('Marque ao menos uma unidade');return}
  if(perfil==='cliente'&&new Set(es.map(x=>x.split('|')[0])).size>1){toast('Um usuário cliente só pode ver unidades da própria empresa');return}
  const email=$('#nEmail').value.trim().toLowerCase();if(_usuarios.some(u=>u.email===email)){toast('Esse e-mail já tem acesso');return}
  const bt=e.submitter||$('#fUser button');bt.disabled=true;
  try{await NV().criarUsuario({nome:$('#nNome').value.trim(),email,perfil,escopo:es,ativo:true});toast('Acesso criado. Convite enviado para '+email);vUsuariosNuvem()}catch(err){console.error(err);toast(err.code==='auth/email-already-in-use'?'Esse e-mail já existe no login. Peça para a pessoa usar “Esqueci minha senha”, ou fale comigo para religar o acesso.':'Não consegui criar o acesso: '+(err.code||err.message));bt.disabled=false}};
 $$('[data-eu]').forEach(b=>b.onclick=()=>modalUsuario(_usuarios[+b.dataset.eu],todos))}
function modalUsuario(u,todos){abrirModal(`<div class="mhead"><h3>${esc(u.nome)}</h3><button class="icobtn" data-close type="button" aria-label="Fechar">${IX}</button></div>
 <form class="mbody form" id="fEu"><div class="row"><label>Nome<input type="text" id="euN" value="${esc(u.nome)}" required></label><label>Perfil<select id="euP">${['operador','estagiario','cliente','master'].map(p=>`<option value="${p}" ${u.perfil===p?'selected':''}>${PERFIL_TXT[p].split(' · ')[0]}</option>`).join('')}</select></label></div>
 <label style="display:grid;gap:3px;font-size:12.5px;color:var(--muted)">Unidades liberadas<select id="euE" multiple size="7">${todos.map(k=>`<option value="${esc(k)}" ${Array.isArray(u.escopo)&&u.escopo.includes(k)?'selected':''}>${esc(nomeEsc(k))}</option>`).join('')}</select></label>
 <label class="switch"><input type="checkbox" id="euA" ${u.ativo===false?'':'checked'}> Acesso ativo</label><p class="note" style="margin:0">Desativar bloqueia na hora o acesso a todos os dados. Use quando alguém sair da equipe.</p></form>
 <div class="mfoot"><button class="btn" type="button" id="euR">Reenviar e-mail de senha</button><button class="btn primary" type="submit" form="fEu">Salvar</button></div>`);
 $('#euR').onclick=async()=>{try{await NV().esqueci(u.email);toast('E-mail de senha enviado para '+u.email)}catch(e){toast('Não consegui enviar o e-mail')}};
 $('#fEu').onsubmit=async e=>{e.preventDefault();const perfil=$('#euP').value;const es=perfil==='master'?'*':[...$('#euE').selectedOptions].map(o=>o.value);
  if(perfil==='cliente'&&new Set(es.map(x=>x.split('|')[0])).size>1){toast('Um usuário cliente só pode ver unidades da própria empresa');return}
  try{await NV().salvarUsuario(u.uid,{nome:$('#euN').value.trim(),email:u.email,perfil,escopo:es,ativo:$('#euA').checked});fecharModal();toast('Acesso atualizado');vUsuariosNuvem()}catch(err){console.error(err);toast('Não consegui salvar.')}}}
