const mongoose = require("mongoose");
const Task = require("../models/Task");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch tasks." });
  }
};

exports.addTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const taskData = {
      title: title.trim(),
      user: req.user.userId
    };

    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      taskData.dueDate = new Date(`${year}-${month}-${day}T12:00:00.000Z`);
    }

    const task = await Task.create(taskData);

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Could not create task." });
  }
};

exports.toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const task = await Task.findOne({ _id: id, user: req.user.userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Could not update task." });
  }
};

exports.toggleTaskImportant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const task = await Task.findOne({ _id: id, user: req.user.userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    task.important = !task.important;
    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Could not update importance." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const task = await Task.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete task." });
  }
};
