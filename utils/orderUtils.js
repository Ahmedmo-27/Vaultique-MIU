/**
 * Generates a unique order number
 * Format: VAULT-YYYYMMDD-XXXXX where X is a random number
 */
exports.generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  
  return `VAULT-${year}${month}${day}-${random}`;
}; 