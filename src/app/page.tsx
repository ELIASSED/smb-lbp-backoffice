"use client";

import React, { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaUsers,
  FaEuroSign,
  FaPlusCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Earnings {
  day: number;
  week: number;
  month: number;
  custom: number;
}

export default function DashboardPage() {
  const router = useRouter();

  // États pour la récupération des earnings
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/earnings`);
      if (!response.ok) {
        throw new Error(
          `Erreur réseau: ${response.status} ${response.statusText}`
        );
      }
      const data: Earnings = await response.json();
      setEarnings(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 text-gray-dark ml-32 p-8">
      {/* En-tête */}
      <header className="bg-yellow text-white p-6 shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold tracking-tight">Tableau de Bord</h1>
        <p className="mt-1 text-gray-light">
          Gérez vos sessions et vos données facilement
        </p>
      </header>

      {/* Contenu principal */}
      <main className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte Sessions */}
        <DashboardCard
          icon={<FaChalkboardTeacher />}
          title="Sessions"
          description="Total des sessions en cours"
          onClick={() => router.push("/sessions")}
        />
        {/* Carte Staff */}
        <DashboardCard
          icon={<FaUsers />}
          title="Staff"
          description="Instructeurs et psychologues"
          onClick={() => router.push("/staff")}
        />
        {/* Carte Gains */}
        <EarningsCard
          earnings={earnings}
          loading={loading}
          error={error}
          onClick={() => router.push("/earnings")}
        />
      </main>

      {/* Section des actions rapides */}
      <section className="bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-teal">Actions rapides</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
          <ActionButton
            icon={<FaPlusCircle />}
            text="Ajouter une session"
            onClick={() => router.push("/sessions/new")}
          />
          <ActionButton
            icon={<FaPlusCircle />}
            text="Ajouter un BAFM/Psychologue"
            onClick={() => router.push("/staff/new")}
          />
        </div>
      </section>
    </div>
  );
}

// Composant réutilisable pour les cartes non liées aux earnings
const DashboardCard = ({ icon, title, value, description, onClick }: any) => (
  <div
    className="bg-white p-6 rounded-lg shadow-lg hover:bg-yellow hover:text-white transition duration-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="text-3xl">{icon}</div>
    <h3 className="text-xl font-semibold mt-4">{title}</h3>
    <p className="text-4xl font-bold">{value}</p>
    <p className="text-sm">{description}</p>
  </div>
);

// Composant spécialisé pour afficher les earnings
const EarningsCard = ({
  earnings,
  loading,
  error,
  onClick,
}: {
  earnings: Earnings | null;
  loading: boolean;
  error: string | null;
  onClick: () => void;
}) => {
  let content;
  if (loading) {
    content = <p>Chargement...</p>;
  } else if (error) {
    content = <p>Erreur: {error}</p>;
  } else if (earnings) {
    content = (
      <div className="space-y-1">
        <p className="text-lg">
          Jour:{" "}
          <span className="font-bold">
            {(earnings.day / 100).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </p>
        <p className="text-lg">
          Semaine:{" "}
          <span className="font-bold">
            {(earnings.week / 100).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </p>
        <p className="text-lg">
          Mois:{" "}
          <span className="font-bold">
            {(earnings.month / 100).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </p>
      </div>
    );
  } else {
    content = <p>Aucune donnée</p>;
  }

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg hover:bg-yellow hover:text-white transition duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="text-3xl">
        <FaEuroSign />
      </div>
      <h3 className="text-xl font-semibold mt-4">Revenus en cours</h3>
      <div className="mt-2">{content}</div>

    </div>
  );
};

// Bouton d'action réutilisable
const ActionButton = ({ icon, text, onClick }: any) => (
  <button
    onClick={onClick}
    className="btn bg-teal text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-teal-light transition duration-300"
  >
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </button>
);
