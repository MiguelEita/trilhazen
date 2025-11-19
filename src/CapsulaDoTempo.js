import React, { useState, useEffect } from 'react';
import './CapsulaDoTempo.css';

// Importa o 'db' e o 'auth' do nosso arquivo de configuração
import { db, auth } from './firebaseConfig';
// Importa as funções do Firestore que vamos usar
import { doc, setDoc, getDoc } from "firebase/firestore";

function CapsulaDoTempo() {
  
  // Estados para controlar o componente
  const [mensagem, setMensagem] = useState(''); // O que o usuário digita
  const [dataAbertura, setDataAbertura] = useState(''); // A data que o usuário escolhe
  const [capsulaSalva, setCapsulaSalva] = useState(null); // Onde guardamos a cápsula vinda do DB
  const [loading, setLoading] = useState(true); // Estado de "carregando"
  
  // Pega o ID do usuário atual
  const userId = auth.currentUser.uid;
  // Define o "caminho" para o documento da cápsula no Firestore
  const docRef = doc(db, 'capsulas', userId);

  // --- Efeito de Leitura (Read) ---
  useEffect(() => {
    const carregarCapsula = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCapsulaSalva(docSnap.data());
      }
      setLoading(false);
    };

    carregarCapsula();
  }, [docRef]);

  // --- Função de Escrita (Write) ---
  const handleSalvarCapsula = async () => {
    if (!mensagem || !dataAbertura) {
      alert("Por favor, escreva uma mensagem e escolha uma data.");
      return;
    }

    const novaCapsula = {
      mensagem: mensagem,
      dataAbertura: dataAbertura, // Salva a data no formato YYYY-MM-DD
      criadaEm: new Date().toISOString() // Salva a data de hoje como string
    };

    try {
      // Salva o documento no Firestore
      await setDoc(docRef, novaCapsula);
      setCapsulaSalva(novaCapsula); // Atualiza o estado local
      setMensagem(''); // Limpa o campo de texto
      setDataAbertura(''); // Limpa a data
    } catch (error) {
      console.error("Erro ao salvar cápsula: ", error);
      alert("Falha ao salvar. Tente novamente.");
    }
  };

  // --- Função para "Resetar" e criar nova ---
  const handleNovaCapsula = () => {
    // Simplesmente limpamos o estado da cápsula salva.
    // Isso fará o componente renderizar o formulário novamente.
    setCapsulaSalva(null);
  };

  // --- Lógica de Renderização ---

  if (loading) {
    return <div className="capsula-container">Carregando Cápsula...</div>;
  }

  // Se JÁ EXISTE uma cápsula salva...
  if (capsulaSalva) {
    const hoje = new Date().toISOString().split('T')[0]; // Data de hoje em YYYY-MM-DD
    const dataAberturaSalva = capsulaSalva.dataAbertura;

    // Compara se a data de hoje é ANTES da data de abertura
    if (hoje < dataAberturaSalva) {
      // A cápsula AINDA ESTÁ TRANCADA
      return (
        <div className="capsula-container capsula-trancada">
          <h3>Sua Cápsula do Tempo está Trancada 🔒</h3>
          <p>Você poderá ler sua mensagem no dia:</p>
          <strong>{new Date(dataAberturaSalva).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</strong>
        </div>
      );
    } else {
      // A cápsula ESTÁ ABERTA!
      return (
        <div className="capsula-container capsula-aberta">
          <h3>Sua Cápsula do Tempo foi Aberta! 🎉</h3>
          <p>Você escreveu:</p>
          <blockquote>"{capsulaSalva.mensagem}"</blockquote>
          
          <hr style={{borderColor: '#374151', margin: '20px 0'}} />
          
          <p style={{fontSize: '14px', marginBottom: '10px'}}>Quer enviar outra mensagem para o futuro?</p>
          <button onClick={handleNovaCapsula} className="primary-action">
            Criar Nova Cápsula
          </button>
        </div>
      );
    }
  }

  // Se NÃO EXISTE uma cápsula salva (ou o usuário clicou em "Criar Nova"), mostra o formulário
  return (
    <div className="capsula-container">
      <h3>Cápsula do Tempo ⏳</h3>
      <p>Escreva uma mensagem para o seu "eu do futuro". Ela ficará trancada até a data que você escolher.</p>
      
      <textarea
        placeholder="Querido eu do futuro..."
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
      />
      
      <label>Data de Abertura:</label>
      <input
        type="date"
        value={dataAbertura}
        onChange={(e) => setDataAbertura(e.target.value)}
        // Impede o usuário de escolher uma data no passado
        min={new Date().toISOString().split('T')[0]} 
      />
      
      <button onClick={handleSalvarCapsula} className="primary-action">
        Trancar Cápsula
      </button>
    </div>
  );
}

export default CapsulaDoTempo;