'use strict';
import db from 'better-sqlite3'
const sql = new db('model/admins.sqlite', { fileMustExist: true });


export function getalljunctions() {
    const stmt = sql.prepare("SELECT * FROM junction");
    return stmt.all();
}

export function gettrafficlights(id_diastaurosis) {
    const stmt = sql.prepare("SELECT * FROM trafficlight WHERE id_diastaurosis = ?");
    return stmt.all(id_diastaurosis);

}

