import React, { useState, useEffect } from 'react';
import './ComunidadePage.css';
import { db } from '../firebaseConfig';
// Importamos as funções para ADICIONAR e LER dados, e ORDENAR por data
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { useOutletContext } from 'react-router-dom';

function ComunidadePage() {
  
  const { user } = useOutletContext(); // Precisamos saber QUEM está a postar
  
  const [posts, setPosts] = useState([]);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [categoria, setCategoria] = useState('Dica');
  const [loading, setLoading] = useState(false);

  // 1. Ouvinte: Carrega os posts em tempo real
  useEffect(() => {
    const postsRef = collection(db, "comunidade");
    // Ordena para o post mais recente aparecer primeiro ('desc')
    const q = query(postsRef, orderBy("criadoEm", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Transforma os dados do Firestore numa lista simples
      const listaPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(listaPosts);
    });

    return () => unsubscribe();
  }, []);

  // 2. Função para Publicar
  const handlePublicar = async (e) => {
    e.preventDefault(); // Evita recarregar a página
    if (!novoTitulo || !novoConteudo) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "comunidade"), {
        titulo: novoTitulo,
        conteudo: novoConteudo, // Pode ser um link ou texto
        categoria: categoria,
        autorNome: user.displayName || "Utilizador Anónimo",
        autorId: user.uid,
        criadoEm: serverTimestamp() // O servidor decide a hora exata
      });

      // Limpa o formulário
      setNovoTitulo('');
      setNovoConteudo('');
      alert("Dica publicada com sucesso!");

    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Erro ao publicar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comunidade-container">
      
      <div className="comunidade-header">
        <h1>Comunidade TrilhaZen</h1>
        <p>Compartilhe conhecimentos e descubra o que outros alunos estão a estudar.</p>
      </div>

      {/* Formulário de Novo Post */}
      <div className="novo-post-box">
        <h3>Publicar uma Dica</h3>
        <form onSubmit={handlePublicar}>
          <div className="input-group">
            <select 
              className="comunidade-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Dica">💡 Dica</option>
              <option value="Vídeo">🎥 Vídeo</option>
              <option value="Artigo">📄 Artigo</option>
              <option value="Dúvida">❓ Dúvida</option>
            </select>
            <input 
              type="text" 
              className="comunidade-input"
              placeholder="Título (Ex: Melhor canal de React)"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              maxLength={50}
            />
          </div>
          
          <div className="input-group">
            <input 
              type="text" 
              className="comunidade-input"
              placeholder="Conteúdo ou Link (https://...)"
              value={novoConteudo}
              onChange={(e) => setNovoConteudo(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-publicar" disabled={loading}>
            {loading ? "Publicando..." : "Publicar para a Comunidade"}
          </button>
        </form>
      </div>

      {/* Lista de Posts (Feed) */}
      <div className="feed-lista">
        {posts.length === 0 && (
          <p style={{textAlign: 'center', color: '#6b7280'}}>
            Nenhum post ainda. Seja o primeiro a compartilhar!
          </p>
        )}

        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <span className="post-tag">{post.categoria}</span>
              <span className="post-autor">Por: {post.autorNome}</span>
            </div>
            <h4>{post.titulo}</h4>
            
            {/* Se parecer um link (começa com http), cria um link clicável */}
            {post.conteudo.startsWith('http') ? (
              <a href={post.conteudo} target="_blank" rel="noopener noreferrer" className="post-link">
                {post.conteudo}
              </a>
            ) : (
              <p>{post.conteudo}</p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

export default ComunidadePage;