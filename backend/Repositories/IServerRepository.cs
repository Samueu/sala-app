using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IServerRepository
{
    Task<IEnumerable<Server>> GetAllAsync();
    Task<IEnumerable<Server>> GetForUserAsync(Guid userId);
    Task<Server?> GetByIdAsync(Guid id);
    Task<Server> AddAsync(Server server);
    Task<bool> UpdateAsync(Server server);
    Task<bool> DeleteAsync(Guid id);
}
