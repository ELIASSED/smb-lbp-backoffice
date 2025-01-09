"use client";

import React, { useState, useEffect } from "react";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "lucide-react";

// Types
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  numeroAutorisationPrefectorale: string;
  email: string;
  phone: string;
}

type StaffType = "instructor" | "psychologist";
type ModalMode = "create" | "edit" | "delete";

interface StaffFormData {
  firstName: string;
  lastName: string;
  numeroAutorisationPrefectorale: string;
  email: string;
  phone: string;
}

interface ModalState {
  isOpen: boolean;
  mode: ModalMode | null;
  selectedStaff: Staff | null;
  staffType: StaffType | null;
}

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
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

// Staff List Item Component
const StaffListItem: React.FC<{
  staff: Staff;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ staff, onEdit, onDelete }) => (
  <li className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <div className="font-semibold text-gray-900">
          {staff.firstName} {staff.lastName}
        </div>
        <div className="text-sm text-gray-600">
          Numéro Agrément Ants: {staff.numeroAutorisationPrefectorale}
        </div>
        <div className="text-sm text-gray-600">
          Email: {staff.email}
        </div>
        <div className="text-sm text-gray-600">
          Téléphone: {staff.phone}
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="Modifier"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          aria-label="Supprimer"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </li>
);

// Staff Form Component
const StaffForm: React.FC<{
  initialData?: Staff;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
  mode: ModalMode;
}> = ({ initialData, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    numeroAutorisationPrefectorale: initialData?.numeroAutorisationPrefectorale || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prénom
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro Agrément Ants
        </label>
        <input
          type="text"
          name="numeroAutorisationPrefectorale"
          value={formData.numeroAutorisationPrefectorale}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {mode === "create" ? "Créer" : "Modifier"}
        </button>
      </div>
    </form>
  );
};

// Main Page Component
const StaffPage: React.FC = () => {
  const [staffData, setStaffData] = useState<{
    instructors: Staff[];
    psychologists: Staff[];
  }>({
    instructors: [],
    psychologists: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    selectedStaff: null,
    staffType: null,
  });

  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [instructorsRes, psychologistsRes] = await Promise.all([
        fetch("/api/animateurs"),
        fetch("/api/psychologues"),
      ]);

      if (!instructorsRes.ok || !psychologistsRes.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const [instructorsData, psychologistsData] = await Promise.all([
        instructorsRes.json(),
        psychologistsRes.json(),
      ]);

      setStaffData({
        instructors: Array.isArray(instructorsData) ? instructorsData : [],
        psychologists: Array.isArray(psychologistsData) ? psychologistsData : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setStaffData({ instructors: [], psychologists: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleStaffOperation = async (
    operation: "create" | "edit" | "delete",
    staffType: StaffType,
    data?: StaffFormData
  ) => {
    const baseUrl = staffType === "instructor" ? "/api/animateurs" : "/api/psychologues";
    const url = operation === "create" 
      ? baseUrl 
      : `${baseUrl}/${modalState.selectedStaff?.id}`;

    try {
      const response = await fetch(url, {
        method: operation === "create" ? "POST" : operation === "edit" ? "PUT" : "DELETE",
        headers: operation !== "delete" ? { "Content-Type": "application/json" } : undefined,
        body: operation !== "delete" ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error("Opération échouée");
      }

      await fetchStaffData();
      closeModal();
    } catch (err) {
      console.error("Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const openModal = (mode: ModalMode, staffType: StaffType, staff?: Staff) => {
    setModalState({
      isOpen: true,
      mode,
      selectedStaff: staff || null,
      staffType,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: null,
      selectedStaff: null,
      staffType: null,
    });
  };

  const renderStaffSection = (
    title: string,
    staffType: StaffType,
    staffList: Staff[]
  ) => (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => openModal("create", staffType)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          {`Nouveau ${staffType === "instructor" ? "instructeur" : "psychologue"}`}
        </button>
      </div>

      {staffList.length > 0 ? (
        <ul className="space-y-4">
          {staffList.map((staff) => (
            <StaffListItem
              key={staff.id}
              staff={staff}
              onEdit={() => openModal("edit", staffType, staff)}
              onDelete={() => openModal("delete", staffType, staff)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-4">
          {`Aucun ${
            staffType === "instructor" ? "instructeur" : "psychologue"
          } trouvé.`}
        </p>
      )}
    </section>
  );

  const renderModal = () => {
    if (!modalState.isOpen || !modalState.mode || !modalState.staffType) return null;

    const staffTypeLabel =
      modalState.staffType === "instructor" ? "instructeur" : "psychologue";
    const title = {
      create: `Ajouter un ${staffTypeLabel}`,
      edit: `Modifier le ${staffTypeLabel}`,
      delete: `Supprimer le ${staffTypeLabel}`,
    }[modalState.mode];

    return (
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={title}>
        {modalState.mode === "delete" ? (
          <div>
            <p className="mb-4">{`Êtes-vous sûr de vouloir supprimer ce ${staffTypeLabel} ?`}</p>
            <p className="font-medium mb-6">
              {modalState.selectedStaff?.firstName} {modalState.selectedStaff?.lastName}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleStaffOperation("delete", modalState.staffType!)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <StaffForm
            initialData={modalState.selectedStaff || undefined}
            onSubmit={(data) =>
              handleStaffOperation(
                modalState.mode as "create" | "edit",
                modalState.staffType!,
                data
              )
            }
            onCancel={closeModal}
            mode={modalState.mode}
          />
        )}
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {renderStaffSection(
          "Liste des BAFM",
          "instructor",
          staffData.instructors
        )}
        {renderStaffSection(
          "Liste des Psychologues",
          "psychologist",
          staffData.psychologists
        )}
      </div>
      {renderModal()}
    </div>
  );
};

export default StaffPage;