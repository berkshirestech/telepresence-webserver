var twilio = require('twilio'),
    app = require('express')(),
    http = require('http').Server(app),
    bodyParser = require('body-parser'),
    io = require('socket.io')(http);

var accountSid = process.env["TWILIO_ACCOUNT_SID"];
var authToken = process.env["TWILIO_AUTH_TOKEN"];
var client = require('twilio')(accountSid, authToken);

var twilioToken = null;

var sessionData = null;

var tokenRequest = new Promise(function(resolve, reject) {
  client.tokens.create({}, function(err, token) {
    resolve(token);
  });
});

tokenRequest.then(function(token) {
  twilioToken = token;
  http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:'+(process.env.PORT || 3000));
  });
});

app.set('view engine', 'html');
app.use(bodyParser.json());
app.enable('view cache');
app.engine('html', require('hogan-express'));

app.get('/', function(req, res){
  res.render('index', { title: 'BCTG Telepresence Robot',
                        host: (req.query.host ? true : false),
                        ice_servers: JSON.stringify(twilioToken.ice_servers),
                        offer: JSON.stringify(sessionData)
                      });
});
app.get('/webrtc.js', function(req, res){
  res.sendfile('bower_components/webrtc-adapter/adapter.js');
});
app.get('/keypress.js', function(req, res){
  res.sendfile('bower_components/Keypress/keypress.js');
});
app.get('/gamecontroller.js', function(req, res){
  res.sendfile('scripts/html5-virtual-game-controller-master/gamecontroller.js');
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
  socket.on('offer-created', function(data){
    sessionData = data;
  });
  socket.on('accept-offer', function(data){
    console.log('accept-offer!');
    socket.emit('offer-accepted', data)
  });
});

