const assert = require('assert')
// const add = require('../add.js').add
// const mul = require('../add.js').mul
import { add, mul } from '../add.js'


// describe方法用于描述分层
describe('add function testing', function() {
  it('1 + 2 should be 3', function() {
    assert.equal(add(1, 2), 3)
  })
  
  it('-5 + 2 should be -3', function() {
    assert.equal(add(-5, 2), -3)
  })

  it('-5 * 2 should be -10', function() {
    assert.equal(mul(-5, 2), -10)
  })
})
