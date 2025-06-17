const nodemailer = require('nodemailer');
const { 
  welcomeEmailTemplate, 
  passwordResetTemplate, 
  accountVerificationTemplate, 
  orderConfirmationTemplate,
  newsletterTemplate,
  promotionalTemplate,
  cartAbandonmentTemplate,
  watchConfigurationTemplate
} = require('./emailTemplates');

// Email queue for handling failed emails
const emailQueue = [];
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Check for required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('Error: Missing required environment variables for email service.');
  console.error('Please set EMAIL_USER and EMAIL_PASSWORD in your .env file.');
  console.error('For Gmail, you need to:');
  console.error('1. Enable 2-factor authentication on your Gmail account');
  console.error('2. Generate an App Password from Google Account settings');
  console.error('3. Use that App Password as EMAIL_PASSWORD');
  process.exit(1);
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  secure: true,
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
    minVersion: 'TLSv1.2'
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
    if (error.code === 'ESOCKET') {
      console.error('\nSSL/TLS connection failed. Please try these steps:');
      console.error('1. Run: npm install nodemailer@latest');
      console.error('2. Make sure your .env file has correct credentials:');
      console.error('   EMAIL_USER=your.email@gmail.com');
      console.error('   EMAIL_PASSWORD=your-16-digit-app-password');
      console.error('3. Check if your Gmail account has 2FA enabled');
      console.error('4. Generate a new App Password from Google Account settings');
      console.error('5. If using Gmail, make sure "Less secure app access" is enabled or use an App Password');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check:');
      console.error('1. Your Gmail address is correct');
      console.error('2. You are using an App Password (not your regular Gmail password)');
      console.error('3. 2-Step Verification is enabled on your Google Account');
      console.error('4. The App Password is correctly copied without any extra spaces');
    } else {
      console.error('Unexpected error:', error.message);
    }
    process.exit(1);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Process email queue
const processQueue = async () => {
  if (emailQueue.length === 0) return;

  const emailJob = emailQueue[0];
  try {
    // Validate email options before sending
    if (!emailJob.mailOptions.from || !emailJob.mailOptions.to || !emailJob.mailOptions.subject) {
      throw new Error('Invalid email options in queue');
    }

    await transporter.sendMail(emailJob.mailOptions);
    console.log('Queued email sent successfully to:', emailJob.mailOptions.to);
    emailQueue.shift(); // Remove the processed email
  } catch (error) {
    console.error('Error sending queued email:', error);
    emailJob.retries++;
    
    if (emailJob.retries >= MAX_RETRIES) {
      console.error('Max retries reached for email to:', emailJob.mailOptions.to);
      emailQueue.shift(); // Remove the failed email after max retries
    } else {
      // Move to end of queue for retry
      emailQueue.push(emailQueue.shift());
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Send email with retry mechanism
const sendEmail = async (mailOptions, retries = 0) => {
  try {
    // Ensure mailOptions has the required fields
    if (!mailOptions.from || !mailOptions.to || !mailOptions.subject || (!mailOptions.text && !mailOptions.html)) {
      throw new Error('Invalid mail options: missing required fields');
    }

    // Convert any non-string content to string
    if (mailOptions.html && typeof mailOptions.html !== 'string') {
      mailOptions.html = JSON.stringify(mailOptions.html);
    }
    if (mailOptions.text && typeof mailOptions.text !== 'string') {
      mailOptions.text = JSON.stringify(mailOptions.text);
    }

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', mailOptions.to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    
    if (retries < MAX_RETRIES) {
      console.log(`Retrying email to ${mailOptions.to} (attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendEmail(mailOptions, retries + 1);
    } else {
      // Add to queue for later processing
      emailQueue.push({
        mailOptions,
        retries: 0,
        timestamp: Date.now()
      });
      console.log('Email added to queue for later processing');
      return false;
    }
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const template = welcomeEmailTemplate(user.Name);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const template = passwordResetTemplate(user.Name, resetLink);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationLink = `https://vaultique.up.railway.app/api/auth/verify-email/${verificationToken}`;
  const template = accountVerificationTemplate(user.Name, verificationLink);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const template = orderConfirmationTemplate(user.Name, order);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send newsletter email
const sendNewsletterEmail = async (user) => {
  const template = newsletterTemplate(user.Name);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send promotional email
const sendPromotionalEmail = async (user) => {
  const template = promotionalTemplate(user.Name);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send cart abandonment email
const sendCartAbandonmentEmail = async (user, product) => {
  const template = cartAbandonmentTemplate(user.Name, product);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  return sendEmail(mailOptions);
};

// Send watch configuration email
const sendWatchConfigurationEmail = async (user, configuration) => {
  const template = watchConfigurationTemplate(user.Name, configuration);
  
  // Send to user
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  };

  // Send to Vaultique
  const vaultiqueMailOptions = {
    from: user.email,
    to: 'vaultique.watches@gmail.com',
    subject: `New Watch Customization Request from ${user.Name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">New Customization Request</h1>
          <p style="color: #7f8c8d; font-size: 18px;">From: ${user.Name} (${user.email})</p>
        </div>
        
        <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
            <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">Requested Specifications:</h2>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Model: ${configuration.model}</p>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Strap Color: ${configuration.strap}</p>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Case Color: ${configuration.case}</p>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Bezel Color: ${configuration.bezel}</p>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dial Color: ${configuration.dial}</p>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Estimated Price: $${configuration.price}</p>
            ${configuration.message ? `<p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-top: 15px;"><strong>Additional Notes:</strong><br>${configuration.message}</p>` : ''}
          </div>

          <div style="margin: 25px 0; padding: 20px; background-color: #e8f4f8; border-radius: 6px; border-left: 4px solid #3498db;">
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0;">
              <strong>Action Required:</strong> Please review this request and contact the customer within 2-3 business days.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      New Customization Request
      From: ${user.Name} (${user.email})

      Requested Specifications:
      Model: ${configuration.model}
      Strap Color: ${configuration.strap}
      Case Color: ${configuration.case}
      Bezel Color: ${configuration.bezel}
      Dial Color: ${configuration.dial}
      Estimated Price: $${configuration.price}
      ${configuration.message ? `\nAdditional Notes:\n${configuration.message}` : ''}

      Action Required: Please review this request and contact the customer within 2-3 business days.
    `
  };

  // Send both emails
  const [userResult, vaultiqueResult] = await Promise.all([
    sendEmail(userMailOptions),
    sendEmail(vaultiqueMailOptions)
  ]);

  return userResult && vaultiqueResult;
};

// Test email configuration
const testEmailConfig = async (testEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: testEmail,
    subject: 'Test Email',
    text: 'This is a test email to verify the email configuration.'
  };

  return sendEmail(mailOptions);
};

// Start processing the email queue periodically
setInterval(processQueue, 60000);

// Start queue processing immediately
processQueue().catch(error => {
  console.error('Error in initial queue processing:', error);
});

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendNewsletterEmail,
  sendPromotionalEmail,
  sendCartAbandonmentEmail,
  sendWatchConfigurationEmail,
  testEmailConfig
}; 