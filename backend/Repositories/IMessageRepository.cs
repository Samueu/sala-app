using SalaApp.Api.Models;

namespace SalaApp.Api.Repositories;

public interface IMessageRepository
{
    Task<Message> AddAsync(Message message);

    /// <summary>
    /// As últimas `take` mensagens-raiz do canal (sem thread) + TODAS as respostas
    /// delas (sem limite de idade — uma thread nunca vem cortada pela metade),
    /// ordenado por CreatedAt ascendente. Inclui o Author de cada mensagem.
    /// </summary>
    Task<IEnumerable<Message>> GetRecentForChannelAsync(Guid channelId, int take);
}
