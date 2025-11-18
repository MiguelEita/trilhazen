// Importações do React
import React, { useState, useEffect } from 'react';
import './App.css';

// Importações dos nossos componentes
import CapsulaDoTempo from './CapsulaDoTempo.js';
import MindCarePopup from './MindCarePopup.js';
import Aula from './Aula.js';
import LoginPage from './LoginPage.js';

// Importações do Firebase
import { auth, db } from './firebaseConfig.js'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
// <-- NOVO! Importamos 'getDoc' para LER um documento SÓ UMA VEZ
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore"; 

// ==========================================================
// O COMPONENTE PRINCIPAL
// ==========================================================
function App() {
  
  // === ESTADOS DE AUTENTICAÇÃO ===
  const [user, setUser] = useState(null); 
  const [authLoading, setAuthLoading] = useState(true); 

  // === ESTADOS DO TRILHAZEN ===
  const [step, setStep] = useState(0); 
  const [objetivo, setObjetivo] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [trilha, setTrilha] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [progresso, setProgresso] = useState({});

  // ==========================================================
  // !! "OUVINTES" (useEffect)
  // ==========================================================

// "Ouvinte" de Autenticação (CORRIGIDO)
  useEffect(() => {
    // onAuthStateChanged é o "ouvinte" do Firebase.
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Usuário está logado
        setUser(currentUser);
        
        // Vamos buscar o 'objetivo' salvo dele
        const userDocRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().objetivoAtual) {
          // Se ele TEM um objetivo salvo...
          const objetivoSalvo = docSnap.data().objetivoAtual;
          
          // <-- A CORREÇÃO ESTÁ AQUI:
          // Pega a preferência salva do banco de dados
          const preferenciasSalvas = docSnap.data().preferencias || ''; 
          
          setObjetivo(objetivoSalvo); // Carrega o objetivo
          setPreferencias(preferenciasSalvas); // <-- E CARREGA A PREFERÊNCIA!

          // Gera a trilha (simulada) para esse objetivo
          gerarTrilhaSimulada(objetivoSalvo, preferenciasSalvas);
          
          setStep(3); // PULA DIRETO PARA O DASHBOARD!
        } else {
          // Se não tem objetivo salvo, começa o onboarding
          setStep(0); // Começa na Splash Screen
        }
        setAuthLoading(false);

      } else {
        // Usuário está deslogado
        setUser(null);
        setAuthLoading(false);
        setStep(0); // Reseta para o início
      }
    });
    return () => unsubscribe();
  }, []); // O '[]' vazio faz isso rodar só UMA VEZ no início

  
  // "Ouvinte" do Progresso (Firestore)
  // (Este está como antes, mas agora depende do 'objetivo' ser carregado primeiro)
  useEffect(() => {
    if (user && objetivo) {
      const docPath = `progresso/${user.uid}/trilhas/${objetivo}`;
      const docRef = doc(db, docPath);

      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setProgresso(docSnap.data().aulas || {});
        } else {
          setProgresso({});
        }
      });
      return () => unsubscribe();
    }
  }, [user, objetivo]); // Depende do 'user' e 'objetivo'


  // Timers da Splash e MindCare (sem mudanças)
  useEffect(() => {
    if (step === 3 && trilha) {
      const timer = setTimeout(() => { setShowPopup(true); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, trilha]);

  useEffect(() => {
    // Só roda a splash se o usuário NÃO pulou direto pro dashboard
    if (step === 0 && !authLoading) { 
      const splashTimer = setTimeout(() => { setStep(1); }, 2500);
      return () => clearTimeout(splashTimer);
    }
  }, [step, authLoading]);
  
  // ==========================================================
  // !! FUNÇÕES PRINCIPAIS
  // ==========================================================

  // <-- NOVO! Função para gerar a trilha (separada)
  const gerarTrilhaSimulada = (obj, pref) => {
    setIsLoading(true);
    const dadosSimulados = {
      "trilha": [
        {"modulo": `Módulo 1: Fundamentos (para ${obj})`, "aulas": ["Aula de Boas-Vindas", "Exercício Prático de Lógica", "Desafio: Seu Primeiro Projeto"]},
        {"modulo": "Módulo 2: Tópicos de Bem-Estar", "aulas": ["Técnica para quando você " + pref, "Aula Prática de Respiração", "Projeto Final Simulado"]}
      ]
    };
    
    // Simula o tempo de carregamento
    setTimeout(() => {
      setTrilha(dadosSimulados.trilha);
      setIsLoading(false);
    }, 1000); // 1 segundo
  };
  

// ==========================================================
// !! FUNÇÃO 'proximaEtapa' (VERSÃO IA REAL - ONLINE) !!
// ==========================================================
async function proximaEtapa() {
  if (step === 1) {
    // Salva o objetivo
    try {
      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, { objetivoAtual: objetivo }, { merge: true });
      setStep(2);
    } catch (error) {
      console.error("Erro ao salvar objetivo: ", error);
      setError("Não foi possível salvar seu objetivo.");
    }
  } 
  else if (step === 2) {
    // Salva as preferências e GERA A TRILHA
    setStep(3);
    setIsLoading(true);
    setError(null);

    try {
      // Salva as preferências
      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, { preferencias: preferencias }, { merge: true });

      // 1. Chamar nossa API ONLINE NO RENDER!
      const response = await fetch('https://trilhazen-api.onrender.com/gerar-trilha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objetivo: objetivo,
          preferencias: preferencias,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da API');
      }

      const data = await response.json(); 
      setTrilha(data.trilha); // Salva a trilha real

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }
}

  function fecharPopup() {
    setShowPopup(false);
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O "ouvinte" lá em cima vai cuidar de resetar os estados
      setTrilha(null);
      setObjetivo('');
      setPreferencias('');
      setProgresso({});
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  // Salvar Progresso (como antes)
  const handleAulaClick = async (nomeDaAula) => {
    const novoProgresso = { ...progresso };
    novoProgresso[nomeDaAula] = !novoProgresso[nomeDaAula];
    setProgresso(novoProgresso);

    try {
      const docPath = `progresso/${user.uid}/trilhas/${objetivo}`;
      const docRef = doc(db, docPath);
      await setDoc(docRef, { aulas: novoProgresso });
    } catch (error) {
      console.error("Erro ao salvar progresso: ", error);
    }
  };

  // ==========================================================
  // !! RENDER (O QUE APARECE NA TELA)
  // ==========================================================

  if (authLoading) {
    return <div className="login-container"><h1 className="splash-logo">Carregando...</h1></div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  // Se o usuário está logado, o 'step' decide o que mostrar
  return (
    <div className="container">
      
      <button onClick={handleLogout} className="logout-button">
        Sair (Logout)
      </button>

      {/* ETAPA 0: SPLASH */}
      {step === 0 && (
        <div className="splash-screen">
          <h1 className="splash-logo">TrilhaZen</h1>
          <p className="splash-tagline">Bem-vindo, {user.displayName}!</p>
        </div>
      )}
      
      {/* ETAPA 1: OBJETIVO */}
      {step === 1 && (
        <div className="onboarding-box">
          <h2>Vamos começar, {user.displayName}?</h2>
          <p>Qual é o seu grande objetivo de aprendizado?</p>
          <input 
            type="text" 
            placeholder="Ex: Aprender Python para Análise de Dados"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />
          <button onClick={proximaEtapa}>Próximo</button>
        </div>
      )}

      {/* ETAPA 2: PREFERÊNCIAS */}
      {step === 2 && (
        <div className="onboarding-box">
          <h2>Parte 2: O Bem-Estar (o "MindCare")</h2>
          <p>O que mais te frustra ou causa ansiedade ao estudar?</p>
          <button className="option-button" onClick={() => setPreferencias('ficar preso num erro')}>Ficar preso em um erro</button>
          <button className="option-button" onClick={() => setPreferencias('não ver meu progresso')}>Não ver meu progresso</button>
          <button className="option-button" onClick={() => setPreferencias('muita teoria')}>Muita teoria e pouca prática</button>
          
          {preferencias !== '' && (
            <button onClick={proximaEtapa} className="primary-action">Gerar minha TrilhaZen!</button>
          )}
        </div>
      )}

      {/* POP-UP DO MINDCARE */}
      {showPopup && <MindCarePopup onClose={fecharPopup} />}

      {/* ETAPA 3: DASHBOARD */}
      {step === 3 && (
        <div className="dashboard">
          {isLoading && <p>Sua TrilhaZen está sendo gerada...</p>}
          {error && <p style={{color: 'red'}}>Erro: {error}</p>}
          {trilha && !isLoading && !error && (
            <div>
              <h1>Sua Trilha: {objetivo}</h1>
              <p>Baseado no seu perfil (que não gosta de {preferencias}), aqui está seu plano:</p>
              
              {trilha.map((mod, index) => (
                <div className="module" key={index}>
                  <h3>{mod.modulo}</h3>
                  {mod.aulas.map((aula, i) => (
                    <Aula 
                      key={i} 
                      nome={aula} 
                      concluido={progresso[aula] || false} 
                      onAulaClick={() => handleAulaClick(aula)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

      {/* ============================================== */}
      {/* !! O CÓDIGO DA CÁPSULA VAI AQUI !!          */}
      {/* (Nós o colocamos dentro da mesma verificação 'trilha && ...' 
          para que ele apareça junto com a trilha) */}
      {/* ============================================== */}
      {trilha && !isLoading && !error && (
        <CapsulaDoTempo />
      )}

        </div>
      )}
    </div>
  );
}

export default App;