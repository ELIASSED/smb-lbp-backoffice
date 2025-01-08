"use client"

import React, { useEffect, useState } from 'react';

const Psychologists = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const response = await fetch('/api/psychologists');
        const data = await response.json();
        setPsychologists(data);
      } catch (error) {
        console.error('Erreur de récupération des psychologues', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

  if (loading) return <div>Chargement des psychologues...</div>;

  return (
    <div>
      <h2>Liste des Psychologues</h2>
      <ul>
        {psychologists.map((psychologist) => (
          <li key={psychologist.id}>
            <p>{psychologist.firstName} {psychologist.lastName}</p>
            <p>Email: {psychologist.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Psychologists;
