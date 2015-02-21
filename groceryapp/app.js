
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require("mongoose"); //load the mongoose database
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/test'); //connect to a local database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});

//define the schemas
var taskSchema = new Schema({
	text: String,
	checked: Boolean
});

taskSchema.methods.echo = function() {
	console.log(this.text);
	return this.text;
};

var taskListSchema = new Schema({
	name: String,
	tasks: Array
});

//now define our models
var TaskList = mongoose.model('TaskList',taskListSchema);
var Task = mongoose.model('Task',taskSchema);

var grocery = new Task({
	text: "Milk",
	checked: false
});

grocery.echo(); //print out the text

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index', { title: grocery.echo() });
});
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
