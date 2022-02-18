export function inline() {
  const allImg = document.querySelectorAll('img');

  for (const img of allImg) {
    const imgSrc = img.getAttribute('src');

    if (imgSrc.split('.')[1] === 'svg') {
      let myRequest = new Request(imgSrc);
      fetch(myRequest)
        .then((response) => {
          return response.text();
        })
        .then((svg) => {
          img.parentNode.innerHTML = svg;
        });
    }
  }
}
