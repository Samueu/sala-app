# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia só o .csproj primeiro pra aproveitar cache de camada no restore
# enquanto o resto do código ainda está mudando.
COPY SalaApp.Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Forma shell (não a forma exec com colchetes) de propósito: permite expandir $PORT
# em tempo de execução. O Fly.io não injeta PORT (usa o internal_port fixo do
# fly.toml, daí o fallback pra 8080); o Railway injeta PORT dinamicamente e espera
# que o app escute nele — esse ENTRYPOINT atende os dois com a mesma imagem.
# "exec" faz o dotnet virar o PID 1 de verdade, senão o SIGTERM do docker stop fica
# preso no shell em vez de chegar no processo — importante com conexões SignalR
# abertas (sem isso, todo shutdown vira SIGKILL depois do timeout).
ENTRYPOINT exec dotnet SalaApp.Api.dll --urls http://+:${PORT:-8080}
