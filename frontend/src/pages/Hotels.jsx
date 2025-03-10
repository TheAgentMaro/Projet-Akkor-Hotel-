// frontend/src/pages/Hotels.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/hotels`)
      .then(response => {
        if (response.data.success) {
          setHotels(response.data.data);
        } else {
          setError('Erreur lors du chargement des hôtels');
        }
      })
      .catch(() => {
        setError('Erreur lors du chargement des hôtels');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Liste des Hôtels</h1>
      <ul>
        {hotels.map(hotel => (
          <li key={hotel.id}>
            <h2>{hotel.name}</h2>
            <p>{hotel.location}</p>
            <p>{hotel.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Hotels;
