import { GraphQLServer, PubSub } from 'graphql-yoga';
const { ApolloServer, gql } = require('apollo-server');
import db from './db';
import User from '../resolvers/User'
import Message from '../resolvers/Message'
import Post from '../resolvers/Post'
import Comment from '../resolvers/Comment'
import Vote from '../resolvers/Vote'
import Query from '../resolvers/Query';
import Mutation from '../resolvers/Mutation';
import Subscription from '../resolvers/Subscription';
const expressPlayground = require("graphql-playground-middleware-express").default;
const express = require("express");

// const schema = require("./schema");
const pubsub = new PubSub();
const mongo = require('../mongo');
const port = process.env.PORT || 5000;

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers: {
    User,
    Message,
    Post,
    Comment,
    Vote,
    Query,
    Mutation,
    Subscription,
  },
  context: {
    db,
    pubsub,
  },
});

mongo.connect(); // from mongo.js

// const resolvers = {
//   User,
//   Message,
//   Post,
//   Comment,
//   Vote,
//   Query,
//   Mutation,
//   Subscription,
// }
// const server = new ApolloServer({ typeDefs:'./schema.graphql', resolvers });
// const context = {db, pubsub}

// const app = express();
// server.applyMiddleware({ app });
// // app.use(cors())
// app.use(
//   '/graphql',
//   graphqlHTTP({
//     schema,
//     rootValue: resolvers,
//     context,
//   })
// );

// //Graphql Playground route
// app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

// app.listen(port, () => {
//     console.log((`The server is up on port ${port}!`));
//   });



server.start({ port: process.env.PORT | 5000 }, () => {
  console.log(`The server is up on port ${process.env.PORT | 5000}!`);
});

// server.listen(8080, () => {
//   console.log('Server listening at http://localhost:8080');
// });
