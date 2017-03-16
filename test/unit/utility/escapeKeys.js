const test = require('tap').test
const escapeKeys = require('../../../lib/utility/escapeKeys').escapeKeys

test('### escapeKeys ###', function (t) {
  const anyItem = []
  const keys = [anyItem, 'key1', 'key2']

  const key = escapeKeys(keys)

  key.forEach((item) => {
    t.equals(typeof item, 'string')
  })

  t.end()
})
