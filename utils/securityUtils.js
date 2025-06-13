const crypto = require('crypto');

// Encryption utilities
const encryptData = (data) => {
  if (!data) return null;
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
};

// Payment validation utilities
const isValidCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cleaned)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return (sum % 10) === 0;
};

const isValidExpiryDate = (expiry) => {
  if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

// Error handling utilities
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error
    });
  } else {
    // Production error response
    if (error.isOperational) {
      res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message
      });
    } else {
      // Programming or unknown errors
      console.error('ERROR 💥', error);
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};

module.exports = {
  encryptData,
  decryptData,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
  AppError,
  errorHandler
}; 