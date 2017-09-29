'use strict'

const Promise = require('bluebird');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

var BOOK_STORE_SURVEY = ["How long have you been a visitor to our bookstore?", 
				 "What language of books are you interested in reading?",
				 "What genre of books do you most often read?",
				 "What was the title of the book that you really enjoyed most recently?",
				 "Who are your most favourite authors? Please list three.",
				 "In our store, do you often find the books you were looking for?", 
				 "Are you satisfied with the physical environment of our store?",
				 "Do you find our staff members helpful?",
				 "Are you a writer or a researcher yourself?",
				 "If you were to describe the ideal bookstore in your mind, how does it look like?"
				];


var GREETINGS = {
		BOT_GENERAL:"I am your humble bot, my job here is to facilitate communication between event organizers and participants. We really appreciate your support. Thanks!",

		BOOK_STORE: "Thanks for taking a survey on our bookstore! " +
				"Please answer each question below with a few sentences. " +
				"Type + to submit answer, ! to type a new answer. \n\n",

		CODE_ACADEMY: "Welcome to Saturday Coding Camp. We have a few questions, "+ 
		"please take a moment to give us feedbacks. These are strictly anonymous and used for better serving this community."

}
var SATURDAY_CODE_CAMP =[];

var FREE_CODE_CAMP_QUESTIONS ="SurveyDepot/webapi/clients/2/surveys/3/questions/";
var questions = [];

const callback_webservice_url=
	"http://ec2-52-56-238-186.eu-west-2.compute.amazonaws.com:1234/";

var currentQuestionNumber=0
var REVIEW_STARTED = false
var saveText = ""

var login_user_id=[];

const PostBackTypes = {
  TELL_ABOUT_BOT: 'TELL_ABOUT_BOT',
  ABOUT_FREE_CODE_ACADEMY: 'ABOUT_FREE_CODE_ACADEMY',
  SELF_SIGN_IN: 'SIGN_IN_GROUP',
  ENTER_HASH_CODE: 'ENTER_HASH_CODE',
  ANSWER_SURVEY_QUESTION: 'ANSWER_SURVEY_QUESTION',
  ANSWER_PEER_QUESTION:'ANSWER_PEER_QUESTION'
};

const CURRENT_SURVEY_PUBLIC ={
	FREE_CODE_ACADEMY: '#free_code_academy_saturday',
	BOOK_STORE_SURVEY: '#Review_Of_Books',
	BERKELEY_ACTOR_ASSEMBLE: '#Berkeley_Actor_Assemble'
}


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())


app.use(express.static('public'));

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})



app.get('/privacy', function (req, res) {
	res.send('Testing Facebook Messenger, will add privacy policy once we are ready for production. During testing phase, we collect only the chat cotnent from users.')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
	res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {

let messaging_events = req.body.entry[0].messaging
for (let i = 0; i < messaging_events.length; i++) {
	let event = req.body.entry[0].messaging[i]
	let senderID = event.sender.id

	if (event.postback)//payload
		{

		switch(event.postback.payload) {
		  case PostBackTypes.TELL_ABOUT_BOT:
			console.log(event.postback.payload);
			sendTextMessage(senderID, GREETINGS.BOT_GENERAL);
			break;
		  case PostBackTypes.SELF_SIGN_IN:
			console.log(event.postback.payload);
			sendTextMessage(senderID, 'Please sign-in with a hashcode provided by your event organizer:');

			break;
		  case PostBackTypes.ABOUT_FREE_CODE_ACADEMY:	
			sendTextMessage(senderID, GREETINGS.CODE_ACADEMY);	
			break;	
		  case PostBackTypes.ANSWER_SURVEY_QUESTION:

			currentQuestionNumber = 1;
			if (SATURDAY_CODE_CAMP.length === 10){
				if (questions != SATURDAY_CODE_CAMP )
				{
				questions = SATURDAY_CODE_CAMP;
				}

				sendTextMessage(senderID, questions[ currentQuestionNumber-1]);
			}
			else
			{
				cacheUserSurvey(senderID, callback_webservice_url, FREE_CODE_CAMP_QUESTIONS, SATURDAY_CODE_CAMP);

			}

			saveText = "";
			REVIEW_STARTED = true;

			login_user_id.push(senderID);	

			break;
		}
		}

	 else if (event.message && event.message.text) {
			let text = event.message.text


		if (REVIEW_STARTED === true){
			if (text.endsWith("+") || text === "+")//save to backend                                         
			{
		  //We might get into trouble if the user input has + without meaning to concat                                                                    
			  let result = text
			  if (saveText.length > 0){
				  result = saveText.concat(text);			
			  }	

			  saveUserFeedback(senderID, result, currentQuestionNumber);
			  saveText="";

			  if (currentQuestionNumber === questions.length )
			  {
				  sendTextMessage(senderID, "You finished all the survey questions. Thanks and good-bye!");
				  REVIEW_STARTED = false;
				  continue;
			  }

			  else{
				  currentQuestionNumber= currentQuestionNumber +1;
				  sendTextMessage(senderID, "Question number " + currentQuestionNumber + ": " + questions[currentQuestionNumber-1]) ;
			  }
			}	


			else if ((text.endsWith("!")  || text === "!"))                                             
			{
				sendTextMessage(senderID, questions[currentQuestionNumber-1]);

			}

			else if (text.length > 0) 
			{
				sendTextMessage(senderID, " Type + to submit answer, ! to start a new answer. \n\n")

				let answer = saveText.concat(text);
				saveText = answer;

			}
		}
		else{
		switch (text){	 
		case CURRENT_SURVEY_PUBLIC.FREE_CODE_ACADEMY:

			console.log("found a known hashcode: " + text);		
			sendButtons(
					senderID,
					'Welcome!',
					[
					 createPostbackButton('About the Meetup', PostBackTypes.ABOUT_FREE_CODE_ACADEMY),
					 createPostbackButton('A Few Queries', PostBackTypes.ANSWER_SURVEY_QUESTION),
					 ]
			);

			break;

		case CURRENT_SURVEY_PUBLIC.BOOK_STORE_SURVEY:
			console.log("found a known hashcode: " + text);

			REVIEW_STARTED = true;
			currentQuestionNumber = 1;
			questions = BOOK_STORE_SURVEY;
			sendTextMessage(senderID,GREETINGS.BOOK_STORE + "\n\n" + questions[ currentQuestionNumber-1])
			saveText = "";

			login_user_id.push(senderID);
			break;

		default:

			sendButtons(
					senderID,
					'Welcome!',
					[
					 createPostbackButton('About the bot', PostBackTypes.TELL_ABOUT_BOT),
					 createPostbackButton('Sign in', PostBackTypes.SELF_SIGN_IN),       

					 ]
			);
		}
		}
	
	
}
res.sendStatus(200);
}})

//const token = "EAALhxeLxG84BABFuZAjqJoI8t4cK7VDJmZBssNantO3EZA8YMtxnxYnC5X04JpzRhyrrFeFzVvAP0IoQVQvZBcT12AoOo6Shs9VmcVZAlkznpMmw50UflDynt9nOrurZCnQ6KZBDMedD4yEpwKDXXhHQi52MctplKTbvDhmDIQvcwZDZD"
  const token = "EAALhxeLxG84BANVHi5FGVxADwsaZABHrAPWiUmoHcwxXjk1uZBPEVZBo7AzhnxegaEqnETZCvejmZCppOfWaZCL7BzQz2osaeTyU04CBVeL4rofiX5PBWrStDODffcYYf9eX7m8SUQJqrsRSUJpeg8sOCFjTd2ZBZCcnnSObaNwyZCQZDZD";


function sendTextMessage(sender, text) {
let messageData = { text:text }
request({
	url: 'https://graph.facebook.com/v2.6/me/messages',
	qs: {access_token:token},
	method: 'POST',
	json: {
	recipient: {id:sender},
	message: messageData,
	}
}, function(error, response, body) {
	if (error) {
	console.log('Error sending messages: ', error)
	} else if (response.body.error) {
	console.log('Error: ', response.body.error)
	}
})
}

///////// send buttons //////////////

function sendButtons(sender, text, buttons) {
      var attachment = {
		"attachment":{  
        'type': 'template',
        'payload': {
          'template_type': 'button',
          'text': text,
          'buttons': buttons
        }
	   }
	  }
	 request({
	url: 'https://graph.facebook.com/v2.6/me/messages',
	qs: {access_token:token},
	method: 'POST',
	json: {
	recipient: {id:sender},
	message: attachment		
	}
}, function(error, response, body) {
	if (error) {
	console.log('Error sending messages: ', error)
	} else if (response.body.error) {
	console.log('Error: ', response.body.error)
	}
})
}
	
function createPostbackButton(text, payload) {
      return {
        'type': 'postback',
        'title': text,
        'payload': payload
      };
 }
/*===============CUSTOM PAYLOAD =====================*/

function saveUserFeedback (sender, text, questionId)
{
 let userData = {sender:text}     
				 /*what can we get out of sender?*/
 let userFeecback = {text:text}

 let posturl = callback_webservice_url +FREE_CODE_CAMP_QUESTIONS+questionId+'/answers/';
 console.log("posturl: " + posturl);
 request({
		url:posturl,
		method: 'POST',
		json:{
			"closed": false,
			"surveyAnswerCreationDate": (new Date().toDateString()),
			"surveyAnswerNote": questions[currentQuestionNumber-1],
			"surveyAnswerText": text,
			"surveyAnswerUserId": sender,
		},function(error, response, body) {
		   if (error) {
			   console.log('Error sending messages: ', error)
		   } else if (response.body.error) {
			   console.log('Error: ', response.body.error)
		   }
		}
	}
	)
 

}

function cacheUserSurvey (sender, hostInfo, questionPath, questionList )
{
	var result = "";
	var geturl = callback_webservice_url +questionPath;
	console.log("geturl: " + geturl);
		
	request(geturl, function(error, response, body) {
	//Async?	
		  let i = 0;
		  result = JSON.parse(body);
		  
		  for (i=0; i< result.length; i++)
			  {
			 //console.log(result[i].surveyQuestionText);
				questionList.push(result[i].surveyQuestionText)
			  
			  }
		  
		  //console.log("questionList === " + questionList);
		  questions = questionList;
		  sendTextMessage(sender,questions[ currentQuestionNumber-1]);
		   if (error) {
			   console.log('Error sending messages: ', error)
		   } else if (response.body.error) {
			   console.log('Error: ', response.body.error)
		   }
		})	
	
	//this does not work!!console.log("cache result: " + result);
	

}

app.listen(app.get('port'), function() {
            console.log('running on port', app.get('port'))
                })
