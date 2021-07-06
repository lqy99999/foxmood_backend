const { buildSchema } = require("graphql");
// const { ApolloServer, gql } = require('apollo-server-express');
const { gql } = require('apollo-server')

const schema = gql`
  type Query {
      users(name: String): [User!]
      signIn(name: String!, password: String!): SignInType
      posts(type: Int, author: String): [Post!]
      onemessageboxes: [Message!]
      votes(vote: String): [Vote!]
    }
    
    type Mutation {
      createUser(data: CreateUserInput!): SignUpType
      deleteUser(name: String!): User!
      updateUser(data: UpdateUserInput!): User!
    
      createPost(data: CreatePostInput!): Post!
      deletePost(type: Int!, _id: ID!, author: String!): Post!
      createComment(data: CreateCommentInput!): Comment!
      deleteComment(data: DeleteCommentInput!): Comment!
    
      createOneMessage(sender: String!, body: String!): Message!
      updateOneMessage(sender: String!, body: String!): Message!
    
      createVote(data: CreateVoteInput!): Vote!
      updateVote(data: CreateVoteInput!): Vote!
      deleteVote(user: String!): Vote!
    
      clearData(type: String): Boolean!
    }
    
    type Subscription {
      user: UserSubscriptionPayload!
      post(type: Int, author: String): PostSubscriptionPayload!
      post6(type: Int): PostSubscriptionPayload!
      oneMessage: OneMessageSubscriptionPayload!
      vote: VoteSubscriptionPayload!
    }
    
    type User {
      name: String!
      password: String!
      friends: [Friend!]
      mood: [Int!]
      today: Int!
    }
    
    type Friend{
      _id: ID!
      name: String!
      today: Int!
    }
    
    type Message {
      # type: Int!
      date: String!
      sender: Sender!
      body: String!
    }
    
    type Sender {
      name: String!
    }
    
    type Post {
      _id: ID!
      type: Int!
      time: String!
      body: String!
      author: Author!
      comments: [Comment!]
    }
    
    type Comment {
      _id: ID!
      post: Author!
      time: String!
      body: String!
      author: Author!
    }
    
    type Author {
      name: String!
    }
    
    type Vote {
      vote: String!
      creator: Name!
      count: Int!
    }
    
    type Name {
      name: String!
    }
    
    type UserSubscriptionPayload {
      mutation: MutationType!
      data: User!
    }
    
    type PostSubscriptionPayload {
      mutation: MutationType!
      data: Post!
    }
    
    type VoteSubscriptionPayload {
      mutation: MutationType!
      data: Vote!
    }
    
    type OneMessageSubscriptionPayload{
      mutation: MutationType!
      sender: String!
      body: String!
    }
    
    input CreateUserInput {
      name: String!
      password: String!
    }
    
    input UpdateUserInput {
      name: String!
      friends: [String!]
      mood: [Int!]
      today: Int!
    }
    
    input CreatePostInput {
      type: Int!
      body: String!
      author: String!
    }
    
    input CreateCommentInput {
      type: Int!
      postId: ID!
      postAuthor: String!
      body: String!
      author: String!
    }
    
    input DeleteCommentInput {
      type: Int!
      postId: Int!
      postAuthor:String!
      commentId: Int!
      author: String!
    }
    
    input CreateVoteInput {
      vote: String!
      creator: String!
    }
    
    enum MutationType {
      CREATED
      UPDATED
      DELETED
      ADDED_COMMENT
      DELETED_COMMENT
    }
    
    enum SignInType {
      SUCCESS
      USER_NOT_FOUND 
      USER_EXISTS
      NOT_MATCH
    }
    
    enum SignUpType {
      SUCCESS
      USER_EXISTS
    }`

export {schema}