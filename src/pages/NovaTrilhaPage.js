import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Ajusta o caminho
import { doc, setDoc } from "firebase/firestore"; 
import { useNavigate, useOutletContext } from 'react-router-dom'; // Hook para navegar

// Página de Onboarding (Etapas 1 e 2)
function NovaTrilhaPage() {
  
  const { user } = useOutletContext(); // Pega o usuário logado do "pai"
  const navigate = useNavigate(); // Hook para nos permitir mudar de página

  // Estados locais SÓ para esta página
  const [step, setStep] = useState(1); // Controla a Etapa 1 ou 2
  const [objetivo, setObjetivo] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função 'proximaEtapa' (lógica do onboarding)
  async function proximaEtapa() {
    if (step === 1) {
      // Salva o objetivo no perfil do usuário
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        // Salva o objetivo e ZERA a trilha salva antiga
        await setDoc(userDocRef, { 
          objetivoAtual: objetivo, 
          trilhaSalva: null, // Força a geração de uma nova trilha
          preferencias: ''  // Reseta as preferências
        }, { merge: true }); 
        
        setStep(2); // Avança para a Etapa 2
        
      } catch (error) {
        console.error("Erro ao salvar objetivo: ", error);
        setError("Não foi possível salvar seu objetivo.");
      }
    } 
    else if (step === 2) {
      // Etapa 2: Salva as preferências E GERA A TRILHA
      setIsLoading(true);
      setError(null);
      
      // Reseta o progresso para a nova trilha
      const safeObjective = objetivo.replace(/[^a-zA-Z0-9]/g, '_');
      const docPath = `progresso/${user.uid}/trilhas/${safeObjective}`;
      const docRef = doc(db, docPath);
      await setDoc(docRef, { aulas: {} }); // Zera o progresso

      try {
        // Salva as preferências
        const userDocRef = doc(db, "usuarios", user.uid);
        await setDoc(userDocRef, { preferencias: preferencias }, { merge: true });

        // Chama a API REAL no Render
        const response = await fetch('https://trilhazen-api.onrender.com/gerar-trilha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objetivo: objetivo,
            preferencias: preferencias,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados da API. O servidor pode estar "acordando". Tente novamente em 30s.');
        }

        const data = await response.json(); 
        
        // Salva a trilha GERADA no banco de dados!
        await setDoc(userDocRef, { trilhaSalva: data.trilha }, { merge: true });
        
        // NAVEGA O USUÁRIO DE VOLTA PARA O DASHBOARD!
        navigate('/'); // O "ouvinte" no App.js vai recarregar a página com a nova trilha

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }

  // --- Renderização ---

  // Se estiver gerando a trilha (Etapa 2), mostra "Carregando"
  if (isLoading) {
    return (
      <div className="onboarding-box" style={{textAlign: 'center', margin: '40px auto'}}>
        <p>Gerando sua nova TrilhaZen pela IA...</p>
        <p>(Isso pode levar até 50 segundos se o servidor estiver "acordando")</p>
      </div>
    );
  }

  // Renderização principal (Onboarding)
  return (
    <>
      {/* ETAPA 1: OBJETIVO */}
      {step === 1 && (
        <div className="container" style={{paddingTop: '40px'}}>
          <div className="onboarding-box">
            <h2>Criar Nova Trilha</h2>
            <p>Qual é o seu novo grande objetivo de aprendizado?</p>
            <input 
              type="text" 
              placeholder="Ex: Aprender Python para Análise de Dados"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
            <button onClick={proximaEtapa}>Próximo</button>
            {error && <p style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
          </div>
        </div>
      )}

      {/* ETAPA 2: PREFERÊNCIAS */}
      {step === 2 && (
        <div className="container" style={{paddingTop: '40px'}}>
          <div className="onboarding-box">
            <h2>Parte 2: O Bem-Estar</h2>
            <p>O que mais te frustra ou causa ansiedade ao estudar?</p>
            <button className="option-button" onClick={() => setPreferencias('ficar preso num erro')}>Ficar preso em um erro</button>
            <button className="option-button" onClick={() => setPreferencias('não ver meu progresso')}>Não ver meu progresso</button>
            <button className="option-button" onClick={() => setPreferencias('muita teoria')}>Muita teoria e pouca prática</button>
            
            {preferencias !== '' && (
              <button onClick={proximaEtapa} className="primary-action">Gerar minha TrilhaZen!</button>
            )}
            {error && <p style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default NovaTrilhaPage;