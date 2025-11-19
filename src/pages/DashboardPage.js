import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
// AQUI ESTAVA O ERRO: Adicionei 'setDoc' à lista de importações
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useOutletContext } from 'react-router-dom';

import Aula from '../Aula';
import MindCarePopup from '../MindCarePopup';
import CapsulaDoTempo from '../CapsulaDoTempo';

function DashboardPage() {
  
  const { user, objetivo, preferencias, trilha } = useOutletContext();
  
  const [progresso, setProgresso] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  
  // Ouvinte do Progresso
  useEffect(() => {
    if (user && objetivo) {
      const safeObjective = objetivo.replace(/[^a-zA-Z0-9]/g, '_');
      const docPath = `progresso/${user.uid}/trilhas/${safeObjective}`;
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

  useEffect(() => {
    if (trilha) {
      const timer = setTimeout(() => { setShowPopup(true); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [trilha]);

  function fecharPopup() {
    setShowPopup(false);
  }

  const handleAulaClick = async (nomeDaAula) => {
    const novoProgresso = { ...progresso };
    novoProgresso[nomeDaAula] = !novoProgresso[nomeDaAula];
    setProgresso(novoProgresso);

    try {
      const safeObjective = objetivo.replace(/[^a-zA-Z0-9]/g, '_');
      const docPath = `progresso/${user.uid}/trilhas/${safeObjective}`;
      const docRef = doc(db, docPath);
      await setDoc(docRef, { aulas: novoProgresso }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar progresso: ", error);
    }
  };

  if (!trilha) {
    return (
      <div className="dashboard">
        <h1>Bem-vindo!</h1>
        <p>Você ainda não tem uma trilha ativa. Por favor, crie uma nova trilha.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {showPopup && <MindCarePopup onClose={fecharPopup} />}

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
      
      <CapsulaDoTempo />
      
    </div>
  );
}

export default DashboardPage;