const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const EmailLog = require('../models/EmailLog');

// Try to load Resend (optional dependency)
let Resend;
try {
  const resendModule = require('resend');
  Resend = resendModule.Resend;
} catch (e) {
  // Resend not installed, will fall back to nodemailer
}

class EmailService {
  constructor() {
    // Determine which email provider to use
    if (process.env.RESEND_API_KEY && Resend) {
      this.provider = 'resend';
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✓ Email service using: Resend');
    } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      this.provider = 'smtp';
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      console.log('✓ Email service using: SMTP (Nodemailer)');
    } else {
      console.warn('⚠️  No email provider configured! Set RESEND_API_KEY or EMAIL_* variables');
      this.provider = 'none';
    }
  }

  /**
   * Send email using configured provider
   */
  async sendEmail({ to, subject, html, text, attachments = [] }) {
    if (this.provider === 'none') {
      throw new Error('No email provider configured');
    }

    if (this.provider === 'resend') {
      return await this.sendWithResend({ to, subject, html, text, attachments });
    } else {
      return await this.sendWithSMTP({ to, subject, html, text, attachments });
    }
  }

  /**
   * Send email via Resend
   */
  async sendWithResend({ to, subject, html, text, attachments }) {
    try {
      // Convert file attachments to base64 for Resend
      const resendAttachments = [];

      for (const attachment of attachments) {
        if (attachment.path && fs.existsSync(attachment.path)) {
          const content = fs.readFileSync(attachment.path);
          resendAttachments.push({
            filename: attachment.filename,
            content: content
          });
        }
      }

      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: to,
        subject: subject,
        html: html,
        text: text, // Plain text version improves deliverability
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined
      });

      // Debug: Log full response structure
      console.log('Resend API response:', JSON.stringify(result, null, 2));

      // Check for errors in response
      if (result?.error) {
        console.error('✗ Resend API error:', result.error);
        throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
      }

      // Resend response structure: { data: { id: '...' }, error: null }
      const emailId = result?.data?.id || result?.id || 'unknown';

      if (emailId === 'unknown') {
        console.warn('⚠️  Could not extract email ID from Resend response');
        console.warn('Response keys:', Object.keys(result || {}));
      } else {
        console.log('✓ Email sent via Resend:', emailId);
      }

      return { success: true, messageId: emailId };
    } catch (error) {
      console.error('✗ Resend error:', error);
      console.error('Error details:', error.message, error.stack);
      throw error;
    }
  }

  /**
   * Send email via SMTP (Nodemailer)
   */
  async sendWithSMTP({ to, subject, html, text, attachments }) {
    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: subject,
        html: html,
        text: text, // Plain text version improves deliverability
        attachments: attachments
      });

      console.log('✓ Email sent via SMTP:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('✗ SMTP error:', error);
      throw error;
    }
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
            Ihr GAiN Austria Team 💙💛</p>
          </div>
          <div class="footer">
            <p>GAiN (Global Aid Network) Austria</p>
            <p>Diese E-Mail wurde automatisch generiert.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version for better deliverability
    const textContent = `
Vielen Dank für Ihre Spende!

Liebe Spenderin, lieber Spender,

vielen Dank, dass Sie einem Menschen in der Ukraine eine Freude bereiten möchten!

Bitte bestätigen Sie Ihre E-Mail-Adresse:
${verificationLink}

Nach der Bestätigung wird Ihr QR-Code aktiviert und Sie erhalten automatisch eine E-Mail, sobald Ihr Geschenk in der Ukraine angekommen ist und der Empfänger eine Dankesnachricht gesendet hat.

Status verfolgen:
${statusLink}

Herzliche Grüße
Ihr GAiN Austria Team

---
GAiN (Global Aid Network) Austria
Diese E-Mail wurde automatisch generiert.
    `.trim();

    try {
      await this.sendEmail({
        to: email,
        subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse - GAiN Austria',
        html: htmlContent,
        text: textContent
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

    // Sanitize message - handle null, undefined, 'undefined', empty strings
    const hasMessage = recipient_message &&
                       recipient_message !== 'undefined' &&
                       recipient_message.trim().length > 0;
    const sanitizedMessage = hasMessage ? recipient_message.trim() : null;

    console.log('Sending email - original message:', recipient_message);
    console.log('Sending email - sanitized message:', sanitizedMessage);

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

            ${sanitizedMessage ? `
            <div class="message-box">
              <p><strong>Nachricht:</strong></p>
              <p><em>"${sanitizedMessage}"</em></p>
            </div>
            ` : ''}

            <p>Im Anhang dieser E-Mail finden Sie die Foto(s), die der Empfänger für Sie hochgeladen hat.</p>

            <p><strong>Vielen Dank für Ihre Unterstützung! 💙💛</strong></p>

            <p>Mit Ihrer Spende haben Sie einem Menschen in schwierigen Zeiten geholfen und Hoffnung geschenkt.</p>

            <p>Herzliche Grüße<br>
            Ihr GAiN Austria Team</p>
          </div>
          <div class="footer">
            <p>GAiN (Global Aid Network) Austria</p>
            <p>Ihre Daten werden gemäß DSGVO geschützt und nach 12 Monaten automatisch gelöscht.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version for better deliverability
    const textContent = `
Dankesnachricht erhalten!

Liebe Spenderin, lieber Spender,

Ihr Geschenk ist angekommen!

Der Empfänger in der Ukraine hat Ihr Geschenk erhalten und möchte sich bei Ihnen bedanken.

${sanitizedMessage ? `Nachricht:\n"${sanitizedMessage}"\n` : ''}
Im Anhang dieser E-Mail finden Sie die Foto(s), die der Empfänger für Sie hochgeladen hat.

Vielen Dank für Ihre Unterstützung!

Mit Ihrer Spende haben Sie einem Menschen in schwierigen Zeiten geholfen und Hoffnung geschenkt.

Herzliche Grüße
Ihr GAiN Austria Team

---
GAiN (Global Aid Network) Austria
Ihre Daten werden gemäß DSGVO geschützt und nach 12 Monaten automatisch gelöscht.
    `.trim();

    // Parse photo paths from JSON (can be array or string for backwards compatibility)
    const attachments = [];
    if (recipient_photo_path) {
      try {
        const photoPaths = JSON.parse(recipient_photo_path);
        const pathsArray = Array.isArray(photoPaths) ? photoPaths : [photoPaths];

        pathsArray.forEach((photoPath, index) => {
          if (fs.existsSync(photoPath)) {
            const extension = path.extname(photoPath);
            attachments.push({
              filename: `dankesfoto_${index + 1}${extension}`,
              path: photoPath
            });
          }
        });

        console.log(`Attaching ${attachments.length} photo(s) to email`);
      } catch (error) {
        // Fallback for old single-path format (backwards compatibility)
        console.log('Photo path is not JSON, treating as single path');
        if (fs.existsSync(recipient_photo_path)) {
          attachments.push({
            filename: 'dankesfoto.jpg',
            path: recipient_photo_path
          });
        }
      }
    }

    try {
      await this.sendEmail({
        to: donor_email,
        subject: 'Dankesnachricht aus der Ukraine - GAiN Austria',
        html: htmlContent,
        text: textContent,
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
