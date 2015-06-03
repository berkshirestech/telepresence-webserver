var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'html');
app.enable('view cache');
app.engine('html', require('hogan-express'));

app.get('/', function(req, res){
  res.render('index', { title: 'BCTG Telepresence Robot',
                        hangout_url: process.env["HANGOUT_URL"]});
});
app.get('/keypress.js', function(req, res){
  res.sendfile('bower_components/Keypress/keypress.js');
});

var robotSocket = null;
io.on('connection', function(socket){
  socket.on('keydown', function(keyPressed){
    console.log("keypressed - notifying robot of:" + keyPressed);
    if(robotSocket){
      console.log("robot ready");
      robotSocket.emit('keydown', keyPressed);
    }else{
      console.log("no robot");
      socket.emit('norobot');
    }
  });
  socket.on('stop', function(){
    console.log("stopping robot");
    if(robotSocket){
      console.log("robot ready");
      robotSocket.emit('stop');
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

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:'+process.env.PORT || 3000);
});
