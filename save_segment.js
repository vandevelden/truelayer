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

app.post("/balance", async (req, res) => {
	

	const message={
        "message":{
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "recipient_name":"Stephane Crozatier",
        "order_number":"12345678902",
        "currency":"USD",
        "payment_method":"Visa 2345",        
        "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
        "timestamp":"1428444852",         
        "address":{
          "street_1":"1 Hacker Way",
          "street_2":"",
          "city":"Menlo Park",
          "postal_code":"94025",
          "state":"CA",
          "country":"US"
        },
        "summary":{
          "subtotal":75.00,
          "shipping_cost":4.95,
          "total_tax":6.19,
          "total_cost":56.14
        },
        "adjustments":[
          {
            "name":"New Customer Discount",
            "amount":20
          },
          {
            "name":"$10 Off Coupon",
            "amount":10
          }
        ],
        "elements":[
          {
            "title":"Classic White T-Shirt",
            "subtitle":"100% Soft and Luxurious Cotton",
            "quantity":2,
            "price":50,
            "currency":"USD",
            "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
          },
          {
            "title":"Classic Gray T-Shirt",
            "subtitle":"100% Soft and Luxurious Cotton",
            "quantity":1,
            "price":25,
            "currency":"USD",
            "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
          }
        ]
      }
    }
  }
    };
       



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




 
 
