function kmp(source, pattern) {
  // 计算table跳转表格
  let table = new Array(pattern.length).fill(0)

  {
    let i = 1, j = 0 // i表示pattern字符串自重复的开始, j表示已重复的字数
    while(i < pattern.length) {
      if(pattern[i] === pattern[j]) {
        ++i, ++j
        table[i] = j
      } else {
        if(j > 0) {
          j = table[j]
        } else {
          ++i
        } 
      }
    }
  }

  {
    let i = 0, j = 0
    while(i < source.length) {
      
      if(pattern[j] === source[i]) {
        ++i, ++j
      } else {
        if(j > 0)
          j = table[j]
        else
          ++i
      }
      if(j === pattern.length) {
        return true
      }
    }
    return false
  }

}

console.log(kmp('ll', 'll'))