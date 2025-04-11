"use client";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusCircleIcon, SearchIcon, FilterIcon } from "@heroicons/react/solid";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

// Types basés sur votre Prisma schema et API
interface Session {
  id: number;
  numeroStageAnts: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  id_recto?: string;
  id_verso?: string;
  permis_recto?: string;
  permis_verso?: string;
  attestationPdf?: string;
}

interface SessionUser {
  id: number;
  sessionId: number;
  userId: number;
  isPaid: boolean;
  isArchived: boolean;
  createdAt: string;
  session: Session;
  user: User & { attestationPdfUrl?: string };
}

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  sessionId: string;
  id_recto?: string;
  id_verso?: string;
  permis_recto?: string;
  permis_verso?: string;
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
  });

  const [newFiles, setNewFiles] = useState<{ [key: string]: File | null }>({
    scanPermisRecto: null,
    scanPermisVerso: null,
    scanIdentiteRecto: null,
    scanIdentiteVerso: null,
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
  });

  const [editFiles, setEditFiles] = useState<{ [key: string]: File | null }>({
    scanPermisRecto: null,
    scanPermisVerso: null,
    scanIdentiteRecto: null,
    scanIdentiteVerso: null,
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
      });
      setNewFiles({
        scanPermisRecto: null,
        scanPermisVerso: null,
        scanIdentiteRecto: null,
        scanIdentiteVerso: null,
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
    });
    setEditFiles({
      scanPermisRecto: null,
      scanPermisVerso: null,
      scanIdentiteRecto: null,
      scanIdentiteVerso: null,
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
          <PlusCircleIcon className="w-6 h-6" />
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

      <ul className="space-y-6">
        {filteredSessionUsers.length ? (
          filteredSessionUsers.map((su) => (
            <li
              key={su.id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="font-medium text-lg text-blue-700">{su.user.prenom} {su.user.nom}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {su.user.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {su.user.telephone}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                    <span className="font-medium">Permis:</span> {su.user.numeroPermis}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="font-medium">Cas:</span> {su.user.casStage}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-md font-bold text-gray-800 bg-gray-100 p-2 rounded">
                    Session {su.session.numeroStageAnts}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Du {new Date(su.session.startDate).toLocaleDateString()} au{" "}
                    {new Date(su.session.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">Lieu:</span> {su.session.location}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Inscription:</span> {new Date(su.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        su.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {su.isPaid ? "Payé" : "Non payé"}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {su.user.id_recto && (
                        <a
                          href={su.user.id_recto}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline bg-blue-50 p-2 rounded flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          CNI recto
                        </a>
                      )}
                      {su.user.id_verso && (
                        <a
                          href={su.user.id_verso}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline bg-blue-50 p-2 rounded flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          CNI verso
                        </a>
                      )}
                      {su.user.permis_recto && (
                        <a
                          href={su.user.permis_recto}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline bg-blue-50 p-2 rounded flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Permis recto
                        </a>
                      )}
                      {su.user.permis_verso && (
                        <a
                          href={su.user.permis_verso}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline bg-blue-50 p-2 rounded flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Permis verso
                        </a>
                      )}
                    </div>
                  </div>
                  {su.user.attestationPdfUrl && (
                    <button
                      onClick={() => downloadAttestation(su.user.attestationPdfUrl!, su.user.nom, su.user.prenom)}
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
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
                      Télécharger attestation
                    </button>
                  )}
                  <div className="flex justify-end space-x-3 mt-4">
                    {!su.isPaid && (
                      <button
                        onClick={() => handleMarkAsPaid(su.id)}
                        disabled={isSubmitting}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm transition-colors"
                      >
                        Marquer payé
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(su)}
                      className="p-2 text-gray-600 hover:text-blue-600"
                      title="Modifier"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleArchiveSessionUser(su.id)}
                      disabled={isSubmitting}
                      className="p-2 text-gray-600 hover:text-red-600"
                      title="Archiver"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-600 text-center py-4">Aucune inscription trouvée.</li>
        )}
      </ul>

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