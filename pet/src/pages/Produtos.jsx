import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Produtos.css';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/<seu_cloud_name>/upload';
const UPLOAD_PRESET = '<seu_upload_preset>';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [file, setFile] = useState(null);
  const [imgUrl, setImgUrl] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [oldPreco, setOldPreco] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    try {
      const response = await axios.get('https://sua-api.com/api/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert('Selecione uma imagem');
      return;
    }

    try {
      const url = await uploadImage(file);
      setImgUrl(url);

      // Monta objeto produto
      const produto = {
        name: nome,
        price: parseFloat(preco),
        oldPrice: parseFloat(oldPreco),
        tag: tag,
        imageUrl: url,
      };

      // Envia para sua API
      await axios.post('https://sua-api.com/api/produtos', produto);

      alert('Produto salvo com sucesso!');
      setNome('');
      setPreco('');
      setOldPreco('');
      setTag('');
      setFile(null);
      fetchProdutos(); // atualizar lista
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  }

  return (
    <div className="produto-container">
      <aside className="filtros">
        {/* filtros aqui - mesmo código anterior */}
      </aside>

      <main className="produtos">
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Preço"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Preço antigo"
            value={oldPreco}
            onChange={e => setOldPreco(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tag (ex: 20% OFF)"
            value={tag}
            onChange={e => setTag(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            required
          />
          <button type="submit">Salvar Produto</button>
        </form>

        {produtos.map((p, i) => (
          <div className="produto-card" key={i}>
            <span className="tag">{p.tag}</span>
            <img src={p.imageUrl} alt={p.name} />
            <h4>{p.name}</h4>
            <p><s>${p.oldPrice}</s> <strong>${p.price}</strong></p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Produtos;
