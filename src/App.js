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

  // "Ouvinte" de Autenticação (Chama a IA REAL)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Usuário está logado
        setUser(currentUser);
        const userDocRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().objetivoAtual) {
          // Se ele TEM um objetivo salvo...
          const objetivoSalvo = docSnap.data().objetivoAtual;
          const preferenciasSalvas = docSnap.data().preferencias || ''; 
          
          setObjetivo(objetivoSalvo);
          setPreferencias(preferenciasSalvas);

          // <-- MUDANÇA IMPORTANTE!
          // Chama a função da IA REAL
          fetchTrilhaReal(objetivoSalvo, preferenciasSalvas);
          
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
  }, []); // '[]' Vazio. Roda só uma vez.

  
  // "Ouvinte" do Progresso (Firestore)
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
  }, [user, objetivo]);


  // Timers da Splash e MindCare (sem mudanças)
  useEffect(() => {
    if (step === 3 && trilha) {
      const timer = setTimeout(() => { setShowPopup(true); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, trilha]);

  useEffect(() => {
    if (step === 0 && !authLoading) { 
      const splashTimer = setTimeout(() => { setStep(1); }, 2500);
      return () => clearTimeout(splashTimer);
    }
  }, [step, authLoading]);
  
  // ==========================================================
  // !! FUNÇÕES PRINCIPAIS
  // ==========================================================

  // <-- NOVO! Esta é a ÚNICA função que gera a trilha
  // Ela chama a API real no Render.com
  const fetchTrilhaReal = async (obj, pref) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://trilhazen-api.onrender.com/gerar-trilha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objetivo: obj,
          preferencias: pref,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da API. O servidor pode estar "acordando" (cold start).');
      }

      const data = await response.json(); 
      setTrilha(data.trilha); // Salva a trilha real

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  // 'proximaEtapa' (MODIFICADA para chamar a IA REAL)
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
      // Salva as preferências
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        await setDoc(userDocRef, { preferencias: preferencias }, { merge: true });

        // <-- MUDANÇA IMPORTANTE!
        // Chama a função da IA REAL
        fetchTrilhaReal(objetivo, preferencias);
        
        setStep(3);
        setProgresso({}); // Reseta o progresso para a nova trilha
      } catch (error) {
        console.error("Erro ao salvar preferências: ", error);
      }
    }
  }

  // (O resto das funções handleLogout, handleAulaClick, etc. continuam iguais)

  function fecharPopup() {
    setShowPopup(false);
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTrilha(null);
      setObjetivo('');
      setPreferencias('');
      setProgresso({});
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

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
          
          {/* A Cápsula do Tempo */}
          {trilha && !isLoading && !error && (
            <CapsulaDoTempo />
          )}

        </div>
      )}
    </div>
  );
}

export default App;