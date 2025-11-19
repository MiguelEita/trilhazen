import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc } from "firebase/firestore"; 
import { useNavigate, useOutletContext } from 'react-router-dom';

function NovaTrilhaPage() {
  
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [objetivo, setObjetivo] = useState('');
  const [preferencias, setPreferencias] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function proximaEtapa() {
    if (step === 1) {
      // Etapa 1: Salvar Objetivo
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        // Importante: Limpamos a trilha antiga para forçar uma nova
        await setDoc(userDocRef, { 
          objetivoAtual: objetivo, 
          trilhaSalva: null,
          preferencias: ''
        }, { merge: true }); 
        
        setStep(2);
      } catch (error) {
        console.error("Erro ao salvar objetivo: ", error);
        setError("Não foi possível salvar seu objetivo.");
      }
    } 
    else if (step === 2) {
      // Etapa 2: Preferências e Geração da Trilha (CHAMADA À API)
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Salvar preferências
        const userDocRef = doc(db, "usuarios", user.uid);
        await setDoc(userDocRef, { preferencias: preferencias }, { merge: true });

        // 2. Resetar o progresso antigo
        const safeObjective = objetivo.replace(/[^a-zA-Z0-9]/g, '_');
        const docPath = `progresso/${user.uid}/trilhas/${safeObjective}`;
        const docRef = doc(db, docPath);
        await setDoc(docRef, { aulas: {} });

        // 3. CHAMAR A API REAL (NO RENDER)
        // Esta chamada vai ao teu backend, que fala com OpenAI e YouTube
        const response = await fetch('https://trilhazen-api.onrender.com/gerar-trilha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objetivo: objetivo,
            preferencias: preferencias,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao comunicar com o servidor. Tente novamente em alguns segundos.');
        }

        const data = await response.json(); 
        
        // 4. SALVAR A TRILHA "RICA" (COM VÍDEOS) NO FIRESTORE
        await setDoc(userDocRef, { trilhaSalva: data.trilha }, { merge: true });
        
        // 5. Redirecionar para o Dashboard
        navigate('/');

      } catch (err) {
        console.error(err);
        setError("Falha ao gerar a trilha. O servidor pode estar a reiniciar. Tente de novo!");
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="onboarding-box" style={{textAlign: 'center', margin: '40px auto'}}>
        <h3>A criar a sua TrilhaZen...</h3>
        <p>A nossa IA está a desenhar o plano e a procurar os melhores vídeos no YouTube.</p>
        <p style={{fontSize: '12px', color: '#9ca3af', marginTop: '10px'}}>(Isto pode demorar cerca de 30-60 segundos)</p>
      </div>
    );
  }

  return (
    <>
      {step === 1 && (
        <div className="container" style={{paddingTop: '40px'}}>
          <div className="onboarding-box">
            <h2>Criar Nova Trilha</h2>
            <p>Qual é o seu novo grande objetivo de aprendizado?</p>
            <input 
              type="text" 
              placeholder="Ex: Aprender React do zero"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
            <button onClick={proximaEtapa}>Próximo</button>
            {error && <p style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="container" style={{paddingTop: '40px'}}>
          <div className="onboarding-box">
            <h2>Parte 2: O Bem-Estar</h2>
            <p>O que mais te frustra ou causa ansiedade ao estudar?</p>
            <button className="option-button" onClick={() => setPreferencias('ficar preso num erro')}>Ficar preso num erro</button>
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