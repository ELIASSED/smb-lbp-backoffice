"use client"
import React from "react";
import { FaChalkboardTeacher, FaUsers, FaChartBar, FaPlusCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const router = useRouter(); // Initialisez useRouter

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight">Tableau de Bord</h1>
        <p className="mt-1 text-gray-200">Suivez et gérez vos activités facilement</p>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8">
        {/* Overview Section */}
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700">Vue d'ensemble</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Sessions Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow hover:shadow-xl transition duration-300 transform hover:scale-105">
              <FaChalkboardTeacher className="text-blue-600 text-3xl" />
              <h3 className="text-xl font-semibold text-gray-700 mt-4">Sessions</h3>
              <p className="text-gray-600 mt-2">Total de sessions en cours: <span className="font-bold">12</span></p>
              <button
                onClick={() => router.push('/sessions')} // Remplace navigate() par router.push()
                className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
              >
                Gérer les sessions
              </button>
            </div>

            {/* Staff Overview */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow hover:shadow-xl transition duration-300 transform hover:scale-105">
              <FaUsers className="text-green-600 text-3xl" />
              <h3 className="text-xl font-semibold text-gray-700 mt-4">Staff</h3>
              <p className="text-gray-600 mt-2">Nombre d'instructeurs et psychologues: <span className="font-bold">8</span></p>
              <button
                onClick={() => router.push('/staff')}
                className="mt-6 bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700"
              >
                Gérer le staff
              </button>
            </div>

            {/* Statistics Overview */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg shadow hover:shadow-xl transition duration-300 transform hover:scale-105">
              <FaChartBar className="text-yellow-600 text-3xl" />
              <h3 className="text-xl font-semibold text-gray-700 mt-4">Statistiques</h3>
              <ul className="mt-2 text-gray-600 space-y-2">
                <li>Total des participants inscrits: <span className="font-bold">150</span></li>
                <li>Sessions complètes: <span className="font-bold">8</span></li>
                <li>Sessions à venir: <span className="font-bold">4</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700">Actions rapides</h2>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              onClick={() => router.push('/sessions/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 flex items-center justify-center w-full sm:w-auto space-x-2"
            >
              <FaPlusCircle className="text-xl" />
              <span>Ajouter une session</span>
            </button>
            <button
              onClick={() => router.push('/staff/new')}
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 flex items-center justify-center w-full sm:w-auto space-x-2"
            >
              <FaPlusCircle className="text-xl" />
              <span>Ajouter un BAFM/Psychologue</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
