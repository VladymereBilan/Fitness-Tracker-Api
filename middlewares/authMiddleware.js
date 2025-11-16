// authMiddleware.js

// Middleware to check for a valid API key
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.header('API_KEY');  // Look for the API key in the 'API_KEY' header

  console.log("API Key from request:", apiKey); // Log the key from the request
  console.log("API Key from environment variable length:", process.env.API_KEY ? process.env.API_KEY.length : 0); // Log the LENGTH of the env var (safer than logging the key)

  // Check if the API key from the request matches the environment variable
  if (!apiKey || apiKey !== process.env.API_KEY) {  // Use the correct environment variable name
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key' });
  }

  next();  // Proceed to the next middleware or route handler if the API key is valid
};

module.exports = apiKeyMiddleware;
