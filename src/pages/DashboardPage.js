import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useOutletContext } from 'react-router-dom';

import Aula from '../Aula';
import MindCarePopup from '../MindCarePopup';
import CapsulaDoTempo from '../CapsulaDoTempo';
import MoodTracker from '../components/MoodTracker';

function DashboardPage() {
  
  // Recebe os dados globais vindos do Layout/App.js
  // Nota: 'trilha' aqui pode vir do Firestore (se já salvo) ou ser null
  const { user, objetivo, preferencias, trilha: trilhaInicial } = useOutletContext();
  
  const [trilha, setTrilha] = useState(trilhaInicial);
  const [progresso, setProgresso] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [loadingTrilha, setLoadingTrilha] = useState(false);
  
  // Atualiza a trilha local se o contexto mudar (ex: carregou do Firestore)
  useEffect(() => {
    if (trilhaInicial) {
      setTrilha(trilhaInicial);
    }
  }, [trilhaInicial]);

  // --- Ouvinte do Progresso (Lê do Banco de Dados) ---
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

  // --- Timer do Pop-up de Bem-Estar ---
  useEffect(() => {
    if (trilha) {
      const timer = setTimeout(() => { setShowPopup(true); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [trilha]);

  function fecharPopup() {
    setShowPopup(false);
  }

  // --- Função para Salvar Progresso ao Clicar ---
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

  // Se não houver trilha, mostra mensagem (ou poderia tentar buscar novamente)
  if (!trilha && !loadingTrilha) {
     // Se chegamos aqui sem trilha, provavelmente é porque o usuário
     // acessou a rota / diretamente sem passar pelo "Nova Trilha".
     return (
      <div className="dashboard">
        <h1>Bem-vindo!</h1>
        <p>Você ainda não tem uma trilha ativa para "{objetivo}".</p>
        <p>Por favor, vá em "Nova Trilha" para criar uma.</p>
      </div>
    );
  }

  if (loadingTrilha) {
      return (
        <div className="dashboard">
          <p>Carregando sua trilha e vídeos...</p>
        </div>
      )
  }

  return (
    <div className="dashboard">
      {showPopup && <MindCarePopup onClose={fecharPopup} />}
      
      <MoodTracker />

      <div>
        <h1>Sua Trilha: {objetivo}</h1>
        <p>Baseado no seu perfil (que não gosta de {preferencias}), aqui está seu plano:</p>
        
        {trilha.map((mod, index) => (
          <div className="module" key={index}>
            <h3>{mod.modulo}</h3>
            {mod.aulas.map((aulaObj, i) => {
               // Lógica para suportar tanto o formato antigo (string) quanto o novo (objeto com vídeo)
               // A API nova retorna objetos: { titulo: "Nome", video: { id: "...", ... } }
               const nomeAula = typeof aulaObj === 'string' ? aulaObj : aulaObj.titulo;
               const videoInfo = typeof aulaObj === 'string' ? null : aulaObj.video;

               return (
                <Aula 
                    key={i} 
                    nome={nomeAula}
                    // Passa o objeto de vídeo para o componente Aula (que deve saber renderizá-lo)
                    video={videoInfo} 
                    concluido={progresso[nomeAula] || false} 
                    onAulaClick={() => handleAulaClick(nomeAula)}
                />
               );
            })}
          </div>
        ))}
      </div>
      
      <CapsulaDoTempo />
      
    </div>
  );
}

export default DashboardPage;