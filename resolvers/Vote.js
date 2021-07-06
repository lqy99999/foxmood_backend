const Vote = {
    async creator(parent, args, {db}, info) {
        return await db.UserModel.findById(parent.creator).
                select("name") 
    }
};

export { Vote as default };

