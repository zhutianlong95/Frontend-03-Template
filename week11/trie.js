let $ = Symbol('$')

class Trie {
  constructor() {
    // 避免受到Object.prototype上面的原型污染，不可写，不可枚举，不可配置
    this.root = Object.create(null)
  }

  // 向字典树插入字符
  insert(word) {
    let node = this.root
    for(let c of word) {
      // 字典树中不存在该字符（属性的key），则创建
      if(!node[c]) {
        node[c] = Object.create(null)
      }

      // 使用定义的$作为一个字符串的终结符
      if(!($ in node)) {
        node[$] = 0
      }
      node[$]++ 
    }
  }

  most() {
    let max = 0
    let maxWord = null
    let visit = (node, word) => {
      if(node[$] && node[$] > max) {
        max = node[$]
        maxWord = word
      }
      for(let p in node) {
        // word + p 为拼接起来的字符串，直到拼到完整单词
        visit(node[p], word + p)
      }
    }

    visit(this.root, '')
    console.log(maxWord, max)
  }
}

function randomWord(length) {
  let s = ''
  for(let i = 0; i < length; i++) {
    s += String.fromCharCode(Math.random() * 26 + 'a'.charCodeAt(0))
  }
  return s
}

let trie = new Trie()

for(let i = 0; i < 100000; i++) {
  trie.insert(randomWord(4))
}