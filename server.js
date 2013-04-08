var express = require('express')
var http = require('http')

var app = express()
app.use(express.static(__dirname+'/public'));
var server = http.createServer(app)

server.listen(9990, '0.0.0.0')
