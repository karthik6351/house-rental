const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create transporter
const createTransporter = () => {
    // For development, use Ethereal (fake SMTP)
    // For production, use real SMTP (Gmail, SendGrid, etc.)

    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Development: Log email to console instead of sending
        return {
            sendMail: async (mailOptions) => {
                logger.info('=== EMAIL (Development Mode) ===');
                logger.info(`To: ${mailOptions.to}`);
                logger.info(`Subject: ${mailOptions.subject}`);
                logger.info(`Body:\n${mailOptions.text}`);
                logger.info('================================');
                return { messageId: 'dev-mode-' + Date.now() };
            }
        };
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'House Rental <noreply@houserental.com>',
        to: email,
        subject: 'Password Reset Request - House Rental Platform',
        text: `
Hello ${userName},

You requested to reset your password for your House Rental account.

Click the link below to reset your password (valid for 15 minutes):
${resetUrl}

If you didn't request this, please ignore this email and your password will remain unchanged.

For security reasons, this link will expire in 15 minutes.

Best regards,
House Rental Team
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 House Rental</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>You requested to reset your password for your House Rental account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link is valid for only <strong>15 minutes</strong></li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Your password will remain unchanged</li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} House Rental Platform. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Email sending failed:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendPasswordResetEmail
};
