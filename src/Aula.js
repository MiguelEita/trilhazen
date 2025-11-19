import React, { useState } from 'react';
import './Aula.css';
import VideoAula from './components/VideoAula'; // Ajusta o caminho se necessário

function Aula({ nome, video, concluido, onAulaClick }) {
  const [mostrarVideo, setMostrarVideo] = useState(false);

  return (
    <div className="aula-container">
      <div 
        className={`aula-item ${concluido ? 'concluida' : ''}`} 
        onClick={onAulaClick}
      >
        <span className="checkbox-icon">{concluido ? '[✓]' : '[ ]'}</span>
        <span className="aula-nome">{nome}</span>
        
        {video && (
          <button 
            className="btn-ver-video"
            onClick={(e) => {
              e.stopPropagation(); // Evita marcar como concluído ao clicar no botão
              setMostrarVideo(!mostrarVideo);
            }}
          >
            {mostrarVideo ? 'Ocultar Vídeo' : '🎥 Ver Vídeo'}
          </button>
        )}
      </div>

      {mostrarVideo && video && (
        <div className="video-container">
          <VideoAula videoId={video.id} titulo={video.titulo} />
        </div>
      )}
    </div>
  );
}

export default Aula;