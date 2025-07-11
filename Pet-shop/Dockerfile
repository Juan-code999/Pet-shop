# Etapa 1: imagem base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

# Etapa 2: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar o arquivo .csproj correto
COPY Pet_shop.csproj ./  # Certifique-se de que esse é o nome correto

# Restaurar dependências
RUN dotnet restore "Pet_shop.csproj"  # Use o nome correto

# Copiar o restante do código
COPY . . 

WORKDIR "/src"

# Build do projeto
RUN dotnet build "Pet_shop.csproj" -c Release -o /app/build

# Etapa 3: publish
FROM build AS publish
RUN dotnet publish "Pet_shop.csproj" -c Release -o /app/publish

# Etapa 4: imagem final
FROM base AS final
WORKDIR /app

# Copiar os arquivos de publicação para a imagem final
COPY --from=publish /app/publish . 

# Definir o ponto de entrada para a aplicação
ENTRYPOINT ["dotnet", "Pet_shop.dll"]  # Certifique-se de que o nome do arquivo .dll é correto
