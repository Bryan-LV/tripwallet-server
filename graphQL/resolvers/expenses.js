const { AuthenticationError, ApolloError } = require('apollo-server');
const currencyjs = require('currency.js');

const checkAuth = require('../../utils/checkAuth');
const Trip = require('../../models/trip.model');
const Expense = require('../../models/expense.model');

const expenseQueries = {
  ///////////////////// Get Expense /////////////////////
}

const expenseResolvers = {
  ///////////////////// Create Expense /////////////////////
  createExpense: async (_, { newExpense }, context) => {
    try {
      // check user is authenticated
      let user = checkAuth(context);
      // create expense
      let expense = new Expense(newExpense);
      // check if new category was added
      let trip = await Trip.findById(newExpense.tripID);
      if (!trip) throw new ApolloError('Trip of new expense cannot be found');
      const checkCategories = trip.categories.filter(cat => cat.toLowerCase() === newExpense.category.toLowerCase());
      if (checkCategories.length === 0) {
        trip.categories.push(newExpense.category);
      }
      // update total spent
      const updatedTotal = currencyjs(trip.totalSpent).add(newExpense.baseCurrencyPrice);
      trip.totalSpent = updatedTotal;
      await expense.save();
      await trip.save();

      return expense;
    } catch (error) {
      console.log(error);
      throw new ApolloError(error);
    }
  },
  ///////////////////// Update Expense /////////////////////
  updateExpense: async (_, { updateExpense }, context) => {

    try {
      const { expenseID, tripID, category, expenseName, foreignPrice, baseCurrencyPrice, spread, startDate, endDate, notes } = updateExpense;
      // check user auth
      let user = checkAuth(context);
      // find trip
      let expense = await Expense.findById(expenseID);
      if (!expense) throw new ApolloError('Expense does not exists');
      // check user cannot update expense that is not their own
      // check expense's tripID > trip.user === user.id who is deleting expense
      let trip = await Trip.findById(tripID);
      if (toString(user._id) !== toString(trip.user)) {
        console.log('User is not authorized to update expense');
        throw new ApolloError('User is not authorized to update this expense')
      }
      // create update object
      const updateObj = {};
      if (category) updateObj.category = category
      if (expenseName) updateObj.expenseName = expenseName
      if (foreignPrice) updateObj.foreignPrice = foreignPrice
      if (baseCurrencyPrice) {
        updateObj.baseCurrencyPrice = baseCurrencyPrice
        const subtractOldExpense = currencyjs(trip.totalSpent).subtract(expense.baseCurrencyPrice);
        const updateExpense = currencyjs(subtractOldExpense).add(baseCurrencyPrice);
        trip.totalSpent = updateExpense;
        await trip.save();
      }
      if (spread) updateObj.spread = spread
      if (startDate) updateObj.startDate = startDate
      if (endDate) updateObj.endDate = endDate
      if (notes) updateObj.notes = notes
      // update trip
      const updatedExpense = await Expense.findByIdAndUpdate(expenseID, { $set: updateObj }, { new: true });
      //return new trip
      return updatedExpense;
    } catch (error) {
      throw new ApolloError(error);
    }
  },
  ///////////////////// Delete Expense /////////////////////
  deleteExpense: async (_, { expenseID }, context) => {
    try {
      // check if user is authenticated
      let user = checkAuth(context);
      // get expense and trip
      let expense = await Expense.findById(expenseID);
      if (!expense) throw new Error('Expense does not exists');
      // check user cannot delete expense that is not their own
      // check expense's tripID > trip.user === user.id who is deleting expense
      let trip = await Trip.findById(expense.tripID);
      if (toString(user._id) !== toString(trip.user)) throw new Error('User is not authorized to delete this expense');

      const updatedTotal = currencyjs(trip.totalSpent).subtract(expense.baseCurrencyPrice);
      trip.totalSpent = updatedTotal;
      await trip.save();
      await expense.remove();
      return { message: 'Expense has been deleted' }
    } catch (error) {
      throw new ApolloError(error);
    }
  },
}

module.exports = { expenseQueries, expenseResolvers };