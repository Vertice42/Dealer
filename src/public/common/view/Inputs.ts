/**
 * An input that can give visual feedback to the user about the action
 */
export class ResponsiveInput {
  public HTML: HTMLInputElement;
  setChangedInput() {
    this.HTML.classList.remove('InputSentSuccessfully');
    this.HTML.classList.remove('UnchangedInput');
    this.HTML.classList.remove('InputSentError');

    this.HTML.classList.add('ChangedInput');
  }
  setUnchangedInput() {
    this.HTML.classList.remove('InputSentSuccessfully');
    this.HTML.classList.remove('ChangedInput');
    this.HTML.classList.remove('InputSentError');

    this.HTML.classList.add('UnchangedInput');
  }
  setInputSuccessfully() {
    this.HTML.classList.remove('ChangedInput');
    this.HTML.classList.remove('UnchangedInput');
    this.HTML.classList.remove('InputSentError');

    this.HTML.classList.add('InputSentSuccessfully');
  }
  setInputError() {
    this.HTML.classList.remove('InputSentSuccessfully');
    this.HTML.classList.remove('ChangedInput');
    this.HTML.classList.remove('ChangedInput');

    this.HTML.classList.add('InputSentError');
  }
  constructor(HTML_Input: HTMLInputElement) {
    this.HTML = HTML_Input;
  }
}

/**
 * An input with an orientation of what should be imputed, 
 * the orientation is only visible when the value of the input is empty
 * 
 * @param Type : HTML input type
 * @param ClassCSS : The CSS class of the input
 * @param maxLength : Maximum number of characters || Default = 7
 * @param min : minimum value || Default = 0
 * @param max : maximum value || Default = 9999999
 */
export class OrientedInput extends ResponsiveInput {
  private Type: string;
  private _Guidance = '';

  private setUsed() {
    this.HTML.type = this.Type;

    this.HTML.classList.add('InputUsed');
    this.HTML.classList.remove('InputNotUsed');
  }
  private setNotUsed() {
    this.HTML.classList.add('UnchangedInput');
    this.HTML.classList.add('InputNotUsed');
  }


  public get value(): string {
    return this.HTML.value;
  }

  public set value(v: string) {
    this.HTML.value = v;
    this.setUsed();
  }

  public get Guidance(): string {
    return this._Guidance;
  }

  public set Guidance(value: string) {
    this._Guidance = value;
    if (this.HTML.value === '') {
      this.HTML.value = this.Guidance;
      this.setNotUsed();
    }
  }

  constructor(Type: string, ClassCSS = '', maxLength = 7, min = '0', max = '9999999') {
    super(<HTMLInputElement>document.createElement('input'));
    this.Type = Type;
    this.HTML.classList.add(ClassCSS);

    this.HTML.maxLength = maxLength;
    this.HTML.min = min
    this.HTML.max = max;

    this.HTML.type = 'text';

    this.HTML.addEventListener('focusout', () => {
      if (this.HTML.value === '') {
        this.HTML.type = 'text';
        this.HTML.classList.add('InputNotUsed');
        this.HTML.classList.remove('InputUsed');
        this.HTML.value = this.Guidance;
      }
    });

    this.HTML.onfocus = () => {
      if (this.HTML.classList.contains('InputNotUsed')) {
        this.HTML.type = Type;

        this.setUsed();
        this.HTML.value = '';
      }
    }
  }
}

/**
 * It is a visual entry that overlays the actual entry so 
 * you can show the status associated with it
 */
export class ResponsiveInputFile {
  HTML: HTMLDivElement;
  HTML_LabelForInput: HTMLLabelElement;
  HTML_PercentageSpan: HTMLSpanElement;
  HTML_InputFile: HTMLInputElement;

  UploadPercentage: number

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

  setUploadPercentage(UploadPercentage: number) {
    if (this.UploadPercentage !== UploadPercentage) {
      this.UploadPercentage = UploadPercentage;
      this.HTML_LabelForInput.style.backgroundImage = `url(../configurator/images/circle.png), conic-gradient(rgb(255, 255, 255) 3% ,#fff ${this.UploadPercentage}% ,rgb(0, 102, 255) ${this.UploadPercentage + 2}% )`;
      this.HTML_PercentageSpan.innerText = Math.round(UploadPercentage) + '%';
    }
  }

  constructor(id: string, accept: string) {
    this.HTML = document.createElement('div');

    this.HTML_InputFile = document.createElement('input');
    this.HTML_InputFile.setAttribute('type', 'file');
    this.HTML_InputFile.classList.add('InputFile');
    this.HTML_InputFile.name = 'file';
    this.HTML_InputFile.accept = accept;
    this.HTML_InputFile.id = id;
    this.HTML.appendChild(this.HTML_InputFile);

    this.HTML_LabelForInput = document.createElement('label')
    this.HTML.classList.add('AddUpdateFileIconDiv');
    this.HTML_LabelForInput = document.createElement('label')
    this.HTML_LabelForInput.classList.add('AddUpdateFileIcon');
    this.HTML_LabelForInput.classList.add('Default');
    this.HTML_LabelForInput.htmlFor = id;

    this.HTML_InputFile.addEventListener('focus', () => {
      this.HTML_LabelForInput.classList.add('AddUpdateFileIconInFocus');
    })
    this.HTML_InputFile.addEventListener('focusout', () => {
      this.HTML_LabelForInput.classList.remove('AddUpdateFileIconInFocus');
    })
    this.HTML.appendChild(this.HTML_LabelForInput);


    this.HTML_PercentageSpan = document.createElement('span');
    this.HTML_PercentageSpan.classList.add('PercentageSpan');
    this.HTML.appendChild(this.HTML_PercentageSpan);
  }
}