'use strict'

const Arrow = require('arrow')

module.exports = function (options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    const arrow = new Arrow({}, true)
    const connector = arrow.getConnector('appc.odata')
    connector.metadata = {}

    if (options.generateTestModels !== false) {
      // Create test model - Posts
      arrow.addModel(Arrow.createModel('Posts', {
        name: 'Posts',
        connector,
        fields: {
          title: {
            type: 'string',
            required: false
          },
          content: {
            type: 'string',
            required: false
          },
          books: {
            type: 'array',
            required: false,
            originalType: 'Product'
          }
        },
        metadata: {
          primarykey: 'id'
        }
      }))
      // Create test model - Books
      arrow.addModel(Arrow.createModel('Books', {
        name: 'Books',
        connector,
        fields: {
          CategoryId: {
            type: 'string',
            required: true
          },
          Discounted: {
            type: 'boolean',
            required: false
          },
          Name: {
            type: 'string',
            required: false
          },
          QuantityPerUnit: {
            type: 'string',
            required: false
          },
          UnitPrice: {
            type: 'number',
            required: false
          },
          Post: {
            type: 'string',
            required: false,
            originalType: 'Post'
          }
        },
        metadata: {
          primarykey: 'id'
        }
      }))
    }

    // Return the arrow instance
    resolve(arrow)
  })
}
