var express = require('express');
var http = require('http') ;
var path = require('path');
var bodyParser = require('body-parser');

const {AuthAPIClient, DataAPIClient} = require("truelayer-client");
const app = require("express")();

const redirect_uri = "http://localhost:3000/truelayer-redirect";
 
// Create TrueLayer client instance 
const client = new AuthAPIClient({
	client_id: "investbot-jloo",
	client_secret: "Pg9p90r9i49hc256yvps6"
    });



// Generate and redirect to authentication url 
app.get("/", (req, res) => {
	// Reference JSDocs for descriptions of parameters 
	const authURL = client.getAuthUrl(redirect_uri, ["accounts","transactions","info","balance"], "nonce", "12345");
	res.redirect(authURL);
    });
 
// Receiving POST request 
app.post("/truelayer-redirect", async (req, res) => {
	// Exchange an authentication code for an access token 
	const code = req.body.code;
	const tokens = await client.exchangeCodeForToken(redirect_uri, code);
    
	// Call to the Data endpoint using the access token obtained. Eg. /info endpoint 
	const info = await DataAPIClient.getInfo(tokens.access_token);
    
	res.set("Content-Type", "text/plain");
	res.send(`Access Token: ${JSON.stringify(info, null, 2)}`);
    });

http.createServer(app).listen(3000, function () {
	console.log("Express server listening on port 3000");
    });




 
 
