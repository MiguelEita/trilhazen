import React from 'react';
import './Aula.css'; // O estilo que já criamos

// O componente agora recebe DUAS propriedades:
// 1. 'nome': O nome da aula (como antes)
// 2. 'concluido': Um boolean (true/false) vindo do App.js
// 3. 'onAulaClick': A FUNÇÃO que ele deve chamar quando for clicado
function Aula({ nome, concluido, onAulaClick }) {

  // O 'useState' foi REMOVIDO daqui.

  // O 'onClick' agora chama a função que veio do "pai" (App.js)
  // O 'className' é definido pelo boolean 'concluido'
  return (
    <div 
      className={`aula-item ${concluido ? 'concluida' : ''}`} 
      onClick={onAulaClick} // Chama a função do App.js
    >
      <span className="checkbox-icon">{concluido ? '[✓]' : '[ ]'}</span>
      <span className="aula-nome">{nome}</span>
    </div>
  );
}

export default Aula;