import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig'; // Ajusta o caminho
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useOutletContext } from 'react-router-dom'; // Hook para receber dados do "pai"

// Importa os componentes
import Aula from '../Aula';
import MindCarePopup from '../MindCarePopup';
import CapsulaDoTempo from '../CapsulaDoTempo';

// Página principal que mostra a trilha e a cápsula
function DashboardPage() {
  
  // Pega os dados do usuário e o objetivo que o "pai" (Layout.js) nos passou
  const { user, objetivo, preferencias, trilha } = useOutletContext();
  
  const [progresso, setProgresso] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Embora a trilha venha pronta, guardamos para futuros re-loads
  const [error, setError] = useState(null);

  // "Ouvinte" do Progresso (Firestore)
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

  // Timer do MindCare Popup
  useEffect(() => {
    if (trilha) { // Se a trilha existe
      const timer = setTimeout(() => { setShowPopup(true); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [trilha]);

  function fecharPopup() {
    setShowPopup(false);
  }

  // Função para salvar o progresso (igual à do App.js antigo)
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


  // --- Renderização ---
  
  if (isLoading) {
    return <div className="dashboard"><p>Carregando sua trilha...</p></div>;
  }
  
  if (error) {
     return <div className="dashboard"><p style={{color: 'red'}}>{error}</p></div>;
  }

  // Se não tem trilha (acontece se o usuário burlar o sistema)
  if (!trilha) {
    return (
      <div className="dashboard">
        <h1>Bem-vindo!</h1>
        <p>Você ainda não tem uma trilha ativa. Por favor, crie uma nova trilha.</p>
        {/* Futuramente, podemos adicionar um botão <Link to="/nova">Criar Trilha</Link> aqui */}
      </div>
    );
  }

  // Renderização principal (Dashboard)
  return (
    <div className="dashboard">
      {/* Pop-up do MindCare */}
      {showPopup && <MindCarePopup onClose={fecharPopup} />}

      {/* Bloco da Trilha */}
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
      
      {/* Bloco da Cápsula do Tempo */}
      <CapsulaDoTempo />
      
    </div>
  );
}

export default DashboardPage;