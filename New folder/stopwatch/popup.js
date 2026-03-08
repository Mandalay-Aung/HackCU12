
let seconds = 0;
let minutes = 0;
let hours = 0;

let timer = null;

function updateTime() {

    seconds++;

    if (seconds == 60) {
        seconds = 0;
        minutes++;
    }

    if (minutes == 60) {
        minutes = 0;
        hours++;
    }

    document.getElementById("display").textContent =
        hours + ":" + minutes + ":" + seconds;
}

document.getElementById("start").onclick = function () {

    if (timer !== null) return;

    timer = setInterval(updateTime, 1000);
};

document.getElementById("stop").onclick = function () {

    clearInterval(timer);
    timer = null;
};

document.getElementById("reset").onclick = function () {

    clearInterval(timer);
    timer = null;

    seconds = 0;
    minutes = 0;
    hours = 0;

    document.getElementById("display").textContent = "00:00:00";
};