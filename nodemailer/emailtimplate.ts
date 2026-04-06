export const LANDLORD_WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Propely - Landlord Portal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f0ece6; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .hdr { background: #1a1a1a; padding: 48px 40px 36px; text-align: center; }
    .hdr-logo { font-family: Georgia, serif; font-size: 22px; color: #e3cda7; margin-bottom: 24px; }
    .hdr-divider { width: 40px; height: 2px; background: #e3cda7; margin: 0 auto 22px; opacity: 0.5; }
    .hdr h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #fff; line-height: 1.3; }
    .hdr h1 span { color: #e3cda7; }
    .hdr-sub { font-size: 14px; color: rgba(255,255,255,0.55); margin-top: 8px; }
    .bdy { padding: 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 14px; }
    .txt { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
    .trial-box { background: #faf8f4; border: 2px solid #e3cda7; border-radius: 10px; padding: 22px; margin-bottom: 28px; text-align: center; }
    .trial-lbl { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 8px; }
    .trial-days { font-family: Georgia, serif; font-size: 48px; color: #1a1a1a; line-height: 1; }
    .trial-unit { font-size: 14px; color: #a08c6e; margin-top: 4px; }
    .trial-ends { font-size: 12px; color: #999; margin-top: 8px; }
    .warn { background: #fffbf3; border-left: 3px solid #e3cda7; border-radius: 0 8px 8px 0; padding: 13px 15px; margin-bottom: 28px; font-size: 12px; color: #7a6440; line-height: 1.6; }
    .cta-wrap { text-align: center; margin-bottom: 32px; }
    .cta { display: inline-block; background: #1a1a1a; color: #e3cda7 !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 13px 36px; border-radius: 6px; }
    .ftrs-lbl { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 14px; }
    .ftrs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 32px; }
    .ftr { background: #faf8f4; border-radius: 8px; padding: 14px; border: 1px solid #ede8de; }
    .ftr-icon { font-size: 16px; margin-bottom: 8px; }
    .ftr h4 { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 3px; }
    .ftr p { font-size: 11px; color: #999; line-height: 1.4; }
    .divider { height: 1px; background: #ede8de; margin: 24px 0; }
    .sign { font-family: Georgia, serif; font-size: 14px; color: #444; }
    .sign span { color: #a08c6e; font-style: italic; }
    .ftr-bar { background: #1a1a1a; padding: 26px 40px; text-align: center; }
    .ftr-bar-logo { font-family: Georgia, serif; font-size: 15px; color: #e3cda7; margin-bottom: 10px; }
    .ftr-bar p { font-size: 11px; color: #555; line-height: 1.8; }
    .ftr-bar a { color: #a08c6e; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .bdy { padding: 28px 24px !important; }
      .hdr { padding: 32px 24px !important; }
      .ftrs { grid-template-columns: 1fr !important; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-logo">Propely</div>
      <div class="hdr-divider"></div>
      <h1>Welcome to your<br><span>landlord portal</span></h1>
      <p class="hdr-sub">Your free trial has started</p>
    </div>
    <div class="bdy">
      <p class="greeting">Hi {userName},</p>
      <p class="txt">Your Propely landlord account is ready. You have full access to all Professional plan features — start adding your properties and managing tenants right away.</p>
      <div class="trial-box">
        <div class="trial-lbl">Your free trial</div>
        <div class="trial-days">14</div>
        <div class="trial-unit">days of Professional access</div>
        <div class="trial-ends">Trial ends: {trialEndsAt}</div>
      </div>
      <div class="warn">💳 &nbsp;Add a payment method before <strong>{trialEndsAt}</strong> to keep your subscription active. No charge until your trial ends.</div>
      <div class="cta-wrap"><a href="{dashboardLink}" class="cta">Go to My Dashboard →</a></div>
      <div class="ftrs-lbl">What you can do</div>
      <div class="ftrs">
        <div class="ftr"><div class="ftr-icon">🏠</div><h4>Add Properties</h4><p>List units, set rent, upload photos</p></div>
        <div class="ftr"><div class="ftr-icon">👥</div><h4>Manage Tenants</h4><p>Invite tenants and sign leases</p></div>
        <div class="ftr"><div class="ftr-icon">💰</div><h4>Collect Rent</h4><p>Online payments with auto-reminders</p></div>
        <div class="ftr"><div class="ftr-icon">🔧</div><h4>Maintenance</h4><p>Track requests and assign vendors</p></div>
        <div class="ftr"><div class="ftr-icon">📊</div><h4>Reports</h4><p>Income, expenses, occupancy stats</p></div>
        <div class="ftr"><div class="ftr-icon">⚙️</div><h4>Subscription</h4><p>Manage billing and plan settings</p></div>
      </div>
      <div class="divider"></div>
      <p class="sign">We're glad you're here,<br><span>The Propely Team</span></p>
    </div>
    <div class="ftr-bar">
      <div class="ftr-bar-logo">Propely</div>
      <p>© 2026 Propely. All rights reserved.<br>This email was sent to <a href="#">{userEmail}</a></p>
    </div>
  </div>
</body>
</html>
`;

export const VENDOR_WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Propely - Vendor Portal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f0ece6; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .hdr { background: #1a1a1a; padding: 48px 40px 36px; text-align: center; }
    .hdr-logo { font-family: Georgia, serif; font-size: 22px; color: #e3cda7; margin-bottom: 24px; }
    .hdr-divider { width: 40px; height: 2px; background: #e3cda7; margin: 0 auto 22px; opacity: 0.5; }
    .hdr h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #fff; line-height: 1.3; }
    .hdr h1 span { color: #e3cda7; }
    .bdy { padding: 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 14px; }
    .txt { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
    .cta-wrap { text-align: center; margin-bottom: 32px; }
    .cta { display: inline-block; background: #1a1a1a; color: #e3cda7 !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 13px 36px; border-radius: 6px; }
    .steps { margin-bottom: 28px; }
    .step { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid #ede8de; }
    .step:last-child { border-bottom: none; }
    .step-num { background: #e3cda7; color: #1a1a1a; font-size: 11px; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .step-txt h4 { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .step-txt p { font-size: 12px; color: #999; }
    .divider { height: 1px; background: #ede8de; margin: 24px 0; }
    .sign { font-family: Georgia, serif; font-size: 14px; color: #444; }
    .sign span { color: #a08c6e; font-style: italic; }
    .ftr-bar { background: #1a1a1a; padding: 26px 40px; text-align: center; }
    .ftr-bar-logo { font-family: Georgia, serif; font-size: 15px; color: #e3cda7; margin-bottom: 10px; }
    .ftr-bar p { font-size: 11px; color: #555; line-height: 1.8; }
    .ftr-bar a { color: #a08c6e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-logo">Propely</div>
      <div class="hdr-divider"></div>
      <h1>Welcome to your<br><span>vendor portal</span></h1>
    </div>
    <div class="bdy">
      <p class="greeting">Hi {userName},</p>
      <p class="txt">Your Propely vendor account is active. You can now receive maintenance requests from property managers and grow your service business.</p>
      <div class="cta-wrap"><a href="{dashboardLink}" class="cta">Go to My Dashboard →</a></div>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div class="step-txt"><h4>Complete your profile</h4><p>Add your services, coverage area, and license info</p></div></div>
        <div class="step"><div class="step-num">2</div><div class="step-txt"><h4>Upload credentials</h4><p>Add your insurance and license documents</p></div></div>
        <div class="step"><div class="step-num">3</div><div class="step-txt"><h4>Set your availability</h4><p>Let landlords know when you're available</p></div></div>
        <div class="step"><div class="step-num">4</div><div class="step-txt"><h4>Start accepting jobs</h4><p>You'll get notified when a request matches your services</p></div></div>
      </div>
      <div class="divider"></div>
      <p class="sign">Welcome aboard,<br><span>The Propely Team</span></p>
    </div>
    <div class="ftr-bar">
      <div class="ftr-bar-logo">Propely</div>
      <p>© 2026 Propely. All rights reserved.<br>This email was sent to <a href="#">{userEmail}</a></p>
    </div>
  </div>
</body>
</html>
`;

export const TENANT_WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>Welcome to Propely!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f0ece6; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .hdr { background: #1a1a1a; padding: 48px 40px 36px; text-align: center; }
    .hdr-logo { font-family: Georgia, serif; font-size: 22px; color: #e3cda7; letter-spacing: 0.5px; margin-bottom: 24px; }
    .hdr-divider { width: 40px; height: 2px; background: #e3cda7; margin: 0 auto 22px; opacity: 0.5; }
    .hdr h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #fff; line-height: 1.3; }
    .hdr h1 span { color: #e3cda7; }
    .hdr-sub { font-size: 14px; color: rgba(255,255,255,0.55); margin-top: 8px; }
    .bdy { padding: 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 14px; }
    .txt { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
    .cred-box { background: #faf8f4; border: 1px solid #e3cda7; border-radius: 10px; padding: 22px; margin-bottom: 28px; }
    .cred-lbl { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 14px; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #ede8de; }
    .cred-row:last-child { border-bottom: none; padding-bottom: 0; }
    .cred-key { font-size: 12px; color: #999; }
    .cred-val { font-family: 'Courier New', monospace; font-size: 12px; color: #1a1a1a; background: #fff; border: 1px solid #e3cda7; padding: 4px 10px; border-radius: 5px; }
    .warn { background: #fffbf3; border-left: 3px solid #e3cda7; border-radius: 0 8px 8px 0; padding: 13px 15px; margin-bottom: 28px; font-size: 12px; color: #7a6440; line-height: 1.6; }
    .cta-wrap { text-align: center; margin-bottom: 32px; }
    .cta { display: inline-block; background: #1a1a1a; color: #e3cda7 !important; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; padding: 13px 36px; border-radius: 6px; }
    .ftrs-lbl { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 14px; }
    .ftrs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 32px; }
    .ftr { background: #faf8f4; border-radius: 8px; padding: 14px; border: 1px solid #ede8de; }
    .ftr-icon { width: 28px; height: 28px; background: #e3cda7; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; font-size: 13px; }
    .ftr h4 { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 3px; }
    .ftr p { font-size: 11px; color: #999; line-height: 1.4; }
    .help { background: #faf8f4; border: 1px solid #ede8de; border-radius: 8px; padding: 18px; margin-bottom: 28px; }
    .help-ttl { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 10px; }
    .help p { font-size: 12px; color: #777; line-height: 1.9; }
    .help a { color: #a08c6e; }
    .divider { height: 1px; background: #ede8de; margin: 24px 0; }
    .sign { font-family: Georgia, serif; font-size: 14px; color: #444; }
    .sign span { color: #a08c6e; font-style: italic; }
    .ftr-bar { background: #1a1a1a; padding: 26px 40px; text-align: center; }
    .ftr-bar-logo { font-family: Georgia, serif; font-size: 15px; color: #e3cda7; margin-bottom: 10px; }
    .ftr-bar p { font-size: 11px; color: #555; line-height: 1.8; }
    .ftr-bar a { color: #a08c6e; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .bdy { padding: 28px 24px !important; }
      .hdr { padding: 32px 24px !important; }
      .ftrs { grid-template-columns: 1fr !important; }
      .ftr-bar { padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-logo">Propely</div>
      <div class="hdr-divider"></div>
      <h1>Welcome to your<br><span>tenant portal</span></h1>
      <p class="hdr-sub">Your account is ready</p>
    </div>
    <div class="bdy">
      <p class="greeting">Hi {userName},</p>
      <p class="txt">Your landlord has set up your tenant account on Propely — your all-in-one portal for managing your rental experience. Everything you need is now in one place.</p>
      <div class="cred-box">
        <div class="cred-lbl">Your login credentials</div>
        <div class="cred-row"><span class="cred-key">Email</span><span class="cred-val">{userEmail}</span></div>
        <div class="cred-row"><span class="cred-key">Password</span><span class="cred-val">{tempPassword}</span></div>
      </div>
      <div class="warn">⚠️ &nbsp;For your security, please change your password immediately after your first login.</div>
      <div class="cta-wrap"><a href="{loginLink}" class="cta">Access My Portal →</a></div>
      <div class="ftrs-lbl">What you can do</div>
      <div class="ftrs">
        <div class="ftr"><div class="ftr-icon">💳</div><h4>Pay Rent Online</h4><p>Secure payments with automatic receipts</p></div>
        <div class="ftr"><div class="ftr-icon">📄</div><h4>View Lease</h4><p>Access your agreement and key dates</p></div>
        <div class="ftr"><div class="ftr-icon">🔧</div><h4>Maintenance</h4><p>Submit and track repair requests</p></div>
        <div class="ftr"><div class="ftr-icon">💬</div><h4>Messages</h4><p>Direct communication with landlord</p></div>
        <div class="ftr"><div class="ftr-icon">📊</div><h4>Payment History</h4><p>Complete records of all transactions</p></div>
        <div class="ftr"><div class="ftr-icon">📱</div><h4>Mobile Ready</h4><p>Manage everything from your phone</p></div>
      </div>
      <div class="help">
        <div class="help-ttl">Need help getting started?</div>
        <p>📚 Visit our <a href="{helpCenterLink}">Help Center</a><br>📧 Email us at <a href="mailto:{supportEmail}">{supportEmail}</a><br>💬 Contact your landlord through the portal</p>
      </div>
      <div class="divider"></div>
      <p class="sign">Best regards,<br><span>The Propely Team</span></p>
    </div>
    <div class="ftr-bar">
      <div class="ftr-bar-logo">Propely</div>
      <p>© 2026 Propely. All rights reserved.<br>This email was sent to <a href="#">{userEmail}</a> · <a href="{unsubscribeLink}">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>
`;

//PASSWORD_RESET_EMAIL_TEMPLATE:
export const PASSWORD_RESET_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <title>Reset Your Password - Propely</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f0ece6; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .hdr { background: #1a1a1a; padding: 48px 40px 36px; text-align: center; }
    .hdr-logo { font-family: Georgia, serif; font-size: 22px; color: #e3cda7; letter-spacing: 0.5px; margin-bottom: 24px; }
    .hdr-divider { width: 40px; height: 2px; background: #e3cda7; margin: 0 auto 22px; opacity: 0.5; }
    .hdr h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #fff; line-height: 1.3; }
    .hdr h1 span { color: #e3cda7; }
    .bdy { padding: 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 14px; }
    .txt { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta { display: inline-block; background: #1a1a1a; color: #e3cda7 !important; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; padding: 13px 36px; border-radius: 6px; }
    .expiry { background: #fffbf3; border-left: 3px solid #e3cda7; border-radius: 0 8px 8px 0; padding: 13px 15px; margin-bottom: 20px; font-size: 12px; color: #7a6440; line-height: 1.6; }
    .divider { height: 1px; background: #ede8de; margin: 24px 0; }
    .link-box { background: #faf8f4; border: 1px dashed #e3cda7; border-radius: 8px; padding: 14px; margin: 20px 0; text-align: center; }
    .link-lbl { font-size: 10px; color: #a08c6e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .link-url { font-family: 'Courier New', monospace; font-size: 11px; color: #555; word-break: break-all; line-height: 1.5; }
    .sec-box { background: #faf8f4; border: 1px solid #ede8de; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .sec-ttl { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 10px; }
    .sec-list { font-size: 12px; color: #666; line-height: 2; padding-left: 16px; }
    .not-you { background: #fffbf3; border-left: 3px solid #e3cda7; border-radius: 0 8px 8px 0; padding: 13px 15px; margin: 20px 0; font-size: 12px; color: #7a6440; line-height: 1.6; }
    .not-you a { color: #a08c6e; }
    .sign { font-family: Georgia, serif; font-size: 14px; color: #444; }
    .sign span { color: #a08c6e; font-style: italic; }
    .ftr-bar { background: #1a1a1a; padding: 26px 40px; text-align: center; }
    .ftr-bar-logo { font-family: Georgia, serif; font-size: 15px; color: #e3cda7; margin-bottom: 10px; }
    .ftr-bar p { font-size: 11px; color: #555; line-height: 1.8; }
    .ftr-bar a { color: #a08c6e; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .bdy { padding: 28px 24px !important; }
      .hdr { padding: 32px 24px !important; }
      .ftr-bar { padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-logo">Propely</div>
      <div class="hdr-divider"></div>
      <h1>Reset your<br><span>password</span></h1>
    </div>
    <div class="bdy">
      <p class="greeting">Hi {userName},</p>
      <p class="txt">We received a request to reset the password for your Propely account. Click the button below to create a new password.</p>
      <div class="cta-wrap"><a href="{resetLink}" class="cta">Reset My Password →</a></div>
      <div class="expiry">⏰ <strong>This link expires in 1 hour.</strong> If you don't reset within this time, you'll need to request a new link.</div>
      <div class="divider"></div>
      <div class="link-box">
        <div class="link-lbl">Can't click the button? Copy this link:</div>
        <div class="link-url">{resetLink}</div>
      </div>
      <div class="divider"></div>
      <div class="sec-box">
        <div class="sec-ttl">Security tips</div>
        <ul class="sec-list">
          <li>Use a strong, unique password</li>
          <li>Include letters, numbers, and symbols</li>
          <li>Don't reuse passwords across sites</li>
          <li>Enable two-factor authentication when available</li>
        </ul>
      </div>
      <div class="not-you"><strong>Didn't request this?</strong> Ignore this email — your password will remain unchanged. If you're concerned, contact us at <a href="mailto:{supportEmail}">{supportEmail}</a></div>
      <div class="divider"></div>
      <p class="sign">Best regards,<br><span>Propely Security Team</span></p>
    </div>
    <div class="ftr-bar">
      <div class="ftr-bar-logo">Propely</div>
      <p>© 2026 Propely. All rights reserved.<br>This email was sent to <a href="#">{userEmail}</a></p>
    </div>
  </div>
</body>
</html>
`;

//PAYMENT_CONFIRMATION_EMAIL_TEMPLATE:
export const PAYMENT_CONFIRMATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Confirmed - Propely</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f0ece6; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .hdr { background: #1a1a1a; padding: 48px 40px 36px; text-align: center; }
    .hdr-logo { font-family: Georgia, serif; font-size: 22px; color: #e3cda7; letter-spacing: 0.5px; margin-bottom: 24px; }
    .hdr-divider { width: 40px; height: 2px; background: #e3cda7; margin: 0 auto 22px; opacity: 0.5; }
    .hdr h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #fff; line-height: 1.3; }
    .hdr h1 span { color: #e3cda7; }
    .bdy { padding: 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 14px; }
    .txt { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
    .badge { display: inline-block; background: #e3cda7; color: #1a1a1a; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .amount-card { background: #faf8f4; border: 1px solid #e3cda7; border-radius: 10px; padding: 28px; margin: 20px 0; text-align: center; }
    .amount-lbl { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 10px; }
    .amount-val { font-family: Georgia, serif; font-size: 42px; color: #1a1a1a; line-height: 1; }
    .det-table { background: #faf8f4; border: 1px solid #ede8de; border-radius: 10px; overflow: hidden; margin: 20px 0; }
    .det-row { display: flex; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid #ede8de; font-size: 13px; }
    .det-row:last-child { border-bottom: none; }
    .det-row .dk { color: #999; }
    .det-row .dv { color: #1a1a1a; font-weight: 600; }
    .outline-cta { display: block; text-align: center; border: 1.5px solid #1a1a1a; color: #1a1a1a !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 13px 36px; border-radius: 6px; margin: 24px 0; }
    .divider { height: 1px; background: #ede8de; margin: 24px 0; }
    .sign { font-family: Georgia, serif; font-size: 14px; color: #444; }
    .sign span { color: #a08c6e; font-style: italic; }
    .ftr-bar { background: #1a1a1a; padding: 26px 40px; text-align: center; }
    .ftr-bar-logo { font-family: Georgia, serif; font-size: 15px; color: #e3cda7; margin-bottom: 10px; }
    .ftr-bar p { font-size: 11px; color: #555; line-height: 1.8; }
    .ftr-bar a { color: #a08c6e; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .bdy { padding: 28px 24px !important; }
      .hdr { padding: 32px 24px !important; }
      .ftr-bar { padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-logo">Propely</div>
      <div class="hdr-divider"></div>
      <h1>Payment<br><span>confirmed</span></h1>
    </div>
    <div class="bdy">
      <p class="greeting">Hi {tenantName},</p>
      <p class="txt">Great news! Your rent payment has been successfully processed and received.</p>
      <div class="badge">✓ Payment Confirmed</div>
      <div class="amount-card">
        <div class="amount-lbl">Amount Paid</div>
        <div class="amount-val">{amount}</div>
      </div>
      <div class="det-table">
        <div class="det-row"><span class="dk">Property</span><span class="dv">{propertyName}</span></div>
        <div class="det-row"><span class="dk">Unit</span><span class="dv">{unitNumber}</span></div>
        <div class="det-row"><span class="dk">Payment Date</span><span class="dv">{paymentDate}</span></div>
        <div class="det-row"><span class="dk">Method</span><span class="dv">{paymentMethod}</span></div>
        <div class="det-row"><span class="dk">Transaction ID</span><span class="dv" style="font-family:monospace;font-size:11px;">{transactionId}</span></div>
      </div>
      <p class="txt">A receipt has been generated and is available in your tenant portal.</p>
      <a href="{dashboardLink}" class="outline-cta">View Receipt in Dashboard →</a>
      <div class="divider"></div>
      <p class="sign">Thank you for your timely payment!<br><span>The Propely Team</span></p>
    </div>
    <div class="ftr-bar">
      <div class="ftr-bar-logo">Propely</div>
      <p>© 2026 Propely. All rights reserved.<br>This email was sent to <a href="#">{userEmail}</a></p>
    </div>
  </div>
</body>
</html>
`;

// LEASE_EXPIRING_EMAIL_TEMPLATE:
export const LEASE_EXPIRING_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Lease Renewal Notice - Propely</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f0ece6; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; }
    .hdr { background: #1a1a1a; padding: 48px 40px 36px; text-align: center; }
    .hdr-logo { font-family: Georgia, serif; font-size: 22px; color: #e3cda7; letter-spacing: 0.5px; margin-bottom: 24px; }
    .hdr-divider { width: 40px; height: 2px; background: #e3cda7; margin: 0 auto 22px; opacity: 0.5; }
    .hdr h1 { font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #fff; line-height: 1.3; }
    .hdr h1 span { color: #e3cda7; }
    .bdy { padding: 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 14px; }
    .txt { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 24px; }
    .notice-badge { display: inline-block; background: #e3cda7; color: #1a1a1a; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .lease-card { background: #faf8f4; border: 1px solid #e3cda7; border-radius: 10px; padding: 22px; margin: 20px 0; }
    .lease-ttl { font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: #a08c6e; font-weight: 600; margin-bottom: 14px; }
    .lease-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #ede8de; font-size: 13px; }
    .lease-row:last-child { border-bottom: none; }
    .lease-row .lk { color: #999; }
    .lease-row .lv { color: #1a1a1a; font-weight: 600; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta { display: inline-block; background: #1a1a1a; color: #e3cda7 !important; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; padding: 13px 36px; border-radius: 6px; }
    .next-box { background: #fffbf3; border-left: 3px solid #e3cda7; border-radius: 0 8px 8px 0; padding: 13px 15px; margin: 20px 0; font-size: 12px; color: #7a6440; line-height: 1.6; }
    .divider { height: 1px; background: #ede8de; margin: 24px 0; }
    .sign { font-family: Georgia, serif; font-size: 14px; color: #444; }
    .sign span { color: #a08c6e; font-style: italic; }
    .ftr-bar { background: #1a1a1a; padding: 26px 40px; text-align: center; }
    .ftr-bar-logo { font-family: Georgia, serif; font-size: 15px; color: #e3cda7; margin-bottom: 10px; }
    .ftr-bar p { font-size: 11px; color: #555; line-height: 1.8; }
    .ftr-bar a { color: #a08c6e; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .bdy { padding: 28px 24px !important; }
      .hdr { padding: 32px 24px !important; }
      .ftr-bar { padding: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <div class="hdr-logo">Propely</div>
      <div class="hdr-divider"></div>
      <h1>Your lease is<br><span>expiring soon</span></h1>
    </div>
    <div class="bdy">
      <p class="greeting">Hi {tenantName},</p>
      <p class="txt">This is a friendly reminder that your lease is approaching its expiration date. We'd love to have you continue as a tenant!</p>
      <div class="notice-badge">⏰ Renewal Notice</div>
      <div class="lease-card">
        <div class="lease-ttl">Lease details</div>
        <div class="lease-row"><span class="lk">Property</span><span class="lv">{propertyName}</span></div>
        <div class="lease-row"><span class="lk">Unit</span><span class="lv">{unitNumber}</span></div>
        <div class="lease-row"><span class="lk">Expires</span><span class="lv">{expirationDate}</span></div>
      </div>
      <div class="cta-wrap"><a href="{contactLink}" class="cta">Contact Your Landlord →</a></div>
      <div class="next-box">💡 <strong>Next steps:</strong> Reach out to your landlord to discuss renewal options, updated terms, or any questions about extending your lease.</div>
      <div class="divider"></div>
      <p class="sign">We value you as a tenant and hope you'll stay!<br><span>The Propely Team</span></p>
    </div>
    <div class="ftr-bar">
      <div class="ftr-bar-logo">Propely</div>
      <p>© 2026 Propely. All rights reserved.<br>This email was sent to <a href="#">{userEmail}</a></p>
    </div>
  </div>
</body>
</html>
`;