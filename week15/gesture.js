
class Dispatcher {
  constructor(element) {
    this.element = element
  }
  dispatch(type, properties) {
    const event = new Event(type)
    for(let name in properties) {
      event[name] = properties[name]
    }
    this.element.dispatchEvent(event)
  }
}


// listener ==> recognize ==> dispatch
export class Listener {
  constructor(element, recognizer) {
    let isListeningMouse = false
    let contexts = new Map()

    // PC端
    element.addEventListener('mousedown', event => {
      const context = Object.create(null)
      contexts.set('mouse' + (1 << event.button), context)
      recognizer.start(event, context)
  
      const mousemove = event => {
        /**
         * mousemove的event中没有button属性，因为鼠标不按键也可以move，
         * 但是有一个buttons属性，是掩码来实现的，是二进制数据，表示move过程中有哪些键是被按下的
         * 所以要用掩码的形式来处理
         */
        let button = 1
        while(button <= event.buttons) {
          if(button & event.buttons) {
            let key;
            if(button === 2)
              key = 4
            else if(button === 4)
              key = 2
            else 
              key = button
            const context = contexts.get('mouse' + key)
            recognizer.move(event, context)
          }
          button = button << 1
        }
      }

      const mouseup = event => {
        const context = contexts.get('mouse' + (1 << event.button))
        recognizer.end(event, context)
        contexts.delete('mouse' + (1 << event.button))

        if(event.buttons === 0) {
          document.removeEventListener('mousemove', mousemove)
          document.removeEventListener('mouseup', mouseup)
          isListeningMouse = false
        }
      }
      
      if(!isListeningMouse) {
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
        isListeningMouse = true
      }
    })

    // 移动端
    element.addEventListener('touchstart', event => {
      // 移动端支持多点触控，changedTouches其实是一个集合，需要遍历拿到每个点的数据
      for(let touch of event.changedTouches) {
        const context = Object.create(null)
        contexts.set(touch.identifier, context)
        recognizer.start(touch, context)
      }
    })

    element.addEventListener('touchmove', event => {
      for(let touch of event.changedTouches) {
        const context = contexts.get(touch.identifier)
        recognizer.move(touch, context)
      }
    })

    element.addEventListener('touchend', event => {
      for(let touch of event.changedTouches) {
        const context = contexts.get(touch.identifier)
        recognizer.end(touch, context)
        contexts.delete(context)
      }
    })

    // 移动端特有的取消事件，touch事件被非正常的方法打断，例如alert之类或者系统操作，不会触发end事件，而是cancel
    element.addEventListener('touchcancel', event => {
      for(let touch of event.changedTouches) {
        const context = contexts.get(touch.identifier)
        recognizer.cancel(touch, context)
        contexts.delete(context)
      }
    })
  }
}

export class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher
  }

  // 开始
  start(point, context) {
    context.startX = point.clientX, context.startY = point.clientY // 逗号连写表示这两句关系紧密
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    }]
  
    context.isTap = true
    context.isPan = false
    context.isPress = false
  
    context.handler = setTimeout(() => {
      context.isTap = false
      context.isPan = false
      context.isPress = true
      context.handler = null
      this.dispatcher.dispatch('press', {})
    }, 500)
  }

  // 移动
  move (point, context) {
    const dx = point.clientX - context.startX, dy = point.clientY - context.startY
  
    if(!context.isPan && (dx ** 2 + dy ** 2 > 100)) {
      // 移动超过10px
      context.isTap = false
      context.isPan = true
      context.isPress = false
      context.isVertical = Math.abs(dx) < Math.abs(dy)
      this.dispatcher.dispatch('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
      clearTimeout(context.handler)
    }
  
    if(context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
  
    context.points = context.points.filter(point => Date.now() - point.t < 500)
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    })
  }

  // 移动
  end(point, context) {
    if(context.isTap) {
      this.dispatcher.dispatch('tap', {})
      clearTimeout(context.handler)
    }
  
    if(context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
  
    if(context.isPress) {
      this.dispatcher.dispatch('pressend', {})
    }
  
    context.points = context.points.filter(point => Date.now() - point.t < 500)
    let d, v;
    if(!context.points.length) {
      v = 0
    } else { 
      d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2)
      v = d / (Date.now() - context.points[0].t)
    }
  
    if(v > 1.5) {
      context.isFlick = true
      this.dispatcher.dispatch('flick', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v
      })
    } else {
      context.isFlick = false
    }
    
    if(context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick
      })
    }
  }

  cancel(point, context) {
    clearTimeout(context.handler)
    this.dispatcher.dispatch('cancel', {})
  }
}

export function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)))
}