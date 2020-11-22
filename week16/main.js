import { Carousel } from './Carousel.js' 
// import { Timeline, Animation } from './animation.js' 
import { createElement } from './framework.js'
import { Button } from './Button.js'
import { List } from './List.js'


let d = [
  {
    img: './img/1.jpg',
    url: './img/1.jpg',
    title: '1'
  },
  {
    img: './img/2.jpg',
    url: './img/2.jpg',
    title: '2'
  },
  {
    img: './img/3.jpg',
    url: './img/3.jpg',
    title: '3'
  },
  {
    img: './img/4.jpg',
    url: './img/4.jpg',
    title: '4'
  } 
]

// let a = <Carousel src={d}
//   onChange = {event => {console.log(event.detail.position)}}
//   onClick = {event => {window.location.href = event.detail.data}}
//   />

// let a = <Button>content</Button>

let a = <List data={d}>
  {
    (record) => 
      <div>
        <img src={record.img}></img>
        <a href={record.url}>{record.title}</a>
      </div>
  }
  
</List>

a.mountTo(document.body)

// let tl = new Timeline()
// window.tl = tl
// window.animation = new Animation({set a(v) {console.log(v)}}, 'a', 0, 100, 1000, null)
// tl.start()