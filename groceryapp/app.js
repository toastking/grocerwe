
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require("mongoose"); //load the mongoose database
var bodyParser = require('body-parser');
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

taskListSchema.methods.getTasks = function(){
	return this.tasks;
};

//now define our models
var TaskList = mongoose.model('TaskList',taskListSchema);
var Task = mongoose.model('Task',taskSchema);
var taskList = new TaskList({name: "Groceries", tasks: [new Task({text: "Milk", checked:false})]});


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
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//render the todo list
app.get('/', function(req, res){
  res.render('index', {"title": TaskList.name, "taskslist": taskList.getTasks()});
});

//get input from the text box on the web page
app.post('/',function(req,res){
	var newTask = new Task({text: req.body.todo, checked: false }); //create a new document

//save it to the server
	newTask.save(function(err,newTask){
		if(err) {
		return console.err(err); //print out the error
	}else{
		console.log(newTask.text);
	}
	});

	//now add it to the array of the tasklist
	taskList.tasks.push(newTask);
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
