const test = require('tap').test
const returnPlaceholder = require('./../../../lib/utility/returnPlaceholder').returnPlaceholder

test('Return placeholder', function (t) {
  const placeholder = returnPlaceholder()
  t.ok(placeholder)
  t.equal(placeholder, '?')

  t.end()
})
