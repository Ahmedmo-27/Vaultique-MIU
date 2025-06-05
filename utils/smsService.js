const twilio = require('twilio');
const {
  welcomeSMSTemplate,
  passwordResetSMSTemplate,
  accountVerificationSMSTemplate,
  orderConfirmationSMSTemplate,
  newsletterSMSTemplate,
  promotionalSMSTemplate,
  cartAbandonmentSMSTemplate
} = require('./smsTemplates');

// Check for required environment variables
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error('Error: Missing required environment variables for SMS service.');
  console.error('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.');
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// SMS queue for handling failed messages
const smsQueue = [];
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Process SMS queue
const processQueue = async () => {
  while (smsQueue.length > 0) {
    const smsJob = smsQueue[0];
    try {
      await client.messages.create(smsJob.messageOptions);
      console.log('Queued SMS sent successfully to:', smsJob.messageOptions.to);
      smsQueue.shift(); // Remove the processed message
    } catch (error) {
      console.error('Error sending queued SMS:', error);
      smsJob.retries++;
      
      if (smsJob.retries >= MAX_RETRIES) {
        console.error('Max retries reached for SMS to:', smsJob.messageOptions.to);
        smsQueue.shift(); // Remove the failed message after max retries
      } else {
        // Move to end of queue for retry
        smsQueue.push(smsQueue.shift());
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
};

// Send SMS with retry mechanism
const sendSMS = async (messageOptions, retries = 0) => {
  try {
    // Ensure messageOptions has the required fields
    if (!messageOptions.to || !messageOptions.body) {
      throw new Error('Invalid message options: missing required fields');
    }

    // Add from number if not provided
    if (!messageOptions.from) {
      messageOptions.from = process.env.TWILIO_PHONE_NUMBER;
    }

    await client.messages.create(messageOptions);
    console.log('SMS sent successfully to:', messageOptions.to);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    if (retries < MAX_RETRIES) {
      console.log(`Retrying SMS to ${messageOptions.to} (attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return sendSMS(messageOptions, retries + 1);
    } else {
      // Add to queue for later processing
      smsQueue.push({
        messageOptions,
        retries: 0,
        timestamp: Date.now()
      });
      console.log('SMS added to queue for later processing');
      return false;
    }
  }
};

// Send welcome SMS
const sendWelcomeSMS = async (user) => {
  const template = welcomeSMSTemplate(user.Name);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Send password reset SMS
const sendPasswordResetSMS = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const template = passwordResetSMSTemplate(user.Name, resetLink);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Send verification SMS
const sendVerificationSMS = async (user, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const template = accountVerificationSMSTemplate(user.Name, verificationLink);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Send order confirmation SMS
const sendOrderConfirmationSMS = async (user, order) => {
  const template = orderConfirmationSMSTemplate(user.Name, order);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Send newsletter SMS
const sendNewsletterSMS = async (user) => {
  const template = newsletterSMSTemplate(user.Name);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Send promotional SMS
const sendPromotionalSMS = async (user) => {
  const template = promotionalSMSTemplate(user.Name);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Send cart abandonment SMS
const sendCartAbandonmentSMS = async (user, product) => {
  const template = cartAbandonmentSMSTemplate(user.Name, product);
  const messageOptions = {
    to: user.phone,
    body: template.body
  };

  return sendSMS(messageOptions);
};

// Test SMS configuration
const testSMSConfig = async (testPhone) => {
  const messageOptions = {
    to: testPhone,
    body: 'This is a test SMS to verify the Twilio configuration.'
  };

  return sendSMS(messageOptions);
};

// Start processing the SMS queue periodically
setInterval(processQueue, 60000); // Check queue every minute

module.exports = {
  sendWelcomeSMS,
  sendPasswordResetSMS,
  sendVerificationSMS,
  sendOrderConfirmationSMS,
  sendNewsletterSMS,
  sendPromotionalSMS,
  sendCartAbandonmentSMS,
  testSMSConfig
}; 