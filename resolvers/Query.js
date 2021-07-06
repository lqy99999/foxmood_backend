const mongoose = require('mongoose');
const Query = {
  async users(parent, {name}, { db }, info) {
      if (!name) {
        return await db.UserModel.find({}).
          collation({locale: "en"}).
          sort({name : 1}).
          select('-password')
      }

      let ul = await db.UserModel.find({name: name}).select('-password')

      console.log("===Query===")
      console.log(ul)
      return ul
  },

  async signIn(parent, {name, password}, {db}, info){
    try{
      if(!name || !password)
        return;

      let user = await db.UserModel.findOne({name: name}).select('name password')
      console.log("===Query:SignIn===")
      console.log(user)

      if(user) {
        if (user.password === password) return "SUCCESS"
        else return "NOT_MATCH"
      } else {
        return "USER_NOT_FOUND"
      }
    } catch(e) {return "USER_NOT_FOUND"}

    return false;
  },
  
  async posts(parent, {type, author}, { db }, info) {
    try{
      let time = new Date().toJSON().slice(0,10) +"T00:00:00.000Z"
      console.log("time: "+time);

      // console.log("!type="+ !type)
      // console.log("!id="+ !id)
      // console.log("!author="+ !author)

      if (!type && !author) {
        let posts = await db.PostModel.find({time: {$gte: new Date(time)}}).
          collation({locale: "en"}).
          sort({time : 1})

        let newPosts = await Promise.all(posts.map(async (post) => {
          const comments = await db.CommentModel.find({post:post}).
                            sort({time: -1})
          const a = {
            type: post.type,
            id: post.id,
            time: post.time,
            body: post.body,
            author: post.author,
            comments: comments
          }
          return a
        }))
        return newPosts;

      }
      else {
        if (!type) throw new Error("Missing type.")
        if (type === 4) {
          if (!author) throw new Error("Missing author.")
          const user = await db.UserModel.findOne({name: author})
          const post = await db.PostModel.find({type: type, author: user})
          console.log(user)
          console.log(post)
          if (!user || !post) throw ("User or post Not found")
          return post
        }
        else if (type === 6){
          const post = await db.PostModel.find({type: type})
          console.log(post)
          if (!post) throw ("Post Not found")
          return post
        }
        else {
          throw new Error(`POST doesn't have Type(${type})`)
        }
      }
    } catch(e) {console.log(e)}
  },

  async onemessageboxes(parent, args, {db}, info){
    let time = new Date().toJSON().slice(0,10) +"T00:00:00.000Z"
    console.log("time: "+time);

    await db.OneMessageBoxModel.deleteMany({date: {$lt: new Date(time)}})
    return await db.OneMessageBoxModel.find().sort({date: 1});
  },

  async votes(parent, {vote}, {db}, info){
    if(!vote){
      return await db.VoteModel.find()
    } else {
      return await db.VoteModel.findOne({vote: vote})
    }
  },
}

export default Query;