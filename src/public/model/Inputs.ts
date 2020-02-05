export class InputNumber {
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