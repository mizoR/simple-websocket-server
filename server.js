#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var connections = [];

var server = http.createServer(function(req, res) {
  console.log((new Date()) + ' Received request for ' + req.url);
  body = fs.readFileSync('./public/index.html');
  console.log(body);
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': body.length
  });
  res.end(body);
});
server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', function(request) {
  var connection = request.accept();
  connections.push(connection)
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      connection.sendUTF(message.utf8Data);
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
  connection.send("{requested_at: " + new Date() + ", result: 'OK'}");
});
