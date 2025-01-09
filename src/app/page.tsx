import React from "react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 p-6">
        <h1 className="text-3xl font-semibold text-white">Tableau de Bord</h1>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Overview Section */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold text-gray-700">Vue d'ensemble</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {/* Sessions Overview */}
            <div className="bg-gray-50 p-4 rounded shadow-sm">
              <h3 className="text-lg font-medium text-gray-700">Sessions</h3>
              <p className="text-gray-600 mt-2">Total de sessions en cours: 12</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Gérer les sessions
              </button>
            </div>

            {/* Staff Overview */}
            <div className="bg-gray-50 p-4 rounded shadow-sm">
              <h3 className="text-lg font-medium text-gray-700">Staff</h3>
              <p className="text-gray-600 mt-2">Nombre d'instructeurs et psychologues: 8</p>
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Gérer le staff
              </button>
            </div>

            {/* Statistics Overview */}
            <div className="bg-gray-50 p-4 rounded shadow-sm">
              <h3 className="text-lg font-medium text-gray-700">Statistiques</h3>
              <ul className="mt-2 text-gray-600">
                <li>Total des participants inscrits: 150</li>
                <li>Sessions complètes: 8</li>
                <li>Sessions à venir: 4</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold text-gray-700">Actions rapides</h2>
          <div className="flex space-x-4 mt-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 w-full sm:w-auto">
              Ajouter une session
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 w-full sm:w-auto">
              Ajouter un instructeur/psychologue
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
