Array.prototype.shuffle = function() {
    var i = this.length;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }

    return this; // for convenience, in case we want a reference to the array
};