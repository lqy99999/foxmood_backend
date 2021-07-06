import { GraphQLServer, PubSub } from 'graphql-yoga';
import db from './db';
import User from '../resolvers/User'
import Message from '../resolvers/Message'
import Post from '../resolvers/Post'
import Comment from '../resolvers/Comment'
import Vote from '../resolvers/Vote'
import Query from '../resolvers/Query';
import Mutation from '../resolvers/Mutation';
import Subscription from '../resolvers/Subscription';

// import express from 'express';
// import bodyParser from 'body-parser';
// import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
// import { makeExecutableSchema } from 'graphql-tools';


const port = process.env.PORT || 5000;

const pubsub = new PubSub();
const mongo = require('../mongo');
// const typeDefs = require('./schema.graphql')
// const resolvers = require('../resolvers')
// const schema = makeExecutableSchema({
//   typeDefs: './schema.graphql',
//   resolvers: {
//     User,
//     Message,
//     Post,
//     Comment,
//     Vote,
//     Query,
//     Mutation,
//     Subscription,
//   },
//   context: {
//         db,
//         pubsub,
//   },
// });

// const app = express();

// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
// app.use('/', graphiqlExpress({ endpointURL: '/graphql' }));

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

server.start({ port: process.env.PORT || 5000 }, () => {
  console.log(`The server is up on port ${process.env.PORT || 5000}!`);
});

// app.listen(port, () => {
//   console.log(`Server started on port: ${port}`);
// });
