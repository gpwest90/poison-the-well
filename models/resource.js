var resource_id = 1;

class Resource {

  constructor(name) {
    this.uniq_id = resource_id++;
    this.name = name;
    this.is_poisoned = false;
  }
}

module.exports = Resource;