const Message = {
    async sender(parent, args, {db}, info) {
        return await db.UserModel.findById(parent.sender).
                select("name") 
    }
};

export { Message as default };