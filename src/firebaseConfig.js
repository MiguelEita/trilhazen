// Importe as funções que precisamos
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Seu web app's Firebase configuration
// (Cole o seu objeto firebaseConfig que o Google te deu aqui)
const firebaseConfig = {
  apiKey: "AIzaSyC5lvm_iZvZTk0tAcBdnlppGNY_YOL-UaU",
  authDomain: "trilhazen-ccc24.firebaseapp.com",
  projectId: "trilhazen-ccc24",
  storageBucket: "trilhazen-ccc24.firebasestorage.app",
  messagingSenderId: "464451836394",
  appId: "1:464451836394:web:508968bfa80739e0473a93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize e Exporte os serviços que vamos usar
const auth = getAuth(app); // Nosso serviço de Autenticação
const db = getFirestore(app); // Nosso banco de dados Firestore
const googleProvider = new GoogleAuthProvider(); // O método de login do Google

export { auth, db, googleProvider, app };