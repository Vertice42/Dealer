export class ResponsiveInput {
  public HTMLInput: HTMLInputElement;
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
  constructor(HTMLInput ?: HTMLInputElement) {
    if(HTMLInput){
          this.HTMLInput = HTMLInput;
    }else{
      this.HTMLInput = document.createElement('input');
    }
  }
}

export class OrientedInput extends ResponsiveInput {
  setUsed() {
    this.HTMLInput.classList.add('InputUsed');
    this.HTMLInput.classList.remove('InputNotUsed');
  }
  setNotUsed() {
    this.HTMLInput.classList.add('UnchangedInput');
    this.HTMLInput.classList.add('InputNotUsed');
  }
  constructor(Guidance: string, type: string, ClassCSS: string) {

    super(<HTMLInputElement>document.createElement('input'));
    this.HTMLInput.classList.add(ClassCSS)

    this.HTMLInput.setAttribute('type', 'text');
    this.setNotUsed();
    this.HTMLInput.value = Guidance;//TODO ADD TRALATE

    this.HTMLInput.addEventListener('focusout', () => {
      if (this.HTMLInput.value === '') {
        this.HTMLInput.setAttribute('type', 'text');
        this.HTMLInput.classList.add('InputNotUsed');
        this.HTMLInput.classList.remove('InputUsed');
        this.HTMLInput.value = Guidance;//ADD TRALATE
      }
    })
    this.HTMLInput.onfocus = () => {
      if (this.HTMLInput.classList.contains('InputNotUsed')) {
        this.HTMLInput.setAttribute('type', type);
        this.setUsed();
        this.HTMLInput.value = '';
      }
    }

  }
}

export class ResponsiveInputFile {
  HTMLInput: HTMLLabelElement;
  constructor(id: string) {
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
    this.HTMLInput.classList.remove('Default')
    this.HTMLInput.classList.remove('InUpload');
    this.HTMLInput.classList.add('Upgradeable');
  }
  setInUpload() {
    this.HTMLInput.classList.remove('Default')
    this.HTMLInput.classList.remove('Upgradeable');
    this.HTMLInput.classList.add('InUpload');
  }
}