var request = require('request');
var saveModel = require('../models/savings');
var transModel = require('../models/transactions');


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
  saveModel.findOne({fbID: uID}, function(err, member) {
    if (err) {
      console.log('Could Not Find Any Records.');
    } else {
      var messageData = {
          "messages": [
            {"text": "You are currently allowed up to "+member.loanLimit+" on InstaLoan."}
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
            {"text": "Your account balance is  "+member.accountBalance+" and your outstanding loan balance is "+member.loanBalance}
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
        callback(messageData);
      } else {
        //Process Deposit.
        var newbalance = (member.accountBalance - 0) + (data.deposit_amount - 0);
        var transaction = new transModel({
          fbID: data.fb_id,
          telephone: data.user_number,
          amount: data.deposit_amount,
          transactionType: 'deposit',
          accountPreBal: member.accountBalance,
          accountPostBal: newbalance
        });
        transaction.save()
        .then(function(transaction){
          //Update the account balance in the user table.
          saveModel.update({fbID: uID}, {
            accountBalance: newbalance
          }, function(err, member){
            if (err) {
              console.log('Could Not Find Any Records.');
            } else {
              var messageData = {
                "messages": [
                  {"text": "Your transaction has been completed. Your transaction ID is "+transaction.id+". and your account balance is "+newbalance}
                ]
              };
              callback(messageData);
            }   
          })
        })
        .catch(e => console.log(e));
      }
    }
  });
}


function makeLoanRequest(data, callback){
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
        callback(messageData);
      } else {
        //if loan amount matches the limit, Make transaction
        if(data.loan_amount<=member.loanLimit){
          //Make the transaction and update the loan balance.
          //Process Deposit.
          var newbalance = (member.loanBalance - 0) + (data.loan_amount - 0);
          var transaction = new transModel({
            fbID: data.fb_id,
            telephone: data.user_number,
            amount: data.loan_amount,
            transactionType: 'loan',
            accountPreBal: member.loanBalance,
            accountPostBal: newbalance
          });
          transaction.save()
          .then(function(transaction){
            //Update the account balance in the user table.
            saveModel.update({fbID: uID}, {
              accountBalance: newbalance
            }, function(err, member){
              if (err) {
                console.log('Could Not Find Any Records.');
              } else {
                var messageData = {
                  "messages": [
                    {"text": "Your transaction has been completed. Your transaction ID is "+transaction.id+". and your account balance is "+newbalance}
                  ]
                };
                callback(messageData);
              }   
            })
          })
          .catch(e => console.log(e));
          
        } else {
          //else reject transaction
          var messageData = {
            "messages": [
              {"text": "The loan amount you requested exceeds your InstaLoan limit."}
            ]
          };
        }
        callback(messageData);
      }
    }
  });
}

function makeTransactionRequest(data, callback){
  var messageData = {
    "request_type":"deposit",
    "telephone_number":"250784525759",
    "transaction_ref":"238909123",
    "transaction_amount": data.amount
  }
  var respmessageData;
  request({
    uri: 'http://localhost:8888/cresint/payrequest',
    method: 'POST',
    json: messageData

  },function (error, body) 
    {
        if (error) 
        {
            respmessageData = {
            "messages": [
              {"text": "Could not complete request at this time. Please try again later."}
            ]
          };
        } else {
            respmessageData = body;
        }
    });
    callback(respmessageData);  
}

module.exports = {verifyWebHook, processRequest};