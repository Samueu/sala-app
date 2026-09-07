using Microsoft.EntityFrameworkCore;
using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class ServerMemberRepository(AppDbContext context) : IServerMemberRepository
{
    public Task<bool> IsMemberAsync(Guid serverId, Guid userId) =>
        context.ServerMembers.AsNoTracking()
            .AnyAsync(sm => sm.ServerId == serverId && sm.UserId == userId);

    public async Task AddAsync(ServerMember member)
    {
        context.ServerMembers.Add(member);
        await context.SaveChangesAsync();
    }
}
