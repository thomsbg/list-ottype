var Delta = require('../../lib/delta');
var expect = require('chai').expect;

describe('constructor', function () {
  var ops = [
    { i: 'abc' },
    { r: 1 },
    { d: 4 },
    { i: 'def' },
    { r: 6 }
  ];

  it('empty', function () {
    var delta = new Delta();
    expect(delta).to.exist;
    expect(delta.ops).to.exist;
    expect(delta.ops.length).to.equal(0);
  });

  it('empty ops', function () {
    var delta = new Delta().delete(0).retain(0);
    expect(delta).to.exist;
    expect(delta.ops).to.exist;
    expect(delta.ops.length).to.equal(0);
  });

  it('array of ops', function () {
    var delta = new Delta(ops);
    expect(delta.ops).to.deep.equal(ops);
  });

  it('delta in object form', function () {
    var delta = new Delta({ ops: ops });
    expect(delta.ops).to.deep.equal(ops);
  });

  it('delta', function () {
    var original = new Delta(ops);
    var delta = new Delta(original);
    expect(delta.ops).to.deep.equal(original.ops);
    expect(delta.ops).to.deep.equal(ops);
  });
});

describe('insert()', function () {
  it('insert(text)', function () {
    var delta = new Delta().insert('test');
    expect(delta.ops.length).to.equal(1);
    expect(delta.ops[0]).to.deep.equal({ i: 'test' });
  });

  it('insert(array)', function () {
    var delta = new Delta().insert([1, 2, 3]);
    expect(delta.ops.length).to.deep.equal(1);
    expect(delta.ops[0]).to.deep.equal({ i: [1, 2, 3] });
  });

  it('insert(text) after delete', function () {
    var delta = new Delta().delete(1).insert('a');
    var expected = new Delta().insert('a').delete(1);
    expect(delta).to.deep.equal(expected);
  });

  it('insert(text) after delete no merge', function () {
    var delta = new Delta().insert(1).delete(1).insert('a');
    var expected = new Delta().insert(1).insert('a').delete(1);
    expect(delta).to.deep.equal(expected);
  });
});

describe('delete()', function () {
  it('delete(0)', function () {
    var delta = new Delta().delete(0);
    expect(delta.ops.length).to.equal(0);
  });

  it('delete(positive)', function () {
    var delta = new Delta().delete(1);
    expect(delta.ops.length).to.equal(1);
    expect(delta.ops[0]).to.deep.equal({ d: 1 });
  });
});

describe('retain()', function () {
  it('retain(0)', function () {
    var delta = new Delta().retain(0);
    expect(delta.ops.length).to.equal(0);
  });

  it('retain(length)', function () {
    var delta = new Delta().retain(2);
    expect(delta.ops.length).to.equal(1);
    expect(delta.ops[0]).to.deep.equal({ r: 2 });
  });
});

describe('push()', function () {
  it('push(op) into empty', function () {
    var delta = new Delta();
    delta.push({ i: 'test' });
    expect(delta.ops.length).to.equal(1);
  });

  it('push(op) consecutive delete', function () {
    var delta = new Delta().delete(2);
    delta.push({ d: 3 });
    expect(delta.ops.length).to.equal(1);
    expect(delta.ops[0]).to.deep.equal({ d: 5 });
  });
});
