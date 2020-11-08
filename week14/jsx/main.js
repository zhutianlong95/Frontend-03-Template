import { Carousel } from './carousel.js' 
import { Timeline, Animation } from './animation.js' 
import { Component, createElement } from './framework.js'


let d = [
  "./img/1.jpg",
  "./img/2.jpg",
  "./img/3.jpg",
  "./img/4.jpg"
]

let a = <Carousel src={d}/>

a.mountTo(document.body)

let tl = new Timeline()
window.tl = tl
window.animation = new Animation({set a(v) {console.log(v)}}, 'a', 0, 100, 1000, null)
tl.start()