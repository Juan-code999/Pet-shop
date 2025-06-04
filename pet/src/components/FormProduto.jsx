import React, { useState } from "react";

function FormProduto() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imagem) {
      alert("Selecione uma imagem");
      return;
    }

   const formData = new FormData();
    formData.append("Nome", nome);
    formData.append("Descricao", descricao);
    formData.append("Preco", preco.toString().replace(",", "."));
    formData.append("Categoria", categoria);
    formData.append("imagem", imagem);  // 'imagem' tem que bater com o name do input e do parâmetro no controller

    try {
      const response = await fetch("http://localhost:5005/api/Produtos", {
        method: "POST",
        body: formData, // multipart/form-data automaticamente
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao cadastrar produto");
      }

      const data = await response.json();
      alert("Produto cadastrado com sucesso!");
      // Limpa formulário
      setNome("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setImagem(null);
      e.target.reset(); // limpa input file também
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
      />
      <input
        type="file"
        name="imagem"
        accept="image/*"
        onChange={(e) => setImagem(e.target.files[0])}
        required
      />
      <button type="submit">Cadastrar Produto</button>
    </form>
  );
}

export default FormProduto;
