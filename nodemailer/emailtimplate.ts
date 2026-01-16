export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Sellora!</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #222;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ccebff, #a8daff);
      color: #222;
      text-align: center;
      padding: 35px 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .body {
      padding: 35px 30px;
    }
    .body p {
      font-size: 16px;
      margin: 16px 0;
      line-height: 1.8;
      color: #444;
    }
    .cta-button {
      display: inline-block;
      background: #222;
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 25px;
      text-decoration: none;
      font-weight: 600;
      margin: 25px 0;
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #000;
    }
    .features {
      margin: 25px 0;
      padding: 25px;
      background: #f9f9f9;
      border-radius: 10px;
      border-left: 4px solid #222;
    }
    .feature-item {
      display: flex;
      align-items: center;
      margin: 12px 0;
    }
    .feature-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
    }
    .highlight {
      color: #222;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Welcome to Sellora ✨</h1>
    </div>
    <div class="body">
      <p>Hello {userName},</p>
      <p>We're thrilled to have you join <span class="highlight">Sellora</span> — your modern e-commerce platform for seamless selling and shopping.</p>

      <div class="features">
        <div class="feature-item">
          <span class="feature-icon">🛍️</span>
          <span>Browse unique products from sellers worldwide</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">💳</span>
          <span>Secure checkout with multiple payment options</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📦</span>
          <span>Track your orders in real-time</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">⭐</span>
          <span>Get personalized recommendations</span>
        </div>
      </div>
      
      <p>Start exploring now:</p>
      <center>
        <a href="{dashboardLink}" class="cta-button">Start Shopping</a>
      </center>
      
      <p>Need assistance? Our <a href="{helpCenterLink}" style="color: #222;">Help Center</a> is here for you.</p>
     
      <p>Happy shopping! 🛒<br>
      <span class="highlight">– The Sellora Team</span></p>
    </div>
    <div class="footer">
      <p>© 2025 Sellora. All rights reserved.</p>
      <p>This email was sent to {userEmail}. <a href="{unsubscribeLink}" style="color: #666;">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>
`;
// lib/email/templates.ts - Email Templates for Oussama Property Management System

/**
 * Welcome Email Template for New Tenants
 */
export const TENANT_WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Your Tenant Portal!</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #222;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      color: #ffffff;
      text-align: center;
      padding: 40px 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .body {
      padding: 35px 30px;
    }
    .body p {
      font-size: 16px;
      margin: 16px 0;
      line-height: 1.8;
      color: #444;
    }
    .credentials-box {
      background: #f8f9fa;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .credentials-box h3 {
      margin: 0 0 15px 0;
      color: #2563eb;
      font-size: 18px;
    }
    .credential-item {
      margin: 10px 0;
      font-family: 'Courier New', monospace;
    }
    .credential-label {
      font-weight: 600;
      color: #666;
      display: inline-block;
      width: 100px;
    }
    .credential-value {
      color: #222;
      background: #fff;
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      display: inline-block;
    }
    .cta-button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 25px 0;
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #1e40af;
    }
    .features {
      margin: 25px 0;
      padding: 25px;
      background: #f9fafb;
      border-radius: 10px;
    }
    .features h3 {
      margin: 0 0 15px 0;
      color: #222;
      font-size: 18px;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
    }
    .feature-icon {
      margin-right: 12px;
      font-size: 20px;
      min-width: 24px;
    }
    .feature-text {
      flex: 1;
    }
    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .warning-box p {
      margin: 0;
      color: #92400e;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    .highlight {
      color: #2563eb;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">🏠</div>
      <h1>Welcome to Oussama Property</h1>
    </div>
    <div class="body">
      <p>Hello <strong>{userName}</strong>,</p>
      
      <p>Welcome to <span class="highlight">Oussama Property Management System</span>! Your landlord has created a tenant account for you to manage your rental experience.</p>
      
      <div class="credentials-box">
        <h3>🔐 Your Login Credentials</h3>
        <div class="credential-item">
          <span class="credential-label">Email:</span>
          <span class="credential-value">{userEmail}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Password:</span>
          <span class="credential-value">{tempPassword}</span>
        </div>
      </div>
      
      <div class="warning-box">
        <p>⚠️ <strong>Important:</strong> Please change your password immediately after your first login for security purposes.</p>
      </div>
      
      <center>
        <a href="{loginLink}" class="cta-button">Login to Your Portal</a>
      </center>
      
      <div class="divider"></div>
      
      <div class="features">
        <h3>What You Can Do:</h3>
        <div class="feature-item">
          <span class="feature-icon">💳</span>
          <span class="feature-text"><strong>Pay Rent Online:</strong> Make secure payments directly through the portal</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📄</span>
          <span class="feature-text"><strong>View Lease Details:</strong> Access your lease agreement and important dates</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔧</span>
          <span class="feature-text"><strong>Submit Maintenance:</strong> Report and track maintenance requests</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📊</span>
          <span class="feature-text"><strong>Payment History:</strong> View all your past payments and receipts</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📬</span>
          <span class="feature-text"><strong>Messages:</strong> Communicate directly with your landlord</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📱</span>
          <span class="feature-text"><strong>Mobile Access:</strong> Manage everything from your phone</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <p><strong>Need Help?</strong></p>
      <p>If you have any questions or need assistance, please don't hesitate to reach out:</p>
      <ul>
        <li>Visit our <a href="{helpCenterLink}" style="color: #2563eb;">Help Center</a></li>
        <li>Contact your landlord through the portal</li>
        <li>Email us at <a href="mailto:{supportEmail}" style="color: #2563eb;">{supportEmail}</a></li>
      </ul>
      
      <p>We're here to make your rental experience as smooth as possible! 🏡</p>
     
      <p>Best regards,<br>
      <span class="highlight">Oussama Property Management Team</span></p>
    </div>
    <div class="footer">
      <p><strong>Oussama Property Management System</strong></p>
      <p>© 2025 Oussama Property. All rights reserved.</p>
      <p>This email was sent to {userEmail}</p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated message. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Password Reset Email Template
 */
export const PASSWORD_RESET_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #222;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: #ffffff;
      text-align: center;
      padding: 40px 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .lock-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .body {
      padding: 35px 30px;
    }
    .body p {
      font-size: 16px;
      margin: 16px 0;
      line-height: 1.8;
      color: #444;
    }
    .reset-button {
      display: inline-block;
      background: #dc2626;
      color: #ffffff !important;
      padding: 16px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 25px 0;
      transition: all 0.3s ease;
      font-size: 16px;
    }
    .reset-button:hover {
      background: #991b1b;
    }
    .token-box {
      background: #f8f9fa;
      border: 2px dashed #d1d5db;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: center;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      word-break: break-all;
    }
    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .warning-box p {
      margin: 0;
      color: #92400e;
    }
    .security-tips {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .security-tips h3 {
      margin: 0 0 10px 0;
      color: #065f46;
    }
    .security-tips ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #065f46;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #dc2626;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="lock-icon">🔒</div>
      <h1>Password Reset Request</h1>
    </div>
    <div class="body">
      <p>Hello <strong>{userName}</strong>,</p>
      
      <p>We received a request to reset your password for your Oussama Property Management account.</p>
      
      <p>Click the button below to reset your password:</p>
      
      <center>
        <a href="{resetLink}" class="reset-button">Reset Password</a>
      </center>
      
      <p style="text-align: center; color: #666; font-size: 14px;">
        Or copy and paste this link into your browser:
      </p>
      <div class="token-box">
        {resetLink}
      </div>
      
      <div class="warning-box">
        <p>⏰ <strong>This link will expire in 1 hour</strong> for security reasons.</p>
      </div>
      
      <div class="divider"></div>
      
      <div class="security-tips">
        <h3>🛡️ Security Tips</h3>
        <ul>
          <li>Never share your password with anyone</li>
          <li>Use a strong password with letters, numbers, and symbols</li>
          <li>Don't use the same password for multiple accounts</li>
          <li>Enable two-factor authentication when available</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <p><strong>Didn't request this?</strong></p>
      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged. You can also contact us at <a href="mailto:{supportEmail}" style="color: #dc2626;">{supportEmail}</a> if you have concerns.</p>
     
      <p>Best regards,<br>
      <strong>Oussama Property Security Team</strong></p>
    </div>
    <div class="footer">
      <p><strong>Oussama Property Management System</strong></p>
      <p>© 2025 Oussama Property. All rights reserved.</p>
      <p>This email was sent to {userEmail}</p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated security email. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Payment Confirmation Email Template
 */
export const PAYMENT_CONFIRMATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmation</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #222;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      text-align: center;
      padding: 40px 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .check-icon {
      font-size: 64px;
      margin-bottom: 10px;
    }
    .body {
      padding: 35px 30px;
    }
    .body p {
      font-size: 16px;
      margin: 16px 0;
      line-height: 1.8;
      color: #444;
    }
    .payment-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 18px;
      color: #10b981;
    }
    .detail-label {
      color: #666;
    }
    .detail-value {
      color: #222;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="check-icon">✅</div>
      <h1>Payment Received!</h1>
    </div>
    <div class="body">
      <p>Hello <strong>{tenantName}</strong>,</p>
      
      <p>Thank you! We've successfully received your rent payment.</p>
      
      <div class="payment-details">
        <div class="detail-row">
          <span class="detail-label">Property:</span>
          <span class="detail-value">{propertyName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit:</span>
          <span class="detail-value">{unitNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">{paymentDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">{paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction ID:</span>
          <span class="detail-value">{transactionId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount Paid:</span>
          <span class="detail-value">{amount}</span>
        </div>
      </div>
      
      <p>A receipt has been generated and is available in your tenant portal.</p>
     
      <p>Best regards,<br>
      <strong>Oussama Property Management</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Oussama Property. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Lease Expiring Soon Email Template
 */
export const LEASE_EXPIRING_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lease Renewal Notice</title>
  <style>
    body {
      font-family: 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #222;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      text-align: center;
      padding: 40px 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .calendar-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .body {
      padding: 35px 30px;
    }
    .body p {
      font-size: 16px;
      margin: 16px 0;
      line-height: 1.8;
      color: #444;
    }
    .cta-button {
      display: inline-block;
      background: #f59e0b;
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 25px 0;
      transition: all 0.3s ease;
    }
    .footer {
      text-align: center;
      padding: 25px;
      background-color: #f5f5f5;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="calendar-icon">📅</div>
      <h1>Lease Renewal Notice</h1>
    </div>
    <div class="body">
      <p>Hello <strong>{tenantName}</strong>,</p>
      
      <p>Your lease for <strong>{unitNumber}</strong> at <strong>{propertyName}</strong> will expire on <strong>{expirationDate}</strong>.</p>
      
      <p>We'd love to have you stay! Please contact us to discuss renewal options.</p>
      
      <center>
        <a href="{contactLink}" class="cta-button">Contact Landlord</a>
      </center>
     
      <p>Best regards,<br>
      <strong>Oussama Property Management</strong></p>
    </div>
    <div class="footer">
      <p>© 2025 Oussama Property. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;