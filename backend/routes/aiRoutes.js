const express = require("express");
const { askAi } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/ask", askAi);

module.exports = router;
