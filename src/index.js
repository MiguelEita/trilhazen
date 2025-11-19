import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Importa o Roteador
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* "Envelopa" o app com o roteador */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);