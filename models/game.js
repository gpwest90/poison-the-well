const Player = require('./player');
const Character = require('./character');

var characters = [
    new Character("Farmer", "Grain", 0),
    new Character("Baker", "Bread", 1),
    new Character("Miner", "Iron", 2),
    new Character("Tailor", "Clothing", 3),
    new Character("Cobbler", "Shoes", 4),
    new Character("Smith", "Armor", 5),
    new Character("Alchemist", "Herbs", 6),
    new Character("Lumberjack", "Wood", 7)
  ]

class Game {
  
  constructor() {
    this.player_count = 0;
    this.players = [];
  }

  findPlayerById(uniq_id) {
    var pos = this.players.map(p => p.uniq_id).indexOf(uniq_id);
    return pos == -1 ? null : this.players[pos];
  }

  connectNewPlayer(name) {
    var player = new Player(name);
    this.players[this.player_count] = player;
    this.player_count ++;
    return player;
  }

  numPlayers() {
    return this.player_count;
  }

  playerNames() {
    return this.players.map(p => p.name);
  }

  listOfCharacters() {
    return characters;
  }

}

module.exports = Game;
