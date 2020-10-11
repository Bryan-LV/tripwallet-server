const { AuthenticationError, ApolloError } = require('apollo-server');
const { createClient } = require('pexels');
require('dotenv').config();

const checkAuth = require('../../utils/checkAuth');
const Trip = require('../../models/trip.model');
const Expense = require('../../models/expense.model');
const { createTripValidation, updateTripValidation } = require('../../utils/tripValidations');

const tripQueries = {
  getTrip: async (parent, { id }) => {
    try {
      let trip = await Trip.findById(id);
      if (!trip) {
        throw new ApolloError('Trip does not exists');
      }
      return trip
    } catch (error) {
      throw new ApolloError(error);
    }
  },
  getTrips: async (parent, args, context) => {
    try {
      let user = checkAuth(context);
      let trips = await Trip.find({ user: user._id });
      if (!trips) {
        throw new ApolloError('Could not find users trips');
      }
      return trips
    } catch (error) {
      throw new ApolloError(error);
    }
  },
  getPhotos: async (parent, args, context) => {
    try {
      checkAuth(context);
      const client = createClient(process.env.PEXELSKEY);

      const query = args.query;
      const queryObject = { query, per_page: 10 }
      if (args.page) queryObject.page = args.page

      const req = await client.photos.search(queryObject)
      const res = req.photos;
      return res;

    } catch (error) {
      console.log(error);
      throw new ApolloError(error);
    }
  }
}

const tripChildQueries = {
  Trip: {
    expenses: async (parent) => {
      try {
        let expenses = await Expense.find({ tripID: parent._id });
        if (!expenses) throw new ApolloError('No expenses found');
        return expenses
      } catch (error) {
        throw new ApolloError(error)
      }
    }
  }
}

const tripResolvers = {
  ///////////////////// Create Trip /////////////////////
  createTrip: async (_, { createTrip }, context) => {
    try {
      // check user is authenticated
      let user = checkAuth(context);
      // validate inputs
      const { error } = createTripValidation.validate(createTrip);
      // create new trip object
      let newTrip = {
        user: user._id,
        tripName: createTrip.tripName,
        foreignCurrency: createTrip.foreignCurrency,
        baseCurrency: createTrip.baseCurrency,
        categories: ["Food", "Accommodation"],
        startDate: createTrip.startDate,
        totalSpent: 0.00
      }
      if (createTrip.budget) newTrip.budget = createTrip.budget;
      if (createTrip.endDate) newTrip.endDate = createTrip.endDate;
      if (createTrip.photo) newTrip.photo = createTrip.photo;
      let trip = new Trip(newTrip);
      let savedTrip = await trip.save();

      return {
        ...savedTrip._id,
        ...savedTrip._doc
      }
    } catch (error) {
      throw new ApolloError(error);
    }
  },
  ///////////////////// Delete Trip /////////////////////
  deleteTrip: async (_, { tripID }, context) => {
    try {
      // check if user is authenticated
      let user = checkAuth(context);
      // get trip
      let trip = await Trip.findById(tripID);
      if (!trip) { throw new ApolloError('Trip does not exists'); }
      // TODO: check user cannot delete trip that is not their own -TEST
      if (toString(user._id) !== toString(trip.user)) {
        throw new AuthenticationError('User is not authorized to delete this trip');
      }
      // delete expenses > category > trip 
      await Expense.deleteMany({ tripID });
      await Trip.deleteOne({ _id: tripID });
      return { message: 'trip has been deleted' }
    } catch (error) {
      throw new ApolloError(error);
    }
  },
  ///////////////////// Update Trip /////////////////////
  updateTrip: async (_, { updateTrip }, context) => {
    console.log(updateTrip);
    try {
      const { tripID, tripName, foreignCurrency, budget, startDate, endDate, photo } = updateTrip;
      // check user auth
      let user = checkAuth(context);
      // validate inputs
      const { error } = updateTripValidation.validate(updateTrip);
      // find trip
      let trip = await Trip.findById(tripID);
      if (!trip) throw new ApolloError('Trip does not exists');
      // check user.id === trip.user
      // TODO: check user.id === trip.user -TEST
      if (toString(user._id) !== toString(trip.user)) {
        console.log('user.id and trip.user are not equal');
        // throw new AuthenticationError('User is not authorized to update this trip');
      }
      // create update object
      const updateObj = {};
      if (tripName) updateObj.tripName = tripName
      if (foreignCurrency) updateObj.foreignCurrency = foreignCurrency
      if (budget) updateObj.budget = budget
      if (startDate) updateObj.startDate = startDate
      if (endDate) updateObj.endDate = endDate
      if (photo) updateObj.photo = photo
      // update trip
      const updatedTrip = await Trip.findByIdAndUpdate(tripID, { $set: updateObj }, { new: true });
      //return new trip
      return updatedTrip;
    } catch (error) {
      throw new ApolloError(error);
    }
  }
}

module.exports = { tripResolvers, tripQueries, tripChildQueries }