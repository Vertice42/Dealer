"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getTableName(table, id) {
    for (var k in table[id])
        if (table[id].hasOwnProperty(k))
            return table[id][k];
}
exports.getTableName = getTableName;
async function RenameTable(db, TableName, NewTableName) {
    return db.query("RENAME TABLE " + TableName + " TO " + NewTableName);
}
exports.RenameTable = RenameTable;
