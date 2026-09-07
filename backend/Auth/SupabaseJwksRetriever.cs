using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Tokens;

namespace SalaApp.Api.Auth;

/// <summary>
/// O Supabase não publica um discovery document OpenID Connect completo, só o JWKS em
/// "/auth/v1/.well-known/jwks.json". Esse retriever busca esse JSON e monta um
/// JsonWebKeySet, pra ser usado num ConfigurationManager&lt;JsonWebKeySet&gt; com cache e
/// atualização automática.
/// </summary>
public class SupabaseJwksRetriever : IConfigurationRetriever<JsonWebKeySet>
{
    public async Task<JsonWebKeySet> GetConfigurationAsync(
        string address, IDocumentRetriever retriever, CancellationToken cancel)
    {
        var json = await retriever.GetDocumentAsync(address, cancel);
        return JsonWebKeySet.Create(json);
    }
}
