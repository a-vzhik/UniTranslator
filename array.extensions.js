Array.prototype.map = function (func) {
  var result = [];
  forEach(this, function (element) {
    result.push(func(element));
  });
  return result;
}

Array.prototype.flatten = function (func) {
	var result = [];
	forEach(this, function (element) {
		forEach(func(element), function (child) {
			result.push(child);
		});
	});
	return result;	
}

Array.prototype.where = function (func) {
	var result = [];
	forEach(this, function (element) {
		if(func(element)){
			result.push(element);
		}
	});
	return result;
}

Array.prototype.remove = function (item) {
	var i = this.indexOf(item);
	return this.splice(i, 1);
}

Array.prototype.each = function (action) {
    for(var i = 0; i< this.length; i++){
        action(this[i], i);
    }
};

Array.prototype.distinct = function () {
	var result = [];
	var hash = new Dictionary();
	forEach(this, function (element) {
		if (!hash.contains(element)) {
			result.push(element);
			hash.store(element, element);
		}
	});
	return result;	
}