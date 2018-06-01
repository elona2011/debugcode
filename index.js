const estraverse = require('estraverse')
const { parseModule } = require('esprima')
const { generate } = require('escodegen')

exports.editDebugCode = code => {
  let tree = parseModule(code)
  estraverse.replace(tree, {
    enter(node, parent) {
      if (node.type === 'IfStatement' && node.test.type === 'Identifier') {
        if (node.test.name === 'DEVELOPMENT') {
          switch (process.env.NODE_ENV) {
            case 'dev':
              node.test = {
                type: 'Literal',
                value: true,
                raw: 'true',
              }
              break
            case 'pre':
            case 'prd':
              return estraverse.VisitorOption.Remove
          }
        } else if (node.test.name === 'PREPRODUCTION') {
          switch (process.env.NODE_ENV) {
            case 'pre':
            case 'dev':
              node.test = {
                type: 'Literal',
                value: true,
                raw: 'true',
              }
              break

            case 'prd':
              return estraverse.VisitorOption.Remove
          }
        } else if (node.test.name === 'PRODUCTION') {
          switch (process.env.NODE_ENV) {
            case 'dev':
              return estraverse.VisitorOption.Remove
            case 'pre':
            case 'prd':
              node.test = {
                type: 'Literal',
                value: true,
                raw: 'true',
              }
              break
          }
        }
      }
    },
  })
  return generate(tree)
}
