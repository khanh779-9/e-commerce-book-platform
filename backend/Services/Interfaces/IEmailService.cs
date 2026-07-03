namespace ECommerceBookPlatform.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, string? textBody = null, CancellationToken ct = default);
    Task SendEmailVerificationAsync(string toEmail, string toName, string verificationLink, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string toName, string resetLink, CancellationToken ct = default);
    Task SendOrderConfirmationAsync(string toEmail, string toName, int orderId, decimal totalAmount, CancellationToken ct = default);
    Task SendOrderStatusUpdateAsync(string toEmail, string toName, int orderId, string status, CancellationToken ct = default);
    Task SendWelcomeAsync(string toEmail, string toName, CancellationToken ct = default);
}