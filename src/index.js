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


const pubsub = new PubSub();
const mongo = require('../mongo');

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

server.start({ port: process.env.PORT | 5000 }, () => {
  console.log(`The server is up on port ${process.env.PORT | 5000}!`);
});

// server.listen(8080, () => {
//   console.log('Server listening at http://localhost:8080');
// });
