var _ = require('./util');
var iterate = require('./iterate');

var Delta = function(ops) {
  // Assume we are given a well formed ops
  if (_.isArray(ops)) {
    this.ops = ops;
  } else if (_.isObject(ops) && _.isArray(ops.ops)) {
    this.ops = ops.ops;
  } else {
    this.ops = [];
  }
};

Delta.prototype.insert = function(item) {
  for (var i = 0; i < arguments.length; i++) {
    this.push({ i: arguments[i] });
  }
  return this;
};

Delta.prototype['delete'] = function(length) {
  if (length <= 0) return this;
  return this.push({ d: length });
};

Delta.prototype.retain = function(length) {
  if (length <= 0) return this;
  return this.push({ r: length });
};

Delta.prototype.push = function(newOp) {
  var index = this.ops.length;
  var lastOp = this.ops[index - 1];
  newOp = _.clone(newOp);
  if (_.isObject(lastOp)) {
    // Combine consecutive deletes into one
    if (_.isDelete(lastOp) && _.isDelete(newOp)) {
      this.ops[index - 1] = { d: lastOp.d + newOp.d };
      return this;
    }
    // Since it does not matter if we insert before or after deleting at the same index,
    // always prefer to insert first
    if (_.isDelete(lastOp) && _.isInsert(newOp)) {
      index -= 1;
    }
  }
  this.ops.splice(index, 0, newOp);
  return this;
};

Delta.prototype.chop = function() {
  var lastOp = this.ops[this.ops.length - 1];
  while (_.isRetain(lastOp)) {
    this.ops.pop();
    lastOp = this.ops[this.ops.length - 1];
  }
  return this;
};

Delta.prototype.length = function() {
  return this.ops.reduce(function(length, elem) {
    return length + _.opLength(elem);
  }, 0);
};

Delta.prototype.slice = function(start, end) {
  start = start || 0;
  if (!_.isNumber(end)) end = Infinity;
  var delta = new Delta();
  var iter = iterate(this.ops);
  var index = 0;
  while (index < end && iter.hasNext()) {
    var nextOp;
    if (index < start) {
      nextOp = iter.next(start - index);
    } else {
      nextOp = iter.next(end - index);
      delta.push(nextOp);
    }
    index += _.opLength(nextOp);
  }
  return delta;
};

Delta.prototype.compose = function(other) {
  var thisIter = iterate(this.ops);
  var otherIter = iterate(other.ops);
  var thisType, otherType;
  this.ops = [];
  while (thisIter.hasNext() || otherIter.hasNext()) {
    thisType = thisIter.peekType();
    otherType = otherIter.peekType();
    if (otherType === 'insert') {
      this.push(otherIter.next());
    } else if (thisType === 'delete') {
      this.push(thisIter.next());
    } else {
      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      var thisOp = thisIter.next(length);
      var otherOp = otherIter.next(length);
      if (otherType === 'retain') {
        if (thisType === 'retain') {
          this.push({ r: length });
        } else {
          // we are either insert or apply, just keep what we have
          this.push(thisOp);
        }
      // Other op should be delete, we could be an insert or retain
      // Insert + delete cancels out
      } else if (otherType === 'delete' && thisType === 'retain') {
        this.push(otherOp);
      }
    }
  }
  return this;
};

Delta.prototype.transform = function(other, priority) {
  priority = !!priority;
  if (_.isNumber(other)) {
    return this.transformPosition(other, priority);
  }
  var thisIter = iterate(this.ops);
  var otherIter = iterate(other.ops);
  var delta = new Delta();
  while (thisIter.hasNext() || otherIter.hasNext()) {
    if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
      delta.retain(_.opLength(thisIter.next()));
    } else if (otherIter.peekType() === 'insert') {
      delta.push(otherIter.next());
    } else {
      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      var thisOp = thisIter.next(length);
      var otherOp = otherIter.next(length);
      if (thisOp.d) {
        // Our delete either makes their delete redundant or removes their retain
        continue;
      } else if (otherOp.d) {
        delta.push(otherOp);
      } else {
        // We retain either their retain or insert
        delta.retain(length);
      }
    }
  }
  return delta.chop();
};

Delta.prototype.transformPosition = function(index, priority) {
  priority = !!priority;
  var thisIter = iterate(this.ops);
  var offset = 0;
  while (thisIter.hasNext() && offset <= index) {
    var length = thisIter.peekLength();
    var nextType = thisIter.peekType();
    thisIter.next();
    if (nextType === 'delete') {
      index -= Math.min(length, index - offset);
      continue;
    } else if (nextType === 'insert' && (offset < index || !priority)) {
      index += length;
    }
    offset += length;
  }
  return index;
};

module.exports = Delta;
