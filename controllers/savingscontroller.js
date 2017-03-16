var saveModel = require('../models/savings');

function verifyWebHook(req, res, next){
  console.log("Verify Token sent");
  if (req.query['hub.mode'] === 'subscribe')
  {
      console.log("Subscribe Verify Token, check: " + req.query['hub.verify_token']);
      if (req.query['hub.verify_token'] === 'CMU_HACK2017')
      {
          console.log("Validating webhook");
          res.send(req.query['hub.challenge'])
      }
      else
      {
          console.log("Oh No, invalid Verify Token: " + req.query['hub.verify_token']);
          res.send("Error, wrong token.");
      }
  }
  else
  {
      console.log("not subscribing");
      res.send('Hello world')
  }
}

function processRequest(req, res, next) {
  var data = req.body;
  var fxn_call = data.fxn_call;
  var textResponse;

  if(fxn_call ==='register'){
      registerUser(data, function(saveduser){
        res.json(saveduser);
      });
  } else  if (fxn_call ==='deposit') {
      textResponse = makeDeposit();
  } else  if (fxn_call ==='checkbal'){
      textResponse = this.checkBalance();
  } else if(fxn_call ==='checklimit'){
      textResponse = loanCheckAmout();
  } else {
      textResponse = makeLoanRequest();
  }
  //res.json(textResponse);
}

function registerUser(data, callback){
  const member = new saveModel({
    fbID: data.fb_id,
    fName: data.fb_first_name,
    lName: data.fb_last_name,
    telephone: data.user_number,
    accountBalance: 0,
    loanLimit: 0,
    loanBalance: 0
  });

  member.save()
    .then(savedUser, function(savedUser){
        var messageData = {
            "messages": [
              {"text": "Your account has been successfully created. Your Account ID is "+savedUser.id}
            ]
          };
          console.log(messageData)
          callback(messageData);
    })
    .catch(e => console.log(e));
}

function makeDeposit(req, res, next){

}

function checkBalance(req, res, next){

}

function loanCheckAmout(req, res, next){

}

function makeLoanRequest(req, res, next){
  var messageData = {
    "messages": [
      {"text": "Welcome to our store!"}
    ]
  };
  return messageData;
}

module.exports = {verifyWebHook, processRequest};