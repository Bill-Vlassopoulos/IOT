import bcrypt from "bcrypt";

import * as userModel from "../model/admin-sqlite.mjs";

export let doLogin = async function (req, res) {
  try {
    const user = await userModel.getUserByUsername(req.body.username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
      //console.log("User not found");
    } else {
      const plainTextPassword = req.body.password;
      const hashedPassword = user.password.toString();

      const match = await bcrypt.compare(plainTextPassword, hashedPassword);
      if (match) {
        req.session.loggedUserId = user.id;
        req.session.save((err) => {
          if (err) {
            return res.status(404).json({ message: "User not found" });
            //console.error("Session save error:", err);
          } else {
            // console.log(
            //   "Session loggedUserId set to:",
            //   req.session.loggedUserId
            // );
            return res.status(200).json({ message: "Logged in" });
          }
        });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
        //console.log("Wrong password");
      }
    }
  } catch (error) {
    //console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export let checkAuthenticated = function (req, res, next) {
  if (req.session.loggedUserId) {
    next();
  } else {
    if (req.originalUrl === "/login") {
      next();
    } else {
      //   res.render("admin-login", {
      //     layout: "admin",
      //     css: cssFilePath,
      //     message: "Συνδεθείτε για να έχετε πρόσβαση",
      //   });}

      console.log("Sign in to access");
    }
  }
};

export let doLogout = (req, res) => {
  //Σημειώνουμε πως ο χρήστης δεν είναι πια συνδεδεμένος
  req.session.destroy();
  res.redirect("/signin");
};
