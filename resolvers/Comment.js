const Comment = {
    async post(parent, args, {db}, info) {
        let ul= await db.PostModel.findById(parent.post).
                    populate({path:"author", select:"-_id name"}).
                    select("-_id author")
        
        // console.log(ul.author)
        return ul.author
    },

    async author(parent, args, {db}, info) {
        return await db.UserModel.findById(parent.author).
                select("name") 
    }
};

export { Comment as default };