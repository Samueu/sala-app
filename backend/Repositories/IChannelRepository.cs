using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IChannelRepository
{
    Task<Channel?> GetByIdAsync(Guid id);
    Task<IEnumerable<Channel>> GetByServerIdAsync(Guid serverId);
}
