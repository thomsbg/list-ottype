var _ = require('./util');

module.exports = function(ops) {
  return new Iterator(ops);
};

function Iterator(ops) {
  this.ops = ops;
  this.index = 0;
  this.offset = 0;
}

Iterator.prototype.hasNext = function() {
  return this.peekLength() < Infinity;
};

Iterator.prototype.next = function(length) {
  if (!length) length = Infinity;
  var nextOp = this.ops[this.index];
  if (nextOp) {
    var offset = this.offset;
    var opLength = _.opLength(nextOp);
    if (length >= opLength - offset) {
      length = opLength - offset;
      this.index += 1;
      this.offset = 0;
    } else {
      this.offset += length;
    }
    if (_.isDelete(nextOp)) {
      return { d: length };
    } else if (_.isRetain(nextOp)) {
      return { r: length };
    } else if (_.isInsert(nextOp) || _.isApply(nextOp)) {
      return _.clone(nextOp);
    } else {
      throw new Error('unknown op format: ' + JSON.stringify(nextOp));
    }
  } else {
    return { r: Infinity };
  }
};

Iterator.prototype.peekLength = function() {
  if (this.ops[this.index]) {
    // Should never return 0 if our index is being managed correctly
    return _.opLength(this.ops[this.index]) - this.offset;
  } else {
    return Infinity;
  }
};

Iterator.prototype.peekType = function() {
  var op = this.ops[this.index];
  if (op) {
    return _.opType(this.ops[this.index]);
  } else {
    return 'retain';
  }
};
