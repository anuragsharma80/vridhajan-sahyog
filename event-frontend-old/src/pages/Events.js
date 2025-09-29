import React, { useEffect, useState } from "react";
import axios from "axios";
import EventForm from "../components/EventForm";
import { toast } from "react-toastify";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // assume you stored token at login
      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (err) {
      toast.error("Failed to fetch events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Add new event
  const addEvent = async (eventData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/events", eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event created successfully!");
      fetchEvents();
    } catch (err) {
      toast.error("Error creating event");
      console.error(err);
    }
  };

  // ✅ Delete event
  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted!");
      fetchEvents();
    } catch (err) {
      toast.error("Failed to delete event");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Events</h2>

      {/* ✅ Event Form */}
      <EventForm onSubmit={addEvent} />

      <hr />

      {/* ✅ Loading State */}
      {loading ? (
        <p>Loading events...</p>
      ) : (
        <ul>
          {events.map((ev) => (
            <li key={ev.id}>
              <strong>{ev.title}</strong> — {new Date(ev.date).toDateString()}
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => deleteEvent(ev.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Events;
