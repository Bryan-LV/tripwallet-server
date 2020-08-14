const jwt = require('jsonwebtoken');
require('dotenv').config();

async function generateToken(user) {
  try {
    return await jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch (error) {
    console.log(error);
    return false
  }
}

module.exports = generateToken;