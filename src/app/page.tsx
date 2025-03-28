// src/app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaChalkboardTeacher,
  FaUsers,
  FaEuroSign,
  FaPlusCircle,
} from "react-icons/fa";

interface Earnings {
  day: number;
  week: number;
  month: number;
  custom: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/earnings`);
        if (!response.ok) {
          throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
        }
        const data: Earnings = await response.json();
        setEarnings(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchEarnings();
    }
  }, [status]);

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8">
      <header className="bg-yellow-500 text-white p-6 shadow-lg rounded-lg text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold">Tableau de Bord</h1>
        <p className="mt-1 text-gray-100">Gérez vos sessions et vos données facilement</p>
      </header>

      <main className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon={<FaChalkboardTeacher />}
          title="Sessions"
          description="Total des sessions en cours"
          onClick={() => router.push("/sessions")}
        />
        <DashboardCard
          icon={<FaUsers />}
          title="Staff"
          description="Instructeurs et psychologues"
          onClick={() => router.push("/staff")}
        />
        <EarningsCard earnings={earnings} loading={loading} error={error} onClick={() => router.push("/")} />
      </main>

      <section className="bg-white shadow-lg rounded-lg p-6 mt-6 text-center">
        <h2 className="text-2xl font-bold text-teal-600">Actions rapides</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
          <ActionButton
            icon={<FaPlusCircle />}
            text="Ajouter une session"
            onClick={() => router.push("/sessions")}
          />
          <ActionButton
            icon={<FaPlusCircle />}
            text="Ajouter un BAFM/Psychologue"
            onClick={() => router.push("/staff")}
          />
        </div>
      </section>
    </div>
  );
}


const DashboardCard = ({ icon, title, description, onClick }: any) => (
  <div
    className="bg-white p-6 rounded-lg shadow-lg hover:bg-yellow-400 hover:text-white transition duration-300 cursor-pointer text-center md:text-left"
    onClick={onClick}
  >
    <div className="text-3xl flex justify-center md:justify-start">{icon}</div>
    <h3 className="text-xl font-semibold mt-4">{title}</h3>
    <p className="text-sm">{description}</p>
  </div>
);

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
  if (loading) content = <p>Chargement...</p>;
  else if (error) content = <p>Erreur: {error}</p>;
  else if (earnings) {
    content = (
      <div className="space-y-1">
        <p className="text-lg">
          Jour:{" "}
          <span className="font-bold">
            {(earnings.day / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </p>
        <p className="text-lg">
          Semaine:{" "}
          <span className="font-bold">
            {(earnings.week / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </p>
        <p className="text-lg">
          Mois:{" "}
          <span className="font-bold">
            {(earnings.month / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </p>
      </div>
    );
  } else content = <p>Aucune donnée</p>;

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-lg hover:bg-yellow-400 hover:text-white transition duration-300 cursor-pointer text-center md:text-left"
      onClick={onClick}
    >
      <div className="text-3xl flex justify-center md:justify-start">
        <FaEuroSign />
      </div>
      <h3 className="text-xl font-semibold mt-4">Revenus en cours</h3>
      <div className="mt-2">{content}</div>
    </div>
  );
};

const ActionButton = ({ icon, text, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition duration-300"
  >
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </button>
);