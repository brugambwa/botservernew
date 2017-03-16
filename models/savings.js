var mongoose = require('mongoose');  
var dbConnection = require('./database');

/**
 * User Schema
 */

var communitySchema = new mongoose.Schema({  
  userName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


/**
 * Methods
 */
communitySchema.method({
});

communitySchema.statics = {

  get(id){
    return this.findById(id)
        .exec()
        .then((user) => {
          if (user) {
            return user;
          }
          const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
          return Promise.reject(err);
        });
  },

  list({ skip = 0, limit = 50 } = {}){
    return this.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    }
}

module.exports = mongoose.model('Community', communitySchema);
