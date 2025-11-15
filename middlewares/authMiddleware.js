// authMiddleware.js
const dotenv = require('dotenv');
dotenv.config();

// Middleware to check for a valid API key
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.header('x-api-key');  // Look for the API key in the 'x-api-key' header

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key' });
  }

  next();  // Proceed to the next middleware or route handler if the API key is valid
};

module.exports = apiKeyMiddleware;
