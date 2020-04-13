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
    private Listerners = [];

    public update(LocalizedTexts: LocalizedText[]) {
        LocalizedTexts.forEach(localizedText => {
            this.LocalizedTexts[localizedText.id] = localizedText;
        });        
        this.Listerners.forEach(Listerner => Listerner());
    }

    public getText(id: string): string {
        return this.LocalizedTexts[id].Text;
    }

    public getInstruction(id: string): string {
        return this.LocalizedTexts[id].Instruction;
    }

    public set onLocaleChange(Listerner: () => any) {
        this.Listerners.push(Listerner);
        Listerner();
    }

    constructor(LocalizedTexts: LocalizedText[]) {
        this.update(LocalizedTexts);
    }
}

/**
 * Include text in All hard HTML code
 */
export function InsertTextInHardCode(LocaleFiles: LocalizedText[]) {
    LocaleFiles.forEach(LocaleFile => {
        let HTML_Element = document.getElementById(LocaleFile.id);
        HTML_Element.innerHTML = LocaleFile.Text;
        HTML_Element.title = LocaleFile.Instruction;
    });
}