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
  constructor(HTMLInput?: HTMLInputElement) {
    if (HTMLInput) {
      this.HTMLInput = HTMLInput;
    } else {
      this.HTMLInput = document.createElement('input');
    }
  }
}

export class OrientedInput extends ResponsiveInput {
  private Type: string;

  setUsed() {
    this.HTMLInput.type = this.Type;

    this.HTMLInput.classList.add('InputUsed');
    this.HTMLInput.classList.remove('InputNotUsed');
  }
  setNotUsed() {
    this.HTMLInput.classList.add('UnchangedInput');
    this.HTMLInput.classList.add('InputNotUsed');
  }
  constructor(Guidance: string, Type: string, ClassCSS: string) {
    super(<HTMLInputElement>document.createElement('input'));
    this.Type = Type;
    this.HTMLInput.classList.add(ClassCSS);

    if (Type === 'number') {
      this.HTMLInput.maxLength = 7;
      this.HTMLInput.max = '9999999';
    }

    this.HTMLInput.type = 'text';
    this.setNotUsed();
    this.HTMLInput.value = Guidance;//TODO ADD TRALATE

    this.HTMLInput.addEventListener('focusout', () => {
      if (this.HTMLInput.value === '') {
        this.HTMLInput.type = 'text';
        this.HTMLInput.classList.add('InputNotUsed');
        this.HTMLInput.classList.remove('InputUsed');
        this.HTMLInput.value = Guidance;//ADD TRALATE
      }
    });
    this.HTMLInput.onfocus = () => {
      if (this.HTMLInput.classList.contains('InputNotUsed')) {
        this.HTMLInput.type = Type;
        window.Twitch.ext.rig.log(this.HTMLInput.type);

        this.setUsed();
        this.HTMLInput.value = '';
      }
    }
  }
}

export class ResponsiveLabelForInputFile {
  HTMLInput: HTMLLabelElement;
  constructor(id?: string, HTMLInput = document.createElement('label')) {
    this.HTMLInput = HTMLInput;
    this.HTMLInput.classList.add('AddUpdateFileIcon');
    this.HTMLInput.classList.add('Default');
    this.HTMLInput.htmlFor = id || HTMLInput.id;
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