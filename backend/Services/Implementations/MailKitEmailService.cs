using System.Net.Mail;
using System.Text;
using ECommerceBookPlatform.Services.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;

namespace ECommerceBookPlatform.Services.Implementations;

public class EmailSettings
{
    public string SmtpHost { get; set; } = "smtp.gmail.com";
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = "";
    public string SmtpPass { get; set; } = "";
    public string FromEmail { get; set; } = "";
    public string FromName { get; set; } = "BookZone";
    public bool EnableSsl { get; set; } = true;
    public string BaseUrl { get; set; } = "";
}

public class MailKitEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<MailKitEmailService> _logger;

    public MailKitEmailService(IOptions<EmailSettings> settings, ILogger<MailKitEmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, string? textBody = null, CancellationToken ct = default)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody,
                TextBody = textBody ?? StripHtml(htmlBody)
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new MailKit.Net.Smtp.SmtpClient();
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, _settings.EnableSsl ? MailKit.Security.SecureSocketOptions.StartTls : MailKit.Security.SecureSocketOptions.None, ct);
            
            if (!string.IsNullOrEmpty(_settings.SmtpUser))
            {
                await client.AuthenticateAsync(_settings.SmtpUser, _settings.SmtpPass, ct);
            }

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Email sent to {ToEmail}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            throw;
        }
    }

    public Task SendEmailVerificationAsync(string toEmail, string toName, string verificationLink, CancellationToken ct = default)
    {
        var subject = "Xác thực email - BookZone";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e2633; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 24px; }}
        .header {{ text-align: center; padding: 24px 0; border-bottom: 1px solid #e6e7e2; }}
        .logo {{ font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; color: #2b5a9b; margin: 0; }}
        .content {{ padding: 32px 0; }}
        .btn {{ display: inline-block; background: #2b5a9b; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
        .footer {{ text-align: center; padding: 24px 0; border-top: 1px solid #e6e7e2; color: #868e9a; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 class='logo'>BookZone</h1>
        </div>
        <div class='content'>
            <h2>Chào {toName},</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại BookZone. Để hoàn tất quá trình đăng ký, vui lòng nhấn nút bên dưới để xác thực địa chỉ email của bạn:</p>
            <p style='text-align: center; margin: 32px 0;'>
                <a href='{verificationLink}' class='btn'>Xác thực email</a>
            </p>
            <p>Hoặc copy đường dẫn sau vào trình duyệt:</p>
            <p style='word-break: break-all; color: #566070; font-size: 14px;'>{verificationLink}</p>
            <p>Liên kết này có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
        <div class='footer'>
            <p>BookZone - Nhà sách trực tuyến dành cho người yêu đọc</p>
            <p>123 Đường Sách, Quận 1, TP.HCM | 1900 6789</p>
        </div>
    </div>
</body>
</html>";

        return SendEmailAsync(toEmail, toName, subject, htmlBody, null, ct);
    }

    public Task SendPasswordResetAsync(string toEmail, string toName, string resetLink, CancellationToken ct = default)
    {
        var subject = "Đặt lại mật khẩu - BookZone";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e2633; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 24px; }}
        .header {{ text-align: center; padding: 24px 0; border-bottom: 1px solid #e6e7e2; }}
        .logo {{ font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; color: #2b5a9b; margin: 0; }}
        .content {{ padding: 32px 0; }}
        .btn {{ display: inline-block; background: #2b5a9b; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
        .footer {{ text-align: center; padding: 24px 0; border-top: 1px solid #e6e7e2; color: #868e9a; font-size: 14px; }}
        .warning {{ background: #fef3e3; border: 1px solid #d9a441; border-radius: 8px; padding: 16px; margin: 16px 0; color: #8a6a1e; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 class='logo'>BookZone</h1>
        </div>
        <div class='content'>
            <h2>Chào {toName},</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tạo mật khẩu mới:</p>
            <p style='text-align: center; margin: 32px 0;'>
                <a href='{resetLink}' class='btn'>Đặt lại mật khẩu</a>
            </p>
            <div class='warning'>
                <strong>Lưu ý:</strong> Liên kết này có hiệu lực trong <strong>15 phút</strong> và chỉ sử dụng được một lần. 
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
            </div>
        </div>
        <div class='footer'>
            <p>BookZone - Nhà sách trực tuyến dành cho người yêu đọc</p>
            <p>123 Đường Sách, Quận 1, TP.HCM | 1900 6789</p>
        </div>
    </div>
</body>
</html>";

        return SendEmailAsync(toEmail, toName, subject, htmlBody, null, ct);
    }

    public Task SendOrderConfirmationAsync(string toEmail, string toName, int orderId, decimal totalAmount, CancellationToken ct = default)
    {
        var subject = $"Xác nhận đơn hàng #{orderId} - BookZone";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e2633; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 24px; }}
        .header {{ text-align: center; padding: 24px 0; border-bottom: 1px solid #e6e7e2; }}
        .logo {{ font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; color: #2b5a9b; margin: 0; }}
        .content {{ padding: 32px 0; }}
        .order-info {{ background: #f8f8f4; border-radius: 8px; padding: 20px; margin: 16px 0; }}
        .order-row {{ display: flex; justify-content: space-between; padding: 8px 0; }}
        .total {{ font-weight: 700; font-size: 18px; color: #2b5a9b; }}
        .btn {{ display: inline-block; background: #2b5a9b; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
        .footer {{ text-align: center; padding: 24px 0; border-top: 1px solid #e6e7e2; color: #868e9a; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 class='logo'>BookZone</h1>
        </div>
        <div class='content'>
            <h2>Chào {toName},</h2>
            <p>Cảm ơn bạn đã đặt hàng tại BookZone! Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận.</p>
            <div class='order-info'>
                <div class='order-row'><span>Mã đơn hàng:</span><strong>#{orderId}</strong></div>
                <div class='order-row'><span>Trạng thái:</span><span>Chờ xác nhận</span></div>
                <div class='order-row total'><span>Tổng cộng:</span><span>{totalAmount:N0} VND</span></div>
            </div>
            <p style='text-align: center; margin: 32px 0;'>
                <a href='{_settings.BaseUrl}/account/orders/{orderId}' class='btn'>Xem chi tiết đơn hàng</a>
            </p>
            <p>Chúng tôi sẽ thông báo khi đơn hàng được xác nhận và giao hàng. Nếu có thắc mắc, hãy liên hệ hotline 1900 6789.</p>
        </div>
        <div class='footer'>
            <p>BookZone - Nhà sách trực tuyến dành cho người yêu đọc</p>
            <p>123 Đường Sách, Quận 1, TP.HCM | 1900 6789</p>
        </div>
    </div>
</body>
</html>";

        return SendEmailAsync(toEmail, toName, subject, htmlBody, null, ct);
    }

    public Task SendOrderStatusUpdateAsync(string toEmail, string toName, int orderId, string status, CancellationToken ct = default)
    {
        var statusText = status switch
        {
            "da_xac_nhan" => "Đã xác nhận",
            "dang_giao_hang" => "Đang giao hàng",
            "da_giao_hang" => "Đã giao thành công",
            "da_huy" => "Đã hủy",
            _ => status
        };

        var subject = $"Cập nhật đơn hàng #{orderId} - {statusText}";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e2633; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 24px; }}
        .header {{ text-align: center; padding: 24px 0; border-bottom: 1px solid #e6e7e2; }}
        .logo {{ font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; color: #2b5a9b; margin: 0; }}
        .content {{ padding: 32px 0; }}
        .status-badge {{ display: inline-block; background: #e7eef8; color: #2b5a9b; padding: 8px 16px; border-radius: 20px; font-weight: 600; }}
        .btn {{ display: inline-block; background: #2b5a9b; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
        .footer {{ text-align: center; padding: 24px 0; border-top: 1px solid #e6e7e2; color: #868e9a; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 class='logo'>BookZone</h1>
        </div>
        <div class='content'>
            <h2>Chào {toName},</h2>
            <p>Đơn hàng <strong>#{orderId}</strong> của bạn đã được cập nhật trạng thái:</p>
            <p style='text-align: center; margin: 24px 0;'>
                <span class='status-badge'>{statusText}</span>
            </p>
            <p style='text-align: center; margin: 32px 0;'>
                <a href='{_settings.BaseUrl}/account/orders/{orderId}' class='btn'>Xem chi tiết</a>
            </p>
        </div>
        <div class='footer'>
            <p>BookZone - Nhà sách trực tuyến dành cho người yêu đọc</p>
        </div>
    </div>
</body>
</html>";

        return SendEmailAsync(toEmail, toName, subject, htmlBody, null, ct);
    }

    public Task SendWelcomeAsync(string toEmail, string toName, CancellationToken ct = default)
    {
        var subject = "Chào mừng bạn đến với BookZone!";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1e2633; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 24px; }}
        .header {{ text-align: center; padding: 24px 0; border-bottom: 1px solid #e6e7e2; }}
        .logo {{ font-family: 'Lora', Georgia, serif; font-size: 28px; font-weight: 600; color: #2b5a9b; margin: 0; }}
        .content {{ padding: 32px 0; }}
        .btn {{ display: inline-block; background: #2b5a9b; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
        .footer {{ text-align: center; padding: 24px 0; border-top: 1px solid #e6e7e2; color: #868e9a; font-size: 14px; }}
        .features {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }}
        .feature {{ text-align: center; padding: 16px; }}
        .feature-icon {{ font-size: 24px; margin-bottom: 8px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 class='logo'>BookZone</h1>
        </div>
        <div class='content'>
            <h2>Chào {toName},</h2>
            <p>Chào mừng bạn đến với BookZone - nhà sách trực tuyến dành cho người yêu đọc!</p>
            <div class='features'>
                <div class='feature'>
                    <div class='feature-icon'>📚</div>
                    <strong>Kho sách đa dạng</strong>
                    <p style='font-size: 13px; color: #566070;'>10,000+ đầu sách mọi thể loại</p>
                </div>
                <div class='feature'>
                    <div class='feature-icon'>🚚</div>
                    <strong>Giao hàng nhanh</strong>
                    <p style='font-size: 13px; color: #566070;'>Miễn phí ship từ 500K</p>
                </div>
                <div class='feature'>
                    <div class='feature-icon'>🎁</div>
                    <strong>Điểm thưởng</strong>
                    <p style='font-size: 13px; color: #566070;'>Tích điểm đổi quà hấp dẫn</p>
                </div>
            </div>
            <p style='text-align: center; margin: 32px 0;'>
                <a href='{_settings.BaseUrl}' class='btn'>Khám phá ngay</a>
            </p>
        </div>
        <div class='footer'>
            <p>BookZone - Nhà sách trực tuyến dành cho người yêu đọc</p>
            <p>123 Đường Sách, Quận 1, TP.HCM | 1900 6789</p>
        </div>
    </div>
</body>
</html>";

        return SendEmailAsync(toEmail, toName, subject, htmlBody, null, ct);
    }

    private static string StripHtml(string html)
    {
        return System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty);
    }
}