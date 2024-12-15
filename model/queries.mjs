'use strict';
import db from 'better-sqlite3'
const sql = new db('model/admins.sqlite', { fileMustExist: true });


export function getalljunctions() {
    const stmt = sql.prepare("SELECT * FROM junction");
    return stmt.all();
}

export function gettrafficlights(id_diastaurosis) {
    const stmt = sql.prepare("SELECT DISTINCT id_traffic_light, latitute, longitude FROM traffic_light WHERE id_diastaurosis = ?");
    return stmt.all(id_diastaurosis);

}

export function getlasttrafficInfo(id_diastaurosis, id_traffic_light) {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const stmt = sql.prepare("SELECT * FROM traffic_light WHERE id_diastaurosis = ? AND id_traffic_light = ? AND date = ? ORDER BY time ASC");
    return stmt.all(id_diastaurosis, id_traffic_light, currentDate);
}

