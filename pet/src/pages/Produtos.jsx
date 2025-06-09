import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Substitui useNavigate
import "../styles/Produtos.css"; // Seu arquivo de estilos personalizado

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
          <h4>CATEGORIES</h4>
          <ul>
            <li><input type="radio" name="cat" /> Electronics</li>
            <li><input type="radio" name="cat" /> PET</li>
            <li><input type="radio" name="cat" /> Jewelry</li>
            <li><input type="radio" name="cat" /> Fashion</li>
            <li><input type="radio" name="cat" /> Furniture</li>
          </ul>
        </div>

        <div className="filtro">
          <h4>GENDER</h4>
          <ul>
            <li><input type="radio" name="gender" /> Men</li>
            <li><input type="radio" name="gender" /> Women</li>
            <li><input type="radio" name="gender" /> Unisex</li>
          </ul>
        </div>

        <div className="filtro">
          <h4>SIZE</h4>
          <div className="sizes">
            {["4XL", "3XL", "XXL", "XL", "L", "M", "S", "XS"].map((size, i) => (
              <button key={i}>{size}</button>
            ))}
          </div>
        </div>

        <div className="filtro">
          <h4>PRICE</h4>
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
          <Link
            to={`/produto/${produto.id}`}
            key={index}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card-produto" style={{ cursor: "pointer" }}>
              <div className="badge-desconto">20% OFF</div>
              <img src={produto.imagemUrl} alt={produto.nome} />
              <h3>{produto.nome}</h3>
              <p className="precos">
                <span className="preco-original">
                  R$ {(produto.preco * 1.25).toFixed(2)}
                </span>
                <span className="preco-atual">
                  R$ {produto.preco.toFixed(2)}
                </span>
              </p>
              <div className="bolinhas-cores">
                <span style={{ backgroundColor: "#000" }}></span>
                <span style={{ backgroundColor: "#f00" }}></span>
                <span style={{ backgroundColor: "#00f" }}></span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Produtos;
