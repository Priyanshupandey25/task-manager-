const express = require("express");
const {
  getTasks,
  addTask,
  toggleTaskStatus,
  toggleTaskImportant,
  deleteTask
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getTasks);
router.post("/", addTask);
router.patch("/:id", toggleTaskStatus);
router.patch("/:id/star", toggleTaskImportant);
router.delete("/:id", deleteTask);

module.exports = router;
