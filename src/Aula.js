import React, { useState } from 'react';
import './Aula.css';
// Importa o componente que exibe o vídeo
import VideoAula from './components/VideoAula'; 

function Aula({ nome, video, concluido, onAulaClick }) {
  // Estado para controlar se o vídeo está visível ou escondido
  const [mostrarVideo, setMostrarVideo] = useState(false);

  return (
    <div className="aula-container">
      <div 
        className={`aula-item ${concluido ? 'concluida' : ''}`} 
        onClick={onAulaClick}
      >
        <span className="checkbox-icon">{concluido ? '[✓]' : '[ ]'}</span>
        <span className="aula-nome">{nome}</span>
        
        {/* Só mostra o botão se houver um vídeo disponível */}
        {video && (
          <button 
            className="btn-ver-video"
            onClick={(e) => {
              e.stopPropagation(); // Impede que o clique marque a aula como concluída
              setMostrarVideo(!mostrarVideo);
            }}
          >
            {mostrarVideo ? 'Ocultar Vídeo' : '🎥 Ver Vídeo'}
          </button>
        )}
      </div>

      {/* Se o utilizador clicou em mostrar, exibe o player do YouTube */}
      {mostrarVideo && video && (
        <div className="video-container">
          <VideoAula videoId={video.id} titulo={video.titulo} />
        </div>
      )}
    </div>
  );
}

export default Aula;