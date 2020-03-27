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
  HTML: HTMLDivElement;
  HTML_LabelForInput: HTMLLabelElement;
  HTML_PercentageSpan: HTMLSpanElement;
  constructor(id?: string, HTMLInput = document.createElement('label')) {
    this.HTML = document.createElement('div');
    this.HTML.classList.add('AddUpdateFileIcondiv');

    this.HTML_LabelForInput = HTMLInput;
    this.HTML_LabelForInput.classList.add('AddUpdateFileIcon');
    this.HTML_LabelForInput.classList.add('Default');
    this.HTML_LabelForInput.htmlFor = id || HTMLInput.id;
    this.HTML.appendChild(this.HTML_LabelForInput);

    this.HTML_PercentageSpan = document.createElement('span');
    this.HTML_PercentageSpan.classList.add('PercentageSpan');
    this.HTML.appendChild(this.HTML_PercentageSpan);
  }
  setDefault() {
    this.HTML_LabelForInput.classList.remove('Upgradeable');
    this.HTML_LabelForInput.classList.remove('InUpload');
    this.HTML_LabelForInput.classList.add('Default');
  }
  setUpgradeable() {
    this.HTML_LabelForInput.classList.remove('Default')
    this.HTML_LabelForInput.classList.remove('InUpload');
    this.HTML_LabelForInput.classList.add('Upgradeable');

    this.HTML_LabelForInput.style.backgroundImage = '';
    this.HTML_PercentageSpan.style.display = 'none';
  }
  setInUpload() {
    this.HTML_LabelForInput.classList.remove('Default')
    this.HTML_LabelForInput.classList.remove('Upgradeable');
    this.HTML_LabelForInput.classList.add('InUpload');

    this.HTML_LabelForInput.style.backgroundImage = '';
    this.HTML_PercentageSpan.style.display = 'none';
  }
  UploadPorcentage: number
  setUploadPorcentage(UploadPorcentage: number) {
    if (this.UploadPorcentage !== UploadPorcentage) {
      this.UploadPorcentage = UploadPorcentage;
      this.HTML_LabelForInput.style.backgroundImage = `url(../configurator/images/circle.png), conic-gradient(rgb(255, 255, 255) 3% ,#fff ${this.UploadPorcentage}% ,rgb(0, 102, 255) ${this.UploadPorcentage + 2}% )`;
      this.HTML_PercentageSpan.innerText = Math.round(UploadPorcentage)+'%';
      this.HTML_PercentageSpan.style.display = '';
    }
  }
}