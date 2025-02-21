"use client";
import React, { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaUsers, FaChartBar, FaPlusCircle, FaEuroSign } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Interface pour les données des gains
interface Earnings {
  day: number;
  week: number;
  month: number;
  custom: number;
}

const DashboardPage = () => {
  const router = useRouter();
  
  // États pour les gains Stripe
  const [earnings, setEarnings] = useState<Earnings>({
    day: 0,
    week: 0,
    month: 0,
    custom: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customDays, setCustomDays] = useState<number>(365);

  // Récupération des gains
  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/earnings?customDays=${customDays}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Erreur réseau: ${response.status} ${response.statusText}`);
      }
      const data: Earnings = await response.json();
      setEarnings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [customDays]);

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setCustomDays(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="mt-2 text-blue-100 text-lg">Gérez vos activités en un coup d'œil</p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Overview Section */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vue d'ensemble</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sessions Overview */}
            <div className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition duration-200">
              <FaChalkboardTeacher className="text-blue-600 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-800">Sessions</h3>
              <p className="text-gray-600 mt-2">Sessions en cours: <span className="font-semibold">12</span></p>
              <button
                onClick={() => router.push('/sessions')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Gérer
              </button>
            </div>

            {/* Staff Overview */}
            <div className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition duration-200">
              <FaUsers className="text-green-600 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-800">Staff</h3>
              <p className="text-gray-600 mt-2">Équipe: <span className="font-semibold">8</span></p>
              <button
                onClick={() => router.push('/staff')}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Gérer
              </button>
            </div>

            {/* Statistics Overview */}
            <div className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition duration-200">
              <FaChartBar className="text-yellow-600 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-800">Statistiques</h3>
              <ul className="mt-2 text-gray-600 space-y-1">
                <li>Participants: <span className="font-semibold">150</span></li>
                <li>Sessions terminées: <span className="font-semibold">8</span></li>
                <li>Sessions prévues: <span className="font-semibold">4</span></li>
              </ul>
            </div>

            {/* Earnings Overview */}
            <div className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition duration-200">
              <FaEuroSign className="text-purple-600 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-800">Gains</h3>
              {loading ? (
                <p className="text-gray-600 mt-2">Chargement...</p>
              ) : error ? (
                <p className="text-red-600 mt-2">{error}</p>
              ) : (
                <ul className="mt-2 text-gray-600 space-y-1">
                  <li>Jour: <span className="font-semibold">{(earnings.day / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></li>
                  <li>Semaine: <span className="font-semibold">{(earnings.week / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></li>
                  <li>Mois: <span className="font-semibold">{(earnings.month / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></li>
                </ul>
              )}
            </div>
          </div>

        </section>

        {/* Action Buttons */}
        <section className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Actions rapides</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/sessions/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
            >
              <FaPlusCircle className="text-xl" />
              <span>Ajouter une session</span>
            </button>
            <button
              onClick={() => router.push('/staff/new')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
            >
              <FaPlusCircle className="text-xl" />
              <span>Ajouter un membre</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;