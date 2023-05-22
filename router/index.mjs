import express from "express";
import { ensureLoggedIn } from "connect-ensure-login";
import db from "../db/index.mjs";
const router = express.Router();

router.get("/", ensureLoggedIn("/login"), async function (req, res) {
  await db.read();
  const data = db.data.users.find((e) => e.id == req.session.passport.user.id);
  res.render("views/index", { picture: data.picture, userName: data.user });
});

export default router;
