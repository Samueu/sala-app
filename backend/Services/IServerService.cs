using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IServerService
{
    Task<IEnumerable<Server>> GetForUserAsync(Guid userId);
    Task<Server?> GetByIdAsync(Guid id);

    /// <summary>
    /// Cria o servidor com o dono vindo do token (não do corpo da requisição) e já
    /// insere a membership do dono (ServerMemberRole.Owner) — sem isso o dono não
    /// veria o próprio servidor em GetForUserAsync.
    /// </summary>
    Task<Server> CreateAsync(Server server, Guid ownerId);
    Task<bool> UpdateAsync(Server server);
    Task<bool> DeleteAsync(Guid id);
}
