var _ = require('../lib/util');
var fuzzer = require('ot-fuzzer');
var listType = require('../index');
var Delta = richType.Delta;

function generateRandomOp(snapshot) {
  var length = snapshot.length;
  var base = length > 100 ? 10 : 7; // Favor deleting on long documents
  var delta = new Delta();
  var result = new Delta();
  var modIndex, modLength, ops, i;

  snapshot = _.cloneDeep(snapshot);

  do {
    // Allows insert/delete to occur at the end (deletes will be noop)
    modIndex = fuzzer.randomInt(Math.min(length, 5) + 1);
    length -= modIndex;
    modLength = Math.min(length, fuzzer.randomInt(4) + 1);

    delta.retain(modIndex);
    ops = next(snapshot, modIndex);
    for (i in ops) {
      result.push(ops[i]);
    }

    switch (fuzzer.randomInt(base)) {
      case 0:
        // Insert plain text
        var word = fuzzer.randomWord();
        delta.insert(word);
        result.insert(word);
        break;
      case 1: case 2:
        delta.retain(modLength);
        ops = next(snapshot, modLength);
        for (i in ops) {
          result.push({ i: ops[i].i });
        }
        length -= modLength;
        break;
      default:
        next(snapshot, modLength);
        delta.delete(modLength);
        length -= modLength;
        break;
    }
  } while (length > 0 && fuzzer.randomInt(2) > 0);

  for (i in snapshot.ops) {
    result.push(snapshot.ops[i]);
  }

  return [delta, result];
}

function next(snapshot, length) {
  var ops = [];
  while (length-- > 0) {
    ops.push(snapshot.ops.shift());
  }
  return ops;
}

fuzzer(listType, generateRandomOp, 100);
