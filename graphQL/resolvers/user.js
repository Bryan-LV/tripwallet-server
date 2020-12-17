const { ApolloError, UserInputError, AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../../models/user.model');
const Trip = require('../../models/trip.model');
const Expense = require('../../models/expense.model');
const RegisterValidation = require('../../utils/registerValidation');
const LoginValidation = require('../../utils/loginValidation');
const generateToken = require('../../utils/generateToken');
const checkAuth = require('../../utils/checkAuth');

const userQueries = {
  user: (_, { id }) => {
    try {
      let user = User.findById(id)
      if (!user) {
        throw new ApolloError('This user does not exist');
      }
      return user;
    } catch (error) {
      throw new ApolloError(error);
    }
  },
  checkAuth: (_, args, context) => {
    try {
      const isValid = checkAuth(context)
      if (isValid) {
        return { isValid: true }
      }
    } catch (error) {
      throw new AuthenticationError('User is not authenticated');
    }
  }
}

const userResolvers = {
  ///////////////////// Register User /////////////////////
  register: async (_, { registerUser }) => {
    const { username, email, baseCurrency, password, confirmPassword } = registerUser;

    try {
      // validate user inputs
      const { error } = RegisterValidation.validate(registerUser);
      if (error) throw new UserInputError(error.message);
      // verify email and username aren't taken
      let user = await User.findOne({ email });
      if (user) throw new UserInputError('This user has existing account');
      user = await User.findOne({ username });
      if (user) throw new UserInputError('This username is taken');
      // Double check passwords match
      if (password !== confirmPassword) throw new UserInputError('Passwords do not match');
      // hash password
      const hashPassword = await bcrypt.hash(password, 10);
      // save to db
      user = new User({ username, email, baseCurrency, password: hashPassword });
      const savedUser = await user.save();
      // generate token
      const token = generateToken(savedUser);
      return {
        _id: savedUser._id,
        ...savedUser._doc,
        token,
        trips: []
      }
    } catch (error) {
      console.log(error);
      throw new ApolloError(error);
    }
  },
  ///////////////////// Login User /////////////////////
  login: async (_, { loginUser }) => {
    try {
      // validate user inputs
      const { error } = LoginValidation.validate(loginUser);
      if (error) throw new UserInputError(error);
      // check if user exists
      let user = await User.findOne({ email: loginUser.email });
      if (!user) {
        throw new UserInputError('User does not have an account');
      }
      // verify password
      const verifyPassword = await bcrypt.compare(loginUser.password, user.password);
      if (!verifyPassword) {
        throw new UserInputError('Wrong credentials');
      }

      // generate token
      const token = await generateToken(user);
      return {
        _id: user._id,
        ...user._doc,
        token
      }
    } catch (error) {
      console.log(error);
      throw new ApolloError(error)
    }
  }
  ,
  ///////////////////// Update User /////////////////////
  updateUser: async (_, { updateUser }, context) => {
    try {
      // check if user is authenticated
      checkAuth(context);
      let user = await User.findByIdAndUpdate(updateUser.id, { $set: updateUser }, { new: true });
      if (!user) throw new ApolloError('User not found');
      return user;
    } catch (error) {
      console.log(error);
      throw new ApolloError(error)
    }
  },
  ///////////////////// Delete User /////////////////////
  deleteUser: async (_, { id }, context) => {
    try {
      // check if user is authenticated
      checkAuth(context);
      let user = await User.findById(id);
      if (!user) throw new ApolloError('User does not exist');
      // delete expenses > trip > user
      let trip = await Trip.findOne({ user: user._id });
      if (trip) {
        await Expense.deleteMany({ tripID: trip._id });
        await trip.remove()
      }
      await user.remove()
      return { message: 'User has been successfully deleted', isValid: true }
    } catch (error) {
      console.log(error);
      throw new ApolloError(error)
    }
  }
}

module.exports = { userResolvers, userQueries }