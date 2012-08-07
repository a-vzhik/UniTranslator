var op = {
  "+": function(a, b){return a + b;},
  "-": function(a, b){return a - b;},
  "*": function(a, b){return a * b;},
  "/": function(a, b){return a / b;},
  "==": function(a, b){return a == b;},
  "===": function(a, b){return a === b;},
  "!": function(a){return !a;}
  /* and so on */
};

function asArray(quasiArray, start) {
  var result = [];
  for (var i = (start || 0); i < quasiArray.length; i++)
    result.push(quasiArray[i]);
  return result;
}

function partial(func) {
  var fixedArgs = asArray(arguments, 1);
  return function(){
    return func.apply(null, fixedArgs.concat(asArray(arguments)));
  };
}

function forEach(array, action) {
  for (var i = 0; i < array.length; i++)
    action(array[i]);
}

function negate(func) {
  return function() {
    return !func.apply(null, arguments);
  };
}

function reduce(combine, base, array) {
  forEach(array, function (element) {
    base = combine(base, element);
  });
  return base;
}

function map(func, array) {
  var result = [];
  forEach(array, function (element) {
    result.push(func(element));
  });
  return result;
}

Object.prototype.contains = function(name){
	return 	Object.prototype.hasOwnProperty.call(this, name) &&
			Object.prototype.propertyIsEnumerable.call(this, name);
}