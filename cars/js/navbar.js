function classToggle() {
  const navs = document.querySelectorAll('.navbar__items')

  navs.forEach(nav => nav.classList.toggle('navbar__toggleshow'));
}

document.querySelector('.navbar__link-toggle')
  .addEventListener('click', classToggle);
