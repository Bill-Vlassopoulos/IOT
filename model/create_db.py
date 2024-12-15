from sqlite3 import *

con = connect("model/admins.sqlite3")
cur = con.cursor()

cur.execute(
    "CREATE TABLE admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
)


cur.execute("""INSERT INTO admins (username, password) VALUES ('admin', 'admin')""")


con.commit()
con.close()
