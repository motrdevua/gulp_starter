export function smooth() {
  const navbar = document.querySelector('.navbar');
  const navbarHeight = navbar.getBoundingClientRect().height;
  const content = document.querySelector('.content');
  const links = document.querySelectorAll('.smooth-scroll');

  for (const link of links) {
    link.addEventListener('click', clickHandler);
  }

  function clickHandler(e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (document.querySelector(href) !== null) {
      const offsetTop = document.querySelector(href).offsetTop;

      if (navbar.classList.contains('fixed')) {
        scroll({
          top: offsetTop - navbarHeight,
          behavior: 'smooth',
        });
      } else {
        content.style.marginTop = `0px`;
        scroll({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    }
  }
}
