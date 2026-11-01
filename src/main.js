import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail,
  createUserWithEmailAndPassword, setPersistence, browserSessionPersistence,
} from 'firebase/auth';
import {
  initializeFirestore, doc, getDoc, getDocs, setDoc, collection, writeBatch, FieldPath, serverTimestamp, deleteField,
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
    if (!user) { carregandoLogin(false); $('#app').hidden = true; $('#login').hidden = false; return; }
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
      window.entrarNuvem(Object.assign({ id: user.uid }, u), clientes);
    } catch (err) {
      console.error(err); carregandoLogin(false);
      aviso('Não consegui abrir seu acesso (' + (err.code || err.message) + '). Confira se as regras do Firestore foram publicadas.');
      await signOut(auth);
    }
  });
}
