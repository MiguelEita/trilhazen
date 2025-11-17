import React, { useState, useEffect } from 'react';
import './App.css';
import MindCarePopup from './MindCarePopup.js';

function App() {
  
  const [step, setStep] = useState(0); 
  const [objetivo, setObjetivo] = useState('');
  const [preferencias, setPreferencias] = useState('');
  
  // NOVO ESTADO: Para guardar a trilha que a IA vai mandar
  const [trilha, setTrilha] = useState(null); 
  
  // NOVO ESTADO: Para mostrar "Carregando..."
  const [isLoading, setIsLoading] = useState(false);
  
  // NOVO ESTADO: Para mostrar mensagens de erro
  const [error, setError] = useState(null);
  
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // O timer do pop-up só deve ligar se a trilha já foi carregada
    if (step === 3 && trilha) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, trilha]);

  // NOVO: Timer da Splash Screen
// Este useEffect vai rodar APENAS UMA VEZ (note o '[]' no final)
useEffect(() => {

  // Se estamos na Etapa 0 (Splash)...
  if (step === 0) {

    // Crie um timer de 2.5 segundos (2500ms)
    const splashTimer = setTimeout(() => {
      setStep(1); //...e então pule para a Etapa 1
    }, 2500); // Duração total da splash

    // Limpa o timer (boa prática)
    return () => clearTimeout(splashTimer);
  }
}, [step]); // Depende do 'step' para rodar (mas só vai pegar o 0)

// ==========================================================
  // !! FUNÇÃO 'proximaEtapa' (VERSÃO IA REAL - CORRIGIDA) !!
  // ==========================================================
  async function proximaEtapa() {
    if (step === 1) {
      setStep(2);
    } 
    else if (step === 2) {
      // Começa a Etapa 3: Mostrar "Carregando"
      setStep(3);
      setIsLoading(true); // Liga o loading
      setError(null);     // Limpa erros antigos

      try {
        // 1. Chamar nossa API de back-end LOCAL!
          const response = await fetch('https://trilhazen-api.onrender.com/gerar-trilha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ // Envia os dados para a IA
            objetivo: objetivo,
            preferencias: preferencias,
          }),
        });

        if (!response.ok) {
          // Se a API falhar (ex: 500), joga um erro
          throw new Error('Erro ao buscar dados da API');
        }

        // 2. Recebe o JSON da IA
        const data = await response.json(); 
        
        // 3. Salva a trilha no nosso "estado"
        setTrilha(data.trilha); // 'data.trilha' vem da estrutura do JSON

      } catch (err) {
        // 4. Se der erro, salva a mensagem de erro
        setError(err.message);
      } finally {
        // 5. Independente de sucesso ou erro, desliga o "Carregando"
        setIsLoading(false);
      }
      
      // !! A PARTE QUE CAUSAVA O ERRO FOI REMOVIDA DAQUI !!
      // (Não há mais 'setTimeout' ou 'dadosSimulados' aqui)
    }
  }
  
  function fecharPopup() {
    setShowPopup(false);
  }

return (
    <div className="container">
      
      {/* ============================================== */}
      {/* ETAPA 0: SPLASH SCREEN (Corrigido)             */}
      {/* ============================================== */}
      {step === 0 && (
        <div className="splash-screen">
          <h1 className="splash-logo">TrilhaZen</h1>
          <p className="splash-tagline">Aprender nunca foi tão tranquilo.</p>
        </div>
      )}

      {/* ============================================== */}
      {/* POP-UP DO MINDCARE (Já existia)                */}
      {/* ============================================== */}
      {showPopup && <MindCarePopup onClose={fecharPopup} />}
      
      {/* ============================================== */}
      {/* ETAPA 1: APARECE SOMENTE SE 'step' FOR 1      */}
      {/* ============================================== */}
      {step === 1 && (
        <div className="onboarding-box">
          <h2>Vamos começar?</h2>
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

      {/* ============================================== */}
      {/* ETAPA 2: APARECE SOMENTE SE 'step' FOR 2      */}
      {/* ============================================== */}
      {step === 2 && (
        <div className="onboarding-box">
          <h2>Parte 2: O Bem-Estar (o "MindCare")</h2>
          <p>O que mais te frustra ou causa ansiedade ao estudar?</p>
          
          <button className="option-button" onClick={() => setPreferencias('ficar preso num erro')}>
            Ficar preso em um erro
          </button>
          <button className="option-button" onClick={() => setPreferencias('não ver meu progresso')}>
            Não ver meu progresso
          </button>
          <button className="option-button" onClick={() => setPreferencias('muita teoria')}>
            Muita teoria e pouca prática
          </button>
          
          {preferencias !== '' && (
            <button onClick={proximaEtapa} className="primary-action">
              Gerar minha TrilhaZen!
            </button>
          )}
        </div>
      )}

      {/* ============================================== */}
      {/* ETAPA 3: APARECE SOMENTE SE 'step' FOR 3      */}
      {/* ============================================== */}
      {step === 3 && (
        <div className="dashboard">
          
          {/* Se estiver carregando, mostra "Carregando..." */}
          {/* (No plano de segurança, mudamos o texto) */}
          {isLoading && <p>Sua TrilhaZen está sendo gerada...</p>}
          
          {/* Se der erro, mostra o erro */}
          {error && <p style={{color: 'red'}}>Erro: {error}</p>}

          {/* Se a trilha já chegou (e não está carregando nem deu erro) */}
          {trilha && !isLoading && !error && (
            <div>
              <h1>Sua Trilha: {objetivo}</h1>
              <p>Baseado no seu perfil (que não gosta de {preferencias}), aqui está seu plano:</p>
              
              {trilha.map((mod, index) => (
                <div className="module" key={index}>
                  <h3>{mod.modulo}</h3>
                  {mod.aulas.map((aula, i) => (
                    <p key={i}>[ ] {aula}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default App;