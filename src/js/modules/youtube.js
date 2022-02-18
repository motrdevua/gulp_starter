export function youtube() {
  function findVideo() {
    const videos = document.querySelectorAll('.video');
    for (const video of videos) {
      setupVideo(video);
    }
  }

  function UrlExists(url) {
    const http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status !== 404;
  }

  function setupVideo(video) {
    const vID = video.dataset.id;
    const posterSrc = video.dataset.postersrc;
    const posterCheck = +video.dataset.postercheck;
    let linkContent = ` <picture>
      <source srcset="https://i.ytimg.com/vi_webp/${vID}/maxresdefault.webp" type="image/webp">
      <img class="video__media" src="https://i.ytimg.com/vi/${vID}/maxresdefault.jpg" alt="poster">
      </picture>
      `;
    let buttonContent = `
      <svg class="play" width="100" height="100" viewbox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="play__circle" d="M50 100c27.614 0 50-22.386 50-50S77.614 0 50 0 0 22.386 0 50s22.386 50 50 50z" />
        <path class="play__triangle"
              d="M69.166 48.463c.255.163.466.39.612.658a1.843 1.843 0 010 1.757 1.802 1.802 0 01-.612.659L40.726 69.72c-1.185.758-2.726-.11-2.726-1.538V31.818c0-1.427 1.54-2.296 2.727-1.537l28.439 18.182z" />
      </svg>
      `;

    let link = document.createElement('a');
    link.classList.add('video__link');
    link.setAttribute('href', 'https://youtu.be/ID'.replace('ID', vID));

    if (posterCheck === 1) {
      if (posterSrc && UrlExists(posterSrc)) {
        link.innerHTML = `<img class="video__media" src="${posterSrc}" alt="poster" loading="lazy">`;
      } else {
        link.innerHTML = linkContent;
      }
    } else {
      link.innerHTML = linkContent;
    }

    video.appendChild(link);

    let button = document.createElement('button');
    button.classList.add('video__button');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'play');
    button.innerHTML = buttonContent;
    video.appendChild(button);

    video.addEventListener('click', () => {
      let iframe = createIframe(vID);
      link.remove();
      button.remove();
      video.appendChild(iframe);
    });

    link.removeAttribute('href');
    video.classList.add('video--enabled');
  }

  function createIframe(id) {
    let iframe = document.createElement('iframe');

    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('frameborder', '0');
    iframe.allow =
      'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('src', generateURL(id));
    iframe.classList.add('video__media');

    return iframe;
  }

  function generateURL(id) {
    let query =
      '?rel=0&showinfo=0&autoplay=1&modestbranding=1&iv_load_policy=3';
    return 'https://www.youtube.com/embed/' + id + query;
  }

  findVideo();
}
