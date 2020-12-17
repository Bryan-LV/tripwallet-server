const { AuthenticationError, ApolloError } = require('apollo-server');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const checkAuth = (context) => {

  try {
    // Check if "authorization" header is set
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
      throw ('Authorization key was not sent in header');
    }
    // Split auth header "Bearer [Token]"
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ('User did not provide token');
    }
    // Validate token - * token will throw error if not valid *
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    throw new AuthenticationError(error);
  }

}

module.exports = checkAuth;
