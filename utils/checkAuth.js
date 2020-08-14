const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const checkAuth = (context) => {
  // check authorization header is set
  const authHeader = context.req.headers.authorization;
  if (!authHeader) {
    throw new AuthenticationError('Authorization key was not sent in header');
  }

  try {
    // split auth header "Bearer [Token]", and take token
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('User did not provide token.');
    }
    // validate token - * token will throw error if not valid *
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    throw new AuthenticationError(error);
  }

}

module.exports = checkAuth;
