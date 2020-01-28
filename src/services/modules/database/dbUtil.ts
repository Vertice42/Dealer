import { Sequelize } from "sequelize/types";

export function getTableName(table , id: number) {
    for (var k in table[id]) if (table[id].hasOwnProperty(k)) return table[id][k];
}

export async function RenameTable(db: Sequelize, TableName: string, NewTableName: string) {
    return db.query("RENAME TABLE " + TableName + " TO " + NewTableName);
}
