var Delta = require('./lib/delta');
var _ = require('./lib/util');
var ottypes = require('ottypes');
var type = {};

type.name = 'list';
type.uri = 'https://github.com/thomsbg/list-ottype';
type.Delta = Delta;

type.create = function(initial) {
  if (_.isArray(initial)) {
    return initial.slice();
  } else {
    throw new TypeError('Initial contents must be an Array');
  }
};

type.apply = function(snapshot, delta) {
  var offset = 0;
  var op, subtype;
  delta = new Delta(delta);
  for (var i = 0; i < delta.ops.length; i++) {
    if (offset > snapshot.length) throw new Error('offset out of bounds: ' + offset + ', snapshot length: ' + snapshot.length);
    op = delta.ops[i];
    if (_.isRetain(op)) {
      offset += op.r;
    } else if (_.isInsert(op)) {
      snapshot.splice(offset, 0, op.i);
      offset += 1;
    } else if (_.isDelete(op)) {
      snapshot.splice(offset, op.d);
    } else if (_.isApply(op)) {
      subtype = ottypes[op.t];
      if (!subtype) throw new Error('unknown subtype: ' + op.t);
      shapshot[offset] = subtype.apply(snapshot[offset], op.o);
      offset += 1;
    } else {
      throw new Error('unknown op format: ' + JSON.stringify(op));
    }
  }
  return snapshot;
};

type.transform = function(delta1, delta2, side) {
  delta1 = new Delta(delta1);
  delta2 = new Delta(delta2);
  // transform delta1 against delta2
  return delta2.transform(delta1, side === 'left');
};

type.compose = function(delta1, delta2) {
  delta1 = new Delta(delta1);
  delta2 = new Delta(delta2);
  return delta1.compose(delta2);
};

module.exports = type;
ottypes[type.name] = type;
ottypes[type.uri] = type;
