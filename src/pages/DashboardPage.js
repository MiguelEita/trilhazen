import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useOutletContext } from 'react-router-dom';

import Aula from '../Aula';
import MindCarePopup from '../MindCarePopup';
import CapsulaDoTempo from '../CapsulaDoTempo';
import MoodTracker from '../components/MoodTracker'; // Importamos o MoodTracker

function DashboardPage() {
  
  // Recebe os dados globais vindos do Layout/App.js
  const { user, objetivo, preferencias, trilha } = useOutletContext();
  
  const [progresso, setProgresso] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  
  // --- Ouvinte do Progresso (Lê do Banco de Dados) ---
  useEffect(() => {
    if (user && objetivo) {
      // Remove caracteres especiais para criar um ID seguro
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
    novoProgresso[nomeDaAula] = !novoProgresso[nomeDaAula]; // Inverte (true/false)
    setProgresso(novoProgresso); // Atualiza visualmente rápido

    try {
      const safeObjective = objetivo.replace(/[^a-zA-Z0-9]/g, '_');
      const docPath = `progresso/${user.uid}/trilhas/${safeObjective}`;
      const docRef = doc(db, docPath);
      // Salva no Firebase
      await setDoc(docRef, { aulas: novoProgresso }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar progresso: ", error);
    }
  };

  // Se não houver trilha carregada (ex: acesso direto sem criar)
  if (!trilha) {
    return (
      <div className="dashboard">
        <h1>Bem-vindo!</h1>
        <p>Você ainda não tem uma trilha ativa. Por favor, vá em "Nova Trilha" para criar uma.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {showPopup && <MindCarePopup onClose={fecharPopup} />}
      
      {/* 1. MOOD TRACKER (Topo) */}
      <MoodTracker />

      {/* 2. A TRILHA (Meio) */}
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
      
      {/* 3. CÁPSULA DO TEMPO (Fundo) */}
      <CapsulaDoTempo />
      
    </div>
  );
}

export default DashboardPage;