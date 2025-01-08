"use client"
import React, { useEffect, useState } from 'react';

const StaffPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des instructeurs
        const instructorsResponse = await fetch('/api/instructors');
        const instructorsData = await instructorsResponse.json();

        // Vérifier la structure des données
        console.log('Instructeurs:', instructorsData);

        if (Array.isArray(instructorsData)) {
          setInstructors(instructorsData);
        } else {
          console.error("Les données des instructeurs ne sont pas un tableau", instructorsData);
          setInstructors([]);  // Définir une valeur par défaut si ce n'est pas un tableau
        }

        // Récupération des psychologues
        const psychologistsResponse = await fetch('/api/psychologists');
        const psychologistsData = await psychologistsResponse.json();
        console.log('Psychologues:', psychologistsData);

        if (Array.isArray(psychologistsData)) {
          setPsychologists(psychologistsData);
        } else {
          console.error("Les données des psychologues ne sont pas un tableau", psychologistsData);
          setPsychologists([]);  // Définir une valeur par défaut si ce n'est pas un tableau
        }
      } catch (error) {
        console.error('Erreur de récupération des données du personnel', error);
        setInstructors([]);
        setPsychologists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Chargement des données...</div>;

  return (
    <div>
      <h2>Liste des Instructeurs</h2>
      <ul>
        {instructors.map((instructor) => (
          <li key={instructor.id}>
            <p>{instructor.firstName} {instructor.lastName}</p>
            <p>Email: {instructor.email}</p>
          </li>
        ))}
      </ul>

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

export default StaffPage;
