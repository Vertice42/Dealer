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
export function IncertTextInHardCode(LocaleFiles: LocalizedText[]) {
    LocaleFiles.forEach(LocaleFile => {
        let HTML_Element = document.getElementById(LocaleFile.id);
        HTML_Element.innerHTML = LocaleFile.Text;
        HTML_Element.title = LocaleFile.Instruction;
        /*
        if(LocaleFile.Instruction !== "")
        HTML_Element.parentElement.setAttribute('aria-label',LocaleFile.Instruction);     
        */
    });
}

export class LocalizedTexts {
    private Texts: string[] = [];
    private Listerners = [];

    update(LocalizedTexts: LocalizedText[]) {
        LocalizedTexts.forEach(localizedText => {
            this.Texts[localizedText.id] = localizedText.Text;
        });        
        this.Listerners.forEach(Listerner => Listerner());
    }

    constructor(LocalizedTexts: LocalizedText[]) {
        this.update(LocalizedTexts);
    }

    public get(id: string): string {
        return this.Texts[id];
    }


    public set onLocaleChange(Listerner: () => any) {
        this.Listerners.push(Listerner);
        Listerner();
    }

}