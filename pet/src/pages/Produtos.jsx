import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Produtos.css";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/Produtos");
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/produto/${id}`);
  };

  const handleFavoritar = (e, id) => {
    e.stopPropagation();
    // Lógica para favoritar o produto
    console.log(`Produto ${id} favoritado`);
  };

  return (
    <div className="container-produtos">
      <aside className="sidebar-filtros">
        <div className="filtro">
          <h4>FAIXA DE PREÇO</h4>
          <div className="price-range">
            <div className="price-inputs">
              <input type="text" placeholder="R$0" />
              <input type="text" placeholder="R$1000" />
            </div>
          </div>
        </div>

        <div className="filtro">
          <h4>CATEGORIAS</h4>
          <ul>
            {["Ração", "Brinquedos", "Coleiras", "Acessórios", "Higiene", "Petiscos", "Medicamentos", "Camas"].map((cat, i) => (
              <li key={i}>
                <input type="radio" name="cat" id={`cat-${i}`} />
                <label htmlFor={`cat-${i}`}>{cat}</label>
              </li>
            ))}
          </ul>
        </div>

        <div className="filtro">
          <h4>TIPO DE ANIMAL</h4>
          <ul>
            {["Cachorro", "Gato", "Pássaro", "Peixe", "Roedor", "Réptil"].map((animal, i) => (
              <li key={i}>
                <input type="radio" name="animal" id={`animal-${i}`} />
                <label htmlFor={`animal-${i}`}>{animal}</label>
              </li>
            ))}
          </ul>
        </div>

        <div className="filtro">
          <h4>MARCAS</h4>
          <ul>
            {["Pedigree", "Whiskas", "Royal Canin", "Premier", "Golden", "N&D", "Friskies", "Purina"].map((marca, i) => (
              <li key={i}>
                <input type="radio" name="marca" id={`marca-${i}`} />
                <label htmlFor={`marca-${i}`}>{marca}</label>
              </li>
            ))}
          </ul>
        </div>

        <div className="filtro">
          <h4>IDADE</h4>
          <ul>
            {["Filhote", "Adulto", "Sênior"].map((idade, i) => (
              <li key={i}>
                <input type="radio" name="idade" id={`idade-${i}`} />
                <label htmlFor={`idade-${i}`}>{idade}</label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="produtos-grid">
        {produtos.map((produto, index) => (
          <div
            className="card-produto"
            key={index}
            onClick={() => handleProductClick(produto.id)}
          >
            <FaHeart
              className="icon-favorito"
              onClick={(e) => handleFavoritar(e, produto.id)}
            />

            <div className="img-wrapper">
              <img
                src={produto.imagensUrl?.[0] || "https://via.placeholder.com/150"}
                alt={produto.nome}
              />
            </div>

            <div className="info-produto">
              <div className="avaliacao">
                {[1, 2, 3, 4, 5].map((i) =>
                  i <= 4 ? (
                    <FaStar key={i} color="#f5a623" size={14} />
                  ) : (
                    <FaRegStar key={i} color="#ccc" size={14} />
                  )
                )}
                <span className="num-avaliacoes">(50)</span>
              </div>

              <h3 className="nome-produto">{produto.nome}</h3>

              <p className="precos">
                {produto.tamanhos?.[0] ? (
                  <>
                    <span className="preco-atual">
                      R$ {produto.tamanhos[0].precoTotal.toFixed(2)}
                    </span>
                    <span className="preco-original">
                      R$ {(produto.tamanhos[0].precoTotal * 1.25).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span>Preço indisponível</span>
                )}
              </p>

              <button
                className="btn-cart"
                onClick={(e) => {
                  e.stopPropagation();
                  // Lógica para adicionar ao carrinho
                }}
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Produtos;