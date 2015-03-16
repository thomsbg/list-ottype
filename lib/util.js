var _ = module.exports;

_.forOwn = require('lodash/object/forOwn');
_.extend = require('lodash/object/extend');
_.clone = require('lodash/lang/clone');
_.isArray = require('lodash/lang/isArray');
_.isNumber = require('lodash/lang/isNumber');
_.isObject = require('lodash/lang/isObject');
_.isString = require('lodash/lang/isString');
_.isUndefined = require('lodash/lang/isUndefined');

_.isRetain = function(op) {
  return op && _.isNumber(op.r);
};

_.isDelete = function(op) {
  return op && _.isNumber(op.d);
};

_.isInsert = function(op) {
  return op && !_.isUndefined(op.i);
};

_.isApply = function(op) {
  return op && _.isString(op.t) && !_.isUndefined(op.o);
};

_.opType = function(op) {
  if (_.isRetain(op)) {
    return 'retain';
  } else if (_.isDelete(op)) {
    return 'delete';
  } else if (_.isInsert(op)) {
    return 'insert';
  } else if (_.isApply(op)) {
    return 'apply';
  } else {
    throw new Error('unknown op format: ' + JSON.stringify(op));
  }
};

_.opLength = function(op) {
  switch (_.opType(op)) {
  case 'delete':
    return op.d;
  case 'retain':
    return op.r;
  case 'insert':
  case 'apply':
    return 1;
  default:
    return 0;
  }
};
