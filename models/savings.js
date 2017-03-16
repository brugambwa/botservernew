var mongoose = require('mongoose');  
var dbConnection = require('./database');

/**
 * User Schema
 */

var memberSchema = new mongoose.Schema({  
  fbID: {
    type: String,
    required: true
  },
  fName: {
    type: String,
    required: true
  },
  lName: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  accountBalance: {
    type: Number,
    required: true
  },
  loanLimit: {
    type: Number,
    required: true
  },
  loanBalance: {
    type: Number,
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
memberSchema.method({
});

memberSchema.statics = {

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

module.exports = mongoose.model('Member', memberSchema);
