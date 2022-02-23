export function burgerMenu() {
  const body = document.querySelector('body');
  const menu = document.querySelector('.menu');
  const burger = document.querySelector('.burger');
  const navbar = document.querySelector('.navbar');

  burger.addEventListener('click', function () {
    menu.classList.toggle('active');
    burger.classList.toggle('active');
    body.classList.toggle('locked');
  });

  document.addEventListener('click', function (e) {
    const withinBoundaries = e.composedPath().includes(burger);

    if (!withinBoundaries) {
      burger.classList.remove('active');
      menu.classList.remove('active');
      body.classList.remove('locked');
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 991.98) {
      menu.classList.remove('active');
      burger.classList.remove('active');
      body.classList.remove('locked');
    }
  });
}

export function fixedNavbar() {
  function fixed() {
    const content = document.querySelector('.content');
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.getBoundingClientRect().height;
    const top = 1;

    if (window.scrollY >= top) {
      navbar.classList.add('fixed');
      content.style.marginTop = `${navbarHeight}px`;
    } else {
      navbar.classList.remove('fixed');
      content.style.marginTop = 0;
    }
  }

  window.addEventListener('load', fixed);
  window.addEventListener('scroll', fixed);
}

export function multiLevelMenu() {
  const menuItemLinks = document.querySelectorAll('.menu__item-link');
  const submenus = document.querySelectorAll('.submenu');
  for (const menuItemLink of menuItemLinks) {
    menuItemLink.addEventListener('click', function (e) {
      e.preventDefault();

      this.classList.toggle('active');
      for (let sibling of this.parentNode.children) {
        if (sibling !== this) sibling.classList.toggle('active');
      }
    });
  }
}
