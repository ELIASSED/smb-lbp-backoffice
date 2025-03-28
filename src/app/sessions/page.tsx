"use client";
import React, { useEffect, useState } from "react";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";
import { StageModal } from "../../components/StageModal";
import {
  Stage,
  StageFormData,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../../services/stageApi";

interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "delete" | null;
  selectedStage: Stage | null;
}

const BackofficeStageList: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    selectedStage: null,
  });

  const pageSize = 5;

  const fetchStages = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setStages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des stages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleModalSubmit = async (formData: StageFormData) => {
    try {
      switch (modalState.mode) {
        case "create":
          await createSession(formData);
          break;

          case "edit":
            if (!modalState.selectedStage?.id) {
              throw new Error("ID manquant");
            }
            await updateSession(modalState.selectedStage.id, formData);
            break;

        case "delete":
          if (!modalState.selectedStage?.id) {
            throw new Error("ID manquant pour l'archivage.");
          }
          await deleteSession(modalState.selectedStage.id);
          break;

        default:
          throw new Error("Mode d'opération invalide");
      }

      await fetchStages();
      closeModal();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error instanceof Error ? error.message : "Une erreur s'est produite lors de l'opération.");
    }
  };

  const openModal = (
    mode: "create" | "edit" | "delete",
    stage: Stage | null = null
  ) => {
    setModalState({ isOpen: true, mode, selectedStage: stage });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, selectedStage: null });
  };

  const totalPages = Math.ceil(stages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStages = stages.slice(startIndex, startIndex + pageSize);

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des Stages</h2>
        <button
          onClick={() => openModal("create")}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"         
           title="Ajouter un nouveau stage"
        >
          <PlusCircleIcon className="w-6 h-6" />
    </button>  
      </div>

      {loading ? (
        <p>Chargement des données...</p>
      ) : (
        <>
          {paginatedStages.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {paginatedStages.map((stage, index) => (
                <li
                  key={`${stage.id}-${index}`}
                  className={`py-4 ${stage.isArchived ? "opacity-60" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">
                        {stage.numeroStageAnts} - Du{" "}
                        {new Date(stage.startDate).toLocaleDateString()} au{" "}
                        {new Date(stage.endDate).toLocaleDateString()}
                        {stage.isArchived && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Archivé)
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 mt-1">
                        <span className="font-semibold">BAFM : </span>
                        {stage.instructor
                          ? `${stage.instructor.firstName} ${stage.instructor.lastName}`
                          : "Aucun instructeur"}
                      </p>
                      <p className="text-gray-600 mt-1">
                        <span className="font-semibold">Psychologue : </span>
                        {stage.psychologue
                          ? `${stage.psychologue.firstName} ${stage.psychologue.lastName}`
                          : "Aucun psychologue"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right mr-4">
                        <p className="font-bold text-green-600">
                          {stage.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                        <p
                          className={`font-semibold ${
                            stage.capacity <= 5
                              ? "text-red-500"
                              : "text-gray-800"
                          }`}
                        >
                          Places restantes: {stage.capacity}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal("edit", stage)}
                             title="Modifier le stage"
                          className="p-2 text-gray-600 hover:text-blue-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("delete", stage)}
                          className="p-2 text-gray-600 hover:text-red-600"
                          title="Archiver"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun stage trouvé.</p>
          )}

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

      <StageModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        stage={modalState.selectedStage || undefined}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default BackofficeStageList;