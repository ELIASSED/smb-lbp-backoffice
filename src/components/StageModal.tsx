// Composant corrigé StageModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Stage,
  StageFormData,
  createSession,
  getInstructors,
  getPsychologists,
  updateSession,
} from "../services/stageApi";

// ----- Composant générique Modal -----
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
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

// ----- Composant StageModal -----
interface StageModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "delete" | null;
  stage?: Stage;
  onSubmit: (data: StageFormData) => void;
}

export const StageModal: React.FC<StageModalProps> = ({
  isOpen,
  onClose,
  mode,
  stage,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<StageFormData>({
    numeroStageAnts: "",
    location: "",
    description: "",
    capacity: 0,
    price: "",
    startDate: "",
    endDate: "",
    instructorId: "",
    psychologueId: "",
  });

  const [instructorList, setInstructorList] = useState<any[]>([]);
  const [psychologistList, setPsychologistList] = useState<any[]>([]);

  // Remplir le formulaire si mode Edit ou Delete
  useEffect(() => {
    if (stage && (mode === "edit" || mode === "delete")) {
      setFormData({
        numeroStageAnts: stage.numeroStageAnts,
        location: stage.location,
        description: stage.description,
        capacity: stage.capacity,
        price: stage.price,
        startDate: new Date(stage.startDate).toISOString().split("T")[0],
        endDate: new Date(stage.endDate).toISOString().split("T")[0],
        instructorId: stage.instructor?.id.toString() || "",
        psychologueId: stage.psychologue?.id.toString() || "",
      });
    } else if (mode === "create") {
      setFormData({
        numeroStageAnts: "",
        location: "",
        description: "",
        capacity: 20,
        price: 199.0,
        startDate: "",
        endDate: "",
        instructorId: "",
        psychologueId: "",
      });
    }
  }, [stage, mode]);

  // Aller chercher la liste des animateurs et psychologues
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const [instructors, psychologists] = await Promise.all([
          getInstructors(),
          getPsychologists(),
        ]);
        setInstructorList(instructors);
        setPsychologistList(psychologists);
      } catch (error) {
        console.error(error);
      }
    };

    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "edit" && stage?.id) {
        await updateSession(stage.id, formData); // Appel à updateSession
        onSubmit(formData); // Callback pour informer le parent
        onClose(); // Fermer la modale après succès
      } else if (mode === "create") {
        await createSession(formData);
        onSubmit(formData);
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Une erreur est survenue. Vérifiez les données et réessayez.");
    }
  };

  // Mode "delete": on affiche seulement la confirmation
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

  // Mode "create" ou "edit": on affiche le formulaire complet
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Créer un nouveau stage" : "Modifier le stage"}
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
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
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
            min={1}
            max={20}
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
            <option value="" disabled>
              Sélectionnez un animateur
            </option>
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
            <option value="" disabled>
              Sélectionnez un psychologue
            </option>
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
            value={formData.startDate || ""}
            onChange={(e) => {
              const newStartDate = e.target.value;
              if (newStartDate) {
                const nextDay = new Date(newStartDate);
                nextDay.setDate(nextDay.getDate() + 1);

                setFormData((prev) => ({
                  ...prev,
                  startDate: newStartDate,
                  endDate: nextDay.toISOString().split("T")[0],
                }));
              }
            }}
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
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            readOnly
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
