const jwt = require('jsonwebtoken')
require('dotenv').config();

const checkAuth = (context) => {

  if (!context) throw new Error('Correct headers were not sent');

  // Check if "authorization" header is set
  const authHeader = context.req.headers.authorization;
  if (!authHeader) {
    throw new Error('Authorization key was not sent in header');
  }

  // Split auth header "Bearer [Token]"
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('User did not provide token');
  }

  try {
    // Validate token - * token will throw error if not valid *
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    throw new Error('User token is not valid');
  }
}

module.exports = checkAuth;
