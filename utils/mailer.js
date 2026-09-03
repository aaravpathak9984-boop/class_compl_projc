/**
 * ============================================================================
 * Mailer Utility (utils/mailer.js)
 * ============================================================================
 * Sends 6-digit account verification emails to users.
 * Supports production SMTP / Gmail as well as automatic Ethereal test accounts.
 */

const nodemailer = require('nodemailer');

const sendVerificationEmail = async (toEmail, code) => {
  try {
    let transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Production Gmail / SMTP service
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Fallback test transporter (Ethereal test mail)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const mailOptions = {
      from: '"Cineplex" <no-reply@cineplex.com>',
      to: toEmail,
      subject: `Your Cineplex Verification Code: ${code}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 30px; background: #0c0c12; color: #ffffff; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <div style="margin-bottom: 20px;">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #0a84ff;">🎬 CINEPLEX</span>
          </div>
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #ffffff;">Verify your email address</h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;">
            Thank you for registering with Cineplex. Please use the following 6-digit verification code to activate your account:
          </p>
          <div style="background: rgba(10, 132, 255, 0.12); border: 1px solid rgba(10, 132, 255, 0.4); border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0a84ff;">${code}</span>
          </div>
          <p style="color: rgba(255,255,255,0.5); font-size: 13px;">
            This security code is valid for 15 minutes. If you did not request this email, no further action is needed.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`Verification email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`Preview email at: ${previewUrl}`);
    }

    return { success: true, previewUrl };
  } catch (err) {
    console.error('Mailer execution notice:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendVerificationEmail };
