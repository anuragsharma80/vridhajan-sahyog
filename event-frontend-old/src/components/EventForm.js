import React, { useState } from "react";

const EventForm = ({ onSubmit }) => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    date: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!event.title || !event.description || !event.date) {
      setError("All fields are required!");
      return;
    }
    setError("");
    onSubmit(event);
    setEvent({ title: "", description: "", date: "" }); // reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        name="title"
        value={event.title}
        onChange={handleChange}
        placeholder="Event Title"
      />

      <textarea
        name="description"
        value={event.description}
        onChange={handleChange}
        placeholder="Event Description"
      />

      <input
        type="date"
        name="date"
        value={event.date}
        onChange={handleChange}
      />

      <button type="submit">Save Event</button>
    </form>
  );
};

export default EventForm;
