import uuidv4 from 'uuid/v4';
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

function checkUser (db, name){
    return db.UserModel.exists({ name: name });
}

async function newUser(db, data){
    return await new db.UserModel(data).save();
}

function makeName (name, to){
    return [name, to].sort().join('_'); // make sure chatboxs' name are same
};

const Mutation = {
    async createUser(parent, { data }, { db, pubsub }, info) {
        try{
            if (!data.name || !data.password) {
                throw new Error('Missing Username or password');
            }
            const existing = await db.UserModel.findOne({ name: data.name});
            if (existing) {
                // throw new Error('Already signed up, please log in.');
                return "USER_EXISTS"
            }
            // if (await checkUser(db, data.name)){
            //     throw new Error('This user name has already been used, please create another one.')
            // }
            const userdata = {
                name: data.name,
                password: data.password,
                friends: [],
                mood: [],
                today: -1,
            };

            const user = await newUser(db, userdata)
            
            console.log("===Mutation: createUser===")
            console.log(user)
            pubsub.publish('user', {
                user: {
                    mutation: 'CREATED',
                    data: user,
                },
            });

            return "SUCCESS"

        }  catch(e){console.log(e)}
    },

    async deleteUser(parent, { name }, { db }, info) {
        try{
            if (!name) {
                throw new Error('Missing User name');
            }
            const user = await db.UserModel.findOne({name: name})
            if (user){
                await db.UserModel.deleteOne({ name: name })
            } else {
                throw new Error('User not found')
            }
            console.log("===Mutation: deleteUser===")
            console.log(user)
            return await user
            // .populate({path:'friends', select:'name today'}).execPopulate();

        }  catch(e){console.log(e)}
    },

    async updateUser(parent, args, { db, pubsub }, info) {
        try{
            const { name, friends, mood, today } = args.data;
            const user = await db.UserModel.findOne({name: name});

            if (!user) {
                throw new Error('User not found');
            }

            if(friends.length !== 0){
                user.friends = [];
                // console.log("friends="+friends)
                await Promise.all (
                    friends.map( async friend => {
                        const a = await db.UserModel.findOne({name: friend});
                        // console.log(a.name)
                        if (a) {
                            user.friends.push(a);
                        }
                }))
            }
        
            if (mood.length !== 0) {
                user.mood = mood;
            }

            if (typeof today === 'number') {
                user.today = today;
            }

            await user.save()
            console.log("===Mutation: updateUser===")
            console.log(user)

            pubsub.publish('user', {
                user: {
                    mutation: 'UPDATED',
                    data: user,
                },
            });
            return user
            // .populate({path:'friends', select:'name today'}).execPopulate();  

        } catch(e){console.log(e)}
    },

    /* type: 4 => 一個人可以有很多posts
     * type: 6 => 一人只有一個post
     */
    async createPost(parent, {data}, { db, pubsub }, info) {
        try {
            const {type, body, author} = data;
            const user = await db.UserModel.findOne({name: author});

            if (!user) {
              throw new Error('User not found');
            }
            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
            var timeStamp = localISOTime.substring(0, 10) + '-' + localISOTime.substring(11, 13) + '-' + localISOTime.substring(14, 16) + '-' + localISOTime.substring(17, 19);
            const post = {
                type: type,
                time: timeStamp,
                body: body,
                author: user,
                comments: []
            };
            
            if( type === 4 ){
                await new db.PostModel(post).save();
                pubsub.publish('post'+`${type}`+`${author}`, {
                    post: {
                        mutation: 'CREATED',
                        data: post,
                    },
                });
            }else if( type === 6 ){
                await db.PostModel.updateOne({type: type, author: user},post,{upsert: true});
                pubsub.publish('post6'+`${type}`, {
                    post6: {
                        mutation: 'CREATED',
                        data: post,
                    },
                });
            }else {
                throw new Error(`POST doesn't have Type(${type})`)
            }
            console.log("===Mutation: createPost===")
            console.log(post)
            return post;

        }catch(e) {console.log(e)}
    },

    async deletePost(parent, {type, _id, author}, { db, pubsub }, info) {
        try{
            const user = await db.UserModel.findOne({name: author})
            if(!user) thorw('User no found')
            const post = await db.PostModel.findOne({type: type, _id: _id, author: user});
            if(!post) thorw('Post no found')

            await db.PostModel.deleteOne({type: type, _id: _id, author: user});
            const comments = await db.CommentModel.deleteMany({post: post});
            console.log(comments)
            
            pubsub.publish('post'+`${type}`+`${author}`, {
                post: {
                    mutation: 'DELETED',
                    data: post,
                },
            });

            return post
        } catch(e) {console.log(e)}
    },
    
    async createComment (parent, {data}, { db, pubsub }, info) {
        try {
            const {type, postId, postAuthor, body, author} = data;
            if (type !== 6) {
                throw new Error(`Comment doesn't have Type(${type})`)
            }
            const postUser = await db.UserModel.findOne({name: postAuthor})
            const commentUser = await db.UserModel.findOne({name: author})
            if (!postUser) throw (`${postAuthor} not found`)
            if (!commentUser) throw (`${author} not found`)

            const post = await db.PostModel.findOne({type:type, _id:postId, author: postUser})
            if(!post) throw ("Post not found")

            var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
            var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
            var timeStamp = localISOTime.substring(0, 10) + '-' + localISOTime.substring(11, 13) + '-' + localISOTime.substring(14, 16) + '-' + localISOTime.substring(17, 19);
            
            const comment = new db.CommentModel({
                post: post,
                time: timeStamp,
                body: body,
                author: commentUser
            })
            await comment.save()
            await db.PostModel.updateOne({type:type, _id:postId, author: postUser}, {$push: {comments: comment}});
            console.log("===Mutation: createComment===")
            pubsub.publish('post6'+`${type}`, {
                post6: {
                    mutation: 'ADDED_COMMENT',
                    data: {
                        type: post.type,
                        id: post.id,
                        time: post.time,
                        body: post.body,
                        author: post.author,
                        comments: [comment]
                    },
                },
            });
            return comment

        } catch (e) {console.log(e)}
    },

    async deleteComment (parent, {data}, { db, pubsub }, info) {
        try {
            const {type, postId, postAuthor, commentId, author} = data
            const postUser = await db.UserModel.findOne({name: postAuthor})
            const commentUser = await db.UserModel.findOne({name: author})
            if(!postUser || !commentUser) throw ("User nout found")

            const post = await db.PostModel.findOne({type, id:postId, author:postUser});
            if(!post) throw ("Post nout found")

            const comment = await db.CommentModel.findOne({post:post, id:commentId, author:commentUser})
            if(!comment) throw ("Comment nout found")

            await db.CommentModel.deleteOne({post:post, author:commentUser});
            
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED_COMMENT',
                    data: {
                        type: post.type,
                        id: post.id,
                        time: post.time,
                        body: post.body,
                        author: post.author,
                        comments: [comment]
                    },
                },
            });
            return comment

        } catch (e) {console.log(e)}
    },

    async createOneMessage(parent, {sender, body}, { db, pubsub }, info) {
        try{
            const user = await db.UserModel.findOne({name: sender})
            if(!user) throw ("User not found")

            const existing = await db.OneMessageBoxModel.findOne({sender: user})
            if (existing){
                return existing
            }

            const message = new db.OneMessageBoxModel({
                date: new Date(),
                sender: user,
                body: body
            })
            await message.save()
            pubsub.publish('oneMessage', {
                oneMessage: {
                    mutation: 'CREATED',
                    sender: sender,
                    body: body
                },
            });
            return message

        }  catch(e) {console.log(e)}
    },

    async updateOneMessage(parent, {sender, body}, { db, pubsub }, info) {
        try{
            const user = await db.UserModel.findOne({name: sender})
            if(!user) throw ("User not found")

            const existing = await db.OneMessageBoxModel.findOne({sender: user})
            if (!existing)  throw ("Message not found")

            // const message = new db.OneMessageBoxModel({
            //     date: new Date(),
            //     sender: user,
            //     body: body
            // })
            existing.date = new Date()
            existing.body = body

            await existing.save()
            pubsub.publish('oneMessage', {
                oneMessage: {
                    mutation: 'UPDATED',
                    sender: sender,
                    body: body
                },
            });
            return existing

        }  catch(e) {console.log(e)}
    },

    async createVote (parent, {data}, { db, pubsub }, info) {
        try{
            const {vote, creator} = data;
            const User = await db.UserModel.findOne({name: creator});
            if(!User) throw ("User not found")
            const Vote_exist = await db.VoteModel.findOne({vote: vote, creator: User});
            if(Vote_exist) throw ("This story has been made; share some other stories!!!")
            const newVote = new db.VoteModel({
                vote: vote,
                creator: User,
                count: 0
            })
            await newVote.save()
            pubsub.publish('vote', {
                vote: {
                    mutation: 'CREATED',
                    data: vote
                },
            });
            return newVote
        }catch(e) {console.log(e)}
    },

    async updateVote (parent, {data}, { db, pubsub }, info) {
        try{
            const {vote, creator} = data;
            const User = await db.UserModel.findOne({name: creator});
            if(!User) throw ("User not found")
            const Vote_exist = await db.VoteModel.findOne({vote: vote, creator: User});
            if(!Vote_exist) throw ("Story not exist!!!")
            const c = Vote_exist.count + 1
            const newVote = {
                vote: vote,
                creator: User,
                count: c
            }
            await db.VoteModel.updateOne({vote: vote, creator: User},newVote,{upsert: true});
            pubsub.publish('vote', {
                vote: {
                    mutation: 'UPDATED',
                    data: newVote
                },
            });
            return newVote
        }catch(e) {console.log(e)}
    },

    async deleteVote (parent, {user}, { db, pubsub }, info) {
        try{
            const User = await db.UserModel.findOne({name: user});
            if(!User) throw ("User not found")

            const voted = await db.VoteModel.find({users: User})
            if(!voted.length) throw ("User didn't vote")
            // console.log(["Voted",voted])

            voted[0].users = voted[0].users.filter((user) => {
                return user.toString() !== User._id.toString()
            })
            // console.log(["Delete vote.users",voted[0].users])
            await voted[0].save()
            pubsub.publish('vote', {
                vote: {
                    mutation: 'DELETED',
                    data:voted[0]
                },
            });
            return voted[0]
        }catch(e) {console.log(e)}
    },

    async clearData(parent, {type}, { db }, info) {
        try{
            if(!type) {
                await db.UserModel.deleteMany()
                await db.ChatBoxModel.deleteMany()
                await db.MessageModel.deleteMany()
                await db.PostModel.deleteMany()
                await db.CommentModel.deleteMany()
                await db.OneMessageBoxModel.deleteMany();
                await db.VoteModel.deleteMany();
                console.log("===Mutation: clearAll===")
            } else {
                type = type.toLowerCase();
                switch (type) {
                    case "users":
                      await db.UserModel.deleteMany();
                      break;
                    case "chatboxes":
                        await db.ChatBoxModel.deleteMany();
                        break;
                    case "messages":
                      await db.MessageModel.deleteMany();
                      break;
                    case "posts":
                        await db.PostModel.deleteMany();
                        break;
                    case "comments":
                        await db.CommentModel.deleteMany();
                        break;
                    case "onemessagebox":
                        await db.OneMessageBoxModel.deleteMany();
                        break;
                    case "votes":
                        await db.VoteModel.deleteMany();
                        break;
                    default:
                      throw `Type(${type}) not found`;
                  }
                  console.log(`===Mutation: clear${type}===`)
            }
            return true

        } catch(e){console.log(e)}
        return false
    },
};

export default Mutation;