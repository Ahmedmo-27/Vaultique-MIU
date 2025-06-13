const { body, validationResult } = require('express-validator');
const { isValidCardNumber, isValidExpiryDate, isValidCVV } = require('../utils/securityUtils');

const validatePaymentInput = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Cardholder name is required')
    .isLength({ min: 3 })
    .withMessage('Cardholder name must be at least 3 characters long'),
  
  body('card_number')
    .trim()
    .notEmpty()
    .withMessage('Card number is required')
    .custom((value) => {
      if (!isValidCardNumber(value)) {
        throw new Error('Invalid card number');
      }
      return true;
    }),
  
  body('bank_name')
    .trim()
    .notEmpty()
    .withMessage('Bank name is required'),
  
  body('expiry')
    .trim()
    .notEmpty()
    .withMessage('Expiry date is required')
    .custom((value) => {
      if (!isValidExpiryDate(value)) {
        throw new Error('Invalid expiry date');
      }
      return true;
    }),
  
  body('cvv')
    .trim()
    .notEmpty()
    .withMessage('CVV is required')
    .custom((value) => {
      if (!isValidCVV(value)) {
        throw new Error('Invalid CVV');
      }
      return true;
    })
];

const validatePaymentMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validatePaymentInput,
  validatePaymentMiddleware
}; 