"use client";
import React, { useEffect, useState } from "react";
import { PencilIcon, PlusCircleIcon, TrashIcon, ArchiveRestoreIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { StageModal } from "../../components/StageModal";
import {
  Stage,
  StageFormData,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  unarchiveSession,
} from "../../services/stageApi";
import { FaFilePdf, FaCheckCircle, FaPencilAlt, FaTrash, FaFile } from "react-icons/fa";
import Link from "next/link";

// Types from the first page.tsx
interface User {
  createdAt: React.ReactNode;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroPermis: string;
  casStage: string;
  id_recto?: string;
  id_verso?: string;
  permis_recto?: string;
  permis_verso?: string;
  letter_48N?: string;
  extraDocument?: string;
  attestationPdfUrl?: string;
}

interface Session {
  numeroStageAnts: string;
  startDate: string;
  endDate: string;
  location: string;
}

interface SessionUser {
  id: number;
  userId: number;
  sessionId: number;
  isPaid: boolean;
  createdAt: string;
  user: User;
  session: Session;
}

// API to fetch session users
const fetchSessionData = async (sessionId: number): Promise<Stage & { sessionUsers: SessionUser[] }> => {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur fetchSessionData:", error);
    throw error;
  }
};

// Composant Breadcrumbs
const Breadcrumbs = () => (
  <nav className="flex mb-6" aria-label="Breadcrumb">
    <ol className="inline-flex items-center space-x-1 md:space-x-3">
      <li className="inline-flex items-center">
        <Link href="/" className="text-sm text-gray-700 hover:text-blue-600">
          Accueil
        </Link>
      </li>
      <li aria-current="page">
        <div className="flex items-center">
          <span className="text-gray-500">/</span>
          <span className="ml-1 md:ml-2 text-sm font-medium text-gray-900">Sessions</span>
        </div>
      </li>
    </ol>
  </nav>
);

// Session Users Table Component (Adapted from first page.tsx)
const SessionUsersTable: React.FC<{
  sessionUsers: SessionUser[];
  downloadAttestation: (url: string, nom: string, prenom: string) => void;
  handleGenerateAttestation: (sessionId: number, userId: number, nom: string, prenom: string) => Promise<void>;
  handleMarkAsPaid: (sessionUserId: number) => Promise<void>;
  openEditModal: (sessionUser: SessionUser) => void;
  handleArchiveSessionUser: (sessionUserId: number) => Promise<void>;
  isSubmitting: boolean;
}> = ({
  sessionUsers,
  downloadAttestation,
  handleGenerateAttestation,
  handleMarkAsPaid,
  openEditModal,
  handleArchiveSessionUser,
  isSubmitting,
}) => {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Identité</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Email</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Téléphone</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">N° Permis</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Cas Stage</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Inscription</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Statut</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Documents</th>
            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessionUsers.length > 0 ? (
            sessionUsers.map((su) => (
              <tr key={su.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b text-sm text-gray-600">{su.user.nom} {su.user.prenom}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">{su.user.email}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">{su.user.telephone}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">{su.user.numeroPermis}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">{su.user.casStage}</td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">
                  {new Date(su.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      su.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {su.isPaid ? "Payé" : "Non payé"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">
                  <div className="flex flex-wrap gap-2">
                    {su.user.id_recto && (
                      <a
                        href={su.user.id_recto}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <FaFile className="inline w-3 h-3 mr-1" /> ID recto
                      </a>
                    )}
                    {su.user.id_verso && (
                      <a
                        href={su.user.id_verso}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <FaFile className="inline w-3 h-3 mr-1" /> ID verso
                      </a>
                    )}
                    {su.user.permis_recto && (
                      <a
                        href={su.user.permis_recto}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <FaFile className="inline w-3 h-3 mr-1" /> Permis recto
                      </a>
                    )}
                    {su.user.permis_verso && (
                      <a
                        href={su.user.permis_verso}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <FaFile className="inline w-3 h-3 mr-1" /> Permis verso
                      </a>
                    )}
                    {su.user.letter_48N && (
                      <a
                        href={su.user.letter_48N}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <FaFile className="inline w-3 h-3 mr-1" /> Lettre 48N
                      </a>
                    )}
                    {su.user.extraDocument && (
                      <a
                        href={su.user.extraDocument}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                      >
                        <FaFile className="inline w-3 h-3 mr-1" /> Document supplémentaire
                      </a>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4 border-b text-sm text-gray-600">
                  <div className="flex gap-2">
                    {su.user.attestationPdfUrl && (
                      <button
                        onClick={() => downloadAttestation(su.user.attestationPdfUrl!, su.user.nom, su.user.prenom)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        aria-label="Télécharger attestation"
                        title="Télécharger attestation"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    )}
                    {su.isPaid ? (
                      <button
                        onClick={() =>
                          handleGenerateAttestation(su.sessionId, su.userId, su.user.nom, su.user.prenom)
                        }
                        disabled={isSubmitting}
                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        aria-label="Générer attestation"
                        title="Générer attestation"
                      >
                        <FaFilePdf className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsPaid(su.id)}
                        disabled={isSubmitting}
                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                        aria-label="Marquer comme payé"
                        title="Marquer comme payé"
                      >
                        <FaCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(su)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                      aria-label="Modifier"
                      title="Modifier"
                    >
                      <FaPencilAlt className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleArchiveSessionUser(su.id)}
                      disabled={isSubmitting}
                      className="p-1 text-gray-600 hover:text-red-600"
                      aria-label="Archiver"
                      title="Archiver"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="py-4 text-center text-gray-600">
                Aucun inscrit pour ce stage.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const BackofficeStageList: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    selectedStage: null,
  });
  // Accordion state
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);
  const [sessionUsers, setSessionUsers] = useState<{ [key: number]: SessionUser[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Filter states
  const [showArchived, setShowArchived] = useState(false);
  const [showWithInscrits, setShowWithInscrits] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stage | "inscrits";
    direction: "asc" | "desc" | null;
  }>({ key: "numeroStageAnts", direction: null });

  const fetchStages = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      console.log("Sessions reçues:", data);
      setStages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des stages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionUsers = async (sessionId: number) => {
    setLoading(true);
    try {
      const data = await fetchSessionData(sessionId);
      setSessionUsers((prev) => ({ ...prev, [sessionId]: data.sessionUsers }));
    } catch (error) {
      console.error(`Erreur lors du chargement des inscrits pour la session ${sessionId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  // Toggle accordion
  const toggleAccordion = (stageId: number) => {
    if (openAccordionId === stageId) {
      setOpenAccordionId(null);
    } else {
      setOpenAccordionId(stageId);
      if (!sessionUsers[stageId]) {
        fetchSessionUsers(stageId);
      }
    }
  };

  // Filter stages based on criteria
  const filteredStages = stages.filter((stage) => {
    const hasInscrits = 20 - stage.capacity > 0;
    const isInDateRange =
      (!dateRange.start || new Date(stage.startDate) >= dateRange.start) &&
      (!dateRange.end || new Date(stage.endDate) <= dateRange.end);

    if (showArchived && showWithInscrits) {
      return stage.isArchived && hasInscrits && isInDateRange;
    }
    if (showArchived) {
      return stage.isArchived && isInDateRange;
    }
    if (showWithInscrits) {
      return hasInscrits && isInDateRange;
    }
    return isInDateRange;
  });

  // Sort function
  const handleSort = (key: keyof Stage | "inscrits") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedStages = [...filteredStages].sort((a, b) => {
      if (key === "inscrits") {
        const aInscrits = 20 - a.capacity;
        const bInscrits = 20 - b.capacity;
        return direction === "asc"
          ? aInscrits - bInscrits
          : bInscrits - aInscrits;
      }

      if (key === "instructor") {
        const aValue = a.instructor?.lastName || "";
        const bValue = b.instructor?.lastName || "";
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (key === "psychologue") {
        const aValue = a.psychologue?.lastName || "";
        const bValue = b.psychologue?.lastName || "";
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const aValue = a[key];
      const bValue = b[key];

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

    setStages(sortedStages);
    setSortConfig({ key, direction });
  };

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
        case "unarchive":
          if (!modalState.selectedStage?.id) {
            throw new Error("ID manquant pour le désarchivage.");
          }
          await unarchiveSession(modalState.selectedStage.id);
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

  const openModal = (mode: "create" | "edit" | "delete" | "unarchive", stage: Stage | null = null) => {
    setModalState({ isOpen: true, mode, selectedStage: stage });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, selectedStage: null });
  };

  // Handle date input changes
  const handleDateChange = (type: "start" | "end", value: string) => {
    if (!value) {
      setDateRange((prev) => ({ ...prev, [type]: null }));
      return;
    }
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setDateRange((prev) => ({ ...prev, [type]: date }));
    }
  };

  // Session user action handlers
  const downloadAttestation = (url: string, nom: string, prenom: string) => {
    console.log(`Téléchargement attestation pour ${prenom} ${nom} depuis ${url}`);
    window.open(url, "_blank");
  };

  const handleGenerateAttestation = async (sessionId: number, userId: number, nom: string, prenom: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/generate-attestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération de l'attestation");
      }

      const updatedResponse = await fetch(`/api/session-users?userId=${userId}&sessionId=${sessionId}`);
      if (!updatedResponse.ok) {
        throw new Error("Erreur lors de la récupération de l'attestation");
      }
      const updatedData = await updatedResponse.json();
      const updatedSessionUser = updatedData[0];

      if (updatedSessionUser?.user?.attestationPdfUrl) {
        await downloadAttestation(updatedSessionUser.user.attestationPdfUrl, nom, prenom);
      }

      await fetchSessionUsers(sessionId); // Refresh session users
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur inconnue lors de la génération");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (sessionUserId: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/session-users/mark-as-paid", {
        method: "POST",
        body: JSON.stringify({ id: sessionUserId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Erreur lors du marquage comme payé");
      }
      alert("Marqué comme payé");
      await fetchSessionUsers(sessionUsers[sessionUserId]?.[0]?.sessionId || 0); // Refresh session users
    } catch (error) {
      console.error("Erreur marquage comme payé:", error);
      alert("Erreur lors du marquage comme payé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (sessionUser: SessionUser) => {
    console.log(`Ouvrir modal édition pour ${sessionUser.user.prenom} ${sessionUser.user.nom}`);
    // TODO: Implement edit modal for session users
  };

  const handleArchiveSessionUser = async (sessionUserId: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/session-users/archive", {
        method: "POST",
        body: JSON.stringify({ id: sessionUserId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage");
      }
      alert("Inscription archivée");
      await fetchSessionUsers(sessionUsers[sessionUserId]?.[0]?.sessionId || 0); // Refresh session users
    } catch (error) {
      console.error("Erreur archivage:", error);
      alert("Erreur lors de l'archivage");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <Breadcrumbs />
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

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Filtres</h3>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de début</label>
              <input
                type="date"
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input
                type="date"
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-40"
              />
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="mr-2"
              />
              Stages hors ligne
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showWithInscrits}
                onChange={(e) => setShowWithInscrits(e.target.checked)}
                className="mr-2"
              />
              Stages avec inscrits
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Chargement des données...</p>
      ) : (
        <>
          {filteredStages.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="h-[600px] overflow-y-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("numeroStageAnts")}
                      >
                        N° ANTS {sortConfig.key === "numeroStageAnts" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("startDate")}
                      >
                        Dates {sortConfig.key === "startDate" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("instructor")}
                      >
                        Instructeur {sortConfig.key === "instructor" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("psychologue")}
                      >
                        Psychologue {sortConfig.key === "psychologue" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        Prix {sortConfig.key === "price" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
                      </th>
                      <th
                        className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                        onClick={() => handleSort("inscrits")}
                      >
                        Inscrits {sortConfig.key === "inscrits" && (sortConfig.direction === "asc" ? "↑" : sortConfig.direction === "desc" ? "↓" : "")}
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
                    {filteredStages.map((stage) => (
                      <React.Fragment key={stage.id}>
                        <tr className={`border-b hover:bg-gray-50 ${stage.isArchived ? "opacity-60" : ""}`}>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            <button
                              onClick={() => toggleAccordion(stage.id)}
                              className="flex items-center text-blue-600 hover:underline"
                            >
                              {stage.numeroStageAnts}
                              {openAccordionId === stage.id ? (
                                <ChevronUpIcon className="w-4 h-4 ml-2" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 ml-2" />
                              )}
                            </button>
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            {new Date(stage.startDate).toLocaleDateString()} -{" "}
                            {new Date(stage.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            {stage.instructor
                              ? `${stage.instructor.firstName} ${stage.instructor.lastName}`
                              : "Aucun"}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            {stage.psychologue
                              ? `${stage.psychologue.firstName} ${stage.psychologue.lastName}`
                              : "Aucun"}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            {stage.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                stage.capacity <= 5 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {20 - stage.capacity}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                stage.isArchived ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {stage.isArchived ? "Hors ligne" : "En ligne"}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-600">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal("edit", stage)}
                                title="Modifier le stage"
                                className="p-2 text-gray-600 hover:text-blue-600"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              {stage.isArchived ? (
                                <button
                                  onClick={() => openModal("unarchive", stage)}
                                  className="p-2 text-gray-600 hover:text-green-600"
                                  title="Remettre en ligne"
                                >
                                  <ArchiveRestoreIcon className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openModal("delete", stage)}
                                  className="p-2 text-gray-600 hover:text-red-600"
                                  title="Archiver"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {openAccordionId === stage.id && (
                          <tr>
                            <td colSpan={8} className="py-4 px-4 bg-gray-50">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Inscrits</h4>
                              <SessionUsersTable
                                sessionUsers={sessionUsers[stage.id] || []}
                                downloadAttestation={downloadAttestation}
                                handleGenerateAttestation={handleGenerateAttestation}
                                handleMarkAsPaid={handleMarkAsPaid}
                                openEditModal={openEditModal}
                                handleArchiveSessionUser={handleArchiveSessionUser}
                                isSubmitting={isSubmitting}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Aucun stage trouvé avec ces filtres.</p>
          )}
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