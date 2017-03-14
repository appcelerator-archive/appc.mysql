/**
 * Translates a "where" object in to the relevant portion of a SQL Query.
 * @param where
 * @param values
 * @returns {string}
 */
exports.translateWhereToQuery = function (where, values) {
  var whereQuery = ''
  for (var key in where) {
    if (where.hasOwnProperty(key) && where[key] !== undefined) {
      whereQuery += whereQuery === '' ? ' WHERE' : ' AND'
      whereQuery += ' ' + key
      if (where[key] && where[key].$like) {
        whereQuery += ' LIKE'
        values.push(where[key].$like)
      } else if (where[key] && where[key].$lt) {
        whereQuery += ' <'
        values.push(where[key].$lt)
      } else if (where[key] && where[key].$lte) {
        whereQuery += ' <='
        values.push(where[key].$lte)
      } else if (where[key] && where[key].$gt) {
        whereQuery += ' >'
        values.push(where[key].$gt)
      } else if (where[key] && where[key].$gte) {
        whereQuery += ' >='
        values.push(where[key].$gte)
      } else if (where[key] && where[key].$ne) {
        whereQuery += ' !='
        values.push(where[key].$ne)
      } else {
        whereQuery += ' ='
        values.push(where[key])
      }
      whereQuery += ' ?'
    }
  }
  return whereQuery
}
