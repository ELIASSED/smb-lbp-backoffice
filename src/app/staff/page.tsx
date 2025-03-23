"use client";

import React, { useState, useEffect } from "react";
import { PlusCircleIcon } from "lucide-react";

import {
  getInstructors,
  getPsychologists,
  createStaff,
  updateStaff,
  archiveStaff,
  Staff,
  StaffType,
} from "@/services/staffApi";

import { Modal } from "../../components/StaffModal";
import { StaffListItem } from "@/components/StaffListItem";
import { StaffForm,  StaffFormData } from "../../components/StaffForm";

/** Structure du state pour la modale */
interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "delete" | null;
  selectedStaff: Staff | null;
  staffType: StaffType | null;
}

const StaffPage: React.FC = () => {
  // État global : instructeurs et psychologues
  const [staffData, setStaffData] = useState<{
    instructors: Staff[];
    psychologists: Staff[];
  }>({
    instructors: [],
    psychologists: [],
  });

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État de la modale
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    selectedStaff: null,
    staffType: null,
  });

  /** Récupération des données depuis l'API */
  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupère instructeurs et psychologues en parallèle
      const [instructors, psychologists] = await Promise.all([
        getInstructors(),
        getPsychologists(),
      ]);
      setStaffData({ instructors, psychologists });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  /** Gère la création, modification, suppression/archivage */
  const handleStaffOperation = async (
    operation: "create" | "edit" | "archive",
    staffType: StaffType,
    data?: StaffFormData
  ) => {
    try {
      if (!staffType) throw new Error("Type de staff manquant");

      if ((operation === "edit" || operation === "archive") && !modalState.selectedStaff?.id) {
        throw new Error("ID manquant pour l'opération");
      }

      if (operation === "create" && data) {
        await createStaff(staffType, data);
      }

      if (operation === "edit" && data && modalState.selectedStaff) {
        await updateStaff(staffType, modalState.selectedStaff.id, data);
      }

      if (operation === "archive" && modalState.selectedStaff) {
        await archiveStaff(staffType, modalState.selectedStaff.id);
      }

      alert("Opération réussie !");
      await fetchStaffData();
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  /** Ouvre la modale */
  const openModal = (mode: "create" | "edit" | "delete", staffType: StaffType, staff?: Staff) => {
    setModalState({
      isOpen: true,
      mode,
      selectedStaff: staff || null,
      staffType,
    });
  };

  /** Ferme la modale */
  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: null,
      selectedStaff: null,
      staffType: null,
    });
  };

  /** Rendu d'une section (Instructeurs ou Psychologues) */
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
          {`Nouveau ${
            staffType === "instructor" ? "instructeur" : "psychologue"
          }`}
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

  /** Rendu de la modale */
  const renderModal = () => {
    if (!modalState.isOpen || !modalState.mode || !modalState.staffType) return null;

    const staffTypeLabel =
      modalState.staffType === "instructor" ? "instructeur" : "psychologue";

    const titleMap: Record<"create" | "edit" | "delete", string> = {
      create: `Ajouter un ${staffTypeLabel}`,
      edit: `Modifier le ${staffTypeLabel}`,
      delete: `Supprimer le ${staffTypeLabel}`,
    };

    const title = titleMap[modalState.mode];

    if (modalState.mode === "delete") {
      return (
        <Modal isOpen={modalState.isOpen} onClose={closeModal} title={title}>
          <div>
            <p className="mb-4">
              {`Êtes-vous sûr de vouloir supprimer ce ${staffTypeLabel} ?`}
            </p>
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
                onClick={() =>
                  handleStaffOperation("archive", modalState.staffType!)
                }
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Archiver
              </button>
            </div>
          </div>
        </Modal>
      );
    }

    // Sinon, "create" ou "edit"
    return (
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={title}>
        <StaffForm
          initialData={modalState.selectedStaff || undefined}
          mode={modalState.mode}
          onSubmit={(data) =>
            handleStaffOperation(
              modalState.mode === "create" ? "create" : "edit",
              modalState.staffType!,
              data
            )
          }
          onCancel={closeModal}
        />
      </Modal>
    );
  };

  // Affichage principal
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Gestion des Animateurs</h2>
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
    </div>
  );
};

export default StaffPage;
