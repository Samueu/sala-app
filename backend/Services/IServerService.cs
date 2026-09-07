using SalaApp.Api.Models;

namespace SalaApp.Api.Services;

public interface IServerService
{
    Task<IEnumerable<Server>> GetAllAsync();
    Task<Server?> GetByIdAsync(Guid id);
    Task<Server> CreateAsync(Server server);
    Task<bool> UpdateAsync(Server server);
    Task<bool> DeleteAsync(Guid id);
}
