var mongoose = require('mongoose');  

var transactionSchema = new mongoose.Schema({ 
  createdAt: {
    type: Date,
    default: Date.now
  }, 
  fbID: {
  	type: String,
  	required: true
  },
  telephone: {
  	type: String,
  	required: true
  },
  amount: {
  	type: Number,
  	required: true
  },
  transactionType: {
  	type: String,
  	required: true
  },
  tpTransID: {
  	type: String
  },
  accountPreBal: {
  	type: Number,
  	required: true
  },
  accountPostBal: {
  	type: Number,
  	required: true
  }
  
});

module.exports = mongoose.model('Transaction', transactionSchema);