import React, { useEffect, useState } from 'react';
import '../../styles/ProductList.css'; // (crie esse arquivo depois com o CSS que vou te passar)
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function ProductList() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/Produto/${id}`) // Substitua pela URL real da sua API
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        return res.json();
      })
      .then(data => {
        setProdutos(data);
        setLoading(false);
      })
      .catch(err => {
        setErro(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="product-list-page">
      <h2 className="title">Lista de Produtos</h2>

      {loading && <p>Carregando produtos...</p>}
      {erro && <p className="error">Erro: {erro}</p>}

      {!loading && !erro && produtos.length === 0 && <p>Nenhum produto encontrado.</p>}

      {!loading && !erro && produtos.length > 0 && (
        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(prod => (
                <tr key={prod.id}>
                  <td>
                    <img src={prod.imagemUrl} alt={prod.nome} className="product-image" />
                  </td>
                  <td>{prod.nome}</td>
                  <td>R$ {prod.preco.toFixed(2)}</td>
                  <td>{prod.categoria}</td>
                  <td>
                    <span className={`status ${prod.ativo ? 'ativo' : 'inativo'}`}>
                      {prod.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="acoes">
                    <button className="edit"><FaEdit /></button>
                    <button className="delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
