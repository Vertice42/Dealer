/**
 * Contains the necessary texts for an html element
 * @param id: id of HTML Element
 * @param Text: Text to be added in inner HTML
 * @param Instruction: Text to be added in html for the purpose of guiding
 */
export class LocalizedText {
    id: string;
    Text: string;
    Instruction: string;

    constructor(id: string, Text: string, Instruction: string) {
        this.id = id;
        this.Text = Text;
        this.Instruction = Instruction;
    }
}
/**
 * Support language changes
 */
export class LocalizedTexts {
    private LocalizedTexts: LocalizedText[] = [];
    private Listeners = [];

    public update(LocalizedTexts: LocalizedText[]) {
        LocalizedTexts.forEach(localizedText => {
            this.LocalizedTexts[localizedText.id] = localizedText;
        });
        this.Listeners.forEach(Listener => Listener());
    }

    public get(id: string): string {
        return (this.LocalizedTexts[id]) ? this.LocalizedTexts[id].Text : '';
    }

    public getInstruction(id: string): string {
        return (this.LocalizedTexts[id]) ? this.LocalizedTexts[id].Instruction : '';
    }

    public set onLocaleChange(Listener: () => any) {
        this.Listeners.push(Listener);
        Listener();
    }

    constructor(LocalizedTexts: LocalizedText[]) {
        this.update(LocalizedTexts);
    }
}

/**
 * Include text in All hard HTML code
 */
export function InsertTextInHardCode(LocaleFiles: LocalizedText[]) {
    LocaleFiles.forEach(localeFile => {
        let HTML_Element = document.getElementById(localeFile.id);
        HTML_Element.innerHTML = localeFile.Text;
        HTML_Element.title = localeFile.Instruction;
    });
}