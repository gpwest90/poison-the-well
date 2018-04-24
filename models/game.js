const Player = require('./player');
const Character = require('./character');

var characters = Character.createCharacters();

class Game {
  
  constructor() {
    this.player_count = 0;
    this.players = [];
    this.resources = [];
    this.has_started = false;
  }

  prepNewRound() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].setGoals(this.resources);
    }
  }

  getPlayerById(uniq_id) {
    return getById(this.players, uniq_id);
  }

  connectNewPlayer(name, character_id) {
    var character = this.getCharacterById(character_id);
    if (character && character.is_selected == false) {
      var player = new Player(name, character);
      this.players[this.player_count] = player;
      this.resources[this.player_count] = character.resource;
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

  resourceList() {
    return this.resources;
  }

  // playerNames() {
  //   return this.players.map(p => p.name);
  // }

  getCharacterById(uniq_id) {
    return getById(characters, uniq_id);
  }

  listOfAvailableCharacters() {
    return characters;
  }

}

var getById = function(array, uniq_id) {
  var pos = array.map(p => p.uniq_id).indexOf(uniq_id);
  return pos == -1 ? null : array[pos];
}

module.exports = Game;
