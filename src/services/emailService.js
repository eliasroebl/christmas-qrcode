const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const EmailLog = require('../models/EmailLog');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send verification email to donor
   */
  async sendVerificationEmail(email, verificationToken, qrToken) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/verify?token=${verificationToken}`;
    const statusLink = `${appUrl}/status?code=${qrToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0057B8; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #FFD700; color: #0057B8; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Vielen Dank für Ihre Spende!</h1>
          </div>
          <div class="content">
            <p>Liebe Spenderin, lieber Spender,</p>

            <p>vielen Dank, dass Sie einem Menschen in der Ukraine eine Freude bereiten möchten!</p>

            <p><strong>Bitte bestätigen Sie Ihre E-Mail-Adresse:</strong></p>

            <p style="text-align: center;">
              <a href="${verificationLink}" class="button">E-Mail bestätigen</a>
            </p>

            <p>Nach der Bestätigung wird Ihr QR-Code aktiviert und Sie erhalten automatisch eine E-Mail,
            sobald Ihr Geschenk in der Ukraine angekommen ist und der Empfänger eine Dankesnachricht gesendet hat.</p>

            <p><strong>Status verfolgen:</strong><br>
            Sie können den Status Ihrer Spende jederzeit hier einsehen:<br>
            <a href="${statusLink}">${statusLink}</a></p>

            <p>Herzliche Grüße<br>
            Ihr Spenden-Team 💙💛</p>
          </div>
          <div class="footer">
            <p>Diese E-Mail wurde automatisch generiert.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '🎁 Bitte bestätigen Sie Ihre E-Mail-Adresse',
        html: htmlContent
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send thank you email to donor with photo
   */
  async sendThankYouEmail(qrCode) {
    const { donor_email, recipient_photo_path, recipient_message } = qrCode;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0057B8; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .message-box { background: white; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💌 Dankesnachricht erhalten!</h1>
          </div>
          <div class="content">
            <p>Liebe Spenderin, lieber Spender,</p>

            <p><strong>Ihr Geschenk ist angekommen! 🎉</strong></p>

            <p>Der Empfänger in der Ukraine hat Ihr Geschenk erhalten und möchte sich bei Ihnen bedanken.</p>

            ${recipient_message ? `
            <div class="message-box">
              <p><strong>Nachricht:</strong></p>
              <p><em>"${recipient_message}"</em></p>
            </div>
            ` : ''}

            <p>Im Anhang dieser E-Mail finden Sie das Foto, das der Empfänger für Sie hochgeladen hat.</p>

            <p><strong>Vielen Dank für Ihre Unterstützung! 💙💛</strong></p>

            <p>Mit Ihrer Spende haben Sie einem Menschen in schwierigen Zeiten geholfen und Hoffnung geschenkt.</p>

            <p>Herzliche Grüße<br>
            Ihr Spenden-Team</p>
          </div>
          <div class="footer">
            <p>Ihre Daten werden gemäß DSGVO geschützt und nach 12 Monaten automatisch gelöscht.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (recipient_photo_path && fs.existsSync(recipient_photo_path)) {
      attachments.push({
        filename: 'dankesfoto.jpg',
        path: recipient_photo_path
      });
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: donor_email,
        subject: '💌 Dankesnachricht aus der Ukraine',
        html: htmlContent,
        attachments: attachments
      });

      // Log email
      await EmailLog.create(qrCode.id, donor_email, 'Dankesnachricht aus der Ukraine', 'sent');

      return { success: true };
    } catch (error) {
      console.error('Error sending thank you email:', error);
      await EmailLog.create(qrCode.id, donor_email, 'Dankesnachricht aus der Ukraine', 'failed', error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();
