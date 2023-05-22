import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "../db/index.mjs";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      await db.read();
      const user = profile._json;
      const dataUser = await db.data.users.find(
        (e) => e.email === user.email && e.id === user.sub
      );
      if (dataUser) {
        return cb(null, dataUser);
      } else if (!dataUser) {
        db.data.users.push({
          id: user.sub,
          user: user.name,
          email: user.email,
          picture:
            user.picture ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xwmXA30O0RMJuturWCgjsMvZDlg7Jzim93BIJ9MgL1PWJMlFwGxCCFpOQUpx5EflMg&usqp=CAU",
          auth: "google",
        });
        await db.write();
        cb(null, user);
      }
    }
  )
);

passport.use(
  new LocalStrategy({ usernameField: "email" }, async function verify(
    email,
    password,
    done
  ) {
    await db.read();
    const users = db.data.users.find(
      (e) => e.email === email && e.password === password
    );
    if (!users) {
      return done("Incorrect user or password", false);
    }
    done(null, users);
  })
);

passport.serializeUser((user, done) => {
  done(null, { id: user.id });
});
passport.deserializeUser((user, done) => {
  done(null, { id: user.id });
});

router.get("/register", (req, res) => {
  res.render("views/register");
});

router.post("/register", async (req, res, next) => {
  try {
    await db.read();
    const data = db.data.users?.find((e) => e.email === req.body.email);

    if (data) {
      return next("Incorrect user or password", false);
    }

    db.data.users?.push({
      id: randomUUID(),
      user: req.body.firstName,
      email: req.body.email,
      password: req.body.password,
      picture:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm2xwmXA30O0RMJuturWCgjsMvZDlg7Jzim93BIJ9MgL1PWJMlFwGxCCFpOQUpx5EflMg&usqp=CAU",
      auth: "local",
    });
    await db.write();
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
});
router.get("/login", async (req, res) => {
  res.render("views/login");
});
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
export default router;
