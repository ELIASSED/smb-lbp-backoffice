import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
  

      {/* Main Content */}
      <main className="p-6 space-y-6">
        <section className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold text-gray-700">Sessions</h2>
          <p className="text-gray-600 mt-2">
            Gérez les sessions de stage ici. Ajoutez, modifiez ou supprimez des sessions.
          </p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Gérer les sessions
          </button>
        </section>

        <section className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold text-gray-700">Instructeurs</h2>
          <p className="text-gray-600 mt-2">
            Gérez les instructeurs du centre. Ajoutez, modifiez ou supprimez leurs informations.
          </p>
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Gérer les instructeurs
          </button>
        </section>

        <section className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold text-gray-700">Psychologues</h2>
          <p className="text-gray-600 mt-2">
            Gérez les psychologues affiliés. Ajoutez, modifiez ou supprimez leurs informations.
          </p>
          <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Gérer les psychologues
          </button>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
