import React from 'react';
import { auth, googleProvider } from './firebaseConfig.js'; // Importa o que precisamos
import { signInWithPopup } from 'firebase/auth';
import './LoginPage.css'; // Vamos criar este CSS

function LoginPage() {

  // Função que será chamada quando o usuário clicar no botão
  const handleLogin = async () => {
    try {
      // Isso abre o Pop-up do Google
      await signInWithPopup(auth, googleProvider);
      // O App.js vai detectar o login automaticamente e trocar a tela
    } catch (error) {
      console.error("Erro ao fazer login: ", error);
      alert("Falha no login. Verifique o console.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-logo">TrilhaZen</h1>
        <p className="login-tagline">Seu mentor de IA para aprender sem burnout.</p>
        <button className="google-login-button" onClick={handleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
          Entrar com o Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;