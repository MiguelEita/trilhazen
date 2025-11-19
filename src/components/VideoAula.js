import React from 'react';

function VideoAula({ videoId, titulo }) {
  if (!videoId) return null;

  return (
    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
      <h4 style={{fontSize: '14px', color: '#a5b4fc', marginBottom: '5px'}}>
        Sugestão: {titulo}
      </h4>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
        <iframe
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          src={`https://www.youtube.com/embed/${videoId}`}
          title={titulo}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default VideoAula;