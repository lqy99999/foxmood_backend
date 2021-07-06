const User = {
    friends(parent, args, { db }, info) {
        return Promise.all (
            parent.friends.map(
                (Id) => db.UserModel.findById(Id).
                            select('name today')
            )
        )
    },
  };
  
  export { User as default };
  