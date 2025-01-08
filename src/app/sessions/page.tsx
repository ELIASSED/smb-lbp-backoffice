"use client"
import React, { useEffect, useState } from 'react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        const data = await response.json();
        console.log(data);  // Ajoutez ceci pour vérifier la structure des données
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          console.error("Les données ne sont pas un tableau.");
        }
      } catch (error) {
        console.error('Erreur de récupération des sessions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <div>Chargement des sessions...</div>;

  return (
    <div>
      <h2>Liste des Sessions</h2>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <p>{session.numeroStageAnts} - {session.location}</p>
            <p>Prix: {session.price} € | Date de début: {new Date(session.startDate).toLocaleDateString()}</p>
            <p>Instructeur: {session.instructor.firstName} {session.instructor.lastName}</p>
            <p>Psychologue: {session.psychologue.firstName} {session.psychologue.lastName}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sessions;

