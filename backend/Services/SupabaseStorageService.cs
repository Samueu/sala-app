using System.Net.Http.Headers;

namespace SalaApp.Api.Services;

/// <summary>
/// Chama a REST API do Supabase Storage direto via HttpClient — não existe um SDK
/// .NET oficial mantido pela Supabase, e o backend já não depende de nenhum SDK
/// deles (Npgsql direto pro Postgres, HTTP direto pro JWKS), então mantém o padrão.
/// </summary>
public class SupabaseStorageService(HttpClient httpClient, IConfiguration configuration) : ISupabaseStorageService
{
    public async Task<string> UploadAsync(string objectPath, Stream content, string contentType)
    {
        var supabaseUrl = configuration["Supabase:Url"];
        var serviceRoleKey = configuration["Supabase:ServiceRoleKey"];
        var bucket = configuration["Supabase:StorageBucket"] ?? "attachments";

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(serviceRoleKey))
        {
            throw new InvalidOperationException("Supabase Storage não está configurado (Supabase:Url/ServiceRoleKey).");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{supabaseUrl}/storage/v1/object/{bucket}/{objectPath}");
        // O Storage exige tanto o header "apikey" quanto "Authorization: Bearer" —
        // aqui os dois recebem a service_role key (acesso total, ignora RLS do
        // Storage; o backend já é o limite de confiança da aplicação).
        request.Headers.Add("apikey", serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
        request.Content = new StreamContent(content);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(
            string.IsNullOrEmpty(contentType) ? "application/octet-stream" : contentType);

        var response = await httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Falha ao enviar arquivo pro Supabase Storage ({(int)response.StatusCode}): {error}");
        }

        return $"{supabaseUrl}/storage/v1/object/public/{bucket}/{objectPath}";
    }
}
