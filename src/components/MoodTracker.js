import React, { useState } from 'react';
import './MoodTracker.css';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from '../firebaseConfig';

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
        
        // Reseta o estado "salvo" após 3 segundos para permitir novo input se quiser
        setTimeout(() => setSaved(false), 3000);
        
      } catch (error) {
        console.error("Erro ao salvar humor:", error);
      }
    }
  };

  return (
    <div className="mood-tracker-container">
      <h3>Como você está se sentindo hoje?</h3>
      
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
  );
}

export default MoodTracker;