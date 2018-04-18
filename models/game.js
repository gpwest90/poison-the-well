const Player = require('./player');
const Character = require('./character');

var characters = Character.createCharacters();

class Game {
  
  constructor() {
    this.player_count = 0;
    this.players = [];
    this.has_started = false;
  }

  findPlayerById(uniq_id) {
    return findById(this.players, uniq_id);
  }

  connectNewPlayer(name, character_id) {
    var character = this.getCharacterById(character_id);
    if (character && character.is_selected == false) {
      var player = new Player(name, character);
      this.players[this.player_count] = player;
      this.player_count ++;
      return player;
    }
    return null;
  }

  numPlayers() {
    return this.player_count;
  }

  playerList() {
    return this.players;
  }

  // playerNames() {
  //   return this.players.map(p => p.name);
  // }

  getCharacterById(uniq_id) {
    return findById(characters, uniq_id);
  }

  listOfAvailableCharacters() {
    return characters;
  }

}

var findById = function(array, uniq_id) {
  var pos = array.map(p => p.uniq_id).indexOf(uniq_id);
  return pos == -1 ? null : array[pos];
}

module.exports = Game;
