from sqlite3 import *
import bcrypt

con = connect("model/admins.sqlite")
cur = con.cursor()

cur.execute(
    "CREATE TABLE admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
)

cur.execute(
    "CREATE TABLE junction(id_diastaurosis INTEGER PRIMARY KEY AUTOINCREMENT, latitute REAL, longitude REAL)"
)

cur.execute(
    """CREATE TABLE traffic_light(
    id_traffic_light INTEGER,
    id_diastaurosis INTEGER,
    latitute REAL,
    longitude REAL,
    date TEXT,
    time TEXT,
    waiting_cars INTEGER,
    violations INTEGER, 
    PRIMARY KEY (id_traffic_light, id_diastaurosis, date, time),
    FOREIGN KEY (id_diastaurosis) REFERENCES junction(id_diastaurosis))"""
)


# cur.execute("""INSERT INTO admins (username, password) VALUES ('admin', 'admin')""")

cur.execute(
    "INSERT INTO admins(username, password) VALUES (?, ?)",
    ("admin", bcrypt.hashpw("admin".encode("utf-8"), bcrypt.gensalt())),
)

con.commit()
con.close()
