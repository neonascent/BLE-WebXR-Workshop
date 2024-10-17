var scale = 10;
var newBPMColour = {
    r: 1.0,
    g: 1.0,
    b: 1.0
};
var oldBPMColour = {
    r: 1.0,
    g: 1.0,
    b: 1.0
};

// UI elements.
const deviceNameLabel = document.getElementById('device-name');
const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const terminalContainer = document.getElementById('terminal');
const sendForm = document.getElementById('send-form');
const inputField = document.getElementById('input');

const heartbeat = new Audio('./media/mixkit-human-single-heart-beat-490.mp3');

// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;

let moveSpeed = 0.0; // Adjust the speed to your preference

const scrollElement = (element) => {
    const scrollTop = element.scrollHeight - element.offsetHeight;

    if (scrollTop > 0) {
        element.scrollTop = scrollTop;
    }
};

const logToTerminal = (message, type = '', color = ' ') => {
    terminalContainer.insertAdjacentHTML('beforebegin',
`<div${type && ` class="${type}" style="color: ${color};" `}>${message}</div>`);

    if (isTerminalAutoScrolling) {
        scrollElement(terminalContainer);
    }
};

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function (data) {
    // process data
    if (data.indexOf('button') > -1) {
        // heartbeat stuff
        // trigger heartbeat sound
        heartbeat.currentTime = 0;
        heartbeat.play();
        // Call a function to move forward
        moveForward();
    } else if (data.indexOf('int:') > -1) {
        var parts = data.split(' ');
        var bpm = parseInt(parts[1]);
        newBPMColour = getColour(bpm);

        logToTerminal("BPM received: " + bpm.toString(), 'in', getColourHex(bpm));

        // make colour
    }

};

// Override default log method to output messages to the terminal and console.
terminal._log = function (...messages) {
    // We can't use `super._log()` here.
    messages.forEach((message) => {
        logToTerminal(message);
        console.log(message); // eslint-disable-line no-console
    });
};

// Implement own send function to log outcoming data to the terminal.
const send = (data) => {
    terminal.send(data).
    then(() => logToTerminal(data, 'out')).catch((error) => logToTerminal(error));
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
    terminal.connect().
    then(() => {
        deviceNameLabel.textContent = terminal.getDeviceName() ?
            terminal.getDeviceName() : defaultDeviceName;
    });
});

disconnectButton.addEventListener('click', () => {
    terminal.disconnect();
    deviceNameLabel.textContent = defaultDeviceName;
});

sendForm.addEventListener('submit', (event) => {
    event.preventDefault();

    send(inputField.value);

    inputField.value = '';
    inputField.focus();
});

// Switch terminal auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
    const scrollTopOffset = terminalContainer.scrollHeight -
        terminalContainer.offsetHeight - terminalAutoScrollingLimit;

    isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});

// at some point we'll use "send" to make vibrate

// we'll parse the input data from arduino/terminal


function getColour(bpm) {
    return hexToRgb(getColourHex(bpm));
}

function getColourHex(bpm) {
    bpm = bpm.clamp(30, 240);
    var hue = 230 - map(bpm, 30, 240, 0, 230);
    // var color = hslToHex(hue, 50, 100);
    return hslToHex(hue, 50, 50);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    }
     : null;
}

function rgbclamp(rgb) {
    return {
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255
    };
}

//https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0'); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

//https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') {
        moveForward();

    }
});

function moveForward() {
    // Get the player's current position in the scene
    moveSpeed = 0.1; // Adjust the speed as necessary
    console.log('move');

}
