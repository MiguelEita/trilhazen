// Este é um novo componente!
// A única função dele é mostrar o pop-up

import React from 'react';
import './MindCarePopup.css'; // Vamos criar este arquivo de CSS em seguida

// 'props' (propriedades) são informações que o componente 'App.js' vai nos mandar.
// Aqui, vamos receber uma função chamada 'onClose'
function MindCarePopup(props) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        
        <h2>Ei, tudo bem? <span>💬</span></h2>
        
        <p>
          Percebi que você está há um tempo neste módulo. 
          Às vezes, "Loops" podem ser confusos no começo.
        </p>
        
        <p>Que tal uma pausa de 2 minutos para um exercício de respiração?</p>
        
        {/* Quando clicarmos no botão, ele vai chamar a função 'onClose' 
            que o App.js nos passou, e o App.js vai fechar o pop-up. */}
        <button className="popup-button" onClick={props.onClose}>
          Fechar (Estou bem!)
        </button>

      </div>
    </div>
  );
}

export default MindCarePopup;