"use client";

import React, { useState, useEffect } from "react";
import { PlusCircleIcon, PencilIcon, TrashIcon, UserIcon } from "lucide-react";
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
import { StaffForm, StaffFormData } from "../../components/StaffForm";
import { AcademicCapIcon } from "@heroicons/react/solid";

interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "delete" | null;
  selectedStaff: Staff | null;
  staffType: StaffType | null;
}

interface SortConfig {
  key: keyof Staff | "staffType";
  direction: "asc" | "desc" | null;
}

interface StaffWithType extends Staff {
  staffType: StaffType;
}

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
  const [staffTypeFilter, setStaffTypeFilter] = useState<"all" | StaffType>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "lastName",
    direction: null,
  });

  const fetchStaffData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [instructors, psychologists] = await Promise.all([
        getInstructors(),
        getPsychologists(),
      ]);
      console.log("Instructeurs reçus:", instructors);
      console.log("Psychologues reçus:", psychologists);
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

  // Fusionner instructeurs et psychologues en une liste avec staffType
  const allStaff: StaffWithType[] = [
    ...staffData.instructors.map((staff) => ({ ...staff, staffType: "instructor" as StaffType })),
    ...staffData.psychologists.map((staff) => ({ ...staff, staffType: "psychologist" as StaffType })),
  ];

  // Filtrer selon staffTypeFilter
  const filteredStaff = staffTypeFilter === "all"
    ? allStaff
    : allStaff.filter((staff) => staff.staffType === staffTypeFilter);

  console.log("Personnel filtré:", filteredStaff);

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

  const openModal = (mode: "create" | "edit" | "delete", staffType: StaffType, staff?: Staff) => {
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

  // Sort function
  const handleSort = (key: keyof Staff | "staffType") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedStaff = [...filteredStaff].sort((a, b) => {
      if (key === "staffType") {
        const aValue = a.staffType;
        const bValue = b.staffType;
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const aValue = a[key as keyof Staff] ?? "";
      const bValue = b[key as keyof Staff] ?? "";

      if (aValue === null || aValue === undefined) return direction === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return direction === "asc" ? 1 : -1;

      if (typeof aValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue as string)
          : bValue.localeCompare(aValue as string);
      }

      return direction === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setStaffData((prev) => ({
      instructors: prev.instructors.map((staff) =>
        sortedStaff.find((s) => s.id === staff.id && s.staffType === "instructor") || staff
      ),
      psychologists: prev.psychologists.map((staff) =>
        sortedStaff.find((s) => s.id === staff.id && s.staffType === "psychologist") || staff
      ),
    }));

    setSortConfig({ key, direction });
  };

  const renderModal = () => {
    if (!modalState.isOpen || !modalState.mode || !modalState.staffType) return null;

    const staffTypeLabel =
      modalState.staffType === "instructor" ? "instructeur" : "psychologue";

    const titleMap: Record<"create" | "edit" | "delete", string> = {
      create: `Ajouter un ${staffTypeLabel}`,
      edit: `Modifier le ${staffTypeLabel}`,
      delete: `Archiver le ${staffTypeLabel}`,
    };

    const title = titleMap[modalState.mode];

    if (modalState.mode === "delete") {
      return (
        <Modal isOpen={modalState.isOpen} onClose={closeModal} title={title}>
          <div>
            <p className="mb-4">
              {`Êtes-vous sûr de vouloir archiver ce ${staffTypeLabel} ?`}
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
        {/* Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Filtres</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={staffTypeFilter}
                onChange={(e) => setStaffTypeFilter(e.target.value as "all" | StaffType)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-40"
              >
                <option value="all">Tous</option>
                <option value="instructor">BAFM</option>
                <option value="psychologist">Psy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Liste des Animateurs</h2>
            <div className="flex gap-2">
              <button
                onClick={() => openModal("create", "instructor")}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Ajouter un BAFM"
              >
                <UserIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => openModal("create", "psychologist")}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Ajouter un psychologue"
              >
                <AcademicCapIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {filteredStaff.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="h-[600px] overflow-y-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                 
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("staffType")}
                      >
                        Type {sortConfig.key === "staffType" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("firstName")}
                      >
                        Prénom {sortConfig.key === "firstName" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("lastName")}
                      >
                        Nom {sortConfig.key === "lastName" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("email")}
                      >
                        Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("phone")}
                      >
                        Téléphone {sortConfig.key === "phone" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("isArchived")}
                      >
                        Statut {sortConfig.key === "isArchived" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff) => (
                      <tr key={`${staff.staffType}-${staff.id}`} className={`border-b hover:bg-gray-50 ${staff.isArchived ? "opacity-60" : ""}`}>

                        <td className="py-2 px-4 text-sm text-gray-600">
                          {staff.staffType === "instructor" ? "BAFM" : "Psychologue"}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">{staff.firstName}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">{staff.lastName}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">{staff.email}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">{staff.phone}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              staff.isArchived ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {staff.isArchived ? "Archivé" : "Actif"}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal("edit", staff.staffType, staff)}
                              title="Modifier"
                              className="p-2 text-gray-600 hover:text-blue-600"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal("delete", staff.staffType, staff)}
                              title="Archiver"
                              className="p-2 text-gray-600 hover:text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Aucun animateur trouvé avec ce filtre.
            </p>
          )}
        </section>

        {renderModal()}
      </div>
    </div>
  );
};

export default StaffPage;