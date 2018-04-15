const nav = document.querySelector('#main');
let topOfNav = nav.offsetTop;
const about = document.querySelector('#about')

function fixNav() {
  if (window.scrollY >= topOfNav) {
    document.body.classList.add('fixed-nav');
    about.style.paddingTop = (nav.offsetHeight) + 'px';
  } else {
    document.body.classList.remove('fixed-nav');
    about.style.paddingTop = "0px";
  }
}

window.addEventListener('scroll', fixNav);


particlesJS.load('particles-js', 'particlesjs-config.json', () => {
  console.log('particles.json loaded...')
})
