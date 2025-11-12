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
  // !! FUNÇÃO 'proximaEtapa' COM A IA SIMULADA (PLANO DE SEGURANÇA) !!
  // ==========================================================
  async function proximaEtapa() {
    if (step === 1) {
      setStep(2);
    } 
    else if (step === 2) {
      // Vai para a Etapa 3 e liga o "Carregando"
      setStep(3);
      setIsLoading(true);
      setError(null);

      // --- INÍCIO DA SIMULAÇÃO ---
      // 1. Estes são os dados "falsos" que vamos mostrar.
      //    Note que eles ainda usam as variáveis 'objetivo' e 'preferencias'
      //    para parecer personalizado!
      const dadosSimulados = {
        "trilha": [
          {
            "modulo": `Módulo 1: Fundamentos (para ${objetivo})`,
            "aulas": [
              "Aula de Boas-Vindas",
              "Exercício Prático de Lógica",
              "Desafio: Seu Primeiro Projeto"
            ]
          },
          {
            "modulo": "Módulo 2: Tópicos de Bem-Estar",
            "aulas": [
              "Técnica para quando você " + preferencias,
              "Aula Prática de Respiração",
              "Projeto Final Simulado"
            ]
          }
        ]
      };

      // 2. Simula um "delay" de rede de 1.5 segundos (para parecer real)
      setTimeout(() => {
        setTrilha(dadosSimulados.trilha); // Define a trilha falsa
        setIsLoading(false); // Desliga o "Carregando"
      }, 1500); // 1500ms = 1.5 segundos
      // --- FIM DA SIMULAÇÃO ---
    }
  }
  
  function fecharPopup() {
    setShowPopup(false);
  }

  return (
    <div className="container">
      
      {showPopup && <MindCarePopup onClose={fecharPopup} />}

      <div className="container">

  {/* ============================================== */}
  {/* !! NOVO !! ETAPA 0: SPLASH SCREEN               */}
  {/* ============================================== */}
  {step === 0 && (
    <div className="splash-screen">
      <h1 className="splash-logo">TrilhaZen</h1>
      <p className="splash-tagline">Aprender nunca foi tão tranquilo.</p>
    </div>
  )}

  {showPopup && <MindCarePopup onClose={fecharPopup} />}

  {/* ETAPA 1 ... (o resto do seu código continua aqui) */}
      
      {/* ETAPA 1 */}
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

      {/* ETAPA 2 */}
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

      {/* ========================================================== */}
      {/* ETAPA 3 ATUALIZADA */}
      {/* ========================================================== */}
      {step === 3 && (
        <div className="dashboard">
          
          {/* Se estiver carregando, mostra "Carregando..." */}
          {isLoading && <p>Sua TrilhaZen está sendo gerada pela IA...</p>}
          
          {/* Se der erro, mostra o erro */}
          {error && <p style={{color: 'red'}}>Erro: {error}</p>}

          {/* Se a trilha já chegou (e não está carregando nem deu erro) */}
          {trilha && !isLoading && !error && (
            <div>
              <h1>Sua Trilha: {objetivo}</h1>
              <p>Baseado no seu perfil (que não gosta de {preferencias}), aqui está seu plano:</p>
              
              {/* Agora lemos a trilha REAL que veio da IA */}
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