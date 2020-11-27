import * as storage from './storage.js';
import create from './create.js';
import countTime from './CountTime.js';
 
const main = create('main', '', [create('h1', 'title', 'Gem-Puzzle'), create('h3', 'article', ''), create('p', 'hint', '')]),
  iconMusic = create('i', 'material-icons', 'music_note'),
  iconNew = create('i', 'material-icons', 'autorenew'),
  iconPause = create('i', 'material-icons', 'pause'),
  iconAuto = create('i', 'material-icons', 'done_all'),
  bar = create('div', 'bar', null, main),
  wrapper = create('div', 'puzzle-wrapper', null, main),
  infoBar = create('div', 'infobar', null, bar),
  autoCompl = create('div', 'new', iconAuto, bar),
  sound = create('div', 'sound', iconMusic, bar),
  newGame = create('div', 'new', iconNew, bar),
  pause = create('div', 'new', iconPause, bar),
  menu = create('div', 'menu', 'Меню', bar);

let cellSizes = [49, 24, 13, 9.7, 7.8, 6.5, 5.53, 4.85],
  defScore = ' -------- ',
  allScores = storage.get('score', `${defScore},${defScore},${defScore},${defScore},${defScore},${defScore},${defScore},${defScore},${defScore},${defScore}`).split(','),
  numbers = storage.get('numbers', ''),
  winArr = [],
  rows = storage.get('rows', '4'),
  elemQty = 0,
  sec = storage.get('sec', '00'),
  min = storage.get('min', '00'),
  defName = storage.get('name', 'Человек'),
  swipeCount = storage.get('swipe', '0'),
  time = create('div', 'time', `${min}:${sec}`, infoBar),
  swipe = create('div', 'swipe', swipeCount, infoBar),
  pauseText = create('h2', null, '10 лучших результатов'),
  scores = create('p', 'scores', `${allScores[0]}\n${allScores[1]}\n${allScores[2]}\n${allScores[3]}\n${allScores[4]}\n${allScores[5]}\n${allScores[6]}\n${allScores[7]}\n${allScores[8]}\n${allScores[9]}`),
  winTemplate = `Ура!\n${defName} Вы решили головоломку\nза ${min} мин ${sec} сек\nс помощью ${swipeCount} ходов\nнажмите кнопку перемешивания что бы сиграть ещё`,
  winText = create('h2', null, winTemplate),
  name1split = create('p', 'your', `Ваше имя `),
  name2split = create('div', 'name', defName, null, ['contenteditable', 'true']),
  gamerName = create('div', 'your_name', [name1split, name2split]),
  row3 = create('h3', null, `Новая игра 3x3`),
  row4 = create('h3', null, `Новая игра 4x4`),
  row5 = create('h3', null, `Новая игра 5x5`),
  row6 = create('h3', null, `Новая игра 6x6`),
  row7 = create('h3', null, `Новая игра 7x7`),
  row8 = create('h3', null, `Новая игра 8x8`),
  randomizeOff = storage.get('randOff', 'false'),
  pictureOn = storage.get('picOn', 'false'),
  rndm = (randomizeOff === 'false' ? 'Перемешивание включено' : 'Перемешивание отключено'),
  pctr = (pictureOn === 'false' ? 'Обычные пятнашки' : 'Пятнашки с картинкой не готовы'),
  randomize = create('h3', null, rndm),
  picture = create('h3', null, pctr),
  pauseCloseButton = create('button', null, 'Закрыть', null, ['id', 'cancel'], ['type', 'reset']),
  menuCloseButton = create('button', null, 'Закрыть', null, ['id', 'cancel'], ['type', 'reset']),
  winCloseButton = create('button', null, 'Закрыть', null, ['id', 'cancel'], ['type', 'reset']),
  pauseDialog = create('dialog', 'pauseDialog', [pauseCloseButton, pauseText, scores], wrapper),
  winDialog = create('dialog', 'winDialog', [winText, winCloseButton], wrapper),
  menuDialog = create('dialog', 'menuDialog', [menuCloseButton, gamerName, row3, row4, row5, row6, row7, row8, picture, randomize], wrapper),
  cellSize = 0,
  cells = [];

export default class GemPuzzle {
  constructor() {
    this.soundOff = storage.get('soundOff', 'false');;
  }

  init() {
    this.container = create('div', 'puzzle', null, wrapper);
    document.body.prepend(main);
    this.empty = { value: 0, top: 0, left: 0 };
    sound.addEventListener('click', (e) => { this.soundOffEvent(e) });
    pause.onmousedown = this.pauseEvent;
    pauseCloseButton.onmousedown = this.pauseEnd;
    winCloseButton.onmousedown = this.winEnd;
    menuCloseButton.onmousedown = this.menuEnd;
    menu.onmousedown = this.menuEvent;
    newGame.addEventListener('click', () => { this.renewAll() });
    autoCompl.addEventListener('click', () => { this.autoComplete() });
    randomize.addEventListener('click', () => { this.randomizeEvent() });
    picture.addEventListener('click', () => { this.pictureEvent() });
    row3.addEventListener('click', () => { this.rowsQuant(3) });
    row4.addEventListener('click', () => { this.rowsQuant(4) });
    row5.addEventListener('click', () => { this.rowsQuant(5) });
    row6.addEventListener('click', () => { this.rowsQuant(6) });
    row7.addEventListener('click', () => { this.rowsQuant(7) });
    row8.addEventListener('click', () => { this.rowsQuant(8) });
    name2split.addEventListener('click', this.setName);
    name2split.addEventListener('keypress', this.setName);
    name2split.addEventListener('blur', this.setName);
    this.soundOffEvent();
    countTime();
    if (!storage.get('first')) {
      this.menuEvent();
      storage.clear()
      storage.set('first', 'false')
    }
    return this;
  }

  generate() {
    let isNew = false,
      cellSize = cellSizes[rows - 1],
      gemElement = `gem_element${rows}`,
      emptyElement = `empty${rows}`;

    rows = Number(rows);
    elemQty = rows * rows;
    numbers = storage.get('numbers');

    if (numbers) numbers = numbers.split(',');
    else {
      isNew = true;
      if (isNew) {
        winArr = [];
        storage.del('winArr');
        if (randomizeOff === 'true') {
          numbers = [...Array(elemQty).keys()];
          numbers.shift();
          numbers.push(0);
        } else { numbers = [...Array(elemQty).keys()].sort(() => Math.random() - 0.5); }
      }
    }

    for (let i = 0; i < numbers.length; i++) {
      const cell = document.createElement('div');
      const value = numbers[i];
      const left = i % rows;
      const top = (i - left) / rows;

      if (value === '0' || value === 0) { cell.className = emptyElement } else {
        cell.className = gemElement;
        cell.setAttribute('draggable', true);
      }

      cell.innerHTML = value;
      cell.style.left = `${(left) * cellSize}vw`
      cell.style.top = `${(top) * cellSize}vw`

      cells.push({ value: value, left: left, top: top, el: cell });
      winArr.push(value);
      if (value === '0' || value === 0) this.empty = { value: value, left: left, top: top, el: cell };

      cell.addEventListener('dragstart', () => { this.dragStart(cell) });
      cell.addEventListener('dragend', () => { this.dragEnd(cell, i) });
      cell.addEventListener('click', () => { this.move(i) });
      if (isNew) this.container.append(cell);
      else { this.container.append(cell); }
    }
    winArr.sort(function(a, b) { return a - b });
    winArr.shift();
    winArr.push('0');
    storage.set('winArr', winArr);
    storage.set('numbers', numbers);
    this.isSolvable();
  }

  isSolvable() {
    let sum = 0,
      zeroPos = 0,
      qtySmaller = 0;
        
    numbers.forEach((n, i) => {
      n = Number(n);
      if (n !== 0) {
        qtySmaller = 0;
        for (let m = i; m < numbers.length; m++ ) {
          if ( numbers[m] !== 0 && numbers[m] < n) qtySmaller++;}
        sum = sum + qtySmaller;
      } else {zeroPos = i} 
    });
    if (!(rows%2)) sum = sum + zeroPos + 1;
    else { sum = sum + zeroPos }

    if ((sum%2)) {console.log('Unsolveble make new order'); this.renewAll();}
  }

  move(index) {
    cellSize = cellSizes[rows - 1];
    if (!cells) this.generate;
    const cell = cells[index];
    const leftDiff = Math.abs(this.empty.left - cell.left);
    const topDiff = Math.abs(this.empty.top - cell.top);

    if (leftDiff + topDiff > 1) return;
    this.playSound('swipe');
    swipeCount++;
    swipe.innerText = `${swipeCount}`;
    storage.set('swipe', swipeCount);
    cell.el.style.left = `${(this.empty.left) * cellSize}vw`;
    cell.el.style.top = `${(this.empty.top) * cellSize}vw`;

    const emptyLeft = this.empty.left;
    const emptyTop = this.empty.top;
    this.empty.left = cell.left;
    this.empty.top = cell.top;
    cell.left = emptyLeft;
    cell.top = emptyTop;

    cells[index].left = cell.left;
    cells[index].top = cell.top;
    cells.forEach((key) => {
      if (key.value === 0) {
        key.left = this.empty.left;
        key.top = this.empty.top;
      }
    })
    let arrCells = [];
    let newNumbers = [];
    cells.forEach((key) => {
      arrCells.push(`${key.top}${key.left},${key.value}`)
    });
    arrCells.sort();
    arrCells.forEach((key) => {
      key.split(',');
      (key.length === 4 ? newNumbers.push(key[3]) : newNumbers.push(key[3] + key[4]))
    })
    storage.set('numbers', newNumbers)

    this.finish()
  }

  autoComplete() {
    cellSize = cellSizes[rows - 1];
    let arrCells = [];
    let newNumbers = [];

    cells.sort(function(a, b) {return a.value - b.value})
    let tmp = cells.shift();
    cells.push(tmp)
    cells.forEach((cell, i) => {
      const left = i % rows;
      const top = (i - left) / rows;
      console.log(cell)
      
      cell.el.innerHTML = cell.value;
      cell.el.style.left = `${(left) * cellSize}vw`
      cell.el.style.top = `${(top) * cellSize}vw`
      arrCells.push(`${top}${left},${cell.value}`)
    })

    arrCells.sort();
    arrCells.forEach((key) => {
      key.split(',');
      (key.length === 4 ? newNumbers.push(key[3]) : newNumbers.push(key[3] + key[4]))
    })
    storage.set('numbers', newNumbers)
    this.empty.left = rows-1;
    this.empty.top = rows-1;

    setTimeout(() => {
      this.finish()
    }, 1000);
  }

  finish() {
    let win = storage.get('winArr')
    let nmbrs = storage.get('numbers')
    if (win === nmbrs) {
      this.winEvent();
    }
  }

  dragStart(e) {
    setTimeout(() => {
      e.classList.add('hide');
    }, 0);
  }

  dragEnd(e, i) {
    this.move(i)
    setTimeout(() => {
      e.classList.remove('hide');
    }, 20);
  }

  soundOffEvent(e) {
    console.log(e)
    if(e) {
      if (e.type === 'click') {
        if (this.soundOff === 'true' ) {
          this.soundOff = 'false';
        }   else {
        this.soundOff = 'true';
          }
      }
    }
    storage.set('soundOff', this.soundOff);
    if (this.soundOff === 'true') { iconMusic.innerText = 'music_off';
    } else { iconMusic.innerText = 'music_note'; }
  }

  playSound(code) {
    let audio = new Audio();
    audio.preload = 'true';
    if (this.soundOff === 'true') return;
    audio.src = 'assets/MsgType.mp3';
    if (code === 'swipe') audio.src = 'assets/ptt_error.mp3';
    if (code === 'menu') audio.src = 'assets/msgtype.mp3';
    if (code === 'won') audio.src = 'assets/startup.mp3';
    audio.play();
  }

  pauseEvent() {
    storage.set('stopTime', true);    
    let aa = '',
      bb = '';
    allScores.sort(function(a, b) {
      aa = ''; bb = '';
      for (let i = 0; i < a.length; i++) { if (a[i] !== ' ') {aa = aa + a[i];} else {break} } 
      for (let j = 0; j < b.length; j++) { if (b[j] !== ' ') {bb = bb + b[j];} else {break} }
      if (!aa) aa = 9999;
      if (!bb) bb = 9999;
      return aa - bb;
    });
    storage.set('score', allScores);
    allScores = storage.get('score').split(',');
    scores = create('p', 'scores', `${allScores[0]}\n${allScores[1]}\n${allScores[2]}\n${allScores[3]}\n${allScores[4]}\n${allScores[5]}\n${allScores[6]}\n${allScores[7]}\n${allScores[8]}\n${allScores[9]}`),
    pauseDialog = create('dialog', 'pauseDialog', [pauseCloseButton, pauseText, scores], wrapper);
    pauseDialog.showModal();
  }

  pauseEnd() {
    storage.set('stopTime', false);    
    pauseDialog.close();
  }

  winEvent() {
    this.playSound('won');
    storage.set('stopTime', true);    
    min = storage.get('min', '00');
    sec = storage.get('sec', '00');
    let winName = storage.get('name', defName),
      newScore = [`${swipeCount} ходов за ${min}:${sec} - ${rows}x${rows} - ${winName}`];
    winTemplate = `Ура!\n${winName} Вы решили головоломку\nза ${min} мин ${sec} сек\nс помощью ${swipeCount} ходов\n\nнажмите кнопку перемешивания\nчто бы сиграть ещё`,
    winText = create('h2', null, winTemplate);
    winDialog = create('dialog', 'winDialog', [winText, winCloseButton], wrapper);
    if (allScores.length > 20) allScores.pop();
    allScores.push(newScore);
    storage.set('score', allScores);
    allScores = storage.get('score').split(',');
    winDialog.showModal();
  }

  winEnd() {
    winDialog.close()
  }

  menuEvent() {
    storage.set('stopTime', true);    
    menuDialog.showModal();
  }

  menuEnd() {
    storage.set('stopTime', false);    
    menuDialog.close();
  }

  randomizeEvent() {
    if (randomizeOff === 'false') {
      randomizeOff = 'true';
      randomize.innerText = 'Перемешивание отключено';
    } else {
      randomizeOff = 'false';
      randomize.innerText = 'Перемешивание включено'
    }
    this.renewAll();
  }

  pictureEvent() {
    if (pictureOn === 'false') {
      pictureOn = 'true';
      picture.innerText = 'Пятнашки с картинкой не готовы';
    } else {
      pictureOn = 'false';
      picture.innerText = 'Обычные пятнашки'
    }
    storage.set('picOn', pictureOn)
    this.renewAll();
  }

  rowsQuant(e) {
    rows = e;
    storage.set('rows', e);
    this.renewAll();
  }

  renewAll() {
    swipe.innerText = `0`;
    this.container.innerHTML = '';
    swipeCount = 0;
    storage.set('swipe', '0');
    storage.set('sec', '00');
    storage.set('min', '00');
    numbers = '';
    cells = [];
    winArr = [];
    storage.set('randOff', 'false');
    storage.del('numbers');
    storage.del('winArr');
    storage.set('stopTime', false);    
    this.generate();
  }

  setName(e) {
    if (e.type === 'click') { name2split.textContent = '' }
    if (e.type === 'keypress') {
      if (e.which == 13 || e.keyCode == 13) {
        name2split.blur();
        storage.set('name', name2split.innerText);
        this.getName;
      }
    } else { storage.set('name', name2split.innerText); }
    if (e.type === 'blur') {
      if (name2split.textContent !== '') {
        name2split.textContent = storage.get('name')
        storage.set('name', defName)
      } else {
        name2split.textContent = defName;
        storage.set('name', defName)
      }
    }
  }

  getName() {
    if (storage.get('name') === null || storage.get('name') === '') {
      name2split.textContent = defName;
      storage.set('name', defName);
    } else {
      name2split.textContent = storage.get('name')
      if (name2split.textContent !== null && name2split.textContent !== '') { defName = storage.get('name') }
    }
  }
}