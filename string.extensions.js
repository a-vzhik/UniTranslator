String.format = function (formatString) {
    var result = new String(formatString);
    var pattern = /{\d+}/g;
    var matched = formatString.match(pattern);

    for (var ii = 0; ii < matched.length; ii++) {
        formatIndex = new Number(matched[ii].substring(1, matched[ii].length - 1));
        if (arguments.length < formatIndex) {
            throw "Invalid Index " + formatIndex;
        }
        result = result.replace(matched[ii], arguments[formatIndex + 1]);
    }
    return result;
}

String.prototype.isWhitespace = function(){
    var match = this.match(/\s*/);
    if(match == null){
        return false;
    }
    return  match[0] == this;
}