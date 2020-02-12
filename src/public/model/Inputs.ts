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
    constructor(HTMLInput: HTMLInputElement){
        this.HTMLInput = HTMLInput;
    }
}

export class OrientedInput implements ResponsiveInput {
  public HTMLInput: HTMLInputElement;
  setChangedInput(): void {
    throw new Error("Method not implemented.");
  }
  setUnchangedInput(): void {
    throw new Error("Method not implemented.");
  }
  setInputSentSuccessfully(): void {
    throw new Error("Method not implemented.");
  }
  setInputSentError(): void {
    throw new Error("Method not implemented.");
  }
  constructor(Guidance:string,type:string) {
    this.HTMLInput = <HTMLInputElement> document.createElement('input');

    this.HTMLInput.setAttribute('type', 'text');
    this.HTMLInput.classList.add('UnchangedInput');

    this.HTMLInput.classList.add('InputNotUsed');
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
      this.HTMLInput.setAttribute('type', type);
      this.HTMLInput.classList.add('InputUsed');
      this.HTMLInput.classList.remove('InputNotUsed');
      this.HTMLInput.value = '';
    }
  }
}