"use client";
import React, { useState, useEffect } from "react";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";

interface Stage {
  id: string;
  numeroStageAnts: string;
  location: string;
  capacity: number;
  price: number;
  startDate: string;
  endDate: string;
}

interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete' | null;
  selectedStage: Stage | null;
}

interface StageFormData {
  numeroStageAnts: string;
  location: string;
  capacity: number;
  price: number;
  startDate: string;
  endDate: string;
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const StageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'delete' | null;
  stage?: Stage;
  onSubmit: (data: StageFormData) => void;
}> = ({ isOpen, onClose, mode, stage, onSubmit }) => {
  const [formData, setFormData] = useState<StageFormData>({
    numeroStageAnts: stage?.numeroStageAnts || '',
    location: stage?.location || '',
    capacity: stage?.capacity || 0,
    price: stage?.price || 0,
    startDate: stage?.startDate ? new Date(stage.startDate).toISOString().split('T')[0] : '',
    endDate: stage?.endDate ? new Date(stage.endDate).toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    if (stage) {
      setFormData({
        numeroStageAnts: stage.numeroStageAnts,
        location: stage.location,
        capacity: stage.capacity,
        price: stage.price,
        startDate: new Date(stage.startDate).toISOString().split('T')[0],
        endDate: new Date(stage.endDate).toISOString().split('T')[0],
      });
    }
  }, [stage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const titles = {
    create: 'Créer un nouveau stage',
    edit: 'Modifier le stage',
    delete: 'Supprimer le stage'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[mode || 'create']}>
      {mode === 'delete' ? (
        <div>
          <p className="mb-4">Êtes-vous sûr de vouloir supprimer ce stage ?</p>
          <p className="font-medium mb-6">{stage?.numeroStageAnts}</p>
          <div className="flex justify-end">
            <button
              onClick={() => onSubmit(formData)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Numéro de stage
              </label>
              <input
                type="text"
                name="numeroStageAnts"
                value={formData.numeroStageAnts}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Lieu
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prix
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Capacité
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date de début
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date de fin
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {mode === 'create' ? 'Créer' : 'Modifier'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

const BackofficeStageList: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    selectedStage: null
  });
  
  const pageSize = 10;

  const fetchStages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await response.json();
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

  const handleCreate = async (formData: StageFormData) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchStages();
        closeModal();
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleEdit = async (formData: StageFormData) => {
    try {
      const response = await fetch(`/api/sessions/${modalState.selectedStage?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchStages();
        closeModal();
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDelete = async (formData: StageFormData) => {
    try {
      const response = await fetch(`/api/sessions/${modalState.selectedStage?.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchStages();
        closeModal();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleModalSubmit = (formData: StageFormData) => {
    switch (modalState.mode) {
      case 'create':
        handleCreate(formData);
        break;
      case 'edit':
        handleEdit(formData);
        break;
      case 'delete':
        handleDelete(formData);
        break;
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'delete', stage: Stage | null = null) => {
    setModalState({
      isOpen: true,
      mode,
      selectedStage: stage
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: null,
      selectedStage: null
    });
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
          onClick={() => openModal('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusCircleIcon className="w-4 h-4 mr-2" />
          Nouveau Stage
        </button>
      </div>

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
                  <div className="flex items-center space-x-4">
                    <div className="text-right mr-4">
                      <p className="font-bold text-green-600">
                        {stage.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                      <p className={`font-semibold ${
                        stage.capacity <= 5 ? "text-red-500" : "text-gray-800"
                      }`}>
                        Places restantes: {stage.capacity}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('edit', stage)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal('delete', stage)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

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