import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventForm from "../components/EventForm";
import API from "../api";

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    API.get(`/events/${id}`).then((res) => setEvent(res.data));
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await API.put(`/events/${id}`, data);
      navigate("/events");
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Event</h2>
      <EventForm initialData={event} onSubmit={handleUpdate} />
    </div>
  );
};

export default EventEdit;
