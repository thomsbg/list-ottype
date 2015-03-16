var assert = require('chai').assert;
var _ = require('../lib/util');

describe('util', function() {
  describe('isRetain', function() {
    it('returns true when op.r is a number', function() {
      assert.isTrue(_.isRetain({ r: 1234 }));
    });
    it('returns false when op.r is not a number', function() {
      assert.isFalse(_.isRetain({ r: 'not a number' }));
    });
    it('returns false when op.r is not present', function() {
      assert.isFalse(_.isRetain({ something: 'else' }));
    });
  });

  describe('isDelete', function() {
    it('returns true when op.d is a number', function() {
      assert.isTrue(_.isDelete({ d: 1234 }));
    });
    it('returns false when op.d is not a number', function() {
      assert.isFalse(_.isDelete({ d: 'not a number' }));
    });
    it('returns false when op.d is not present', function() {
      assert.isFalse(_.isDelete({ something: 'else' }));
    });
  });

  describe('isInsert', function() {
    it('returns true when op.i is not undefined', function() {
      assert.isTrue(_.isInsert({ i: 1234 }));
    });
    it('returns false when op.i is undefined', function() {
      assert.isFalse(_.isInsert({ i: undefined }));
    });
    it('returns false when op.i is not present', function() {
      assert.isFalse(_.isInsert({ something: 'else' }));
    });
  });

  describe('isApply', function() {
    it('returns true when op.t is a string and op.o is present', function() {
      assert.isTrue(_.isApply({ t: 'text', o: [5, '!'] }));
    });
    it('returns false when op.t is a string and op.o is not present', function() {
      assert.isFalse(_.isApply({ t: 'text' }));
    });
    it('returns false when op.t is not present', function() {
      assert.isFalse(_.isApply({ something: 'else' }));
    });
  });

  describe('opLength', function() {
    it('returns the number for retains', function() {
      assert.equal(_.opLength({ r: 6 }), 6);
    });
    it('returns the number for deletes', function() {
      assert.equal(_.opLength({ d: 4 }), 4);
    });
    it('returns 1 for inserts', function() {
      assert.equal(_.opLength({ i: 'data' }), 1);
    });
    it('returns 1 for apply', function() {
      assert.equal(_.opLength({ t: 'text', o: [] }), 1);
    });
  });
});
