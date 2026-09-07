using SalaApp.Api.Models;
using SalaApp.Api.Repositories;

namespace SalaApp.Api.Services;

/// <summary>
/// Hoje só repassa para o repositório. Fica isolado para receber regra de
/// negócio (validações, permissões, etc.) sem precisar mexer no controller.
/// </summary>
public class ServerService(IServerRepository repository, IServerMemberRepository memberRepository) : IServerService
{
    public Task<IEnumerable<Server>> GetForUserAsync(Guid userId) => repository.GetForUserAsync(userId);

    public Task<Server?> GetByIdAsync(Guid id) => repository.GetByIdAsync(id);

    public async Task<Server> CreateAsync(Server server, Guid ownerId)
    {
        server.OwnerId = ownerId;
        var created = await repository.AddAsync(server);

        await memberRepository.AddAsync(new ServerMember
        {
            ServerId = created.Id,
            UserId = ownerId,
            Role = ServerMemberRole.Owner,
        });

        return created;
    }

    public Task<bool> UpdateAsync(Server server) => repository.UpdateAsync(server);

    public Task<bool> DeleteAsync(Guid id) => repository.DeleteAsync(id);
}
