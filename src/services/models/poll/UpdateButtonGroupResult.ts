export default class UpdateButtonGroupResult {
    CreatedButtons: number
    UpdatedButtons: number
    DeletedButtons: number

    constructor(CreatedButtons: number,UpdatedButtons: number,DeletedButtons: number, ) {
        this.CreatedButtons = CreatedButtons;
        this.UpdatedButtons = UpdatedButtons;
        this.DeletedButtons = DeletedButtons;
    }
}