"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponsiveInput {
    constructor(HTMLInput) {
        if (HTMLInput) {
            this.HTMLInput = HTMLInput;
        }
        else {
            this.HTMLInput = document.createElement('input');
        }
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
class OrientedInput extends ResponsiveInput {
    setUsed() {
        this.HTMLInput.classList.add('InputUsed');
        this.HTMLInput.classList.remove('InputNotUsed');
    }
    setNotUsed() {
        this.HTMLInput.classList.add('UnchangedInput');
        this.HTMLInput.classList.add('InputNotUsed');
    }
    constructor(Guidance, type, ClassCSS) {
        super(document.createElement('input'));
        this.HTMLInput.classList.add(ClassCSS);
        this.HTMLInput.setAttribute('type', 'text');
        this.setNotUsed();
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
            if (this.HTMLInput.classList.contains('InputNotUsed')) {
                this.HTMLInput.setAttribute('type', type);
                this.setUsed();
                this.HTMLInput.value = '';
            }
        };
    }
}
exports.OrientedInput = OrientedInput;
class ResponsiveInputFile {
    constructor(id) {
        this.HTMLInput = document.createElement('label');
        this.HTMLInput.classList.add('AddUpdateFileIcon');
        this.HTMLInput.classList.add('Default');
        this.HTMLInput.htmlFor = id;
    }
    setDefault() {
        this.HTMLInput.classList.remove('Upgradeable');
        this.HTMLInput.classList.remove('InUpload');
        this.HTMLInput.classList.add('Default');
    }
    setUpgradeable() {
        this.HTMLInput.classList.remove('Default');
        this.HTMLInput.classList.remove('InUpload');
        this.HTMLInput.classList.add('Upgradeable');
    }
    setInUpload() {
        this.HTMLInput.classList.remove('Default');
        this.HTMLInput.classList.remove('Upgradeable');
        this.HTMLInput.classList.add('InUpload');
    }
}
exports.ResponsiveInputFile = ResponsiveInputFile;
