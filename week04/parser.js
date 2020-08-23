const css = require('css');
const layout = require('./layout.js');

var currentToken = null;
var currentAttribute = null;
var currentTextNode = null;

var stack = [{ type: 'document', children: [] }];

var rules = [];

function addCSSRule(text) {
  var ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
  console.log('Rules', rules);
}

function specificity(selector) {
  var p = [0, 0, 0, 0];
  var selectorParts = selector.split(' ');
  for (var part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1] += 1;
    } else if (part.charAt(0) === '.') {
      p[2] += 1;
    } else {
      p[3] += 1;
    }
  }
  return p;
}

function compare(sp1, sp2) {
  for (var i = 0; i <= 3; i++) {
    if (i === 3) return sp1[3] - sp2[3];
    if (sp1[i] - sp2[i]) return sp1[i] - sp2[i];
  }
}


function match(element, selector) {
  if (!selector || !element.attributes) return false;

  var tagSelector = selector.match(/^[\w]+/gm);
  var idSelectors = selector.match(/(?<=#)([\w\d\-\_]+)/gm);
  var classSelectors = selector.match(/(?<=\.)([\w\d\-\_]+)/gm);

  if (selector.charAt(0) === '#') {
    var attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (attr && attr.value === selector.replace('#', '')) return true;
  } else if (selector.charAt(0) === '.') {
    var attr = element.attributes.filter(attr => attr.name === 'class')[0];
    if (attr && attr.value === selector.replace('.', '')) return true;
  } else {
    if (element.tagName === selector) return true;
  }

  return false;
}

function computeCSS(element) {
  var elements = stack.slice().reverse();

  if (!elements.computedStyle) element.computedStyle = {};
  for (var rule of rules) {
    var selectorParts = rule.selectors[0].split(' ').reverse();

    if (!match(element, selectorParts[0])) continue;

    var matched = false;

    var j = 1;
    for (var i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) j++;
    }

    if (j >= selectorParts.length) matched = true;

    if (matched) {
      var sp = specificity(rule.selectors[0]);
      var computedStyle = element.computedStyle;
      for (var declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) computedStyle[declaration.property] = {};

        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp;
        }
      }
    }
  }
}

function emit(token) {
  var top = stack[stack.length - 1];

  if (token.type == 'startTag') {
    var element = {
      type: 'element',
      children: [],
      attributes: [],
    };

    element.tagName = token.tagName;

    for (var prop in token) {
      if (prop !== 'type' && prop != 'tagName') {
        element.attributes.push({
          name: prop,
          value: token[prop],
        });
      }
    }

    computeCSS(element);

    top.children.push(element);
    element.parent = top;
    if (!token.isSelfClosing) stack.push(element);

    currentTextNode = null;
  } else if (token.type == 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Parse error: Tag start end not matched');
    } else {
      if (top.tagName === 'style') {
        addCSSRule(top.children[0].content);
      }
      layout(top);
      stack.pop();
    }

    currentTextNode = null;
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: '',
      };
      top.children.push(currentTextNode);
    }

    currentTextNode.content += token.content;
  }
}

const EOF = Symbol('EOF');

function data(char) {
  if (char === '<') {
    return tagOpen;
  } else if (char === EOF) {
    emit({
      type: 'EOF',
    });
    return;
  } else {
    emit({
      type: 'text',
      content: char,
    });
    return data;
  }
}

function tagOpen(char) {
  if (char === '/') {
    return endTagOpen;
  } else if (char.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: '',
    };
    return tagName(char);
  } else {
    return;
  }
}

function endTagOpen(char) {
  if (char.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: '',
    };
    return tagName(char);
  } else if (char === '>') {
  } else if (char === EOF) {
  }
}

function tagName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag;
  } else if (char.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += char;
    return tagName;
  } else if (char === '>') {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (char === '/' || char === '>') {
    return afterAttributeName(char);
  } else if (char === '=' || char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(char);
  }
}

function attributeName(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) {
    return afterAttributeName(char);
  } else if (char === '=') {
    return beforeAttributeValue;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else {
    currentAttribute.name += char;
    return attributeName;
  }
}

function beforeAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/) || char === '/' || char === '>' || char === EOF) {
    return beforeAttributeValue;
  } else if (char === '"') {
    return doubleQuotedAttributeValue;
  } else if (char === "'") {
    return singleQuotedAttributeValue;
  } else if (char === '>') {
  } else {
    return unquotedAttributeValue(char);
  }
}

function doubleQuotedAttributeValue(char) {
  if (char === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute.value += char;
    return doubleQuotedAttributeValue;
  }
}

function singleQuotedAttributeValue(char) {
  if (char === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute.value += char;
    return singleQuotedAttributeValue;
  }
}

function afterQuotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag;
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (char === EOF) {
    throw new Error('Parse error: eof-in-tag');
  } else {
    throw new Error('Parse error: missing-whitespace-between-attributes');
  }
}

function unquotedAttributeValue(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (char === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (char === '\u0000') {
    throw new Error('Parse error');
  } else if (char === '"' || char === "'" || char === '<' || char === '=' || char === '`') {
    throw new Error('Parse error');
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentAttribute.value += char;
    return unquotedAttributeValue;
  }
}

function afterAttributeName(char) {
  if (char.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (char === '/') {
    return selfClosingStartTag;
  } else if (char === '=') {
    return beforeAttributeValue;
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (char === EOF) {
    throw new Error('Parse error');
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(char);
  }
}

function selfClosingStartTag(char) {
  if (char === '>') {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (char === 'EOF') {
  } else {
  }
}

module.exports.parseHTML = function (html) {
  var state = data;
  for (var char of html) {
    state = state(char);
  }
  state = state(EOF);

  return stack[0];
};