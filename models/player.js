const Resource = require('./resource');

class Player {
  constructor(name, character) {
    this.name = name;
    this.uniq_id = Player.makeId();
    character.is_selected = true;
    this.character = character;
    this.is_ready = false;
    this.extra_lives = 3;
    this.food_goal = [];
    this.victory_goal = [];
    this.data_cache = null;
    this.farming = [];
    this.home_inventory = [
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      null,
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource)
    ]
    this.market_inventory = [
      new Resource(character.resource),
      null,
      null,
      null,
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource),
      new Resource(character.resource)
    ];

    this.trade_post_id = null;
    this.trade_inventory = [
      new Resource(character.resource),
      null,
      new Resource(character.resource)
    ]

    this.image = "<img src='images/characters/"+character.name+".png'>";
  }

  farmResources() {
    for (var i = 0; i < this.farming.length; i++) {
      if (i > this.extra_lives) {
        return
      }

      var new_resource = this.farming[i];
      addToFirstBlank(this.home_inventory, new Resource(new_resource))
      // If this is the specialized reousrce, add a second one
      if (new_resource == this.character.resource) {
        addToFirstBlank(this.home_inventory, new Resource(new_resource))
      }
    }
  }

  marketResource(resource_id) {
    // If resource is at home, send to market
    var pos = positionWithId(this.home_inventory, resource_id)
    if (pos != -1) {
      addToFirstBlank(this.market_inventory, this.home_inventory[pos])
      this.home_inventory[pos] = null;
    } 
    // if resource is at market, send home
    else {
      var pos = positionWithId(this.market_inventory, resource_id)
      if (pos != -1) {
        addToFirstBlank(this.home_inventory, this.market_inventory[pos])
        this.market_inventory[pos] = null;
      } 
    }
  }

  handleData(data) {
    if (data.farming) {
      this.farming = data.farming;
    }
  }

  setGoals(resources) {
    // Food goal changes each round
    var item1 = resources[Math.floor(Math.random()*resources.length)];
    var item2 = resources[Math.floor(Math.random()*resources.length)];
    var item3 = resources[Math.floor(Math.random()*resources.length)];
    var item4 = resources[Math.floor(Math.random()*resources.length)];
    this.food_goal = [item1, item2, item3, item4];

    // Victory goal only changes after being 'bought'
    if (this.victory_goal.length == 0) {
      var item1 = resources[Math.floor(Math.random()*resources.length)];
      var item2 = resources[Math.floor(Math.random()*resources.length)];
      var item3 = resources[Math.floor(Math.random()*resources.length)];
      var item4 = resources[Math.floor(Math.random()*resources.length)];
      this.victory_goal = [item1, item2, item3, item4];
    }
  }

  static makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}

var positionWithId = function(array, uniq_id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] != null && array[i].uniq_id == uniq_id) {
      return i;
    }
  }
  return -1;
}

var firstBlankPosition = function(array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == null) {
      return i;
    }
  }
  return array.length;
}

var addToFirstBlank = function(array, obj) {
  array[firstBlankPosition(array)] = obj;
}

module.exports = Player;
