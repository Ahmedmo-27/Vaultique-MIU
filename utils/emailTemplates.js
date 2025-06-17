const welcomeEmailTemplate = (userName) => ({
  subject: "Welcome to Vaultique! 🎉",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome ${userName}</h1>
        <p style="color: #7f8c8d; font-size: 18px;">Where luxury and precision meet</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Welcome to Vaultique!</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We are excited to have you join our community of discerning watch enthusiasts. At Vaultique, we specialize in offering a carefully curated collection of the world's finest luxury timepieces from renowned brands like Rolex, Audemars Piguet, and many more directly to your wrist.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">As a valued member of Vaultique, you'll enjoy:</h2>
          <ul style="color: #34495e; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li><strong>Exclusive Access:</strong> A carefully selected range of premium timepieces</li>
            <li><strong>Authenticity Guaranteed:</strong> 100% authentic pieces from trusted suppliers</li>
            <li><strong>Personalized Service:</strong> Dedicated team to help you find your perfect watch</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/collections" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Our Products</a>
        </div>

        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We look forward to sending you a special message in the Vaultique packaging.</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Till next time,<br>-Vaultique</p>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 14px;">
          <p>P.S.: Keep an eye out for your email inbox to receive special offers from us.</p>
        </div>
      </div>
    </div>
  `,
  text: `
    Welcome ${userName} to Vaultique!

    We are excited to have you join our community of discerning watch enthusiasts. At Vaultique, we specialize in offering a carefully curated collection of the world's finest luxury timepieces from renowned brands like Rolex, Audemars Piguet, and many more directly to your wrist.

    As a valued member of Vaultique, you'll enjoy:
    - Exclusive Access: A carefully selected range of premium timepieces
    - Authenticity Guaranteed: 100% authentic pieces from trusted suppliers
    - Personalized Service: Dedicated team to help you find your perfect watch

    Explore our collection: ${process.env.FRONTEND_URL}/collections

    We look forward to sending you a special message in the Vaultique packaging.
    Till next time,
    -Vaultique

    P.S.: Keep an eye out for your email inbox to receive special offers from us.
  `
});

const passwordResetTemplate = (userName, resetLink) => ({
  subject: "Reset Your Vaultique Password 🔒",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Password Reset Request</h1>
        <p style="color: #7f8c8d; font-size: 18px;">Secure your Vaultique account</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We received a request to reset your Vaultique account password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>

        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">This link will expire in 30 minutes for security reasons.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>For security reasons, this link will expire in 30 minutes.</p>
        <p>Best regards,<br>The Vaultique Team</p>
      </div>
    </div>
  `,
  text: `
    Password Reset Request

    Dear ${userName},

    We received a request to reset your Vaultique account password. Click the link below to create a new password:

    ${resetLink}

    This link will expire in 30 minutes for security reasons.

    If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.

    Best regards,
    The Vaultique Team
  `
});

const accountVerificationTemplate = (userName, verificationLink) => ({
  subject: "Verify Your Vaultique Account ✨",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to Vaultique</h1>
        <p style="color: #7f8c8d; font-size: 18px;">One step closer to accessing luxury timepieces</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Thank you for creating your Vaultique account. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #2c3e50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>

        <p style="color: #7f8c8d; font-size: 14px; text-align: center;">Or copy and paste this link in your browser:</p>
        <p style="color: #3498db; font-size: 14px; text-align: center; word-break: break-all;">${verificationLink}</p>

        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">After Verification:</h2>
          <ul style="color: #34495e; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>Access to exclusive watch collections</li>
            <li>Secure document storage</li>
            <li>Priority customer support</li>
            <li>Special member benefits</li>
          </ul>
        </div>

        <p style="color: #e74c3c; font-size: 14px; text-align: center; margin-top: 20px;">This verification link will expire in 24 hours.</p>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>The Vaultique Team</p>
      </div>
    </div>
  `,
  text: `
    Welcome to Vaultique

    Dear ${userName},

    Thank you for creating your Vaultique account. To complete your registration and access all features, please verify your email address by clicking the link below:

    ${verificationLink}

    After verification, you'll have access to:
    - Exclusive watch collections
    - Secure document storage
    - Priority customer support
    - Special member benefits

    This verification link will expire in 24 hours.

    If you didn't create this account, please ignore this email.

    Best regards,
    The Vaultique Team
  `
});

const orderConfirmationTemplate = (userName, orderDetails) => ({
  subject: "Order Confirmation - Vaultique 🛍️",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Order Confirmation</h1>
        <p style="color: #7f8c8d; font-size: 18px;">Thank you for your purchase</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Thank you for your order with Vaultique. We're pleased to confirm that we've received your order and it's being processed.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">Order Details:</h2>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Order Number: ${orderDetails.orderNumber}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Date: ${orderDetails.date}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Total: ${orderDetails.total}</p>
        </div>

        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">Items Ordered:</h2>
          ${orderDetails.items.map(item => `
            <div style="margin-bottom: 15px;">
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">${item.name}</p>
              <p style="color: #7f8c8d; font-size: 14px;">Quantity: ${item.quantity}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>If you have any questions about your order, please contact our support team.</p>
        <p>Best regards,<br>The Vaultique Team</p>
      </div>
    </div>
  `,
  text: `
    Order Confirmation

    Dear ${userName},

    Thank you for your order with Vaultique. We're pleased to confirm that we've received your order and it's being processed.

    Order Details:
    Order Number: ${orderDetails.orderNumber}
    Date: ${orderDetails.date}
    Total: ${orderDetails.total}

    Items Ordered:
    ${orderDetails.items.map(item => `
    ${item.name}
    Quantity: ${item.quantity}
    `).join('\n')}

    If you have any questions about your order, please contact our support team.

    Best regards,
    The Vaultique Team
  `
});

const newsletterTemplate = (userName) => ({
  subject: "New Exclusive Timepieces Await 🕰️",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">New Exclusive Timepieces Await</h1>
        <p style="color: #7f8c8d; font-size: 18px;">Your monthly luxury watch update</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Thank you for being part of Vaultique, where luxury watches aren't just bought, they're chosen. As a valued member of our community, we're excited to bring you the latest from the world of high-end timepieces.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">🔹 What's New This Month</h2>
          <ul style="color: #34495e; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li><strong>Fresh Arrivals:</strong> Explore the newest drops from top brands</li>
            <li><strong>Editor's Picks:</strong> Timepieces known for lasting value and signature design</li>
            <li><strong>Coming Soon:</strong> First look at next month's arrivals</li>
            <li><strong>Private Offers:</strong> Exclusive deals and early access</li>
          </ul>
        </div>

        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">🔸 Why Shop with Vaultique?</h2>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">At Vaultique, we're all about trust, quality, and service. Every watch is sourced through trusted suppliers and comes with authenticity guaranteed.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/collections" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Browse Collection</a>
          <a href="https://instagram.com/vaultique" style="background-color: #E1306C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Follow on Instagram</a>
        </div>

        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Thank you again for being part of Vaultique.</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">See you next time,<br>-Vaultique</p>
      </div>
    </div>
  `,
  text: `
    New Exclusive Timepieces Await

    Dear ${userName},

    Thank you for being part of Vaultique, where luxury watches aren't just bought, they're chosen. As a valued member of our community, we're excited to bring you the latest from the world of high-end timepieces.

    🔹 What's New This Month:
    - Fresh Arrivals: Explore the newest drops from top brands
    - Editor's Picks: Timepieces known for lasting value and signature design
    - Coming Soon: First look at next month's arrivals
    - Private Offers: Exclusive deals and early access

    🔸 Why Shop with Vaultique?
    At Vaultique, we're all about trust, quality, and service. Every watch is sourced through trusted suppliers and comes with authenticity guaranteed.

    Browse Collection: ${process.env.FRONTEND_URL}/collections
    Follow us on Instagram: https://instagram.com/vaultique

    Thank you again for being part of Vaultique.
    See you next time,
    -Vaultique
  `
});

const promotionalTemplate = (userName) => ({
  subject: "New Limited Timepiece Offers ⏰",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">New Limited Timepiece Offers</h1>
        <p style="color: #7f8c8d; font-size: 18px;">${userName}, Now is the time.</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">For a limited time, Vaultique is offering exclusive private deals on some of the most sought after luxury timepieces, including handpicked models from Rolex, Audemars Piguet, Cartier, and more.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">🔹 What's Included:</h2>
          <ul style="color: #34495e; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>Exclusive limited-time offers on select models</li>
            <li>First access to new arrivals and restocks</li>
            <li>Personalized guidance from our Vaultique watch specialists</li>
          </ul>
        </div>

        <p style="color: #e74c3c; font-size: 16px; line-height: 1.6; font-weight: bold;">But don't wait — these pieces move fast, and stock is limited. Once they're gone, they will never return.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/offers" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Claim Your Offer</a>
          <a href="https://instagram.com/vaultique" style="background-color: #E1306C; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Follow on Instagram</a>
        </div>

        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Elevate your wrist — and your collection.</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">-Vaultique</p>
      </div>
    </div>
  `,
  text: `
    New Limited Timepiece Offers

    ${userName}, Now is the time.

    For a limited time, Vaultique is offering exclusive private deals on some of the most sought after luxury timepieces, including handpicked models from Rolex, Audemars Piguet, Cartier, and more.

    🔹 What's Included:
    - Exclusive limited-time offers on select models
    - First access to new arrivals and restocks
    - Personalized guidance from our Vaultique watch specialists

    But don't wait — these pieces move fast, and stock is limited. Once they're gone, they will never return.

    Claim Your Offer: ${process.env.FRONTEND_URL}/offers
    Follow us on Instagram: https://instagram.com/vaultique

    Elevate your wrist — and your collection.
    -Vaultique
  `
});

const cartAbandonmentTemplate = (userName, productDetails) => ({
  subject: "The Watch was Almost Yours ⌚",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">The Watch was Almost Yours</h1>
        <p style="color: #7f8c8d; font-size: 18px;">Complete your purchase and claim your piece of timeless luxury</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">You're so close to owning a masterpiece. Your cart is still waiting — and so is that perfect timepiece.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">🕰️ Your Watch:</h2>
          <div style="text-align: center;">
            <img src="${productDetails.image}" alt="${productDetails.name}" style="max-width: 300px; margin-bottom: 15px;">
            <p style="color: #34495e; font-size: 18px; font-weight: bold;">${productDetails.name}</p>
            <p style="color: #2c3e50; font-size: 20px;">${productDetails.price}</p>
          </div>
        </div>

        <p style="color: #e74c3c; font-size: 16px; line-height: 1.6; font-weight: bold;">Don't let this one get away. Limited stock means you'll want to act fast before it's gone.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/cart" style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Your Purchase</a>
        </div>

        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We're ready when you are.</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Warm regards,<br>-Vaultique Team</p>
      </div>
    </div>
  `,
  text: `
    The Watch was Almost Yours

    You're so close to owning a masterpiece. Your cart is still waiting — and so is that perfect timepiece.

    🕰️ Your Watch:
    ${productDetails.name}
    ${productDetails.price}

    Don't let this one get away. Limited stock means you'll want to act fast before it's gone.

    Complete Your Purchase: ${process.env.FRONTEND_URL}/cart

    We're ready when you are.
    Warm regards,
    -Vaultique Team
  `
});

const watchConfigurationTemplate = (userName, configuration) => ({
  subject: "Watch Customization Request - Vaultique 🕰️",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Watch Customization Request</h1>
        <p style="color: #7f8c8d; font-size: 18px;">Your custom watch request has been received</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
        <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Thank you for your interest in our custom watch service. We have received your customization request and will begin processing it shortly.</p>
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">Your Requested Specifications:</h2>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Model: ${configuration.model}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Strap Color: ${configuration.strap}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Case Color: ${configuration.case}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Bezel Color: ${configuration.bezel}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Dial Color: ${configuration.dial}</p>
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Estimated Price: $${configuration.price}</p>
          ${configuration.message ? `<p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-top: 15px;"><strong>Additional Notes:</strong><br>${configuration.message}</p>` : ''}
        </div>

        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
          <h2 style="color: #2c3e50; font-size: 20px; margin-bottom: 15px;">What's Next?</h2>
          <ul style="color: #34495e; font-size: 16px; line-height: 1.6; padding-left: 20px;">
            <li>Our team will review your customization request</li>
            <li>We will contact you within 2-3 business days to discuss the details</li>
            <li>Once approved, we will provide you with a final quote</li>
            <li>You will be notified when your custom watch is ready for collection</li>
          </ul>
        </div>

        <div style="margin: 25px 0; padding: 20px; background-color: #e8f4f8; border-radius: 6px; border-left: 4px solid #3498db;">
          <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0;">
            <strong>Important:</strong> We will keep you updated throughout the customization process. Please save this email for your reference.
          </p>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <p>If you have any questions about your request, please contact our support team.</p>
        <p>Best regards,<br>The Vaultique Team</p>
      </div>
    </div>
  `,
  text: `
    Watch Customization Request

    Dear ${userName},

    Thank you for your interest in our custom watch service. We have received your customization request and will begin processing it shortly.

    Your Requested Specifications:
    Model: ${configuration.model}
    Strap Color: ${configuration.strap}
    Case Color: ${configuration.case}
    Bezel Color: ${configuration.bezel}
    Dial Color: ${configuration.dial}
    Estimated Price: $${configuration.price}
    ${configuration.message ? `\nAdditional Notes:\n${configuration.message}` : ''}

    What's Next?
    - Our team will review your customization request
    - We will contact you within 2-3 business days to discuss the details
    - Once approved, we will provide you with a final quote
    - You will be notified when your custom watch is ready for collection

    Important: We will keep you updated throughout the customization process. Please save this email for your reference.

    If you have any questions about your request, please contact our support team.

    Best regards,
    The Vaultique Team
  `
});

module.exports = {
  welcomeEmailTemplate,
  passwordResetTemplate,
  accountVerificationTemplate,
  orderConfirmationTemplate,
  newsletterTemplate,
  promotionalTemplate,
  cartAbandonmentTemplate,
  watchConfigurationTemplate
}; 