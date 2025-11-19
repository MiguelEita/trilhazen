import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import './Layout.css';

// Importando os ícones
import { FiMap, FiPlusCircle, FiUsers, FiLogOut } from "react-icons/fi";

function Layout(props) {
  
  const navigate = useNavigate();
  const location = useLocation(); // Para saber qual aba está ativa

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  // Função auxiliar para verificar se o link está ativo
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-layout">
      <nav className="app-nav">
        
        {/* Link: Minha Trilha */}
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          <FiMap className="nav-icon" />
          <span className="nav-text">Trilha</span>
        </Link>

        {/* Link: Nova Trilha */}
        <Link to="/nova" className={`nav-link ${isActive('/nova')}`}>
          <FiPlusCircle className="nav-icon" />
          <span className="nav-text">Nova</span>
        </Link>

        {/* Link: Comunidade */}
        <Link to="/comunidade" className={`nav-link ${isActive('/comunidade')}`}>
          <FiUsers className="nav-icon" />
          <span className="nav-text">Comunidade</span>
        </Link>

        {/* Botão: Sair */}
        <button onClick={handleLogout} className="nav-link nav-logout">
          <FiLogOut className="nav-icon" />
          <span className="nav-text">Sair</span>
        </button>

      </nav>

      <main className="app-content">
        <Outlet context={props} /> 
      </main>
    </div>
  );
}

export default Layout;