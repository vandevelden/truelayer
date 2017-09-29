var express = require('express');
var http = require('http') ;
var path = require('path');
var bodyParser = require('body-parser');

const {AuthAPIClient, DataAPIClient} = require("truelayer-client");
const app = require("express")();

//const redirect_uri = "http://localhost:3000/callback";
const redirect_uri="https://requestbin.t7r.co/1cushov1";

// Create TrueLayer client instance 
const client = new AuthAPIClient({
	client_id: "superwhizzybang-0v2j",
	client_secret: "kxniij6feqqe6r4iatwpoj"
    });



// Generate and redirect to authentication url 
app.get("/", (req, res) => {
	// Reference JSDocs for descriptions of parameters 
	const authURL = client.getAuthUrl(redirect_uri, ["offline_access","accounts","transactions","info","balance"], "nonce", "12345","true");
	res.redirect(authURL);
    });
 
// Receiving POST request 
app.post("/callback", async (req, res) => {
	// Exchange an authentication code for an access token 
	const code = req.body.code;
	const tokens = await client.exchangeCodeForToken(redirect_uri, code);
    
	// Call to the Data endpoint using the access token obtained. Eg. /info endpoint 
	const info = await DataAPIClient.getInfo(tokens.access_token);
    
	res.set("Content-Type", "text/plain");
	res.send(`Access Token: ${JSON.stringify(info, null, 2)}`);
    });

app.get("/account", async (req, res) => {
const message={
	    "messages": [
       			
	
        {
      "text":  "Looking at activities in the past month",
      "quick_replies": [
        {
          "title":"Loved it!",
          "block_names": ["PortfolioBlock"]
        },
        
      ]
    
    }]
};
    res.set("Content-type", "application/json");
	res.send(message)
	
    });


app.post("/balance", async (req, res) => {
    const message ={"messages": [
    {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Financial Information for John Doe",
          "buttons": [
            {
              "type": "show_block",
              "block_names": ["PortfolioBlock"],
              "redirect_to_blocks":["PortfolioBlock"],
              "title": "Review Summary of Account Activities"
            },
            {
              "type": "show_block",
              "block_names": ["InvestBlock"],
              "redirect_to_blocks":["investment"],
              "title": "Get Investment Advice"
            }
          ]
        }
      }
    }
  ]};
    
    
const message1={
	    "messages": [
       			
	{
	    
	    "attachment":{
		"type":"template",
		"payload":{
		    "template_type":"list",
		    "top_element_style":"large",
		    "elements":[

	{
	    "title":"Activity Summary",
	    //"image_url":"http://rockets.chatfuel.com/img/shirt.png",
	    "image_url":"http://simpleicon.com/wp-content/uploads/bank.png",
        "subtitle":"Monthly activities",
        
	    "buttons":[
	     {
	    "type":"web_url",
	    "url":"http://2a104e93.ngrok.io/account",
	    "title":"View Item"
	     }
              ]
        
	},  
	{
	    "title":"Investment Advice",
	    "image_url":"https://cdn0.iconfinder.com/data/icons/gray-business-toolbar/512/harvest-512.png",
        //"image_url":"http://rockets.chatfuel.com/img/hoodie.png",
	    "subtitle":"Investment Options and Assessment",
	    "buttons":[
            
	     {
	    "type":"web_url",
	    "url":"http://2a104e93.ngrok.io/invest",
	    "title":"View Item"
	      }]}]			}}
	}]};
       



	const message_old={
	    "messages": [
	{"text": "Welcome to the Chatfuel Rockets!"},
	{"text": "What are you up to?"}
 ]
	};
	
	const block={
	    "set_attributes": 
	    {
		"some attribute": "some value",
		"another attribute": "another value"
	    },
	    "block_names": ["jsonblock"],
	    "type": "show_block",
	    "title": "go"
	};



const results = {"results": [
    {
	"update_timestamp": "2017-02-07T17:29:24.740802Z",
	"account_id": "f1234560abf9f57287637624def390871",
	"account_type": "TRANSACTION",
	"display_name": "Club Lloyds",
	"currency": "GBP",
	"account_number": {
	    "iban": "GB35LOYD12345678901234",
	    "number": "12345678",
	    "sort_code": "12-34-56"
	}
    }]};

	res.set("Content-type", "application/json");
	res.send(message)
	
    });

    

http.createServer(app).listen(3000, function () {
	console.log("Express server listening on port 3000");
    });




 
 
