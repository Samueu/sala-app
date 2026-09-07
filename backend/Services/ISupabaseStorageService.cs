namespace SalaApp.Api.Services;

public interface ISupabaseStorageService
{
    /// <summary>
    /// Sobe o conteúdo pro Supabase Storage e devolve a URL pública do objeto
    /// (só é de fato acessível se o bucket estiver marcado como público).
    /// </summary>
    Task<string> UploadAsync(string objectPath, Stream content, string contentType);
}
