const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false,
        shift: false,
        lang: true,
        speach: false,
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    _createKeys() {
        let fragment = document.createDocumentFragment(),
            keyLayoutEn = [
                "done", "ё", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                "tab", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ", "\\",
                "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
                "shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".", "clear",
                "lang", "speach", "space", "arrow_left", "arrow_right"
            ],
            keyLayoutRu = [
                "done", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                "tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
                "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter",
                "shift", "z", "x", "c", "v", "b", "n", "m", "?", ",", ".", "clear",
                "lang", "speach", "space", "arrow_left", "arrow_right"
            ];

        let keyLayout = this.properties.lang ? keyLayoutEn : keyLayoutRu;
        console.log('CreateKeys ' + keyLayout)
            // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };
        console.log(this.elements.keysContainer.lastChild);
        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "p", "enter", "clear", "\\", "arrow_right"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "backspace":
                    keyElement.classList.add("keyboard__key--double-wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
                        this._triggerEvent("oninput");
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--double-wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--double-wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += "\n";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("keyboard_hide");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                case "arrow_left":
                    keyElement.classList.add("keyboard__key--wide", );
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_left");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                    });

                    break;
                case "arrow_right":
                    keyElement.classList.add("keyboard__key--wide", );
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_right");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "shift":
                    keyElement.classList.add("keyboard__key--double-wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("arrow_circle_up");

                    keyElement.addEventListener("click", () => {
                        this._nextShift()
                        keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
                    });

                    break;

                case "speach":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_voice");

                    keyElement.addEventListener("click", () => {
                        this._toggleSpeach();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.speach);
                    });

                    break;

                case "lang":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = this.properties.lang ? 'EN' : 'RU';

                    keyElement.addEventListener("click", () => {
                        this.properties.lang = !this.properties.lang;
                        this.elements.keysContainer.replaceChild(this._createKeys(), this);
                    });

                    break;

                case "tab":
                    keyElement.classList.add("keyboard__key--double-wide");
                    keyElement.innerHTML = createIconHTML("keyboard_tab");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += "     ";
                        this._triggerEvent("oninput");
                    });

                    break;
                case "clear":
                    keyElement.classList.add("keyboard__key--double-wide");
                    keyElement.innerHTML = createIconHTML("clear");
                    keyElement.addEventListener("click", () => {
                        this.properties.value = window.confirm("Do you really want clear ALL?") ? " " : this.properties.value;
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        this.properties.value += this.properties.capsLock || this.properties.shift ? key.toUpperCase() : key.toLowerCase();
                        if (this.properties.shift) {
                            this.properties.shift = false;
                            for (const key of this.elements.keys) {
                                if (key.childElementCount === 0) {
                                    key.textContent = this.properties.shift ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                                }
                            }
                        }

                        this._triggerEvent("oninput");
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });
        console.log(this.elements.keysContainer.classlist);
        return fragment;
    },

    _triggerEvent(handlerName) {
        console.log('triggerEvent ' + handlerName);
        console.log(this.properties)


        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    _toggleSpeach() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    _nextShift() {
        this.properties.shift = !this.properties.shift;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.shift ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

window.addEventListener("DOMContentLoaded", function() {
    Keyboard.init();
    console.log('windowEventListner')

});