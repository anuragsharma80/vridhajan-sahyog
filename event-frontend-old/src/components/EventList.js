// const [loading, setLoading] = useState(false);

// useEffect(() => {
//   setLoading(true);
//   axios.get("/api/events")
//     .then(res => setEvents(res.data))
//     .catch(err => console.error(err))
//     .finally(() => setLoading(false));
// }, []);

// return (
//   <>
//     {loading ? <p>Loading events...</p> : <EventTable events={events} />}
//   </>
// );
