import { sleep } from "../../../utils/funtions";

export function EnableRelocatableElemente(Element: HTMLElement, StartingLocationX, StartingLocationY) {
    var moveX = 0;
    var moveY = 0;

    var X = localStorage[Element.id + 'X'] || StartingLocationX;
    var Y = localStorage[Element.id + 'Y'] || StartingLocationY;

    Element.style.left = X + 'px';
    Element.style.top = Y + 'px';

    Element.onmousedown = function (event) {
        Element.style.cursor = 'grabbing';
        moveX = event.pageX;
        moveY = event.pageY;

        X = Element.offsetLeft;
        Y = Element.offsetTop;

        Element.onmousemove = function (event) {

            moveX -= event.pageX;
            moveY -= event.pageY;

            if (X - moveX > 0 && X - moveX < window.innerWidth - Element.offsetWidth &&
                Y - moveY > 0 && Y - moveY < window.innerHeight - Element.offsetHeight) {

                X -= moveX;
                Y -= moveY;

                Element.style.left = X + 'px';
                Element.style.top = Y + 'px';

                localStorage[Element.id + 'X'] = X;
                localStorage[Element.id + 'Y'] = Y;

            }

            moveX = event.pageX;
            moveY = event.pageY;
        }

        return false;
    }
    Element.onmouseleave = function () {
        Element.onmousemove = null;
    }
    Element.onmouseup = function () {
        Element.style.cursor = 'default';
        Element.onmousemove = null;
    }
}

export function DisableRelocatableElemente(Element: HTMLElement) {
    Element.onmousedown = null;
    Element.onmouseleave = null;
    Element.onmouseup = null;
}

export function EnableHideWhenMouseIsInactive(FatherElement: HTMLElement, Element: HTMLElement) {
    let move = true;
    FatherElement.addEventListener('mousemove', async (event) => {
        if (move) {
            move = false;
            if (!Element.classList.contains('Visible'))
                Element.classList.add('Visible');
            await sleep(500);
            if (Element.classList.contains('Visible'))
                Element.classList.remove('Visible');
            move = true;
        }
    })
}

export function GenerateColor() {
    /**Generate random hex color*/
    var hexadecimais = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += hexadecimais[Math.floor(Math.random() * 16)];
    }
    return color;
}

export async function CrateLinerAnimation(initial: number, end: number, time: number, onFrameChange: (progres: number) => any) {
    let incrementer = (end - initial) / (time / 16);

    for (let progres = initial; progres < end; progres += incrementer) {
        onFrameChange(progres);
        await sleep(16);
    }
}