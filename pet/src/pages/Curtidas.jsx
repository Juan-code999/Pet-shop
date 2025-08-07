import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaStar, FaRegStar, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Produtos.css";

const Curtidas = () => {
  const [produtosCurtidos, setProdutosCurtidos] = useState([]);
  const [todosProdutos, setTodosProdutos] = useState([]);
  const navigate = useNavigate();

  // Carregar produtos curtidos
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get("https://pet-shop-eiab.onrender.com/api/Produtos");
        setTodosProdutos(response.data);

        const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        const filtrados = response.data.filter((produto) => favoritos.includes(produto.id));
        setProdutosCurtidos(filtrados);
      } catch (error) {
        console.error("Erro ao carregar curtidos:", error);
      }
    };

    fetchProdutos();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/produto/${id}`);
  };

  const removerFavorito = (e, id) => {
    e.stopPropagation();
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const atualizados = favoritos.filter((favId) => favId !== id);
    localStorage.setItem("favoritos", JSON.stringify(atualizados));
    const atualizadosProdutos = todosProdutos.filter((produto) => atualizados.includes(produto.id));
    setProdutosCurtidos(atualizadosProdutos);
  };

  return (
    <div className="container-produtos">
      <h2 className="titulo-curtidos">Meus Favoritos</h2>

      {produtosCurtidos.length === 0 ? (
        <p className="mensagem-vazia">Você ainda não curtiu nenhum produto.</p>
      ) : (
        <section className="produtos-grid">
          {produtosCurtidos.map((produto) => {
            const preco = produto.tamanhos?.[0]?.precoTotal || 0;
            const precoOriginal = preco * 1.25;

            return (
              <div
                key={produto.id}
                className="card-produto"
                onClick={() => handleProductClick(produto.id)}
              >
                <button
                  className="icon-favorito favoritado"
                  onClick={(e) => removerFavorito(e, produto.id)}
                  aria-label="Remover dos favoritos"
                >
                  <FaHeart />
                </button>

                {produto.desconto && (
                  <span className="badge-desconto">-{produto.desconto}%</span>
                )}

                <div className="img-wrapper">
                  <img
                    src={produto.imagensUrl?.[0] || "/placeholder-produto.jpg"}
                    alt={produto.nome}
                  />
                </div>

                <div className="info-produto">
                  <div className="avaliacao">
                    {[1, 2, 3, 4, 5].map((i) =>
                      i <= Math.floor(produto.avaliacaoMedia || 4) ? (
                        <FaStar key={i} />
                      ) : (
                        <FaRegStar key={i} />
                      )
                    )}
                    <span className="num-avaliacoes">
                      ({produto.numAvaliacoes || 50})
                    </span>
                  </div>
                  <h3 className="nome-produto">{produto.nome}</h3>
                  <p className="precos">
                    {preco > 0 ? (
                      <>
                        <span className="preco-atual">
                          R$ {preco.toFixed(2).replace(".", ",")}
                        </span>
                        {precoOriginal > preco && (
                          <span className="preco-original">
                            R$ {precoOriginal.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="preco-indisponivel">Preço indisponível</span>
                    )}
                  </p>
                  <button
                    className="btn-cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/produto/${produto.id}`);
                    }}
                    disabled={!produto.tamanhos?.length}
                  >
                    <FaShoppingCart /> Ver produto
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default Curtidas;
