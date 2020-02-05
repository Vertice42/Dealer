"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InputNumber {
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
exports.InputNumber = InputNumber;
