const Subscription = {
    user: {
        subscribe(parent, args, { pubsub }, info) {
          return pubsub.asyncIterator('user');
        },
    },
    post: {
        async subscribe(parent, {type, author}, { pubsub }, info) {
          return pubsub.asyncIterator('post'+`${type}`+`${author}`);
        },
    },
    post6: {
      async subscribe(parent, {type}, { pubsub }, info) {
        return pubsub.asyncIterator('post6'+`${type}`);
      },
    },
    oneMessage: {
        subscribe(parent, args, { pubsub }, info) {
          return pubsub.asyncIterator('oneMessage');
        },
    },
    vote: {
      subscribe(parent, args, { pubsub }, info) {
        return pubsub.asyncIterator('vote');
      },
  },
};

export default Subscription;