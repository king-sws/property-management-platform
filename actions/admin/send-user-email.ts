// lib/actions/admin/send-user-email.ts
"use server";

import { auth } from "@/auth";
import nodemailer from "nodemailer";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_NAME = "Property Manager";

// Nodemailer Transporter (Brevo SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SENDLER_USER as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Nodemailer with Brevo SMTP
 */
async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
  try {
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.SENDLER_USER}>`,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    console.log(`✅ Email sent successfully to ${to}: ${subject}`);
    console.log(`📧 Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);

    // Fallback: Log to console in development
    if (process.env.NODE_ENV === "development") {
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
    }
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, "")
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Send welcome email to newly created user
 */
export async function sendUserWelcomeEmail(
  email: string,
  name: string,
  password: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const loginUrl = `${APP_URL}/sign-in`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .credentials-box {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .credential-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .credential-row:last-child {
            border-bottom: none;
          }
          .credential-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 14px;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 25px 0;
            font-weight: 600;
            text-align: center;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            text-align: center;
            padding: 30px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .warning strong {
            color: #92400e;
          }
          .info-list {
            margin: 20px 0;
            padding-left: 20px;
          }
          .info-list li {
            margin: 10px 0;
            color: #4b5563;
          }
          .role-badge {
            display: inline-block;
            background: #e0e7ff;
            color: #4338ca;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            margin-left: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${APP_NAME}!</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #111827;">Hi <strong>${name}</strong>,</p>
            
            <p style="color: #4b5563;">
              Your account has been created as a <span class="role-badge">${role}</span> user. 
              You can now access the ${APP_NAME} platform and start managing your account.
            </p>

            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #111827;">🔐 Your Login Credentials</h3>
              <div class="credential-row">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${email}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">Temporary Password:</span>
                <span class="credential-value">${password}</span>
              </div>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Notice</strong>
              <p style="margin: 10px 0 0 0; color: #92400e;">
                For your security, please change this temporary password immediately 
                after your first login. You can do this in your account settings.
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">
                Login to Your Dashboard
              </a>
            </div>

            <h3 style="color: #111827; margin-top: 30px;">📋 What's Next?</h3>
            <ul class="info-list">
              <li>Log in using your credentials above</li>
              <li>Complete your profile information</li>
              <li>Change your temporary password</li>
              <li>Explore the dashboard and available features</li>
              ${
                role === "LANDLORD"
                  ? "<li>Add your properties and units</li>"
                  : role === "TENANT"
                  ? "<li>View your lease information</li>"
                  : role === "VENDOR"
                  ? "<li>Complete your vendor profile and upload credentials</li>"
                  : ""
              }
            </ul>

            <p style="color: #4b5563; margin-top: 30px;">
              If you have any questions or need assistance, please don't hesitate 
              to contact our support team.
            </p>

            <p style="color: #4b5563; margin-top: 20px;">
              Best regards,<br>
              <strong>The ${APP_NAME} Team</strong>
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              This email was sent from ${APP_NAME}.
            </p>
            <p style="margin: 0;">
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

Your account has been created as a ${role} user. You can now access the ${APP_NAME} platform.

Your Login Credentials:
Email: ${email}
Temporary Password: ${password}

IMPORTANT: Please change this temporary password immediately after your first login.

Login here: ${loginUrl}

What's Next?
- Log in using your credentials
- Complete your profile information
- Change your temporary password
- Explore the dashboard and available features

If you have any questions, please contact our support team.

Best regards,
The ${APP_NAME} Team
  `;

    await sendEmail({
      to: email,
      subject: `Welcome to ${APP_NAME} - Your Account is Ready`,
      html: htmlContent,
      text: textContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Send welcome email error:", error);
    return {
      success: false,
      error: "Failed to send welcome email",
    };
  }
}

/**
 * Send custom email to user
 */
export async function sendCustomEmailToUser(
  userId: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const prisma = (await import("@/lib/prisma")).default;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Message from ${APP_NAME}</h2>
          </div>
          <div class="content">
            <p>Hi ${user.name || "there"},</p>
            <div style="margin: 20px 0;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <p>
              Best regards,<br>
              The ${APP_NAME} Team
            </p>
          </div>
          <div class="footer">
            <p>This email was sent from ${APP_NAME}</p>
          </div>
        </div>
      </body>
    </html>
  `;

    await sendEmail({
      to: user.email,
      subject: subject,
      html: htmlContent,
    });

    // Log the action
    await prisma.activityLog.create({
      data: {
        userId: session.user.id!,
        type: "USER_LOGIN",
        action: `Sent email to user: ${subject}`,
        entityType: "User",
        entityId: userId,
        metadata: {
          subject,
          recipientEmail: user.email,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Send custom email error:", error);
    return {
      success: false,
      error: "Failed to send email",
    };
  }
}