const express = require('express');
const app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
const path = require(`path`);
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.enable('trust proxy');
var request = require('request');

var redirect_uri= "http://localhost:8080/oauth";
var client_id = "916034912784-vmi2ekt46gp1bac0svv4t3acj2rnn8oj.apps.googleusercontent.com";
var scope = "https://www.googleapis.com/auth/userinfo.profile";
client_secret = "81GIJ6ztg99K7LzYAsaX_nxo";

app.get('/',function(req,res){
  var context = {};
   res.render('Home',context);
});

app.get('/oauth',function(req,res){
  if(req.query.code){
	  console.log(req.query.code);
  }else{
	  console.log('error');
  }
   var context = {};
   
   var body = 'code=' + req.query.code +'&client_id=' + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirect_uri + '&grant_type=authorization_code';
  
  request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url:     'https://oauth2.googleapis.com/token',
  body:    body
	}, function(error, response, body){
	  var obj = JSON.parse(body);
	  var token = 'Bearer ' + obj.access_token;
	  request.get({
	  headers: {'Authorization': token},
	  url:     'https://people.googleapis.com/v1/people/me?personFields=names',
	  body: ""
		}, function(error, response, body){
		    var obj = JSON.parse(body);
			context.firstName = obj.names[0].givenName;
			context.lastName = obj.names[0].familyName;
			context.state = req.query.state;
			res.render('Shred',context);
		});
	});
	
});

app.post('/Authenticate',function(req,res){
	
	var state = "state" + Math.floor(Math.random() * 1000000); 
	
   res.writeHead(301,
  {Location: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + client_id + '&scope=' + scope + '&redirect_uri=' + redirect_uri + '&state=' + state + '&response_type=code'}
);
res.end();
});



// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
var server = app.listen(PORT, () => {
});