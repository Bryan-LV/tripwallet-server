const { ApolloServer } = require('apollo-server');
const db = require('./db');

const typeDefs = require('./graphQL/typeDefs');
const resolvers = require('./graphQL/resolvers');

// connect database
db();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
  cors: {
    origin: [
      'https://tripwallet.netlify.app',
      process.env.NODE_ENV !== 'production' && 'http://localhost:3000'
    ],
    credentials: true
  }
});

server.listen({ port: PORT }).then(({ url }) => console.log(url));

