import React, { useState } from "react";
import axios from "axios";

function FormProduto() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1 - Upload da imagem para o Cloudinary
      const formDataCloudinary = new FormData();
      formDataCloudinary.append("file", imagem);
      formDataCloudinary.append("upload_preset", "LatMiau"); // Substitua pelo seu preset do Cloudinary

      const cloudinaryResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/dnuwa7gs2/image/upload",
        formDataCloudinary
      );

      const imageUrl = cloudinaryResponse.data.secure_url;

      // 2 - Preparar os dados do produto com a imagem
      const produtoData = {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        imagemUrl: imageUrl, // ⚠️ Verifique se sua API espera exatamente "imagemUrl"
      };

      console.log("Enviando para API:", produtoData);

      // 3 - Enviar dados para sua API ASP.NET Core
      await axios.post("http://localhost:5005/api/Produtos", produtoData);

      alert("Produto cadastrado com sucesso!");

      // 4 - Limpar formulário
      setNome("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setImagem(null);
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto. Verifique o console.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        accept="image/*"
        onChange={(e) => setImagem(e.target.files[0])}
        required
      />
      <button type="submit">Cadastrar Produto</button>
    </form>
  );
}

export default FormProduto;
