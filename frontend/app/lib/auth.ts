// Não existe client Supabase no frontend ainda. Isso é o ponto de extensão pra
// quando a autenticação real for ligada aqui — até lá, quem chama getAccessToken()
// recebe null (e o backend, que exige [Authorize] em tudo que usa isso, responde 401).
let accessTokenProvider: () => Promise<string | null> = async () => null;

export function setAccessTokenProvider(fn: () => Promise<string | null>) {
  accessTokenProvider = fn;
}

export function getAccessToken(): Promise<string | null> {
  return accessTokenProvider();
}
