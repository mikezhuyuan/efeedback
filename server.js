var express = require('express')
var http = require('http')
var sockjs  = require('sockjs')
var students = Object.create(null)
var teachers = Object.create(null)
var handlers = Object.create(null)

//communication
var client = {
	call : function(conn, name) {
		var args = Array.prototype.slice.call(arguments, 2)
		conn.write(JSON.stringify({uid:conn.id, method:name, args:args}))
	}
}

var server = {
	register : function(name, handler) {
		handlers[name] = handler
	}
}

function dispatch(conn, data) {
	var h = handlers[data.method] 
	if(h) {
		data.args.unshift(conn)
		h.apply(null, data.args)
	}
}

function broadcast(sender, users, callback) {
	if(!callback) {
		callback = users
		users = sender
		sender = null
	}

	Object.keys(users).forEach(function(id){
		var u = users[id]
		if(u && sender !== id && sender !== u )
			callback(u)
	})
}

var studentEndpoint = sockjs.createServer()
studentEndpoint.on('connection', function(conn) {
	var student = new Student(conn)
	console.log('connected')

    conn.on('data', function(msg) {
        console.log('data: ' + msg)
        dispatch(conn, JSON.parse(msg))
    })

    conn.on('close', function(){
    	student.remove()
    	console.log('disconnected')
    })
})

var teacherEndpoint = sockjs.createServer()
teacherEndpoint.on('connection', function(conn) {
	var teacher = new Teacher(conn)
	console.log('connected')

    conn.on('data', function(msg) {
        console.log('data: ' + msg)
        dispatch(conn, JSON.parse(msg))
    })

    conn.on('close', function(){
    	teacher.remove()
    	console.log('disconnected')
    })
})

//app logic
var Student = (function(){
	var type = function(conn) {
		this.id = conn.id
		this.conn = conn

		students[this.id] = this
	}

	type.prototype = {
		remove : function() {
			var studentId = this.id

			broadcast(teachers, function(teacher){
				client.call(teacher.conn, 'closeTalk', studentId)
			})

			this.conn = null
			delete students[this.id]
		}
	}

	return type
})()

var Teacher = (function(){
	var type = function(conn) {
		this.id = conn.id
		this.conn = conn

		teachers[this.id] = this
	}

	type.prototype = {
		remove : function() {
			this.conn = null
			delete teachers[this.id]
		}
	}

	return type
})()

server.register('startTalk', function(conn, talkId, content, url){
	var studentId = conn.id

	broadcast(teachers, function(teacher){
		client.call(teacher.conn, 'startTalk', studentId, talkId, content, url)
	})
})

server.register('ask', function(conn, talkId, content){
	var studentId = conn.id

	broadcast(teachers, function(teacher){
		client.call(teacher.conn, 'ask', studentId, talkId, content)
	})
})

server.register('answer', function(conn, studentId, talkId, content){
	var student = students[studentId]
	client.call(student.conn, 'answer', talkId, content)	
})

//setup serve
var app = express()
app.use(express.static(__dirname+'/public'));
var server = http.createServer(app)

studentEndpoint.installHandlers(server, {prefix:'/student'})
teacherEndpoint.installHandlers(server, {prefix:'/teacher'})

server.listen(9990, '0.0.0.0')
