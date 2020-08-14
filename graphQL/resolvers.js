const { userResolvers, userQueries } = require('./resolvers/user');
const { tripResolvers, tripQueries, tripChildQueries } = require('./resolvers/trip');
const { expenseQueries, expenseResolvers } = require('./resolvers/expenses');

const resolvers = {
  Query: {
    ...userQueries,
    ...tripQueries,
    ...expenseQueries
  },

  ...tripChildQueries,

  Mutation: {
    ...userResolvers,
    ...tripResolvers,
    ...expenseResolvers
  }
}

module.exports = resolvers;
