const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  domain: process.env.COOKIE_DOMAIN || undefined,
};

/**
 * Set a cookie with the given name and value
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Additional cookie options
 */
const setCookie = (res, name, value, options = {}) => {
  const finalOptions = {
    ...cookieOptions,
    ...options,
  };
  res.cookie(name, value, finalOptions);
};

/**
 * Get a cookie value by name
 * @param {Object} req - Express request object
 * @param {string} name - Cookie name
 * @returns {string|undefined} Cookie value
 */
const getCookie = (req, name) => {
  return req.cookies[name];
};

/**
 * Remove a cookie by name
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 */
const removeCookie = (res, name) => {
  res.cookie(name, '', {
    ...cookieOptions,
    expires: new Date(0),
  });
};

/**
 * Set a session cookie with expiration
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAge - Cookie expiration in milliseconds
 */
const setSessionCookie = (res, name, value, maxAge = 24 * 60 * 60 * 1000) => {
  setCookie(res, name, value, { maxAge });
};

/**
 * Set a persistent cookie that lasts for a specified number of days
 * @param {Object} res - Express response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Number of days the cookie should last
 */
const setPersistentCookie = (res, name, value, days = 30) => {
  const maxAge = days * 24 * 60 * 60 * 1000;
  setCookie(res, name, value, { maxAge });
};

module.exports = {
  setCookie,
  getCookie,
  removeCookie,
  setSessionCookie,
  setPersistentCookie,
  cookieOptions,
}; 