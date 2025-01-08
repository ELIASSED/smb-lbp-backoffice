"use client";
import React, { useState, useEffect } from "react";

interface Stage {
  id: string;
  numeroStageAnts: string;
  location: string;
  capacity: number;
  price: number;
  startDate: string;
  endDate: string;
}

const BackofficeStageList: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // Nombre de stages affichés par page

  // Fonction pour récupérer les données
  const fetchStages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await response.json();
      setStages(data); // Stockage des données dans l'état
    } catch (error) {
      console.error("Erreur lors du chargement des stages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Appel de la fonction au chargement initial
  useEffect(() => {
    fetchStages();
  }, []);

  // Pagination : Calcul des indices et des pages
  const totalPages = Math.ceil(stages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStages = stages.slice(startIndex, startIndex + pageSize);

  // Navigation entre les pages
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Gestion des Stages</h2>
      {loading ? (
        <p>Chargement des données...</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {paginatedStages.map((stage) => (
              <li key={stage.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">
                      {stage.numeroStageAnts} - {stage.location}
                    </p>
                    <p className="text-gray-600">
                      Du {new Date(stage.startDate).toLocaleDateString()} au{" "}
                      {new Date(stage.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-green-600">
                      {stage.price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                    <p
                      className={`font-semibold ${
                        stage.capacity <= 5 ? "text-red-500" : "text-gray-800"
                      }`}
                    >
                      Places restantes: {stage.capacity}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`py-2 px-4 rounded ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Précédent
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`py-2 px-4 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BackofficeStageList;
