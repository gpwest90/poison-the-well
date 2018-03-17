const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const server = require('http').createServer(app);  
const io = require('socket.io')(server);

const Game = require('./models/game');

var game = new Game();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/node_modules'));  
app.use(express.static(__dirname + '/assets'));

// Socket connection
io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(player_id) {
      console.log("Finding player: "+ player_id);
      var player = game.findPlayerById(player_id);
      console.log(player);
      if (player == null) {
        client.emit('not-found');
        client.disconnect();
      } else {
        client.emit('reconnect');
      }
  });
  client.on('disconnect', function () {
    console.log('Client disconnected');
  });
});



// Set default renderings
app.set('view engine', 'html');
app.engine('html', exphbs({
  defaultLayout: 'main',
  extname: '.html',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('views', path.join(__dirname, 'views'))

// Start Server
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})


// 
// ### Routes
// 
// Home
app.get('/', (req, res) => {
  res.render('home', {
    characters: game.listOfCharacters(),
    player_count: game.numPlayers(),
    root_url: 'localhost:'+port
  })
})

// Players
app.get('/players', (req, res) => {
  res.render('players/index', {
    player_list: game.playerNames()
  })
})

app.post('/player', (req, res) => {
  var player = game.connectNewPlayer(req.body.name, req.body.character_id);
  res.render('players/new', {
    player: player
  })
  // res.redirect('/players');
})



// JSON example:
// res.setHeader('Content-Type', 'application/json');
// res.send(JSON.stringify({player: player}));
