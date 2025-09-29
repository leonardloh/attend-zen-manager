// Email service integration
// This is a mock implementation that can be replaced with real email services like SendGrid, AWS SES, etc.

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface InvitationEmailData {
  email: string;
  invitationLink: string;
  role: string;
  invitedBy: string;
  expiresAt: string;
}

// Mock email service - replace with real implementation
class MockEmailService {
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    // In a real implementation, this would call your email service API
    console.log('📧 Mock Email Sent:', {
      to: template.to,
      subject: template.subject,
      html: template.html,
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always return success
    return true;
  }
}

// Real email service implementations (uncomment and configure as needed)

// SendGrid implementation
/*
import sgMail from '@sendgrid/mail';

class SendGridEmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      await sgMail.send({
        to: template.to,
        from: process.env.FROM_EMAIL || 'noreply@attendzen.com',
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }
}
*/

// AWS SES implementation
/*
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

class AWSEmailService {
  private client: SESClient;

  constructor(region: string) {
    this.client = new SESClient({ region });
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const command = new SendEmailCommand({
        Source: process.env.FROM_EMAIL || 'noreply@attendzen.com',
        Destination: {
          ToAddresses: [template.to],
        },
        Message: {
          Subject: {
            Data: template.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: template.html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: template.text || '',
              Charset: 'UTF-8',
            },
          },
        },
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('AWS SES error:', error);
      return false;
    }
  }
}
*/

// Nodemailer implementation
/*
import nodemailer from 'nodemailer';

class NodemailerEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@attendzen.com',
        to: template.to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      return true;
    } catch (error) {
      console.error('Nodemailer error:', error);
      return false;
    }
  }
}
*/

// Create email service instance
const createEmailService = () => {
  // Use mock service by default
  return new MockEmailService();
  
  // Uncomment to use real email services:
  // return new SendGridEmailService(process.env.SENDGRID_API_KEY!);
  // return new AWSEmailService(process.env.AWS_REGION!);
  // return new NodemailerEmailService();
};

const emailService = createEmailService();

// Email template generators
export const generateInvitationEmail = (data: InvitationEmailData): EmailTemplate => {
  const roleLabels: Record<string, string> = {
    student: '学员',
    class_admin: '班级管理员',
    branch_admin: '分院管理员',
    state_admin: '州属管理员',
    super_admin: '超级管理员',
  };

  const roleLabel = roleLabels[data.role] || data.role;
  const expiresDate = new Date(data.expiresAt).toLocaleDateString('zh-CN');

  const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>邀请加入 Attend Zen Manager</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .button:hover {
          background: #0056b3;
        }
        .details {
          background: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>邀请加入 Attend Zen Manager</h1>
        <p>您已被邀请加入考勤管理系统</p>
      </div>
      
      <div class="content">
        <p>您好！</p>
        
        <p>您已被邀请加入 Attend Zen Manager 考勤管理系统。请点击下面的链接接受邀请并创建您的账户。</p>
        
        <div class="details">
          <h3>邀请详情：</h3>
          <ul>
            <li><strong>邮箱：</strong>${data.email}</li>
            <li><strong>角色：</strong>${roleLabel}</li>
            <li><strong>邀请人：</strong>${data.invitedBy}</li>
            <li><strong>过期时间：</strong>${expiresDate}</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.invitationLink}" class="button">接受邀请并创建账户</a>
        </div>
        
        <p><strong>注意：</strong>此邀请链接将在 ${expiresDate} 过期。如果您没有请求此邀请，请忽略此邮件。</p>
        
        <p>如果您无法点击上面的按钮，请复制以下链接到浏览器中打开：</p>
        <p style="word-break: break-all; color: #666;">${data.invitationLink}</p>
      </div>
      
      <div class="footer">
        <p>此邮件由 Attend Zen Manager 系统自动发送，请勿回复。</p>
      </div>
    </body>
    </html>
  `;

  const text = `
邀请加入 Attend Zen Manager

您好！

您已被邀请加入 Attend Zen Manager 考勤管理系统。

邀请详情：
- 邮箱：${data.email}
- 角色：${roleLabel}
- 邀请人：${data.invitedBy}
- 过期时间：${expiresDate}

请点击以下链接接受邀请并创建您的账户：
${data.invitationLink}

注意：此邀请链接将在 ${expiresDate} 过期。

此邮件由 Attend Zen Manager 系统自动发送，请勿回复。
  `;

  return {
    to: data.email,
    subject: '邀请加入 Attend Zen Manager 考勤管理系统',
    html,
    text,
  };
};

// Main email sending function
export const sendInvitationEmail = async (data: InvitationEmailData): Promise<boolean> => {
  try {
    const template = generateInvitationEmail(data);
    return await emailService.sendEmail(template);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};

export default emailService;