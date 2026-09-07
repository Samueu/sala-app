using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IMessageRepository
{
    Task<Message> AddAsync(Message message);
}
