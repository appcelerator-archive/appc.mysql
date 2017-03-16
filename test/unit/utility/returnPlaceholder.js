const test = require('tap').test
const returnPlaceholder = require('../../../lib/utility/returnPlaceholder').returnPlaceholder

test('### returnPlaceholder ###', function (t) {
  const placeholder = returnPlaceholder()

  t.equals(placeholder, '?')
  t.equals(typeof placeholder, 'string')

  t.end()
})
