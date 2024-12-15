import session from "express-session";

const taskListSession = session({
  secret: "mySecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});

export default taskListSession;
