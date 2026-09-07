namespace SalaApp.Api.Services;

/// <summary>
/// Motivos pelos quais uma operação de amizade pode falhar. O Controller mapeia cada
/// valor pro status HTTP correspondente — mantém o Service livre de conhecimento de
/// HTTP, seguindo o mesmo espírito do resto do projeto (que hoje resolve isso com
/// retorno null + checagem no Controller; aqui só precisamos de mais de um "tipo" de
/// falha por operação, daí o enum em vez de null simples).
/// </summary>
public enum FriendRequestError
{
    ReceiverNotFound,
    CannotFriendSelf,
    AlreadyPending,
    RequestNotFound,
    NotYourRequest,
    RequestAlreadyAnswered,
    NotFriends,
}
