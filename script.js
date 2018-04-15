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

const model = {
  aboutInfo: "Hello, my name is Frank Yi and I am a Javascript developer from Tacoma Washington.  \
  I love computers, coding, and all things technological.  I use HTML, CSS, and code mainly in Vanilla Javascript.  \
  I like to create projects about Seattle and based around Seattle's open data API. Here are a few examples below."
}

document.querySelector('.about-text-p').innerHTML = model.aboutInfo;
