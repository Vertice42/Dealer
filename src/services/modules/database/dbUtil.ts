import { Sequelize, Model } from "sequelize/types";

export function getTableName(table , id: number) {
    for (var k in table[id]) if (table[id].hasOwnProperty(k)) return table[id][k];
}

export async function getMaxIDOfTable(table: typeof Model){
    return Object.values((await table.sequelize.query(`SELECT MAX(ID) FROM ${table.tableName}`))[0][0])[0] || 0
}

export async function RenameTable(db: Sequelize, TableName: string, NewTableName: string) {
    return db.query("RENAME TABLE " + TableName + " TO " + NewTableName);
}
