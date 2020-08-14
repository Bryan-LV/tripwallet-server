const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async function () {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    console.log('database connected');
  } catch (error) {
    console.log(error);
  }
}