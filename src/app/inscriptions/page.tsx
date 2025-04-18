"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { FaCheckCircle, FaFilePdf, FaPencilAlt, FaTrash, FaFile, FaFileAlt, FaFileDownload } from 'react-icons/fa';
import {User,FormData, SessionUser} from "@/services/sessionUserApi"

// Types basés sur votre Prisma schema et API
interface Session {
  id: number;
  numeroStageAnts: string;
  startDate: string;
  endDate: string;
}

interface SessionUser {
  id: number;
  sessionId: number;
  userId: number;
  isPaid: boolean;
  isArchived: boolean;
  createdAt: string;
  session: Session;
  user: User;
}

// Initialisation de Supabase
const supabase = createClient(
  process.env.SUPABASE_DATABASE_URL || "https://fewxlrfepeidboogmhbv.supabase.co",
  process.env.PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
);

// Fonction pour uploader les fichiers vers Supabase
const uploadFilesToSupabase = async (
  id: string,
  files: { [key: string]: File | null }
): Promise<{ [key: string]: string }> => {
  const uploadedPaths: { [key: string]: string } = {};
  const fileFields = {
    scanPermisRecto: "permis_recto",
    scanPermisVerso: "permis_verso",
    scanIdentiteRecto: "id_recto",
    scanIdentiteVerso: "id_verso",
    scanletter_48N: "letter_48N",
  };

  for (const [field, dbField] of Object.entries(fileFields)) {
    const file = files[field];
    if (file) {
      const filePath = `${id}/${dbField}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("documents").upload(filePath, file, { upsert: true });
      if (error) throw new Error(`Erreur d'upload pour ${dbField}: ${error.message}`);
      const { publicUrl } = supabase.storage.from("documents").getPublicUrl(filePath).data;
      uploadedPaths[dbField] = publicUrl;
    }
  }
  return uploadedPaths;
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
      <li>
        <div className="flex items-center">
          <span className="text-gray-500">/</span>
          <Link href="/sessions" className="ml-1 md:ml-2 text-sm text-gray-700 hover:text-blue-600">
            Sessions
          </Link>
        </div>
      </li>
      <li aria-current="page">
        <div className="flex items-center">
          <span className="text-gray-500">/</span>
          <span className="ml-1 md:ml-2 text-sm font-medium text-gray-900">Inscrits</span>
        </div>
      </li>
    </ol>
  </nav>
);

// Composant Tableau Excel-like
interface SortConfig {
  key: keyof SessionUser | string;
  direction: 'asc' | 'desc' | null;
}

const SessionUsersTable: React.FC<{
  filteredSessionUsers: SessionUser[];
  downloadAttestation: (url: string, nom: string, prenom: string) => void;
  handleGenerateAttestation: (sessionId: number, userId: number, nom: string, prenom: string) => void;
  handleMarkAsPaid: (sessionUserId: number) => void;
  openEditModal: (sessionUser: SessionUser) => void;
  handleArchiveSessionUser: (sessionUserId: number) => void;
  isSubmitting: boolean;
}> = ({
  filteredSessionUsers,
  downloadAttestation,
  handleGenerateAttestation,
  handleMarkAsPaid,
  openEditModal,
  handleArchiveSessionUser,
  isSubmitting,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'user.nom', direction: null });

  const handleSort = (key: keyof SessionUser | string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedUsers = [...filteredSessionUsers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (key.includes('user.')) {
        const field = key.split('.')[1];
        aValue = a.user[field as keyof SessionUser['user']] ?? '';
        bValue = b.user[field as keyof SessionUser['user']] ?? '';
      } else if (key.includes('session.')) {
        const field = key.split('.')[1];
        aValue = a.session[field as keyof SessionUser['session']] ?? '';
        bValue = b.session[field as keyof SessionUser['session']] ?? '';
      } else {
        aValue = a[key as keyof SessionUser] ?? '';
        bValue = b[key as keyof SessionUser] ?? '';
      }

      if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;

      if (typeof aValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue as string)
          : bValue.localeCompare(aValue as string);
      }

      return direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    filteredSessionUsers = sortedUsers;
    setSortConfig({ key, direction });
  };

  console.log('SessionUsers filtrés:', filteredSessionUsers);

  return (
    <div className="overflow-x-auto">
      <div className="h-[600px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('user.prenom')}
              >
                Identité {sortConfig.key === 'user.prenom' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('session.numeroStageAnts')}
              >
                Numéro ANTS {sortConfig.key === 'session.numeroStageAnts' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('session.startDate')}
              >
                Dates {sortConfig.key === 'session.startDate' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('user.email')}
              >
                Email {sortConfig.key === 'user.email' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('user.telephone')}
              >
                Téléphone {sortConfig.key === 'user.telephone' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('user.numeroPermis')}
              >
                Numéro de permis {sortConfig.key === 'user.numeroPermis' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('user.casStage')}
              >
                Cas de stage {sortConfig.key === 'user.casStage' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Inscription {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th
                className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('isPaid')}
              >
                Paiement {sortConfig.key === 'isPaid' && (sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : '')}
              </th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700">Documents</th>
              <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessionUsers.length ? (
              filteredSessionUsers.map((su) => (
                <tr key={su.id} className={`border-b hover:bg-gray-50 ${su.isPaid ? '' : 'opacity-80'}`}>
                  <td className="py-2 px-4 text-sm text-gray-600">{su.user.prenom} {su.user.nom}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">{su.session.numeroStageAnts}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {new Date(su.session.startDate).toLocaleDateString()} -{' '}
                    {new Date(su.session.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">{su.user.email}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">{su.user.telephone}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">{su.user.numeroPermis}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">{su.user.casStage}</td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    {new Date(su.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        su.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {su.isPaid ? 'Payé' : 'Non payé'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-2">
                      {su.user.id_recto && (
                        <a
                          href={su.user.id_recto}
                          target="_blank"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                          title="ID recto"
                        >
                          <FaFile className="w-3 h-3 mr-1" /> ID recto
                        </a>
                      )}
                      {su.user.id_verso && (
                        <a
                          href={su.user.id_verso}
                          target="_blank"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                          title="ID verso"
                        >
                          <FaFile className="w-3 h-3 mr-1" /> ID verso
                        </a>
                      )}
                      {su.user.permis_recto && (
                        <a
                          href={su.user.permis_recto}
                          target="_blank"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                          title="Permis recto"
                        >
                          <FaFile className="w-3 h-3 mr-1" /> Permis recto
                        </a>
                      )}
                      {su.user.permis_verso && (
                        <a
                          href={su.user.permis_verso}
                          target="_blank"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                          title="Permis verso"
                        >
                          <FaFile className="w-3 h-3 mr-1" /> Permis verso
                        </a>
                      )}
                      {su.user.letter_48N && (
                        <a
                          href={su.user.letter_48N}
                          target="_blank"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                          title="Lettre 48N"
                        >
                          <FaFile className="w-3 h-3 mr-1" /> Lettre 48N
                        </a>
                      )}
                      {su.user.extraDocument && (
                        <a
                          href={su.user.extraDocument}
                          target="_blank"
                          className="text-blue-600 hover:underline flex items-center text-xs"
                          title="Document supplémentaire"
                        >
                          <FaFile className="w-3 h-3 mr-1" /> Document supplémentaire
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-600">
                    <div className="flex gap-2">
                      {su.user.attestationPdfUrl && (
                        <button
                          onClick={() => downloadAttestation(su.user.attestationPdfUrl!, su.user.nom, su.user.prenom)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          aria-label="Télécharger attestation"
                          title="Télécharger attestation"
                        >
                          <FaFileDownload className="w-4 h-4" />
                        </button>
                      )}
                      {su.isPaid ? (
                        <button
                          onClick={() =>
                            handleGenerateAttestation(su.sessionId, su.userId, su.user.nom, su.user.prenom)
                          }
                          disabled={isSubmitting}
                          className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                          aria-label="Générer attestation"
                          title="Générer attestation"
                        >
                          <FaFilePdf className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsPaid(su.id)}
                          disabled={isSubmitting}
                          className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-400"
                          aria-label="Marquer comme payé"
                          title="Marquer comme payé"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(su)}
                        className="p-1 text-gray-600 hover:text-blue-600"
                        aria-label="Modifier"
                        title="Modifier"
                      >
                        <FaPencilAlt className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveSessionUser(su.id)}
                        disabled={isSubmitting}
                        className="p-1 text-gray-600 hover:text-red-600 disabled:text-gray-400"
                        aria-label="Archiver"
                        title="Archiver"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="py-4 text-center text-gray-600">
                  Aucune inscription trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant principal du backoffice
export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [filteredSessionUsers, setFilteredSessionUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSessionUser, setSelectedSessionUser] = useState<SessionUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<number | "all">("all");

  const [newSessionUser, setNewSessionUser] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
    sessionId: "",
    id_recto: "",
    id_verso: "",
    permis_recto: "",
    permis_verso: "",
    letter_48N: "",
  });

  const [newFiles, setNewFiles] = useState<{ [key: string]: File | null }>({
    scanPermisRecto: null,
    scanPermisVerso: null,
    scanIdentiteRecto: null,
    scanIdentiteVerso: null,
    scanletter_48N: null,
  });

  const [editFormData, setEditFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
    sessionId: "",
    id_recto: "",
    id_verso: "",
    permis_recto: "",
    permis_verso: "",
    letter_48N: "",
  });

  const [editFiles, setEditFiles] = useState<{ [key: string]: File | null }>({
    scanPermisRecto: null,
    scanPermisVerso: null,
    scanIdentiteRecto: null,
    scanIdentiteVerso: null,
    scanletter_48N: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, usersRes] = await Promise.all([
        fetch("/api/sessions").then((res) => {
          if (!res.ok) throw new Error("Erreur lors du chargement des sessions");
          return res.json();
        }),
        fetch("/api/session-users").then((res) => {
          if (!res.ok) throw new Error("Erreur lors du chargement des inscriptions");
          return res.json();
        }),
      ]);

      const activeSessionUsers = usersRes.filter((su: SessionUser) => !su.isArchived);
      setSessions(sessionsRes);
      setSessionUsers(activeSessionUsers);
      setFilteredSessionUsers(activeSessionUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = sessionUsers;

    if (selectedSessionId !== "all") {
      result = result.filter((su) => su.sessionId === selectedSessionId);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (su) =>
          su.user.nom.toLowerCase().includes(term) ||
          su.user.prenom.toLowerCase().includes(term) ||
          su.user.email.toLowerCase().includes(term) ||
          su.user.numeroPermis.toLowerCase().includes(term) ||
          su.session.numeroStageAnts.toLowerCase().includes(term)
      );
    }

    setFilteredSessionUsers(result);
  }, [searchTerm, selectedSessionId, sessionUsers]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    isEdit = false
  ) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewSessionUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    isEdit = false
  ) => {
    const file = e.target.files?.[0] || null;
    if (isEdit) {
      setEditFiles((prev) => ({ ...prev, [field]: file }));
    } else {
      setNewFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSessionId("all");
  };

  const handleAddSessionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tempId = uuidv4();
      const uploadedPaths = await uploadFilesToSupabase(tempId, newFiles);

      const response = await fetch("/api/session-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          civilite: "M.",
          nom: newSessionUser.nom,
          prenom: newSessionUser.prenom,
          email: newSessionUser.email,
          telephone: newSessionUser.telephone,
          numeroPermis: newSessionUser.numeroPermis,
          dateDelivrancePermis: newSessionUser.dateDelivrancePermis,
          prefecture: newSessionUser.prefecture,
          etatPermis: newSessionUser.etatPermis,
          casStage: newSessionUser.casStage,
          sessionId: Number(newSessionUser.sessionId),
          adresse: "Adresse par défaut",
          codePostal: "00000",
          ville: "Ville par défaut",
          nationalite: "Française",
          dateNaissance: "1990-01-01",
          codePostalNaissance: "00000",
          id_recto: uploadedPaths.id_recto || null,
          id_verso: uploadedPaths.id_verso || null,
          permis_recto: uploadedPaths.permis_recto || null,
          permis_verso: uploadedPaths.permis_verso || null,
          letter_48N: uploadedPaths.letter_48N || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création de l'inscription");
      }

      setShowAddModal(false);
      setNewSessionUser({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        numeroPermis: "",
        dateDelivrancePermis: "",
        prefecture: "",
        etatPermis: "",
        casStage: "",
        sessionId: "",
        id_recto: "",
        id_verso: "",
        permis_recto: "",
        permis_verso: "",
        letter_48N: "",
      });
      setNewFiles({
        scanPermisRecto: null,
        scanPermisVerso: null,
        scanIdentiteRecto: null,
        scanIdentiteVerso: null,
        scanletter_48N: null,
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSessionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionUser) return;
    setIsSubmitting(true);
    try {
      const uploadedPaths = await uploadFilesToSupabase(selectedSessionUser.user.id.toString(), editFiles);

      const response = await fetch(`/api/session-users/${selectedSessionUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: editFormData.nom,
          prenom: editFormData.prenom,
          email: editFormData.email,
          telephone: editFormData.telephone,
          numeroPermis: editFormData.numeroPermis,
          dateDelivrancePermis: editFormData.dateDelivrancePermis,
          prefecture: editFormData.prefecture,
          etatPermis: editFormData.etatPermis,
          casStage: editFormData.casStage,
          sessionId: Number(editFormData.sessionId),
          id_recto: uploadedPaths.id_recto || editFormData.id_recto,
          id_verso: uploadedPaths.id_verso || editFormData.id_verso,
          permis_recto: uploadedPaths.permis_recto || editFormData.permis_recto,
          permis_verso: uploadedPaths.permis_verso || editFormData.permis_verso,
          letter_48N: uploadedPaths.letter_48N || editFormData.letter_48N,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification de l'inscription");
      }

      setShowEditModal(false);
      setSelectedSessionUser(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveSessionUser = async (id: number) => {
    if (!confirm("Voulez-vous vraiment archiver cette inscription ?")) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/session-users/archive", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'archivage");
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/session-users/mark-as-paid", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du marquage comme payé");
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
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

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue lors de la génération");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAttestation = async (url: string, nom: string, prenom: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du téléchargement de l'attestation");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `attestation_${nom}_${prenom}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du téléchargement");
    }
  };

  const openEditModal = (sessionUser: SessionUser) => {
    setSelectedSessionUser(sessionUser);
    setEditFormData({
      nom: sessionUser.user.nom || "",
      prenom: sessionUser.user.prenom || "",
      email: sessionUser.user.email || "",
      telephone: sessionUser.user.telephone || "",
      numeroPermis: sessionUser.user.numeroPermis || "",
      dateDelivrancePermis: sessionUser.user.dateDelivrancePermis || "",
      prefecture: sessionUser.user.prefecture || "",
      etatPermis: sessionUser.user.etatPermis || "",
      casStage: sessionUser.user.casStage || "",
      sessionId: sessionUser.sessionId.toString() || "",
      id_recto: sessionUser.user.id_recto || "",
      id_verso: sessionUser.user.id_verso || "",
      permis_recto: sessionUser.user.permis_recto || "",
      permis_verso: sessionUser.user.permis_verso || "",
      letter_48N: sessionUser.user.letter_48N || "",
    });
    setEditFiles({
      scanPermisRecto: null,
      scanPermisVerso: null,
      scanIdentiteRecto: null,
      scanIdentiteVerso: null,
      scanletter_48N: null,
    });
    setShowEditModal(true);
  };

  if (loading) return <div className="p-6 text-gray-600">Chargement des données...</div>;
  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Gestion des Inscriptions</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
          title="Ajouter une inscription"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher par nom, prénom, email, n° permis..."
              />
            </div>
          </div>
          <div className="md:w-1/3">
            <select
              value={selectedSessionId === "all" ? "all" : selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.numeroStageAnts} ({new Date(session.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <div className="md:w-1/6 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Affichage de {filteredSessionUsers.length} inscription(s) sur {sessionUsers.length} au total
        </div>
      </div>

      <SessionUsersTable
        filteredSessionUsers={filteredSessionUsers}
        downloadAttestation={downloadAttestation}
        handleGenerateAttestation={handleGenerateAttestation}
        handleMarkAsPaid={handleMarkAsPaid}
        openEditModal={openEditModal}
        handleArchiveSessionUser={handleArchiveSessionUser}
        isSubmitting={isSubmitting}
      />

      {/* Modal d’ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Ajouter une Inscription</h3>
            <form onSubmit={handleAddSessionUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: "nom", label: "Nom", type: "text" },
                  { name: "prenom", label: "Prénom", type: "text" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "telephone", label: "Téléphone", type: "text" },
                  { name: "numeroPermis", label: "Numéro de Permis", type: "text" },
                  { name: "dateDelivrancePermis", label: "Date de Délivrance", type: "date" },
                  { name: "prefecture", label: "Préfecture", type: "text" },
                  { name: "casStage", label: "Cas de Stage", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={newSessionUser[field.name as keyof FormData]}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700">État du Permis</label>
                  <select
                    name="etatPermis"
                    value={newSessionUser.etatPermis}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="">Sélectionnez un état</option>
                    <option value="Valide">Valide</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    name="sessionId"
                    value={newSessionUser.sessionId}
                    onChange={handleInputChange}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="">Sélectionnez une session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.numeroStageAnts} ({new Date(session.startDate).toLocaleDateString()} -{" "}
                        {new Date(session.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                {[
                  { name: "scanIdentiteRecto", label: "Carte d’identité (recto)" },
                  { name: "scanIdentiteVerso", label: "Carte d’identité (verso)" },
                  { name: "scanPermisRecto", label: "Permis (recto)" },
                  { name: "scanPermisVerso", label: "Permis (verso)" },
                  { name: "scanletter_48N", label: "Lettre 48N" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) => handleFileChange(e, field.name)}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
                      accept="image/*,application/pdf"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d’édition */}
      {showEditModal && selectedSessionUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Modifier l’Inscription</h3>
            <form onSubmit={handleEditSessionUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: "nom", label: "Nom", type: "text" },
                  { name: "prenom", label: "Prénom", type: "text" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "telephone", label: "Téléphone", type: "text" },
                  { name: "numeroPermis", label: "Numéro de Permis", type: "text" },
                  { name: "dateDelivrancePermis", label: "Date de Délivrance", type: "date" },
                  { name: "prefecture", label: "Préfecture", type: "text" },
                  { name: "casStage", label: "Cas de Stage", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={editFormData[field.name as keyof FormData]}
                      onChange={(e) => handleInputChange(e, true)}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700">État du Permis</label>
                  <select
                    name="etatPermis"
                    value={editFormData.etatPermis}
                    onChange={(e) => handleInputChange(e, true)}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="">Sélectionnez un état</option>
                    <option value="Valide">Valide</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    name="sessionId"
                    value={editFormData.sessionId}
                    onChange={(e) => handleInputChange(e, true)}
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="">Sélectionnez une session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.numeroStageAnts} ({new Date(session.startDate).toLocaleDateString()} -{" "}
                        {new Date(session.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                {[
                  { name: "scanIdentiteRecto", label: "Carte d’identité (recto)", key: "id_recto" },
                  { name: "scanIdentiteVerso", label: "Carte d’identité (verso)", key: "id_verso" },
                  { name: "scanPermisRecto", label: "Permis (recto)", key: "permis_recto" },
                  { name: "scanPermisVerso", label: "Permis (verso)", key: "permis_verso" },
                  { name: "scanletter_48N", label: "Lettre 48N", key: "letter_48N" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type="file"
                      name={field.name}
                      onChange={(e) => handleFileChange(e, field.name, true)}
                      className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
                      accept="image/*,application/pdf"
                    />
                    {editFormData[field.key as keyof FormData] && (
                      <a
                        href={editFormData[field.key as keyof FormData]}
                        target="_blank"
                        className="mt-1 block text-blue-600 hover:underline text-sm"
                      >
                        Voir fichier actuel
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}