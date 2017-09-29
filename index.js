var express = require('express');
var http = require('http') ;
var path = require('path');
var bodyParser = require('body-parser');



var app = express(); 

app.use(express.static(path.join(__dirname, 'public')));
/*JS client side files has to be placed under a folder by name 'public' */

app.use(bodyParser);

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	    extended: true
		}));     

/*to access the posted data from client using request body*/
app.post('/post', function (req, res) {
	/* Handling the AngularJS post request*/
	console.log(req.body);
	res.setHeader('Content-Type', 'application/json');
	/*response has to be in the form of a JSON*/
    req.body.serverMessage = "NodeJS replying to angular"
        /*adding a new field to send it to the angular Client */
	res.end(JSON.stringify(req.body));
    /*Sending the respone back to the angular Client */
    });
 
http.createServer(app).listen(3000, function () {
	console.log("Express server listening on port 3000");
    });
