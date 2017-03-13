const test = require('tap').test
const convertDataTypeToJSType = require('../../../lib/utility/convertDataTypeToJSType').convertDataTypeToJSType
var type

test('### convertDataTypeToJSType ###', function (t) {
  var dataTypes = {
    tinyint: 'Number',
    smallint: 'Number',
    mediumint: 'Number',
    bigint: 'Number',
    int: 'Number',
    integer: 'Number',
    float: 'Number',
    bit: 'Number',
    double: 'Number',
    binary: 'Number',
    year: 'Number',
    date: 'Date',
    datetime: 'Date',
    time: 'Date',
    someOtherDataType: 'String'
  }

  for (type in dataTypes) {
    var dataType = convertDataTypeToJSType(type)
    t.equals(dataType.name, dataTypes[type])
  }

  t.end()
})
