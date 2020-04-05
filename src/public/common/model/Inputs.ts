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
  constructor(HTMLInput: HTMLInputElement) {
    this.HTMLInput = HTMLInput;
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
  HTML_InputFile: HTMLInputElement;
  constructor(id: string) {
    this.HTML = document.createElement('div');

    this.HTML_InputFile = document.createElement('input');
    this.HTML_InputFile.setAttribute('type', 'file');
    this.HTML_InputFile.classList.add('inputfile');
    this.HTML_InputFile.name = 'file';
    this.HTML_InputFile.accept = '.mp3,.wav';
    this.HTML_InputFile.id = id;
    this.HTML.appendChild(this.HTML_InputFile);

    this.HTML_LabelForInput = document.createElement('label')
    this.HTML.classList.add('AddUpdateFileIcondiv');
    this.HTML_LabelForInput = document.createElement('label')
    this.HTML_LabelForInput.classList.add('AddUpdateFileIcon');
    this.HTML_LabelForInput.classList.add('Default');
    this.HTML_LabelForInput.htmlFor = id;
    this.HTML_InputFile.addEventListener('focus', () => {
      this.HTML_LabelForInput.classList.add('AddUpdateFileIconInfocus');
    })
    this.HTML_InputFile.addEventListener('focusout', () => {
      this.HTML_LabelForInput.classList.remove('AddUpdateFileIconInfocus');
    })

    this.HTML.appendChild(this.HTML_LabelForInput);

    this.HTML_PercentageSpan = document.createElement('span');
    this.HTML_PercentageSpan.classList.add('PercentageSpan');
    this.HTML.appendChild(this.HTML_PercentageSpan);
  }
  setDefault() {
    this.HTML_LabelForInput.classList.remove('Upgradeable');
    this.HTML_LabelForInput.classList.remove('InUpload');
    this.HTML_LabelForInput.classList.add('Default');
    this.HTML_PercentageSpan.style.display = 'none';
  }

  setUpgradeable() {
    this.HTML_LabelForInput.classList.remove('Default')
    this.HTML_LabelForInput.classList.remove('InUpload');
    this.HTML_LabelForInput.classList.add('Upgradeable');

    this.HTML_PercentageSpan.style.display = 'none';
    this.HTML_LabelForInput.style.backgroundImage = '';
  }

  setInUpload() {
    this.HTML_LabelForInput.classList.remove('Default')
    this.HTML_LabelForInput.classList.remove('Upgradeable');
    this.HTML_LabelForInput.classList.add('InUpload');

    this.HTML_PercentageSpan.style.display = '';
  }
  UploadPorcentage: number
  setUploadPorcentage(UploadPorcentage: number) {
    if (this.UploadPorcentage !== UploadPorcentage) {
      this.UploadPorcentage = UploadPorcentage;
      this.HTML_LabelForInput.style.backgroundImage = `url(../configurator/images/circle.png), conic-gradient(rgb(255, 255, 255) 3% ,#fff ${this.UploadPorcentage}% ,rgb(0, 102, 255) ${this.UploadPorcentage + 2}% )`;
      this.HTML_PercentageSpan.innerText = Math.round(UploadPorcentage) + '%';
    }
  }
}