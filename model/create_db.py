from sqlite3 import *
import bcrypt

con = connect("model/admins.sqlite3")
cur = con.cursor()

cur.execute(
    "CREATE TABLE admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
)


# cur.execute("""INSERT INTO admins (username, password) VALUES ('admin', 'admin')""")

cur.execute(
        "INSERT INTO admins(username, password) VALUES (?, ?)",
        ("admin", bcrypt.hashpw("admin".encode("utf-8"), bcrypt.gensalt())),
    )
con.commit()
con.close()
