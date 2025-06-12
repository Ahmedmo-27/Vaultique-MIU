/**
 * Generates a unique tracking number for shipping
 * Format: VAULT-XXXX-XXXX-XXXX where X is a random alphanumeric character
 */
exports.generateTrackingNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const generateSegment = () => {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };

  return `VAULT-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}; 