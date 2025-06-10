import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaHeart } from "react-icons/fa";
import "../styles/Produtos.css";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);

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

  return (
    <div className="container-produtos">
      <aside className="sidebar-filtros">
        <div className="filtro">
          <h4>CATEGORIAS</h4>
          <ul>
            <li><input type="radio" name="cat" /> Eletrônicos</li>
            <li><input type="radio" name="cat" /> PET</li>
            <li><input type="radio" name="cat" /> Joias</li>
            <li><input type="radio" name="cat" /> Moda</li>
            <li><input type="radio" name="cat" /> Móveis</li>
          </ul>
        </div>

        <div className="filtro">
          <h4>GÊNERO</h4>
          <ul>
            <li><input type="radio" name="gender" /> Masculino</li>
            <li><input type="radio" name="gender" /> Feminino</li>
            <li><input type="radio" name="gender" /> Unissex</li>
          </ul>
        </div>

        <div className="filtro">
          <h4>TAMANHOS</h4>
          <div className="sizes">
            {["4XL", "3XL", "XXL", "XL", "L", "M", "S", "XS"].map((size, i) => (
              <button key={i}>{size}</button>
            ))}
          </div>
        </div>

        <div className="filtro">
          <h4>PREÇO</h4>
          <div className="price-range">
            <div className="price-slider">
              <span>R$0</span>
              <input type="range" min="0" max="500" />
              <span>R$500</span>
            </div>
            <button className="reset-btn">Resetar</button>
          </div>
        </div>
      </aside>

      <section className="produtos-grid">
        {produtos.map((produto, index) => (
          <div className="card-produto" key={index}>
            <FaHeart className="icon-favorito" />

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

              <button className="btn-cart">Add to cart</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Produtos;
