const welcomeSMSTemplate = (userName) => ({
  body: `Welcome to Vaultique, ${userName}! 🎉 We're thrilled to have you join our community of discerning watch enthusiasts. Explore our curated collection of luxury timepieces at ${process.env.FRONTEND_URL}/collections`
});

const passwordResetSMSTemplate = (userName, resetLink) => ({
  body: `Hi ${userName}, we received a request to reset your Vaultique password. Click here to create a new password: ${resetLink} (expires in 30 min). If you didn't request this, please ignore this message.`
});

const accountVerificationSMSTemplate = (userName, verificationLink) => ({
  body: `Hi ${userName}, verify your Vaultique account to access exclusive timepieces, secure storage, and priority support. Click here: ${verificationLink}`
});

const orderConfirmationSMSTemplate = (userName, orderDetails) => ({
  body: `Hi ${userName}, your Vaultique order #${orderDetails.orderNumber} has been confirmed! Total: ${orderDetails.total}. We'll notify you when it ships. View order: ${process.env.FRONTEND_URL}/orders/${orderDetails.orderNumber}`
});

const newsletterSMSTemplate = (userName) => ({
  body: `Hi ${userName}, new exclusive timepieces have arrived at Vaultique! 🕰️ Including Rolex, Audemars Piguet, and more. Check them out: ${process.env.FRONTEND_URL}/collections`
});

const promotionalSMSTemplate = (userName) => ({
  body: `Hi ${userName}, limited-time offers on luxury timepieces at Vaultique! ⏰ Exclusive deals on Rolex, AP, Cartier & more. Don't miss out: ${process.env.FRONTEND_URL}/offers`
});

const cartAbandonmentSMSTemplate = (userName, productDetails) => ({
  body: `Hi ${userName}, your ${productDetails.name} (${productDetails.price}) is waiting in your cart! Limited stock available. Complete your purchase: ${process.env.FRONTEND_URL}/cart`
});

module.exports = {
  welcomeSMSTemplate,
  passwordResetSMSTemplate,
  accountVerificationSMSTemplate,
  orderConfirmationSMSTemplate,
  newsletterSMSTemplate,
  promotionalSMSTemplate,
  cartAbandonmentSMSTemplate
}; 