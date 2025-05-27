const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const { createLogger } = require('./logger');

const logger = createLogger('Email');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.init();
  }

  async init() {
    try {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      if (process.env.NODE_ENV !== 'test') {
        await this.transporter.verify();
        logger.info('Email service initialized successfully');
      }

      // Load email templates
      await this.loadTemplates();
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      
      // Create a mock transporter for development
      if (process.env.NODE_ENV === 'development') {
        this.transporter = {
          sendMail: async (options) => {
            logger.info('Mock email sent:', {
              to: options.to,
              subject: options.subject,
              text: options.text?.substring(0, 100) + '...'
            });
            return { messageId: 'mock-message-id' };
          }
        };
      }
    }
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      // Create templates directory if it doesn't exist
      try {
        await fs.access(templatesDir);
      } catch {
        await fs.mkdir(templatesDir, { recursive: true });
        await this.createDefaultTemplates(templatesDir);
      }

      const templateFiles = await fs.readdir(templatesDir);
      
      for (const file of templateFiles) {
        if (file.endsWith('.html')) {
          const templateName = path.basename(file, '.html');
          const templateContent = await fs.readFile(path.join(templatesDir, file), 'utf8');
          this.templates.set(templateName, templateContent);
        }
      }

      logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  async createDefaultTemplates(templatesDir) {
    const templates = {
      emailVerification: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RSA Transportation</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello {{name}},</p>
            <p>Thank you for registering with RSA Transportation. Please click the button below to verify your email address:</p>
            <p style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify Email</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{{verificationUrl}}</p>
            <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 RSA Transportation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      passwordReset: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>RSA Transportation</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello {{name}},</p>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <p style="text-align: center;">
                <a href="{{resetUrl}}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{{resetUrl}}</p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 RSA Transportation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      welcome: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to RSA Transportation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to RSA Transportation!</h1>
        </div>
        <div class="content">
            <h2>Welcome aboard, {{name}}!</h2>
            <p>Thank you for joining RSA Transportation. We're excited to have you as part of our community.</p>
            <p>With your account, you can:</p>
            <ul>
                <li>Book transportation services</li>
                <li>Track your trips in real-time</li>
                <li>Manage your bookings</li>
                <li>Access exclusive offers</li>
            </ul>
            <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="button">Get Started</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; 2024 RSA Transportation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
    };

    for (const [name, content] of Object.entries(templates)) {
      await fs.writeFile(path.join(templatesDir, `${name}.html`), content);
    }
  }

  replaceTemplateVariables(template, data) {
    let result = template;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    
    return result;
  }

  async sendEmail({ to, subject, template, data = {}, text, html, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      let emailHtml = html;
      let emailText = text;

      // Use template if provided
      if (template && this.templates.has(template)) {
        emailHtml = this.replaceTemplateVariables(this.templates.get(template), data);
        
        // Generate text version from HTML if not provided
        if (!emailText) {
          emailText = emailHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        }
      }

      const mailOptions = {
        from: `"RSA Transportation" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text: emailText,
        html: emailHtml,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send email:', {
        to,
        subject,
        error: error.message
      });
      throw error;
    }
  }

  async sendBulkEmail(emails) {
    const results = [];
    
    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  async sendNotification({ userId, type, title, message, data: _data = {} }) {
    try {
      // This would integrate with a notification service
      // For now, we'll just log it
      logger.info('Notification sent', {
        userId,
        type,
        title,
        message
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export convenience function
const sendEmail = (options) => emailService.sendEmail(options);
const sendBulkEmail = (emails) => emailService.sendBulkEmail(emails);
const sendNotification = (options) => emailService.sendNotification(options);

module.exports = {
  EmailService,
  emailService,
  sendEmail,
  sendBulkEmail,
  sendNotification
};