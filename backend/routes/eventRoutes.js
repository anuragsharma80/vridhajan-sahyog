const express = require("express");
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");
const auth = require("../middleware/auth");

// Protected routes → only logged-in users with valid token
router.post("/", auth, createEvent);
router.get("/", auth, getEvents);
router.get("/:id", auth, getEventById);
router.put("/:id", auth, updateEvent);
router.delete("/:id", auth, deleteEvent);

module.exports = router;

