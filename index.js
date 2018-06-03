const estraverse = require('estraverse')
const { parseModule } = require('esprima')
const { generate } = require('escodegen')

exports.editDebugCode = (code, env) => {
  let tree = parseModule(code)
  estraverse.replace(tree, {
    enter(node, parent) {
      if (node.type === 'IfStatement' && node.test.type === 'Identifier') {
        if (node.test.name === 'DEVELOPMENT') {
          switch (env) {
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
          switch (env) {
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
          switch (env) {
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
