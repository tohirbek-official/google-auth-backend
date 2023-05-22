import express from "express";
import dotenv from "dotenv";
import auth from "./router/auth.mjs";
import indexRouter from "./router/index.mjs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "database",
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true },
    resave: false,
    saveUninitialized: false,
  })
);
const __dirname = dirname(fileURLToPath(import.meta.url));
app.set("view engine", "ejs");
app.set("views", __dirname, "views");
app.use(passport.authenticate("session"));
app.use(auth);
app.use(indexRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server started  on port " + PORT));
