const assert = require('assert')
import { parseHTML } from '../src/parser.js'


// describe方法用于描述分层
describe('testing', function() {
  it("<a></a>", function () {
    let tree = parseHTML('<a></a>')
    assert.equal(tree.children[0].tagName, 'a')
    assert.equal(tree.children[0].children.length, 0)
  })
  it('<a href="#"></a>', function () {
      let tree = parseHTML('<a href="#"></a>')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
  })
  it('<a href ></a>', function () {
      let tree = parseHTML('<a href ></a>')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
  })
  it('<a href id></a>', function () {
      let tree = parseHTML('<a href id></a>')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
  })
  it('<a href="#" id></a>', function () {
      let tree = parseHTML('<a href="#" id></a>')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
      assert.equal(tree.children[0].attributes.length, 2)
  })
  it('<a href="#" id=abc></a>', function () {
      let tree = parseHTML('<a href="#" id=abc></a>')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
      assert.equal(tree.children[0].attributes.length, 2)
  })
  it('<a href="#" id=abc/>', function () {
      let tree = parseHTML('<a href="#" id=abc/>')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
  })
  it('<a href="#" id=\'abc\' />', function () {
      let tree = parseHTML('<a href="#" id=\'abc\' />')
      assert.equal(tree.children[0].tagName, 'a')
      assert.equal(tree.children.length, 1)
  })
  it('<a/>', function () {
      let tree = parseHTML('<a/>')
      assert.equal(tree.children.length, 1)
      assert.equal(tree.children[0].children.length, 0)
  })
  it('<A /> upper case', function () {
      let tree = parseHTML('<A />')
      assert.equal(tree.children.length, 1)
      assert.equal(tree.children[0].children.length, 0)
  })
  it('<>', function () {
      let tree = parseHTML('<>')
      assert.equal(tree.children[0].type, 'text')
  })
})
