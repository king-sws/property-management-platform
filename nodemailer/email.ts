// lib/email/index.ts - Email Service for Oussama Property Management System

import nodemailer from 'nodemailer';
import {
  TENANT_WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_EMAIL_TEMPLATE,
  PAYMENT_CONFIRMATION_EMAIL_TEMPLATE,
  LEASE_EXPIRING_EMAIL_TEMPLATE,
} from './emailtimplate';

// -------------------------
// Email Configuration
// -------------------------
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@oussamaproperty.com',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@oussamaproperty.com',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://oussamaproperty.com',
  companyName: 'Oussama Property',
};

// -------------------------
// Nodemailer Transporter (Brevo SMTP)
// -------------------------
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SENDLER_USER as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

// -------------------------
// Email Provider Interface
// -------------------------
interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Nodemailer with Brevo SMTP
 */
async function sendEmail({ to, subject, html, text }: EmailParams): Promise<void> {
  try {
    // Verify transporter configuration
    await transporter.verify();
    
    // Send email
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });
    
    console.log(`✅ Email sent successfully to ${to}: ${subject}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Fallback: Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL WOULD BE SENT (SMTP Error - Logging instead)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${to}
Subject: ${subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${text || stripHtml(html)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    } else {
      // In production, throw the error
      throw error;
    }
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Replace template variables
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

// -------------------------
// Public Email Functions
// -------------------------

/**
 * Send welcome email to new tenant with login credentials
 */
export async function sendTenantWelcomeEmail(
  email: string,
  name: string,
  tempPassword: string
): Promise<void> {
  const variables = {
    userName: name,
    userEmail: email,
    tempPassword: tempPassword,
    loginLink: `${EMAIL_CONFIG.appUrl}/signin`,
    helpCenterLink: `${EMAIL_CONFIG.appUrl}/help`,
    supportEmail: EMAIL_CONFIG.supportEmail,
  };
  
  const html = replaceTemplateVariables(TENANT_WELCOME_EMAIL_TEMPLATE, variables);
  
  await sendEmail({
    to: email,
    subject: `Welcome to ${EMAIL_CONFIG.companyName} - Your Tenant Portal`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetLink = `${EMAIL_CONFIG.appUrl}/reset-password?token=${resetToken}`;
  
  const variables = {
    userName: name,
    userEmail: email,
    resetLink: resetLink,
    supportEmail: EMAIL_CONFIG.supportEmail,
  };
  
  const html = replaceTemplateVariables(PASSWORD_RESET_EMAIL_TEMPLATE, variables);
  
  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Oussama Property',
    html,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(params: {
  tenantEmail: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId: string;
}): Promise<void> {
  const variables = {
    tenantName: params.tenantName,
    propertyName: params.propertyName,
    unitNumber: params.unitNumber,
    amount: `$${params.amount.toFixed(2)}`, // Format with dollar sign
    paymentDate: params.paymentDate,
    paymentMethod: params.paymentMethod,
    transactionId: params.transactionId,
  };
  
  const html = replaceTemplateVariables(PAYMENT_CONFIRMATION_EMAIL_TEMPLATE, variables);
  
  await sendEmail({
    to: params.tenantEmail,
    subject: `Payment Confirmation - ${EMAIL_CONFIG.companyName}`,
    html,
  });
}

/**
 * Send lease expiring notification
 */
export async function sendLeaseExpiringEmail(params: {
  tenantEmail: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  expirationDate: string;
}): Promise<void> {
  const variables = {
    tenantName: params.tenantName,
    propertyName: params.propertyName,
    unitNumber: params.unitNumber,
    expirationDate: params.expirationDate,
    contactLink: `${EMAIL_CONFIG.appUrl}/dashboard/messages`,
  };
  
  const html = replaceTemplateVariables(LEASE_EXPIRING_EMAIL_TEMPLATE, variables);
  
  await sendEmail({
    to: params.tenantEmail,
    subject: `Lease Renewal Notice - ${params.propertyName}`,
    html,
  });
}

/**
 * Send maintenance request notification to landlord
 */
export async function sendMaintenanceNotificationEmail(params: {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  issueType: string;
  description: string;
  priority: string;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #f59e0b; font-weight: bold; }
        .priority-low { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 New Maintenance Request</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${params.landlordName}</strong>,</p>
          <p>A new maintenance request has been submitted:</p>
          <ul>
            <li><strong>Property:</strong> ${params.propertyName}</li>
            <li><strong>Unit:</strong> ${params.unitNumber}</li>
            <li><strong>Tenant:</strong> ${params.tenantName}</li>
            <li><strong>Issue Type:</strong> ${params.issueType}</li>
            <li><strong>Priority:</strong> <span class="priority-${params.priority.toLowerCase()}">${params.priority}</span></li>
            <li><strong>Description:</strong> ${params.description}</li>
          </ul>
          <p>Please log in to your dashboard to view details and respond.</p>
          <p>
            <a href="${EMAIL_CONFIG.appUrl}/dashboard/maintenance" 
               style="background: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Request
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({
    to: params.landlordEmail,
    subject: `New Maintenance Request - ${params.propertyName} Unit ${params.unitNumber}`,
    html,
  });
}

/**
 * Send rent reminder email
 */
export async function sendRentReminderEmail(params: {
  tenantEmail: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}): Promise<void> {
  const urgency = params.daysUntilDue <= 3 ? 'URGENT' : 'Reminder';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .amount { font-size: 32px; font-weight: bold; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Rent Payment ${urgency}</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${params.tenantName}</strong>,</p>
          <p>This is a ${urgency.toLowerCase()} that your rent payment is due ${params.daysUntilDue === 0 ? 'today' : `in ${params.daysUntilDue} days`}.</p>
          <p style="text-align: center; margin: 30px 0;">
            <div class="amount">$${params.amount.toFixed(2)}</div>
            <div style="color: #666;">Due: ${params.dueDate}</div>
          </p>
          <p>
            <strong>Property:</strong> ${params.propertyName}<br>
            <strong>Unit:</strong> ${params.unitNumber}
          </p>
          <p>
            <a href="${EMAIL_CONFIG.appUrl}/dashboard/payments" 
               style="background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Pay Now
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendEmail({
    to: params.tenantEmail,
    subject: `${urgency}: Rent Payment Due - ${params.propertyName}`,
    html,
  });
}

// Export email config for use in other modules
export { EMAIL_CONFIG };


const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_NAME = "Property Manager";

// Vendor Invite Email
export async function sendVendorInviteEmail(
  email: string,
  name: string,
  businessName: string,
  tempPassword: string
): Promise<void> {
  const loginUrl = `${APP_URL}/sign-in`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .credentials-box {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .credential-row:last-child {
            border-bottom: none;
          }
          .credential-label {
            font-weight: bold;
            color: #6b7280;
          }
          .credential-value {
            font-family: monospace;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${APP_NAME}!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            
            <p>
              You've been added as a vendor to ${APP_NAME}. Your business, 
              <strong>${businessName}</strong>, can now receive and manage maintenance 
              requests from property owners.
            </p>

            <div class="credentials-box">
              <h3>Your Login Credentials</h3>
              <div class="credential-row">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${email}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">Temporary Password:</span>
                <span class="credential-value">${tempPassword}</span>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice</strong>
              <p style="margin: 10px 0 0 0;">
                For your security, please change this temporary password immediately 
                after your first login.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">
                Login to Dashboard
              </a>
            </div>

            <h3>What's Next?</h3>
            <ul>
              <li>Log in and complete your vendor profile</li>
              <li>Add your service areas and specialties</li>
              <li>Upload your license and insurance information</li>
              <li>Set your availability preferences</li>
              <li>Start receiving maintenance requests</li>
            </ul>

            <p>
              If you have any questions or need assistance, please don't hesitate 
              to contact our support team.
            </p>

            <p>
              Best regards,<br>
              The ${APP_NAME} Team
            </p>
          </div>
          <div class="footer">
            <p>
              This email was sent from ${APP_NAME}.<br>
              If you didn't expect this email, please contact support immediately.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to ${APP_NAME}!

Hi ${name},

You've been added as a vendor to ${APP_NAME}. Your business, ${businessName}, 
can now receive and manage maintenance requests from property owners.

Your Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

IMPORTANT: Please change this temporary password immediately after your first login.

Login here: ${loginUrl}

What's Next?
- Log in and complete your vendor profile
- Add your service areas and specialties
- Upload your license and insurance information
- Set your availability preferences
- Start receiving maintenance requests

If you have any questions, please contact our support team.

Best regards,
The ${APP_NAME} Team
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: `Welcome to ${APP_NAME} - Vendor Account Created`,
    text: textContent,
    html: htmlContent,
  });
}

// Tenant Welcome Email (already exists, adding here for reference)


// New Maintenance Assignment Email for Vendors
export async function sendMaintenanceAssignmentEmail(
  vendorEmail: string,
  vendorName: string,
  ticketTitle: string,
  propertyAddress: string,
  ticketId: string
): Promise<void> {
  const ticketUrl = `${APP_URL}/dashboard/maintenance/${ticketId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-box { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔧 New Maintenance Request</h2>
          </div>
          <div class="content">
            <p>Hi ${vendorName},</p>
            <p>You've been assigned a new maintenance request:</p>
            <div class="ticket-box">
              <h3>${ticketTitle}</h3>
              <p><strong>Property:</strong> ${propertyAddress}</p>
            </div>
            <div style="text-align: center;">
              <a href="${ticketUrl}" class="button">View Ticket Details</a>
            </div>
            <p>Please review the ticket and update the status as you progress.</p>
            <p>Best regards,<br>The ${APP_NAME} Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: vendorEmail,
    subject: `New Maintenance Assignment: ${ticketTitle}`,
    html: htmlContent,
  });
}