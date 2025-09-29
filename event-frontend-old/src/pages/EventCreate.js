import React from "react";
import EventForm from "../components/EventForm";
import API from "../api";
import { useNavigate } from "react-router-dom";

const EventCreate = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await API.post("/events", data);
      navigate("/events");
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <EventForm onSubmit={handleCreate} />
    </div>
  );
};

export default EventCreate;
