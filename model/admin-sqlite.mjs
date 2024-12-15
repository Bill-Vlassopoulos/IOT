"use strict";

import { Database } from "sqlite-async";

let sql;
try {
  sql = await Database.open("model/admins.sqlite3");
} catch (error) {
  throw Error("Δεν ήταν δυνατό να ανοίξει η βάση δεδομένων." + error);
}

export let findUserByUsernamePassword = async (username, password) => {
  //Φέρε μόνο μια εγγραφή (το LIMIT 0, 1) που να έχει username και password ίσο με username και password
  const stmt = await sql.prepare(
    "SELECT username FROM admins WHERE username = ? and password = ? LIMIT 0, 1"
  );
  try {
    const user = await stmt.all(username, password);
  } catch (err) {
    throw err;
  }
};

/* Επιστρέφει τον χρήστη με όνομα 'username'*/
export let getUserByUsername = async (username) => {
  const stmt = await sql.prepare(
    "SELECT id, username, password FROM admins WHERE username = ? LIMIT 0, 1"
  );
  try {
    const user = await stmt.all(username);
    return user[0];
  } catch (err) {
    throw err;
  }
};
