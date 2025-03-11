import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/hotels`)
      .then((response) => {
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

  if (loading) return <div className="text-center text-gray-700">Chargement...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Liste des Hôtels</h1>
      <ul className="space-y-4">
        {hotels.map((hotel) => (
          <li key={hotel.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-blue-600">{hotel.name}</h2>
            <p className="text-gray-600">{hotel.location}</p>
            <p className="text-gray-700 mt-2">{hotel.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Hotels;
