namespace SalaApp.Api.Repositories;

public interface IServerMemberRepository
{
    Task<bool> IsMemberAsync(Guid serverId, Guid userId);
}
