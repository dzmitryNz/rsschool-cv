import * as storage from './storage.js';

export default function countTime() {
    let min = storage.get('min', '00'),
      sec = storage.get('sec', '00'),
      time = document.querySelector('.time'),
      stopTime = storage.get('stopTime', 'false');
    min = Number(min);
    sec = Number(sec);
    if (stopTime === 'false') sec++;
    if (sec === 60) {
      min++;
      sec = 0;
    }
    storage.set('min', addZero(min));
    storage.set('sec', addZero(sec));
    if (stopTime === 'false') time.innerText = `${addZero(min)}:${addZero(sec)}`;
    setTimeout(countTime, 1000);

    function addZero(n) { return (parseInt(n, 10) < 10 ? '0' : '') + n; }
  }