"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UpdateButtonGroupResult {
    constructor(CreatedButtons, UpdatedButtons, DeletedButtons) {
        this.CreatedButtons = CreatedButtons;
        this.UpdatedButtons = UpdatedButtons;
        this.DeletedButtons = DeletedButtons;
    }
}
exports.default = UpdateButtonGroupResult;
