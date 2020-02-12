"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponsiveInput {
    constructor(HTMLInput) {
        this.HTMLInput = HTMLInput;
    }
    setChangedInput() {
        this.HTMLInput.classList.remove('InputSentSuccessfully');
        this.HTMLInput.classList.remove('UnchangedInput');
        this.HTMLInput.classList.remove('InputSentError');
        this.HTMLInput.classList.add('ChangedInput');
    }
    setUnchangedInput() {
        this.HTMLInput.classList.remove('InputSentSuccessfully');
        this.HTMLInput.classList.remove('ChangedInput');
        this.HTMLInput.classList.remove('InputSentError');
        this.HTMLInput.classList.add('UnchangedInput');
    }
    setInputSentSuccessfully() {
        this.HTMLInput.classList.remove('ChangedInput');
        this.HTMLInput.classList.remove('UnchangedInput');
        this.HTMLInput.classList.remove('InputSentError');
        this.HTMLInput.classList.add('InputSentSuccessfully');
    }
    setInputSentError() {
        this.HTMLInput.classList.remove('InputSentSuccessfully');
        this.HTMLInput.classList.remove('ChangedInput');
        this.HTMLInput.classList.remove('ChangedInput');
        this.HTMLInput.classList.add('InputSentError');
    }
}
exports.ResponsiveInput = ResponsiveInput;
class OrientedInput {
    constructor(Guidance, type) {
        this.HTMLInput = document.createElement('input');
        this.HTMLInput.setAttribute('type', 'text');
        this.HTMLInput.classList.add('UnchangedInput');
        this.HTMLInput.classList.add('InputNotUsed');
        this.HTMLInput.value = Guidance; //TODO ADD TRALATE
        this.HTMLInput.addEventListener('focusout', () => {
            if (this.HTMLInput.value === '') {
                this.HTMLInput.setAttribute('type', 'text');
                this.HTMLInput.classList.add('InputNotUsed');
                this.HTMLInput.classList.remove('InputUsed');
                this.HTMLInput.value = Guidance; //ADD TRALATE
            }
        });
        this.HTMLInput.onfocus = () => {
            this.HTMLInput.setAttribute('type', type);
            this.HTMLInput.classList.add('InputUsed');
            this.HTMLInput.classList.remove('InputNotUsed');
            this.HTMLInput.value = '';
        };
    }
    setChangedInput() {
        throw new Error("Method not implemented.");
    }
    setUnchangedInput() {
        throw new Error("Method not implemented.");
    }
    setInputSentSuccessfully() {
        throw new Error("Method not implemented.");
    }
    setInputSentError() {
        throw new Error("Method not implemented.");
    }
}
exports.OrientedInput = OrientedInput;
