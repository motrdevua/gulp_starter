// import $ from 'jquery';
// window.$ = $;
// window.jQuery = $;

import * as check from './modules/iswebp.js';
import * as navbar from './modules/navbar.js';
import * as scroll from './modules/smoothscroll.js';
// import * as svg from './modules/svg.js';
// import * as video from './modules/youtube.js';
// import * as loadVideo from './modules/lazyvideo.js';

check.isWebp();
navbar.burgerMenu();
navbar.fixedNavbar();
scroll.smooth();
// svg.inline();
// video.youtube();
// loadVideo.lazy();
