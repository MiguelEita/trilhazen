import React, { useState } from 'react';
import './MoodTracker.css';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from '../firebaseConfig';
// Importamos ícones para o botão de abrir/fechar
import { FiSmile, FiChevronDown, FiChevronUp } from "react-icons/fi";

const moods = [
  { label: 'Feliz', emoji: '😄', value: 'feliz' },
  { label: 'Bem', emoji: '🙂', value: 'bem' },
  { label: 'Neutro', emoji: '😐', value: 'neutro' },
  { label: 'Cansado', emoji: '😴', value: 'cansado' },
  { label: 'Estressado', emoji: '😫', value: 'estressado' },
];

function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [saved, setSaved] = useState(false);
  // NOVO: Estado para controlar se está aberto ou fechado
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMoodSelect = async (moodValue) => {
    setSelectedMood(moodValue);
    
    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'humor'), {
          userId: auth.currentUser.uid,
          humor: moodValue,
          data: serverTimestamp()
        });
        setSaved(true);
        
        // Fecha automaticamente após 2 segundos
        setTimeout(() => {
          setSaved(false);
          setIsExpanded(false); // Fecha o acordeão
          setSelectedMood(null); // Reseta a seleção visual
        }, 2000);
        
      } catch (error) {
        console.error("Erro ao salvar humor:", error);
      }
    }
  };

  return (
    <div className={`mood-tracker-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      
      {/* O Cabeçalho agora é clicável para abrir/fechar */}
      <div className="mood-header" onClick={toggleExpand}>
        <div className="mood-header-title">
          <FiSmile className="mood-icon-main" />
          <span>Como você está se sentindo hoje?</span>
        </div>
        {/* Ícone que muda se está aberto ou fechado */}
        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
      </div>

      {/* O conteúdo só aparece se isExpanded for true */}
      {isExpanded && (
        <div className="mood-content">
          {saved ? (
            <div className="mood-saved-message">
              <p>Obrigado por compartilhar! Registramos seu humor.</p>
            </div>
          ) : (
            <div className="mood-buttons">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  className={`mood-btn ${selectedMood === mood.value ? 'selected' : ''}`}
                  onClick={() => handleMoodSelect(mood.value)}
                  title={mood.label}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MoodTracker;