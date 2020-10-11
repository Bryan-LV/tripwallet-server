const { ApolloServer } = require('apollo-server');
const db = require('./db');

const typeDefs = require('./graphQL/typeDefs');
const resolvers = require('./graphQL/resolvers');

// connect database
db();

const PORT = process.env.PORT || 4000;
const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});


server.listen({ port: PORT }).then(({ url }) => console.log(url));

