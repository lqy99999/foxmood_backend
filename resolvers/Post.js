const Post = {
    async author(parent, args, {db}, info) {
        return await db.UserModel.findById(parent.author).
                select("name") 
    },
    comments(parent, args, {db}, info){
        return Promise.all(
            parent.comments.map((mId) =>
                db.CommentModel.findById(mId))
        );
    }
};

export { Post as default };