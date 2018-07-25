const Resource = require('./resource');
const MainGame = require('./game');

class Player {
  constructor(name, character) {
    this.name = name;
    this.uniq_id = Player.makeId();
    character.is_selected = true;
    this.character = character;
    this.is_necromancer = false;
    this.is_ready = false;
    this.extra_lives = 3;
    
    this.food_goal = [];
    this.victory_goal = [];
    this.poison_goal = [];
    this.zombie_goal = [];

    this.is_fed = false;
    this.poison_used = 0;
    this.victory_points_gained = 0;
    this.zombie_attacks = 0;

    this.data_cache = null;
    this.farming = [];
    this.home_inventory = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ]
    this.market_inventory = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ];

    this.trade_post_id = null;
    this.trade_ready = false;
    this.trade_inventory = [
      null,
      null,
      null
    ]

    this.image = "<img src='images/characters/"+character.name+".png'>";
  }

  destroy() {
    for (var i=0; i < this.home_inventory.length; ++i) {
      if (this.home_inventory[i] != null) {
        this.home_inventory[i].destroy();
      }
    }
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

  clearPoison() {
    this.takeDamage(this.poison_used);
    this.poison_used = 0;
  }

  clearZombie() {
    this.takeDamage(this.zombie_attacks);
    this.zombie_attacks = 0;
  }

  resetHunger() {
    if (this.is_fed) {
      this.is_fed = false;
    } else {
      this.takeDamage(1);
    }
  }

  takeDamage(num) {
    this.extra_lives -= num;
    if (this.extra_lives < 0) {
      this.extra_lives = 0;
    }
  }

  moveAllResourcesToHome() {
    // Move all market resources home
    for (var i = 0; i < this.market_inventory.length; ++i) {
      if (this.market_inventory[i] != null) {
        this.swapResourceBetweenInventories(this.home_inventory, this.market_inventory, this.market_inventory[i].uniq_id);
      }
    }

    // Move all trade resources home
    for (var i = 0; i < this.trade_inventory.length; ++i) {
      if (this.trade_inventory[i] != null) {
        this.swapResourceBetweenInventories(this.home_inventory, this.trade_inventory, this.trade_inventory[i].uniq_id);
      }
    }
  }

  marketResource(resource_id) {
    this.swapResourceBetweenInventories(this.home_inventory, this.market_inventory, resource_id);
  }

  tradeResource(resource_id) {
    this.swapResourceBetweenInventories(this.market_inventory, this.trade_inventory, resource_id);
  }

  poisonResource(resource_id, poison_id) {
    // Find poison resource
    var poison_resource = this.findResource(poison_id);
    var target_resource = this.findResource(resource_id);

    if (poison_resource == null || target_resource == null || target_resource.is_poisoned) {
      return false;
    } else {
      this.destroyResource(poison_id);
      target_resource.becamePoisoned();
      return true
    }

  }

  swapResourceBetweenInventories(inv1, inv2, resource_id) {
    // If resource is in inv1, send to inv2
    var pos = positionWithId(inv1, resource_id)
    if (pos != -1) {
      addToFirstBlank(inv2, inv1[pos])
      inv1[pos] = null;
    } 
    // if resource is in inv2, send to inv1
    else {
      var pos = positionWithId(inv2, resource_id)
      if (pos != -1) {
        addToFirstBlank(inv1, inv2[pos])
        inv2[pos] = null;
      } 
    }
  }

  purchaseItem(item_name, resource_ids, target_player_id=null) {
    // TODO validate purchase
    for (var i=0; i < resource_ids.length; ++i) {
      this.spendResource(resource_ids[i]);
    }


    if (item_name == "food") {
      this.food_goal = [];
      this.is_fed = true;
    } else if (item_name == "victory-point") {
      this.victory_goal = [];
      this.victory_points_gained++;
    } else if (item_name == "poison") {
      this.poison_goal = [];
      addToFirstBlank(this.home_inventory, new Resource("Poison"));
    } else if (item_name == "zombie") {
      this.zombie_goal = [];
      MainGame.getActiveGame().zombieAttack(target_player_id);
    }
  }

  spendResource(resource_id) {
    // Check home inventory
    var pos = positionWithId(this.home_inventory, resource_id)
    if (pos != -1) {
      if (this.home_inventory[pos].is_poisoned) {
        this.poison_used ++;
      }
      this.home_inventory[pos].destroy();
      this.home_inventory[pos] = null;
      return true;
    }
    return false;
  }

  handleData(data) {
    if (data.farming) {
      this.farming = data.farming;
    }
  }

  setGoals(resources) {
    if (this.is_necromancer) {
      // Food goal changes each round
      var item1 = resources[Math.floor(Math.random()*resources.length)];
      var item2 = resources[Math.floor(Math.random()*resources.length)];
      this.food_goal = [item1, item2];

      // Poison goal only changes after being 'bought'
      if (this.poison_goal.length == 0) {
        var item1 = resources[Math.floor(Math.random()*resources.length)];
        var item2 = resources[Math.floor(Math.random()*resources.length)];
        this.poison_goal = [item1, item2];
      }

      // Zombie goal only changes after being 'bought'
      if (this.zombie_goal.length == 0) {
        var item1 = resources[Math.floor(Math.random()*resources.length)];
        var item2 = resources[Math.floor(Math.random()*resources.length)];
        var item3 = resources[Math.floor(Math.random()*resources.length)];
        var item4 = resources[Math.floor(Math.random()*resources.length)];
        this.zombie_goal = [item1, item2, item3, item4];
      }
    } else {
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
  }

  findResource(resource_id) {
    // Try searching home inventory
    var found_resource = resourceWithId(this.home_inventory, resource_id)

    // If not found yet, try market inventory
    if (found_resource == null) {
      found_resource = resourceWithId(this.market_inventory, resource_id);
    }

    // If not found yet, try trade inventory
    if (found_resource == null) {
      found_resource = resourceWithId(this.trade_inventory, resource_id);
    }

    // Will either return a found resource or null
    return found_resource
  }

  destroyResource(resource_id) {
    // Try searching home inventory
    var found_pos = positionWithId(this.home_inventory, resource_id)
    if (found_pos != -1) {
      this.home_inventory[found_pos].destroy();
      this.home_inventory[found_pos] = null;
      return true;
    }

    // If not found yet, try market inventory
    found_pos = positionWithId(this.market_inventory, resource_id);
    if (found_pos != -1) {
      this.market_inventory[found_pos].destroy();
      this.market_inventory[found_pos] = null;
      return true;
    }

    // If not found yet, try trade inventory
    found_pos = positionWithId(this.trade_inventory, resource_id);
    if (found_pos != -1) {
      this.trade_inventory[found_pos].destroy();
      this.trade_inventory[found_pos] = null;
      return true;
    }

    return false;
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

var resourceWithId = function(array, uniq_id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] != null && array[i].uniq_id == uniq_id) {
      return array[i];
    }
  }
  return null;
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
