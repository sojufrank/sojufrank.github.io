
function carousel(){
  const carouselContainer = document.querySelector('.carousel-container')
  const carouselArray = document.querySelectorAll('.carousel-item')
  const carouselLength = document.querySelectorAll('.carousel-item').length
  const carouselItemWidth = document.querySelector('.carousel-container').offsetWidth
  const carouselItemHeight = document.querySelector('.carousel-container').offsetWidth * .75
  const tzHeight = document.querySelector('.carousel-container').offsetHeight
  const carouselDegree = 360 / carouselLength
  const carouselSpace = carouselItemWidth / 10

  let tz

  /*= Math.round( ( tzHeight / 2 ) /
    Math.tan( ( ( Math.PI * 2 ) / tzHeight ) / 2 ) ) + carouselSpace
*/
  window.screen.availWidth <= 768 ?
    tz = Math.round( ( carouselItemHeight / 2 ) /
      Math.tan( ( ( Math.PI * 2 ) / carouselLength ) / 2 ) ) - carouselSpace:
    tz = Math.round( ( carouselItemWidth / 2 ) /
      Math.tan( ( ( Math.PI * 2 ) / carouselLength ) / 2 ) ) + carouselSpace

    console.log(carouselItemHeight)
    console.log(tz)

  function setClickHandlers(){
    const next = document.querySelector('.carousel-next')
    const prev = document.querySelector('.carousel-prev')
    const down = document.querySelector('.caret-down')
    const carousel = document.querySelector('.carousel')
    let degree = 0;

    next.addEventListener('click',(e)=>{
      degree = degree - carouselDegree
      window.screen.availWidth <= 768 ?
        carousel.style.webkitTransform = "rotateX("+degree+"deg)" :
        carousel.style.webkitTransform = "rotateY("+degree+"deg)"
    })

    down.addEventListener('click',(e)=>{
      degree = degree - carouselDegree
      window.screen.availWidth <= 768 ?
        carousel.style.webkitTransform = "rotateX("+degree+"deg)" :
        carousel.style.webkitTransform = "rotateY("+degree+"deg)"
    })

    prev.addEventListener('click',(e)=>{
      degree = degree + carouselDegree
      window.screen.availWidth <= 768 ?
        carousel.style.webkitTransform = "rotateX("+degree+"deg)" :
        carousel.style.webkitTransform = "rotateY("+degree+"deg)"
    })
  }
  this.init = function(){
    let startDegree = 0
    carouselContainer.style.perspective =`${carouselItemWidth * carouselLength}px`
    carouselContainer.style.height =`${(carouselItemWidth / 16) * 9 }px`
    carouselArray.forEach(item => {
      item.style.height =`${(carouselItemWidth / 16) * 9 }px`
      window.screen.availWidth <= 768 ?
        item.style.webkitTransform = `rotateX(${startDegree}deg) translateZ(${tz}px)` :
        item.style.webkitTransform = `rotateY(${startDegree}deg) translateZ(${tz}px)`
      startDegree = startDegree + carouselDegree
    })
    setClickHandlers()
  }
}
console.log(window.screen.availWidth)
const c = new carousel()
c.init()
