
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
var lists = {}; //hash table with the task lists in it

mongoose.connect('mongodb://localhost/test'); //connect to a local database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});

//define the schemas
var taskSchema = new Schema({
	text: String,
	checked: Boolean,
	createdBy: String
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

//define a list of task lists
var allListSchema = new Schema({
	list: Array
});

//now define our models
var TaskList = mongoose.model('TaskList',taskListSchema);
var Task = mongoose.model('Task',taskSchema);

var app = express();

//initalize the lists of tasklists
for(var tList in TaskList.find()){
	lists[tList.name] = tList;
}


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
	//load the new form page
	res.render('splash');
});

//make a new list
app.post('/new-list', function(req,res){
	var taskList = new TaskList({name: req.body.listName , tasks: [new Task({text: "Milk", checked:false, createdBy: "noob"})]});
	taskList.save(function(err){
if(err) {
		return console.err(err); //print out the error
	}
		console.log('/'+req.body.listName + "task list synced!");
	});

	lists[req.body.listName] = taskList;

	//save the link so we can send it to someone laster
	taskList.save(function(err,taskList){
if(err) {
		return console.err(err); //print out the error
	}else{
		console.log("task list synced!");
	}
	});
	res.redirect('/'+req.body.listName);
});

//get input from the text box on the web page
app.post('/:name/new-task',function(req,res){
	var newTask = new Task({text: req.body.todo, checked: false,createdBy: req.body.name }); //create a new document

//save it to the server

	var tList = lists[req.param('name')];

	//now add it to the array of the tasklist
	tList.tasks.push(newTask);
	tList.save(function(err,taskList){
if(err) {
		return console.err(err); //print out the error
	}else{
		console.log("task list synced!");
	}
	});
	res.redirect('/'+tList.name); //redirect it to the list
});

app.get('/:name',function(req,res){
	var taskslist = lists[req.param('name')];

	for(var i in taskslist){
		console.log(i);
	}

	if(taskslist !== null){
	res.render('index',{"listName": req.param('name'),"taskslist": taskslist.tasks});
}
});


//get input from the checkboxes
app.get('/task/:id',function(req,res){
var tList = lists[req.param('name')];

//find the task to delete using the id 
Task.findById(req.params.id , function(err,task){

	alert(task.text + "will be deleted!");
	//remove the task from the database
	task.remove(function(err,task){
		res.redirect('/'+tList.name); //redirect it to the list
	});
});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
