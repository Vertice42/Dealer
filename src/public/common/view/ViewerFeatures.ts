import { sleep } from "../../../utils/functions";
/**
 * Allows the ability to allocate to an element with absolute position.
 * The start position must be inserted in the constructor together to the element.
 */
export class DivRelocatable {
    private Element: HTMLElement;

    private X: number;
    private Y: number;

    private enable = false;

    private onmousemove = (event: MouseEvent) => {
        let newX = this.X + event.movementX;
        let newY = this.Y + event.movementY;

        if (newX > 0 && newX < document.body.offsetWidth - this.Element.offsetWidth &&
            newY > 0 && newY < document.body.offsetHeight - this.Element.offsetHeight) {
            this.X = newX;
            this.Y = newY;

            this.Element.style.left = this.X + 'px';
            this.Element.style.top = this.Y + 'px';

            localStorage[this.Element.id + 'X'] = this.X;
            localStorage[this.Element.id + 'Y'] = this.Y;
        }
    }
    private onmousedown = () => {
        this.Element.style.cursor = 'grabbing';

        this.X = this.Element.offsetLeft;
        this.Y = this.Element.offsetTop;

        this.Element.addEventListener('mousemove', this.onmousemove);
    }
    private onmouseleave = () => {
        this.Element.style.cursor = 'default';
        this.Element.removeEventListener('mousemove', this.onmousemove);
    }
    private onmouseup = () => {
        this.Element.style.cursor = 'default';
        this.Element.removeEventListener('mousemove', this.onmousemove);
    }

    Enable(StartingLocationX = 0, StartingLocationY = 0) {
        if (!this.enable) {
            this.enable = true;

            this.X = localStorage[this.Element.id + 'X'] || StartingLocationX;
            this.Y = localStorage[this.Element.id + 'Y'] || StartingLocationY;

            this.Element.style.left = this.X + 'px';
            this.Element.style.top = this.Y + 'px';

            this.Element.addEventListener('mousedown', this.onmousedown);
            this.Element.addEventListener('mouseleave', this.onmouseleave);
            this.Element.addEventListener('mouseup', this.onmouseup);
        }
    }

    Disable() {
        this.enable = false;

        this.Element.removeEventListener('mousedown', this.onmousedown);
        this.Element.removeEventListener('mouseleave', this.onmouseleave);
        this.Element.removeEventListener('mouseup', this.onmouseup);
    }

    constructor(Element: HTMLElement, StartingLocationX: number, StartingLocationY: number) {
        this.Element = Element;
        this.Enable(StartingLocationX, StartingLocationY);
    }
}


/**
 * Hide the element if the mouse is not moved and reactivate it if it moves again for a specified time
 * 
 * @param FatherElement : The element to determine the area where the movement for shows the element to be shown again
 * @param Element :Element to hide
 * @param Time :Time for mouse to remain still before the element is hidden
 */
export class AutomaticHidingDueInactivity {
    private Action = true;
    private Elements: HTMLElement[];
    private WaitingTime: number;

    public async show(permanently: boolean, WaitingTime = this.WaitingTime) {
        if (this.Action) {
            this.Action = false;

            this.Elements.forEach(async Element => {
                if (!Element.classList.contains('Visible')) {
                    Element.classList.add('Visible');
                }
            });

            await sleep(WaitingTime);
            this.Action = true;

            if (!permanently) {
                this.Elements.forEach(async Element => {
                    if (Element.classList.contains('Visible'))
                        Element.classList.remove('Visible');
                });
            }
        }
    }

    constructor(FatherElement: HTMLElement, Element: HTMLElement[], Time = 500) {
        this.Elements = Element;
        this.WaitingTime = Time;

        FatherElement.addEventListener('mousemove', async (event) => this.show(false));
        FatherElement.addEventListener('click', async (event) => this.show(false));

    }
}

/**
 * Generates a hexadecimal number for a random color
 */
export function GenerateColor() {
    /**Generate random hex color*/
    var hexadecimal = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += hexadecimal[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Create a linear animation to create a transition
 * @param initial :Initial transition value
 * @param end : End transition value
 * @param time : Transition time
 * @param onFrameChange : Listener for transition frames
 */
export async function CrateLinerAnimation(initial: number, end: number, time: number, onFrameChange: (progress: number) => any) {
    let i = (end - initial) / (time / 16);

    for (let progress = initial; progress < end; progress += i) {
        onFrameChange(progress);
        await sleep(16);
    }
}