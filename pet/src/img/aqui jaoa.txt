import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

import './Masculino.css';

const Masculino = () => {

  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState(null);
  const [idUsuario, setIdUsuario] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtros, setFiltros] = useState({
    categorias: [],
    subcategorias: [],
    tamanhos: [],
    cores: [],
    preco: [0, 2600],
  });



  const mapaCores = {
    Amarelo: "#FFD700",
    Azul: "#0000FF",
    Branco: "#FFFFFF",
    Cinza: "#808080",
    Laranja: "#FFA500",
    Marrom: "#A52A2A",
    Preto: "#000000",
    Rosa: "#FFC0CB",
    Roxo: "#800080",
    Verde: "#008000",
    Vermelho: "#FF0000"
  };



  const CoresDisponiveis = ["Amarelo", "Azul", "Branco", "Cinza", "Laranja", "Marrom", "Preto", "Rosa", "Roxo", "Verde", "Vermelho"];

  const ChecksList = [
    {
      title: 'Categorias',
      tipo: 'categorias',
      checksLists: ["Blusas", "Calças", "Tênnis", "Camisas", "Meias"]
    },
    {
      title: 'Sub-Categorias',
      tipo: 'subcategorias',
      checksLists: ["Casual", "Esportivo", "Social"]
    },
    {
      title: 'Tamanhos',
      tipo: 'tamanhos',
      categoriaTamanho: [
        {
          tipo: 'Roupas',
          checksLists: ["PP", "P", "M", "G", "GG"]
        },
        {
          tipo: 'Calçados',
          checksLists: ["34", "35", "36", "38", "40", "42", "44", "46", "47", "48"]
        }
      ]
    },
  ];

  useEffect(() => {
    const buscarProdMasc = async () => {
      try {
        const response = await fetch("https://localhost:7294/Produto");
        if (!response.ok) throw new Error("Erro ao buscar produtos");
        const data = await response.json();
        const masculinos = data.filter(prod => prod.genero === "Masculino");
        const produtosComImagem = masculinos.map(prod => ({
          ...prod,
          urlImagens: Array.isArray(prod.urlImagens) && prod.urlImagens.length > 0 && typeof prod.urlImagens[0] === "string"
            ? prod.urlImagens
            : ["http://via.placeholder.com/300x200.png?text=Produto+sem+imagem"]

        }));
        setProdutos(produtosComImagem);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setErro("Não foi possível carregar os produtos.");
      }
    };
    buscarProdMasc();
    const id = localStorage.getItem("idUsuario");
    setIdUsuario(id);

    const precoURL = searchParams.get('preco')?.split('-').map(Number);
    const filtrosIniciais = {
      categorias: searchParams.get('categoria')?.split(',') || [],
      subcategorias: searchParams.get('subcategoria')?.split(',') || [],
      tamanhos: searchParams.get('tamanho')?.split(',') || [],
      cores: searchParams.get('cor')?.split(',') || [],
      preco: precoURL && precoURL.length === 2 ? precoURL : [0, 2600],
    };
    setFiltros(filtrosIniciais);


  }, []);

  const handleCheckboxChange = (tipo, valor) => {
    setFiltros(prev => {
      const atual = prev[tipo];
      const atualizado = atual.includes(valor) ? atual.filter(i => i !== valor) : [...atual, valor];
      return { ...prev, [tipo]: atualizado };
    });
  };


  const handlePrecoChange = (event, index) => {
    const novoValor = parseFloat(event.target.value);

    setFiltros(prev => {
      const novoPreco = [...prev.preco];

      if (index === 0) {
        // Preço mínimo não pode ultrapassar o preço máximo
        novoPreco[0] = Math.min(novoValor, novoPreco[1]);
      } else {
        // Preço máximo não pode ser menor que o preço mínimo
        novoPreco[1] = Math.max(novoValor, novoPreco[0]);
      }

      return { ...prev, preco: novoPreco };
    });
  };


  useEffect(() => {
    const params = new URLSearchParams();

    if (filtros.categorias.length > 0) params.set('categoria', filtros.categorias.join(','));
    if (filtros.subcategorias.length > 0) params.set('subcategoria', filtros.subcategorias.join(','));
    if (filtros.tamanhos.length > 0) params.set('tamanho', filtros.tamanhos.join(','));
    if (filtros.cores.length > 0) params.set('cor', filtros.cores.join(','));
    if (filtros.preco) params.set('preco', `${filtros.preco[0]}-${filtros.preco[1]}`);

    setSearchParams(params);
  }, [filtros]);



  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltros({
      categorias: [],
      subcategorias: [],
      tamanhos: [],
      cores: [],
      preco: [0, 2600],
    });
  };

  // Função para remover filtro específico
  const removerFiltro = (tipo, valor) => {
    setFiltros(prev => {
      if (tipo === 'preco') {
        // Reseta faixa de preço para padrão
        return { ...prev, preco: [0, 2600] };
      }
      const novoFiltro = prev[tipo].filter(item => item !== valor);
      return { ...prev, [tipo]: novoFiltro };
    });
  };

  const temFiltrosAtivos =
    filtros.categorias.length > 0 ||
    filtros.subcategorias.length > 0 ||
    filtros.tamanhos.length > 0 ||
    filtros.cores.length > 0 ||
    filtros.preco[0] !== 0 ||
    filtros.preco[1] !== 2600;



  const produtosFiltrados = produtos.filter(prod => {
    const categoriaOk = filtros.categorias.length === 0 || filtros.categorias.includes(prod.categoria);
    const subcategoriaOk = filtros.subcategorias.length === 0 || filtros.subcategorias.includes(prod.subcategoria);
    const tamanhoOk = filtros.tamanhos.length === 0 || prod.tamanhos?.some(t => filtros.tamanhos.includes(t));
    const corOk = filtros.cores.length === 0 || filtros.cores.includes(capitalizeFirst(prod.cor));
    const precoOk = prod.preco >= filtros.preco[0] && prod.preco <= filtros.preco[1];
    return categoriaOk && subcategoriaOk && tamanhoOk && corOk && precoOk;
  });

  const adicionarAoCarrinho = async (produto) => {
    if (!idUsuario) {
      alert("Você precisa estar logado.");
      return;
    }
    const idProduto = produto.id;
    try {
      const resposta = await fetch("https://localhost:7294/Carrinho");
      const todos = await resposta.json();
      const existente = todos.find(c => c.idUsuario === idUsuario && c.idProduto === idProduto);
      if (existente) {
        const novaQuantidade = existente.quantidade + 1;
        await fetch(`https://localhost:7294/Carrinho/${existente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUsuario, idProduto, quantidade: novaQuantidade })
        });
      } else {
        await fetch("https://localhost:7294/Carrinho", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idUsuario, idProduto, quantidade: 1 })
        });
      }
      alert("Produto adicionado ao carrinho!");
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      alert("Erro ao adicionar ao carrinho.");
    }
  };

  return (
    <>
      <div className="conteiner-masc">
        <div className="masc-content">
          <h2 className="title-masc">Masculino</h2>
          <p>({produtosFiltrados.length}) Resultado{produtosFiltrados.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="flex-conteiner">
        <aside className="sidebar">

          {temFiltrosAtivos && (
            <div className="filtros-aplicados-container">
              <div className="filtros-aplicados-top">
                <span>FILTROS APLICADOS:</span>
                <button className="limpar-tudo-btn" onClick={limparFiltros}>Limpar tudo</button>
              </div>
              <div className="filtros-lista">
                {filtros.categorias.map(cat => (
                  <button
                    key={`cat-${cat}`}
                    className="filtro-btn"
                    onClick={() => removerFiltro('categorias', cat)}
                  >× {cat}</button>
                ))}
                {filtros.subcategorias.map(sub => (
                  <button
                    key={`sub-${sub}`}
                    className="filtro-btn"
                    onClick={() => removerFiltro('subcategorias', sub)}
                  >× {sub}</button>
                ))}
                {filtros.tamanhos.map(tam => (
                  <button
                    key={`tam-${tam}`}
                    className="filtro-btn"
                    onClick={() => removerFiltro('tamanhos', tam)}
                  >× {tam}</button>
                ))}
                {filtros.cores.map(cor => (
                  <button
                    key={`cor-${cor}`}
                    className="filtro-btn"
                    onClick={() => removerFiltro('cores', cor)}
                  >× {cor}</button>
                ))}
                {(filtros.preco[0] !== 0 || filtros.preco[1] !== 2600) && (
                  <button
                    className="filtro-btn"
                    onClick={() => removerFiltro('preco')}
                  >
                    × R$ {filtros.preco[0]} - R$ {filtros.preco[1]}
                  </button>
                )}
              </div>
            </div>
          )}


          {/* Filtros por Categoria/Subcategoria/Tamanho */}
          {ChecksList.map((item, index) => (
            <details key={index}>
              <summary>{item.title}</summary>
              {item.categoriaTamanho ? (
                item.categoriaTamanho.map((subItem, subIndex) => (
                  <details key={subIndex} className="tamanho-filtros" open>
                    <summary>{subItem.tipo}</summary>
                    <ul className="lista-composta">
                      {subItem.checksLists.map((check, i) => (
                        <li key={i}>
                          <label>
                            <input type="checkbox" checked={filtros.tamanhos.includes(check)} onChange={() => handleCheckboxChange("tamanhos", check)} /> {check}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))
              ) : (
                <ul className="lista-simples">
                  {item.checksLists.map((check, i) => (
                    <li key={i}>
                      <label>
                        <input type="checkbox" checked={filtros[item.tipo]?.includes(check)} onChange={() => handleCheckboxChange(item.tipo, check)} /> {check}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}

          {/* Filtro por Cor */}
          <details className='details-cor'>
            <summary>Cor</summary>
            <div className="filtros-cor">
              {CoresDisponiveis.map((cor, index) => {
                const isChecked = filtros.cores.includes(cor);
                return (
                  <label key={index} className="cor-label">
                    <input
                      type="checkbox"
                      value={cor}
                      checked={isChecked}
                      onChange={() => handleCheckboxChange("cores", cor)}
                    />
                    <span
                      className="cor-circulo"
                      style={{
                        backgroundColor: mapaCores[cor] || "transparent",
                        border: cor === "Branco" ? "1px solid #888" : "none",
                      }}
                    >
                    </span>
                    {cor}
                  </label>
                );
              })}
            </div>
          </details>


          {/* Filtro por Preço */}
          <div className='faixa-preco'>
            <h2 className='preco-filtro'>Faixas de preço</h2>

            <div className="range-wrapper">
              <div className="range-background"></div>
              <div
                className="range-highlight"
                style={{
                  left: `${(filtros.preco[0] / 2600) * 100}%`,
                  width: `${((filtros.preco[1] - filtros.preco[0]) / 2600) * 100}%`,
                }}
              />
              <input
                type="range"
                min="0"
                max="2600"
                step="10"
                value={filtros.preco[0]}
                onChange={(e) => handlePrecoChange(e, 0)}
              />
              <input
                type="range"
                min="0"
                max="2600"
                step="10"
                value={filtros.preco[1]}
                onChange={(e) => handlePrecoChange(e, 1)}
              />
            </div>

            <div className="range-valores">
              <span>R$ {filtros.preco[0]}</span>
              <span>R$ {filtros.preco[1]}</span>
            </div>
          </div>



        </aside>

        <main className="content">
          <div className="masc-produtos">
            {produtosFiltrados.map((prod) => (
              <Link to={`/produto/${prod.id}`} key={prod.id}>
                <div className="card-prods">
                  <img src={prod.urlImagens[0]} alt={prod.nome} onError={(e) => { e.target.src = "http://via.placeholder.com/300x200.png?text=Produto+sem+imagem"; }} />
                  <div className="text-card">
                    <h4 className="nome">{prod.nome}</h4>
                    <p className="categoria">{prod.categoria}</p>
                    <p className="preco">{prod.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                  <div className="btns-actions">
                    <button onClick={(e) => { e.preventDefault(); adicionarAoCarrinho(prod); }}>Adicionar ao Carrinho</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div >
    </>
  );
};

export default Masculino;
