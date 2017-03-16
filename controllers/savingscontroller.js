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

  if(fxn_call ==='register'){
      registerUser(data, function(saveduser){
        res.json(saveduser);
      });
  } else  if (fxn_call ==='deposit') {
      makeDeposit(data, function(depositresp){
        res.json(depositresp);
      });
  } else  if (fxn_call ==='checkbal'){
      checkBalance(data, function(balanceinfo){
        res.json(balanceinfo);
      });
  } else if(fxn_call ==='checklimit'){
      loanLimitAmoutCheck(data, function(loanlimitinfo){
        res.json(loanlimitinfo);
      });
  } else {
      makeLoanRequest(data, function(loanrequestinfo){
        res.json(loanrequestinfo);
      });
  }
}

function loanLimitAmoutCheck(data, callback){
  var uID = data.fb_id;
  saveModel.find({fbID: uID}, function(err, member) {
    if (err) {
      console.log('Could Not Find Any Records.');
    } else {
      var messageData = {
          "messages": [
            {"text": "You are currently allowed up to "+member[0].loanLimit+" on InstaLoan."}
          ]
        };
        console.log(messageData);
        callback(messageData);
    }
  });
}

function checkBalance(data, callback){
  var uID = data.fb_id;
  saveModel.findOne({fbID: uID}, function(err, member) {
    if (err) {
      console.log('Could Not Find Any Records.');
    } else {
      if(!member){
        var messageData = {
          "messages": [
            {"text": "No account record found. Click Join to start saving!"}
          ]
        };
      } else {
        var messageData = {
          "messages": [
            {"text": "Your account balance is  "+member[0].accountBalance+" And your outstanding loan balance is "+member[0].loanBalance}
          ]
        };
      }
      callback(messageData);
    }
  });
}

function registerUser(data, callback){
  var uID = data.fb_id;
  saveModel.findOne({fbID: uID}, function(err, member) {
    if (err) {
      console.log('Could Not Find Any Records.');
    } else {
      if(!member){
        var member = new saveModel({
        fbID: data.fb_id,
        fName: data.fb_first_name,
        lName: data.fb_last_name,
        telephone: data.user_number,
        accountBalance: 0,
        loanLimit: 0,
        loanBalance: 0
      });

      member.save()
        .then(function(savedUser){
            var messageData = {
                "messages": [
                  {"text": "Your account has been successfully created. Your Account ID is "+savedUser.id}
                ]
              };
        })
        .catch(e => console.log(e));
      } else {
        var messageData = {
          "messages": [
            {"text": "You already have an account. Please select another transaction option"}
          ]
        };
      }
      callback(messageData);
    }
  });
}

function makeDeposit(data, callback){

}


function makeLoanRequest(data, callback){
  var messageData = {
    "messages": [
      {"text": "Welcome to our store!"}
    ]
  };
  return messageData;
}

module.exports = {verifyWebHook, processRequest};