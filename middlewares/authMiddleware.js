// authMiddleware.js

// Middleware to check for a valid API key
const apiKeyMiddleware = (req, res, next) => {
  // Log the API key from environment variable for debugging
  console.log("API_KEY in Vercel:", process.env.API_KEY);  // Log the value of the API key in Vercel

  // Log the request headers for debugging
  console.log("Request Headers:", req.headers);  // Log the incoming request headers

  // Look for the API key in the 'x-api-key' header
  const apiKey = req.header('x-api-key'); 

  // If no API key is provided or the key doesn't match, send an Unauthorized response
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key' });
  }

  // Proceed to the next middleware or route handler if the API key is valid
  next();  
};

module.exports = apiKeyMiddleware;
