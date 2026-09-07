using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

/// <summary>
/// Hoje só repassa para o repositório. Fica isolado para receber regra de
/// negócio (validações, permissões, etc.) sem precisar mexer no controller.
/// </summary>
public class ServerService(IServerRepository repository) : IServerService
{
    public Task<IEnumerable<Server>> GetAllAsync() => repository.GetAllAsync();

    public Task<Server?> GetByIdAsync(Guid id) => repository.GetByIdAsync(id);

    public Task<Server> CreateAsync(Server server) => repository.AddAsync(server);

    public Task<bool> UpdateAsync(Server server) => repository.UpdateAsync(server);

    public Task<bool> DeleteAsync(Guid id) => repository.DeleteAsync(id);
}
