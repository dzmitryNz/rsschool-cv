import * as storage from './storage.js';
import create from './create.js';
import language from './index.js'; //{en, ru}
import Key from './Key.js';

const main = create('main', '', [create('h1', 'title', 'Virtual Keyboard'), create('div', 'article', [
    create('p', 'hint', 'Левые Ctrl + Alt переключают язык ввода. Hide скрывает клавиатуру'),
    create('p', 'hint', 'При распознавании голоса в консоль выводятся предварительные результаты распознавания'),
    create('p', 'hint', 'Звуки по-умолчанию выключены, внизу есть кнопка, которой это можно отключить'),
    create('p', 'hint', 'при нажати клавиши Shift мышкой она блокируется, при нажатии с клавиатуры работает как обычно')
])]);

{ /* <i class="material-icons">keyboard_voice</i>  */ }

export default class Keyboard {
    constructor(rowsOrder) {
        this.rowsOrder = rowsOrder;
        this.keysPressed = {};
        this.isCaps = false;
        this.soundOff = storage.get('soundOff', true);
        this.shiftKey = false;
        this.speachRec = false;
    }


    init(langCode) { // LangCode > en (ru)
        this.keyBase = language[langCode];
        this.output = create('textarea', 'output', null, main, ['placeholder',
            `Введите что-нибудь...`
        ], ['rows', 5], ['cols', 50], ['spellcheck', false], ['autocorrect', 'off']);
        this.hideButton = create('div', 'hide-button', 'Hide keyboard', main);
        this.wrapper = create('div', 'keyboard-wrapper', null, main);
        this.container = create('div', 'keyboard', null, this.wrapper, ['language', langCode]);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        document.body.prepend(main);
        this.speachRecognition();
        return this;
    }

    generateLayout() {
        this.keyButtons = [];
        this.rowsOrder.forEach((row, i) => {
            const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
            rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
            row.forEach((code) => {
                const keyObj = this.keyBase.find((key) => key.code === code);
                if (keyObj) {
                    const keyButton = new Key(keyObj);
                    this.keyButtons.push(keyButton);
                    rowElement.appendChild(keyButton.div);
                }
            });
        });

        document.addEventListener('keydown', this.handleEvent);
        document.addEventListener('keyup', this.handleEvent);
        this.container.onmousedown = this.preHandleEvent;
        this.container.onmouseup = this.preHandleEvent;
        this.hideButton.onmousedown = this.hideKeyboardEvent;
    }

    hideKeyboardEvent = (e) => {
        let hideKeyboard = this.wrapper.classList.length === 1 ? true : false;
        if (hideKeyboard) {
            this.wrapper.classList.add("keyboard--hidden");
            this.hideButton.innerText = 'Show keyboard';
        } else {
            this.wrapper.classList.remove("keyboard--hidden");
            this.hideButton.innerText = 'Hide keyboard';
        }

    }

    preHandleEvent = (e) => {
        e.stopPropagation();
        const keyDiv = e.target.closest('.keyboard__key');
        if (!keyDiv) return;
        const { dataset: { code } } = keyDiv;
        keyDiv.addEventListener('mouseleave', this.resetButtonState);
        this.handleEvent({ code, type: e.type });
    };

    resetButtonState = ({ target: { dataset: { code } } }) => {

        const keyObj = this.keyButtons.find((key) => key.code === code);
        if (!keyObj.code.match(/Caps|Shift|Sound|Speach/)) {
            keyObj.div.classList.remove('active');
            keyObj.div.removeEventListener('mouseleave', this.resetButtonState);
        }
    }

    handleEvent = (e) => {
        if (e.stopPropagation) e.stopPropagation();
        const { code, type } = e;
        const keyObj = this.keyButtons.find((key) => key.code === code);
        if (!keyObj) return;
        this.output.focus();
        // On key pressed
        if (type.match(/keydown|mousedown/)) {
            if (!code.match(/Shift/)) this.playSound(code);
            if (code.match(/Shift/) && type.match(/mousedown/)) this.playSound(code);
            if (type.match(/key/)) e.preventDefault();
            if (code.match(/Hide/)) this.hideKeyboardEvent();
            if (code.match(/Shift/) && !type.match(/mousedown/)) {
                if (!this.shiftKey) {
                    this.playSound(code);
                    this.shiftKey = true;
                    this.switchUpperCaseShift(true);
                }
            }

            if (code.match(/Shift/) && type.match(/mousedown/)) {
                if (!this.shiftKey) {
                    this.shiftKey = true;
                    this.switchUpperCaseShift(true);
                } else {
                    this.shiftKey = false;
                    this.switchUpperCaseShift(false);
                }
            }
            if (code.match(/Caps/)) {
                this.isCaps = !this.isCaps;
                if (this.isCaps) {
                    this.switchUpperCase(true);
                    this.keyButtons.find((key) => key.code === 'CapsLock').div.classList.add('active');
                } else {
                    this.switchUpperCase(false);
                    this.keyButtons.find((key) => key.code === 'CapsLock').div.classList.remove('active');
                }
            }
            if (code.match(/Speach/)) {
                this.speachRec = !this.speachRec;
                if (this.speachRec) this.recognitionStart();
                else {
                    this.recognitionStop();
                }
            }
            if (code.match(/Sound/)) {
                this.soundOff = !this.soundOff;
                storage.set('soundOff', this.soundOff);
            }


            if (this.soundOff) this.keyButtons.find((key) => key.code === 'Sound').div.classList.add('active');


            // Switch language
            if (code.match(/Control/)) this.ctrlKey = true;
            if (code.match(/Alt/)) this.altKey = true;

            if (code.match(/Control/) && this.altKey) this.switchLanguage();
            if (code.match(/Alt/) && this.ctrlKey) this.switchLanguage();
            if (code.match(/Lang/)) this.switchLanguage();

            if (!this.isCaps) {
                this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
            } else if (this.isCaps) {
                if (this.shiftKey) {
                    this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
                } else {
                    this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
                }
            }

            keyObj.div.classList.add('active');
            // release button
        } else if (type.match(/keyup|mouseup/)) {
            if (code.match(/Control/)) this.ctrlKey = false;
            if (code.match(/Alt/)) this.altKey = false;
            //for Shift keyboard event
            if (code.match(/Shift/) && !type.match(/mouseup/)) {
                if (this.shiftKey) {
                    this.shiftKey = false;
                    this.switchUpperCaseShift(false);
                }
            }
            // remove 'active' classes
            if (!code.match(/Caps|Sound|Shift|Speach/)) {

                keyObj.div.classList.remove('active');

            } else {
                if (code.match(/Caps/) && !this.isCaps) { keyObj.div.classList.remove('active'); }
                if (code.match(/Sound/) && !this.soundOff) { keyObj.div.classList.remove('active'); }
                if (code.match(/Shift/) && !this.shiftKey) { keyObj.div.classList.remove('active'); }
                if (code.match(/Speach/) && !this.speachRec) { keyObj.div.classList.remove('active'); }
            }
            if (!this.soundOff) this.keyButtons.find((key) => key.code === 'Sound').div.classList.remove('active');
        }
    }


    switchLanguage = () => {
        const langAbbr = Object.keys(language); //[en, ru]
        let langIdx = langAbbr.indexOf(this.container.dataset.language); // 1
        this.keyBase = langIdx + 1 < langAbbr.length ? language[langAbbr[langIdx += 1]] : language[langAbbr[langIdx -= langIdx]]; // 0

        this.container.dataset.language = langAbbr[langIdx];
        storage.set('kbLang', langAbbr[langIdx]);

        this.speachRecognition();

        this.keyButtons.forEach((button) => {
            const keyObj = this.keyBase.find((key) => key.code === button.code);
            if (!keyObj) return;
            button.shift = keyObj.shift;
            button.small = keyObj.small;
            if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
                button.sub.innerHTML = keyObj.shift;
            } else {
                button.sub.innerHTML = '';
            }
            button.letter.innerHTML = keyObj.small;
        });
        if (this.isCaps) this.switchUpperCase(true);
        if (this.shiftKey) this.switchUpperCaseShift(true);
    }

    switchUpperCase(isTrue) {
        if (isTrue) {
            this.keyButtons.forEach((button) => {
                // Change symbols on key if Caps
                if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                } else if (!button.isFnKey && this.isCaps && this.shiftKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.small;
                }
                if (button.isFnKey) button.letter.innerHTML = button.small;
            });
        }

        if (!isTrue) {
            this.keyButtons.forEach((button) => {
                if (!this.isCaps && !this.shiftKey) {
                    button.letter.innerHTML = button.small;
                } else if (!this.isCaps) {
                    button.letter.innerHTML = button.shift;
                } else if (!button.isFnKey) {
                    if (this.isCaps || this.shiftKey) {
                        button.letter.innerHTML = button.shift;
                    } else {
                        button.letter.innerHTML = button.small;
                    }
                }
                if (button.isFnKey) button.letter.innerHTML = button.small;
            });
        }
    }

    switchUpperCaseShift(isTrue) {
        if (isTrue) {
            this.keyButtons.forEach((button) => {
                if (button.sub.innerText) {
                    if (this.shiftKey) {
                        button.sub.classList.add('sub-active');
                        button.letter.classList.add('sub-inactive');
                    }
                }
                // Change symbols on key if Caps
                if (!button.isFnKey && this.shiftKey && !this.isCaps && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                } else if (!button.isFnKey && this.shiftKey && this.isCaps && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.small;
                }

            });
        }

        if (!isTrue) {
            this.keyButtons.forEach((button) => {
                if (button.sub.innerHTML && !button.isFnKey) {
                    button.sub.classList.remove('sub-active');
                    button.letter.classList.remove('sub-inactive');

                    if (!this.isCaps && !this.shiftKey) {
                        button.letter.innerHTML = button.small;
                    } else if (!this.isCaps) {
                        button.letter.innerHTML = button.shift;
                    }
                } else if (!button.isFnKey) {
                    if (this.isCaps || this.shiftKey) {
                        button.letter.innerHTML = button.shift;
                    } else {
                        button.letter.innerHTML = button.small;
                    }
                }

            });
        }
    }

    printToOutput(keyObj, symbol) {
        let cursorPos = this.output.selectionStart;
        const left = this.output.value.slice(0, cursorPos);
        const right = this.output.value.slice(cursorPos);

        const fnButtonsHandler = {
            Tab: () => {
                this.output.value = `${left}\t${right}`;
                cursorPos += 1;
            },
            ArrowLeft: () => {
                cursorPos = cursorPos - 1 >= 0 ? cursorPos - 1 : 0;
            },
            ArrowRight: () => {
                cursorPos += 1;
            },
            ArrowUp: () => {
                const possitionFromLeft = this.output.value.slice(0, cursorPos).match(/(\n).*$(?!\l)/g) || [
                    [1]
                ];
                cursorPos -= possitionFromLeft[0].length;
            },
            ArrowDown: () => {
                const possitionFromLeft = this.output.value.slice(cursorPos).match(/^.*(\n).*(?!\l)/g) || [
                    [1]
                ];
                cursorPos += possitionFromLeft[0].length;
            },
            Enter: () => {
                this.output.value = `${left}\n${right}`;
                cursorPos += 1;
            },
            Delete: () => {
                this.output.value = `${left}${right.slice(1)}`;
            },
            Backspace: () => {
                this.output.value = `${left.slice(0, -1)}${right}`;
                cursorPos -= 1;
            },
            Lang: () => {
                this.output.value = `${left}${right}`;
            },
            Hide: () => {
                this.output.value = `${left}${right}`;
            },
            Sound: () => {
                this.output.value = `${left}${right}`;
            },
            Speach: () => {
                this.output.value = `${left}${right}`;
            },
            Space: () => {
                this.output.value = `${left} ${right}`;
                cursorPos += 1;
            }
        };

        if (fnButtonsHandler[keyObj.code]) { fnButtonsHandler[keyObj.code](); } else if (!keyObj.isFnKey) {
            cursorPos += symbol.length;
            this.output.value = `${left}${symbol || ''}${right}`;
        }
        this.output.setSelectionRange(cursorPos, cursorPos);
    }

    playSound(code) {
        let audio = new Audio();
        audio.preload = 'true';
        let lang = storage.get('kbLang');
        if (lang === 'ru') audio.src = 'assets/doink.ogg';
        else audio.src = 'assets/msgtype.mp3';
        if (this.soundOff) return;
        // console.log(`Sound ${code}`)
        if (code.match(/Control/)) audio.src = 'assets/error.mp3';
        if (code.match(/Lang/)) audio.src = 'assets/pixiedust.ogg';
        if (code.match(/Arr/)) audio.src = 'assets/drip.ogg';
        if (code.match(/Alt/)) audio.src = 'assets/argon.ogg';
        if (code.match(/Shift/)) audio.src = 'assets/Spica.ogg';
        if (code.match(/Caps/)) audio.src = 'assets/shaula.ogg';
        if (code.match(/Lang/)) audio.src = 'assets/system.mp3';
        if (code.match(/Speach/)) audio.src = 'assets/proxima.ogg';
        if (code.match(/Enter/)) audio.src = 'assets/message.mp3';
        if (code.match(/Hide/)) audio.src = 'assets/tada.ogg';
        if (code.match(/Backspace/)) audio.src = 'assets/incoming.mp3';
        if (code.match(/Sound/)) return;

        audio.play();
    }

    recognitionStart() {
        this.recognition.start();
        this.recognition.addEventListener('end', this.recognition.start);
    }

    recognitionStop() {
        this.recognition.removeEventListener('end', this.recognition.start);
        this.recognition.stop();
    }

    speachRecognition() {
        this.recognition.interimResults = true;
        this.recognition.lang = storage.get('kbLang', 'en')

        console.log(`speachRec ${this.recognition.lang}`);

        this.recognition.addEventListener('result', e => {
            const transcript = Array.from(e.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            console.log(` ${transcript}`)

            if (e.results[0].isFinal) {
                this.printToOutput(this.keyButtons.find((key) => key.code === 'KeyT'), transcript);
            }
        });
    }
}