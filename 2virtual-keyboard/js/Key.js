import create from './create.js';

export default class Key {
    constructor({ small, shift, code }) {
        this.code = code;
        this.small = small;
        this.shift = shift;
        this.icon = null;
        this.isFnKey = Boolean(code.match(/Control|Lang|Hide|Speach|Sound|Arrow|Alt|Shift|Tab|Backspace|Del|Space|Enter|Caps/));

        if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
            this.sub = create('div', 'sub', this.shift);
        } else {
            this.sub = create('div', 'sub', '')
        }
        this.letter = create('div', 'letter', this.small);
        if (code.match(/Hide/)) this.icon = create('i', 'material-icons', 'keyboard_hide');
        if (code.match(/Speach/)) this.icon = create('i', 'material-icons', 'keyboard_voice');
        if (code.match(/Backspace/)) this.icon = create('i', 'material-icons', 'backspace');
        if (code.match(/Tab/)) this.icon = create('i', 'material-icons', 'keyboard_tab');
        if (code.match(/Enter/)) this.icon = create('i', 'material-icons', 'keyboard_return');
        if (code.match(/Sound/)) this.icon = create('i', 'material-icons', 'music_off');
        if (code.match(/Space/)) this.icon = create('i', 'material-icons', 'space_bar');
        if (code.match(/ArrowUp/)) this.icon = create('i', 'material-icons', 'keyboard_arrow_up');
        if (code.match(/ArrowDown/)) this.icon = create('i', 'material-icons', 'keyboard_arrow_down');
        if (code.match(/ArrowLeft/)) this.icon = create('i', 'material-icons', 'keyboard_arrow_left');
        if (code.match(/ArrowRight/)) this.icon = create('i', 'material-icons', 'keyboard_arrow_right');
        this.div = create('div', `keyboard__key`, [this.sub, this.letter, this.icon], null, ['code', this.code],
            this.isFnKey ? ['fn', 'true'] : ['fn', 'false']);
    }
}

// createIconHTML = (icon_name) => {
//     return `<i class="material-icons">${icon_name}</i>`;
// createIconHTML("backspace");
// createIconHTML("keyboard_capslock");
// createIconHTML("keyboard_return");
// createIconHTML("space_bar");
// createIconHTML("clear");
// createIconHTML("keyboard_tab");
// createIconHTML("keyboard_voice");
// createIconHTML("arrow_circle_up");
// createIconHTML("keyboard_arrow_right");
// createIconHTML("keyboard_arrow_left");
// createIconHTML("keyboard_hide");