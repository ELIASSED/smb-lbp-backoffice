"use client";
import React, { useState, useEffect } from "react";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";

interface Stage {
  id: number;
  numeroStageAnts: string;
  price: number;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  instructor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  psychologue: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  isArchived: boolean;
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
  instructorId: string;
  psychologueId: string;
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
    numeroStageAnts: '',
    location: '',
    capacity: 0,
    price: 0,
    startDate: '',
    endDate: '',
    instructorId: '',
    psychologueId: ''
  });

  const [instructorList, setInstructorList] = useState<any[]>([]);
  const [psychologistList, setPsychologistList] = useState<any[]>([]);

  useEffect(() => {
    if (stage && (mode === 'edit' || mode === 'delete')) {
      setFormData({
        numeroStageAnts: stage.numeroStageAnts,
        location: stage.location,
        capacity: stage.capacity,
        price: stage.price,
        startDate: new Date(stage.startDate).toISOString().split('T')[0],
        endDate: new Date(stage.endDate).toISOString().split('T')[0],
        instructorId: stage.instructor?.id.toString() || '',
        psychologueId: stage.psychologue?.id.toString() || ''
      });
    }
  }, [stage, mode]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const [instructorRes, psychologistRes] = await Promise.all([
          fetch("/api/animateurs"),
          fetch("/api/psychologues"),
        ]);

        if (!instructorRes.ok || !psychologistRes.ok) {
          throw new Error("Erreur lors de la récupération des animateurs et psychologues");
        }

        const [instructorData, psychologistData] = await Promise.all([
          instructorRes.json(),
          psychologistRes.json(),
        ]);

        setInstructorList(instructorData);
        setPsychologistList(psychologistData);
      } catch (error) {
        console.error(error);
      }
    };

    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  const handleDelete = async () => {
    if (!modalState.selectedStage?.id) {
      console.error("ID manquant pour la suppression");
      return;
    }
  
    try {
      const response = await fetch(`/api/sessions/${modalState.selectedStage.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      await fetchStages(); // Recharger les données
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur s'est produite lors de l'archivage du stage.");
    }
  };

  if (mode === "delete") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Archiver le stage">
        <div>
          <p className="mb-4">Êtes-vous sûr de vouloir archiver ce stage ?</p>
          <p className="font-medium mb-6">{stage?.numeroStageAnts}</p>
          <div className="flex justify-end">
            <button
              onClick={() => onSubmit(formData)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Archiver
            </button>
          </div>
        </div>
      </Modal>
    );
  }


  return (
    <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    title={mode === 'create' ? 'Créer un nouveau stage' : 'Modifier le stage'}
  >
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Numéro de stage</label>
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
          <label className="block text-sm font-medium mb-1">Lieu</label>
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
          <label className="block text-sm font-medium mb-1">Prix</label>
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
          <label className="block text-sm font-medium mb-1">Capacité</label>
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
          <label className="block text-sm font-medium mb-1">Animateur BAFM</label>
          <select
            name="instructorId"
            value={formData.instructorId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Sélectionnez un animateur</option>
            {instructorList.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.firstName} {instructor.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Psychologue</label>
          <select
            name="psychologueId"
            value={formData.psychologueId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Sélectionnez un psychologue</option>
            {psychologistList.map((psychologist) => (
              <option key={psychologist.id} value={psychologist.id}>
                {psychologist.firstName} {psychologist.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date de début</label>
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
          <label className="block text-sm font-medium mb-1">Date de fin</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {mode === "create" ? "Créer" : "Modifier"}
          </button>
        </div>
      </form>
    
  </Modal>

  );
};


const BackofficeStageList: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    selectedStage: null
  });

  const pageSize = 6;

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

  const handleModalSubmit = async (formData: StageFormData) => {
    try {
      let response;
      
      switch (modalState.mode) {
        case 'create':
          response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          break;
          
        case 'edit':
          if (!modalState.selectedStage?.id) throw new Error("ID manquant");
          response = await fetch(`/api/sessions/${modalState.selectedStage.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, id: modalState.selectedStage.id })
          });
          break;
          
        case 'delete':
          if (!modalState.selectedStage?.id) throw new Error("ID manquant");
          response = await fetch(`/api/sessions/${modalState.selectedStage.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          break;
          
        default:
          throw new Error("Mode d'opération invalide");
      }

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      await fetchStages();
      closeModal();
      
    } catch (error) {
      console.error('Erreur:', error);
      alert("Une erreur s'est produite lors de l'opération.");
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'delete', stage: Stage | null = null) => {
    setModalState({ isOpen: true, mode, selectedStage: stage });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, selectedStage: null });
  };

  const totalPages = Math.ceil(stages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStages = stages.slice(startIndex, startIndex + pageSize);

  if (!Array.isArray(paginatedStages)) {
    console.error('paginatedStages n\'est pas un tableau:', paginatedStages);
    return null;
  }
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
          {paginatedStages.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {paginatedStages.map((stage, index) => (
                <li 
                  key={`${stage.id}-${index}`} 
                  className={`py-4 ${stage.isArchived ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">
                        {stage.numeroStageAnts} - Du {new Date(stage.startDate).toLocaleDateString()} au{" "}
                        {new Date(stage.endDate).toLocaleDateString()}
                        {stage.isArchived && (
                          <span className="ml-2 text-sm text-gray-500">(Archivé)</span>
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
                          ? `${stage.psychologue.firstName} ${stage.psychologue.lastName} `
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
                            stage.capacity <= 5 ? "text-red-500" : "text-gray-800"
                          }`}
                        >
                          Places restantes: {stage.capacity}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal("edit", stage)}
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

