const router = require("express").Router();
const { login } = require("../controllers/authCtrl");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/login", login);

module.exports = router;
