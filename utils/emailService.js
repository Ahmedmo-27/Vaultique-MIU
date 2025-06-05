const nodemailer = require('nodemailer');
const { 
  welcomeEmailTemplate, 
  passwordResetTemplate, 
  accountVerificationTemplate, 
  orderConfirmationTemplate,
  newsletterTemplate,
  promotionalTemplate,
  cartAbandonmentTemplate 
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
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // How many messages to send per second
  rateLimit: 5 // Max number of messages per rateDelta
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
    console.error('Please check your email credentials and make sure:');
    console.error('1. EMAIL_USER is a valid Gmail address');
    console.error('2. EMAIL_PASSWORD is a valid App Password');
    console.error('3. 2-factor authentication is enabled on your Gmail account');
    process.exit(1);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Process email queue
const processQueue = async () => {
  while (emailQueue.length > 0) {
    const emailJob = emailQueue[0];
    try {
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
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
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
setInterval(processQueue, 60000); // Check queue every minute

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendNewsletterEmail,
  sendPromotionalEmail,
  sendCartAbandonmentEmail,
  testEmailConfig
}; 