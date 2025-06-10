import React, { useState } from "react";
import axios from "axios";

function FormProduto() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [especieAnimal, setEspecieAnimal] = useState("");
  const [idadeRecomendada, setIdadeRecomendada] = useState("");
  const [porteAnimal, setPorteAnimal] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [desconto, setDesconto] = useState(0);
  const [disponivel, setDisponivel] = useState(true);
  const [imagens, setImagens] = useState([]);
  const [tamanhos, setTamanhos] = useState([
    { tamanho: "", precoPorKg: "", precoTotal: "" }
  ]);

  const handleAddTamanho = () => {
    setTamanhos([...tamanhos, { tamanho: "", precoPorKg: "", precoTotal: "" }]);
  };

  const handleTamanhoChange = (index, field, value) => {
    const novosTamanhos = [...tamanhos];
    novosTamanhos[index][field] = value;
    setTamanhos(novosTamanhos);
  };

  const handleFileChange = (e) => {
    const arquivosNovos = Array.from(e.target.files);
    setImagens(prev => [...prev, ...arquivosNovos]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imagensUrl = [];
      for (const imagem of imagens) {
        const formData = new FormData();
        formData.append("file", imagem);
        formData.append("upload_preset", "LatMiau");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dnuwa7gs2/image/upload",
          formData
        );
        imagensUrl.push(response.data.secure_url);
      }

      const produtoData = {
        nome,
        descricao,
        categoria,
        marca,
        especieAnimal,
        idadeRecomendada,
        porteAnimal,
        destaque,
        desconto: parseFloat(desconto),
        disponivel,
        imagensUrl,
        tamanhos: tamanhos.map(t => ({
          tamanho: t.tamanho,
          precoPorKg: parseFloat(t.precoPorKg),
          precoTotal: parseFloat(t.precoTotal)
        }))
      };

      console.log("Enviando para API:", produtoData);
      await axios.post("http://localhost:5005/api/Produtos", produtoData);
      alert("Produto cadastrado com sucesso!");

      // Limpar
      setNome(""); setDescricao(""); setCategoria(""); setMarca("");
      setEspecieAnimal(""); setIdadeRecomendada(""); setPorteAnimal("");
      setDestaque(false); setDesconto(0); setDisponivel(true);
      setImagens([]); setTamanhos([{ tamanho: "", precoPorKg: "", precoTotal: "" }]);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao cadastrar produto.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
      <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} required />
      <input placeholder="Categoria" value={categoria} onChange={e => setCategoria(e.target.value)} required />
      <input placeholder="Marca" value={marca} onChange={e => setMarca(e.target.value)} required />
      <input placeholder="Espécie Animal" value={especieAnimal} onChange={e => setEspecieAnimal(e.target.value)} />
      <input placeholder="Idade Recomendada" value={idadeRecomendada} onChange={e => setIdadeRecomendada(e.target.value)} />
      <input placeholder="Porte do Animal" value={porteAnimal} onChange={e => setPorteAnimal(e.target.value)} />

      <label>
        Destaque
        <input type="checkbox" checked={destaque} onChange={e => setDestaque(e.target.checked)} />
      </label>

      <input
        type="number"
        placeholder="Desconto (%)"
        value={desconto}
        onChange={e => setDesconto(e.target.value)}
      />

      <label>
        Disponível
        <input type="checkbox" checked={disponivel} onChange={e => setDisponivel(e.target.checked)} />
      </label>

      <h4>Tamanhos:</h4>
      {tamanhos.map((t, index) => (
        <div key={index}>
          <input
            placeholder="Tamanho (ex: 2,5 Kg)"
            value={t.tamanho}
            onChange={e => handleTamanhoChange(index, "tamanho", e.target.value)}
            required
          />
          <input
            placeholder="Preço por Kg"
            type="number"
            value={t.precoPorKg}
            onChange={e => handleTamanhoChange(index, "precoPorKg", e.target.value)}
            required
          />
          <input
            placeholder="Preço Total"
            type="number"
            value={t.precoTotal}
            onChange={e => handleTamanhoChange(index, "precoTotal", e.target.value)}
            required
          />
        </div>
      ))}
      <button type="button" onClick={handleAddTamanho}>+ Adicionar Tamanho</button>

      <input type="file" multiple accept="image/*" onChange={handleFileChange} required />
      <button type="submit">Cadastrar Produto</button>
    </form>
  );
}

export default FormProduto;
