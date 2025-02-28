"use-strict";
const { apiKey, permission } = require("../auth/checkAuth");
const express = require("express");
const router = express.Router();
//check api key
router.use("/v1/api", require("./access"));

router.use(apiKey);
router.use(permission("0000"));
router.use("/v1/api", require("./product"));
module.exports = router;
