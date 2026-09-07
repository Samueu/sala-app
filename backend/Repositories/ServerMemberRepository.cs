using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;

namespace SalaApp.Api.Repositories;

public class ServerMemberRepository(AppDbContext context) : IServerMemberRepository
{
    public Task<bool> IsMemberAsync(Guid serverId, Guid userId) =>
        context.ServerMembers.AsNoTracking()
            .AnyAsync(sm => sm.ServerId == serverId && sm.UserId == userId);
}
