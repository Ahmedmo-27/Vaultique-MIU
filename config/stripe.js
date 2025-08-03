const stripe = require('stripe');
const config = require('./env');

// Initialize Stripe with secret key
const stripeInstance = stripe(config.stripe.secretKey);

// Validate Stripe configuration
if (!config.stripe.secretKey) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
}

if (!config.stripe.publishableKey) {
  console.warn('Warning: STRIPE_PUBLISHABLE_KEY is not set. Stripe Elements will not work.');
}

module.exports = {
  stripe: stripeInstance,
  config: config.stripe,
  
  // Helper function to create payment intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Helper function to create customer
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripeInstance.customers.create({
        email: email,
        name: name,
        metadata: metadata
      });
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Helper function to create payment method
  async createPaymentMethod(type, card, billingDetails = {}) {
    try {
      const paymentMethod = await stripeInstance.paymentMethods.create({
        type: type,
        card: card,
        billing_details: billingDetails
      });
      return paymentMethod;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  // Helper function to attach payment method to customer
  async attachPaymentMethodToCustomer(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripeInstance.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      return paymentMethod;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  },

  // Helper function to process refund
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: reason
      };
      
      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripeInstance.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }
}; 