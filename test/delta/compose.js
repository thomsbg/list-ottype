var Delta = require('../../lib/delta');
var expect = require('chai').expect;

describe('compose()', function () {
  it('insert + insert', function () {
    var a = new Delta().insert('A');
    var b = new Delta().insert('B');
    var expected = new Delta().insert('B', 'A');
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('insert + retain', function () {
    var a = new Delta().insert('A');
    var b = new Delta().retain(1);
    var expected = new Delta().insert('A');
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('insert + delete', function () {
    var a = new Delta().insert('A');
    var b = new Delta().delete(1);
    var expected = new Delta();
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('delete + insert', function () {
    var a = new Delta().delete(1);
    var b = new Delta().insert('B');
    var expected = new Delta().insert('B').delete(1);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('delete + retain', function () {
    var a = new Delta().delete(1);
    var b = new Delta().retain(1);
    var expected = new Delta().delete(1).retain(1);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('delete + delete', function () {
    var a = new Delta().delete(1);
    var b = new Delta().delete(1);
    var expected = new Delta().delete(2);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('retain + insert', function () {
    var a = new Delta().retain(1);
    var b = new Delta().insert('B');
    var expected = new Delta().insert('B').retain(1);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('retain + retain', function () {
    var a = new Delta().retain(1);
    var b = new Delta().retain(1);
    var expected = new Delta().retain(1);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('retain + delete', function () {
    var a = new Delta().retain(1);
    var b = new Delta().delete(1);
    var expected = new Delta().delete(1);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('insert after retain', function () {
    var a = new Delta().insert('Hello');
    var b = new Delta().retain(3).insert('X');
    var expected = new Delta().insert('Hello').retain(2).insert('X');
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('insert and delete ordering', function () {
    var a = new Delta().insert('Hello', 'World');
    var b = new Delta().insert('Hello', 'World');
    var insertFirst = new Delta().retain(1).insert('X').delete(1);
    var deleteFirst = new Delta().retain(1).delete(1).insert('X');
    var expected = new Delta().insert('Hello', 'X');
    expect(a.compose(insertFirst)).to.deep.equal(expected);
    expect(b.compose(deleteFirst)).to.deep.equal(expected);
  });

  it('delete entire text', function () {
    var a = new Delta().retain(4).insert(1, 2, 3);
    var b = new Delta().delete(7);
    var expected = new Delta().delete(4);
    expect(a.compose(b)).to.deep.equal(expected);
  });

  it('retain more than length of base', function () {
    var a = new Delta().insert('Hello');
    var b = new Delta().retain(10);
    var expected = new Delta().insert('Hello').retain(9);
    expect(a.compose(b)).to.deep.equal(expected);
  });
});
