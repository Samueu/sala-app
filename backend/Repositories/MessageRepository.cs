using SalaApp.Api.Data;
using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public class MessageRepository(AppDbContext context) : IMessageRepository
{
    public async Task<Message> AddAsync(Message message)
    {
        context.Messages.Add(message);
        await context.SaveChangesAsync();
        return message;
    }
}
