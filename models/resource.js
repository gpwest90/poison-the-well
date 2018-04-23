var resource_id = 1;

class Resource {

  constructor(name) {
    this.uniq_id = resource_id++;
    this.name = name;
    this.is_poisoned = false;
    this.image =  "<img src='images/resources/"+name+".png'>";
  }

}

module.exports = Resource;