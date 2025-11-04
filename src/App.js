// PASSO 1: Importamos 'useState' E 'useEffect'
import React, { useState, useEffect } from 'react';
import './App.css';

// PASSO 2: Importamos nosso novo componente de Pop-up
import MindCarePopup from './MindCarePopup.js';

function App() {
  
  const [step, setStep] = useState(1); 
  const [objetivo, setObjetivo] = useState('');
  const [preferencias, setPreferencias] = useState('');
  
  // PASSO 3: Novo estado para controlar a visibilidade do pop-up
  const [showPopup, setShowPopup] = useState(false);

  // PASSO 4: Usamos o useEffect para criar o "timer"
  // Este código vai rodar *automaticamente* toda vez que o 'step' mudar
  useEffect(() => {
    
    // Se o usuário acabou de chegar no Dashboard (Etapa 3)
    if (step === 3) {
      
      // Criamos um timer para esperar 5 segundos (5000 milissegundos)
      const timer = setTimeout(() => {
        setShowPopup(true); // Depois de 5s, mostramos o pop-up!
      }, 5000); // 5000ms = 5 segundos

      // Isso é uma "limpeza": se o usuário sair do dashboard antes dos 5s,
      // o timer é cancelado. É uma boa prática.
      return () => clearTimeout(timer);
    }
    
  }, [step]); // A mágica está aqui: [step] diz ao React "rode isso só quando 'step' mudar"


  function proximaEtapa() {
    if (step === 1) {
      setStep(2);
    } 
    else if (step === 2) {
      setStep(3);
    }
  }

  // Função que o pop-up vai chamar para se fechar
  function fecharPopup() {
    setShowPopup(false);
  }

  return (
    <div className="container">
      
      {/* ============================================== */}
      {/* POP-UP DO MINDCARE (só aparece se 'showPopup' for true) */}
      {/* ============================================== */}
      {showPopup && <MindCarePopup onClose={fecharPopup} />}
      
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
            <button onClick={proximaEtapa} style={{backgroundColor: '#28a745'}}>
              Gerar minha TrilhaZen!
            </button>
          )}
        </div>
      )}

      {/* ETAPA 3 */}
      {step === 3 && (
        <div className="dashboard">
          <h1>Sua Trilha: {objetivo}</h1>
          <p>Baseado no seu perfil (que não gosta de {preferencias}), aqui está seu plano:</p>
          
          <div className="module">
            <h3>Módulo 1: Fundamentos</h3>
            <p>[✓] Aula: O que são variáveis</p>
            <p>[►] Aula: Loops e Condicionais</p>
            <p>[ ] Exercício: Calculadora simples</p>
          </div>

          <div className="module">
            <h3>Módulo 2: Próximos Passos</h3>
            <p>[ ] Aula: Funções e Métodos</p>
            <p>[ ] Exercício: Jogo da Forca</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;