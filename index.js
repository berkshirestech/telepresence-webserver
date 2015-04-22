var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.get('/keypress.js', function(req, res){
  res.sendfile('bower_components/Keypress/keypress.js');
});

var robotSocket = null;
io.on('connection', function(socket){
  socket.on('keypress', function(keyPressed){
    console.log("keypressed - notifying robot of:" + keyPressed);
    if(robotSocket){
      console.log("robot ready");
      robotSocket.emit('keypress', keyPressed);
    }else{
      console.log("no robot");
      socket.emit('norobot');
    }
  });
  socket.on('imarobot', function(){
    robotSocket = socket;
    robotSocket.on('disconnect', function(){
      robotSocket = null;
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
