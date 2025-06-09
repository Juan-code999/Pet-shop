import React, { useState } from "react";
import axios from "axios";

function FormProduto() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagens, setImagens] = useState([]); // agora é array

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1 - Upload das imagens para Cloudinary
      const imagensUrl = [];

      for (const imagem of imagens) {
        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", imagem);
        formDataCloudinary.append("upload_preset", "LatMiau");

        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dnuwa7gs2/image/upload",
          formDataCloudinary
        );

        imagensUrl.push(cloudinaryResponse.data.secure_url);
      }

      // 2 - Preparar dados do produto com array de URLs
      const produtoData = {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        imagensUrl, // agora é um array de URLs
      };

      console.log("Enviando para API:", produtoData);

      // 3 - Enviar para API
      await axios.post("http://localhost:5005/api/Produtos", produtoData);

      alert("Produto cadastrado com sucesso!");

      // 4 - Limpar formulário
      setNome("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setImagens([]);
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto. Verifique o console.");
    }
  };

  // Para atualizar o estado com múltiplos arquivos selecionados:
  const handleFileChange = (e) => {
  const arquivosNovos = Array.from(e.target.files);
  setImagens(prevImagens => [...prevImagens, ...arquivosNovos]);
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
        multiple
        onChange={handleFileChange}
        required
      />

      {/* Mostrar nomes das imagens selecionadas */}
      {imagens.length > 0 && (
        <div>
          <h4>Imagens selecionadas:</h4>
          <ul>
            {imagens.map((img, index) => (
              <li key={index}>{img.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit">Cadastrar Produto</button>
    </form>
  );
}

export default FormProduto;
