import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importações das nossas páginas e layout
import LoginPage from './LoginPage.js';
import Layout from './Layout.js';
import DashboardPage from './pages/DashboardPage.js';
import NovaTrilhaPage from './pages/NovaTrilhaPage.js';
import ComunidadePage from './pages/ComunidadePage.js';

import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore"; 

function App() {
  
  const [user, setUser] = useState(null); 
  const [authLoading, setAuthLoading] = useState(true); 
  const [objetivo, setObjetivo] = useState(null);
  const [preferencias, setPreferencias] = useState(null);
  const [trilha, setTrilha] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().objetivoAtual) {
          setObjetivo(docSnap.data().objetivoAtual);
          setPreferencias(docSnap.data().preferencias || ''); 
          setTrilha(docSnap.data().trilhaSalva || null);
        } else {
          setObjetivo(null);
          setPreferencias(null);
          setTrilha(null);
        }
        setAuthLoading(false);

      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []); 
  
  if (authLoading) {
    return (
      <div className="container">
         <div className="splash-screen">
            <h1 className="splash-logo">TrilhaZen</h1>
            <p className="splash-tagline">Carregando...</p>
         </div>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <Route path="/" element={<Layout user={user} objetivo={objetivo} preferencias={preferencias} trilha={trilha} />}>
          <Route index element={objetivo ? <DashboardPage /> : <Navigate to="/nova" />} />
          <Route path="nova" element={<NovaTrilhaPage />} />
          <Route path="comunidade" element={<ComunidadePage />} />
          <Route path="login" element={<Navigate to="/" />} /> 
        </Route>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}

export default App;