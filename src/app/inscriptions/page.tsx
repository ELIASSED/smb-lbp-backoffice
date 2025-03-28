"use client";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { SessionUser, Session } from "../../services/sessionUserApi";
import { updateRegistration, archiveRegistration, getStages } from "../../services/registrationApi";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.SUPABASE_DATABASE_URL || "https://fewxlrfepeidboogmhbv.supabase.co",
  process.env.PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
);

interface Stage {
  id: number;
  numeroStageAnts: string;
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
  id_recto: string;
  id_verso: string;
  permis_recto: string;
  permis_verso: string;
}

const uploadFilesToSupabase = async (id: string, files: { [key: string]: File | null }): Promise<{ [key: string]: string }> => {
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
      const { data, error } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error(`Erreur d'upload pour ${field}:`, error.message);
        throw new Error(`Échec de l'upload de ${field}: ${error.message}`);
      }

      const { publicUrl } = supabase.storage.from("documents").getPublicUrl(filePath).data;
      uploadedPaths[dbField] = publicUrl;
    }
  }

  return uploadedPaths;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"edit" | "archive" | null>(null);
  const [selectedSessionUser, setSelectedSessionUser] = useState<SessionUser | undefined>(undefined);
  const [stageList, setStageList] = useState<Stage[]>([]);

  const [newSessionUser, setNewSessionUser] = useState({
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

  const [newSessionUserFiles, setNewSessionUserFiles] = useState<{ [key: string]: File | null }>({
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

  const [editFormFiles, setEditFormFiles] = useState<{ [key: string]: File | null }>({
    scanPermisRecto: null,
    scanPermisVerso: null,
    scanIdentiteRecto: null,
    scanIdentiteVerso: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) throw new Error("Erreur lors de la récupération des sessions");
      const data: Session[] = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/session-users");
      if (!response.ok) throw new Error("Erreur lors de la récupération des inscriptions");
      const data: SessionUser[] = await response.json();
      setSessionUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const stages = await getStages();
      console.log("Stages récupérés :", stages); // Pour déboguer
      if (stages && Array.isArray(stages)) {
        setStageList(stages);
      } else {
        throw new Error("Les données des stages ne sont pas valides");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des stages :", error);
      setError("Impossible de charger les stages");
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchSessionUsers();
  }, []);

  // Charger les stages au montage initial pour éviter le fetch tardif
  useEffect(() => {
    fetchStages();
  }, []);

  useEffect(() => {
    if (selectedSessionUser && (modalMode === "edit" || modalMode === "archive")) {
      setEditFormData({
        nom: selectedSessionUser.user.nom || "",
        prenom: selectedSessionUser.user.prenom || "",
        email: selectedSessionUser.user.email || "",
        telephone: selectedSessionUser.user.telephone || "",
        numeroPermis: selectedSessionUser.user.numeroPermis || "",
        dateDelivrancePermis: selectedSessionUser.user.dateDelivrancePermis || "",
        prefecture: selectedSessionUser.user.prefecture || "",
        etatPermis: selectedSessionUser.user.etatPermis || "",
        casStage: selectedSessionUser.user.casStage || "",
        sessionId: selectedSessionUser.session?.id.toString() || "",
        id_recto: selectedSessionUser.user.id_recto || "",
        id_verso: selectedSessionUser.user.id_verso || "",
        permis_recto: selectedSessionUser.user.permis_recto || "",
        permis_verso: selectedSessionUser.user.permis_verso || "",
      });
    }
  }, [selectedSessionUser, modalMode]);

  const handleAddSessionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tempId = uuidv4();
      const uploadedPaths = await uploadFilesToSupabase(tempId, newSessionUserFiles);

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
          sessionId: parseInt(newSessionUser.sessionId),
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

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'ajout de l'inscription");
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
      setNewSessionUserFiles({
        scanPermisRecto: null,
        scanPermisVerso: null,
        scanIdentiteRecto: null,
        scanIdentiteVerso: null,
      });
      await fetchSessionUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const response = await fetch(`/api/session-users/mark-as-paid`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), // On envoie uniquement l'ID
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour du paiement");
      }
  
      await fetchSessionUsers(); // Recharge les données pour refléter les changements
      await fetchSessions(); // Recharge les sessions pour mettre à jour la capacité affichée
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const downloadAttestation = async (url: string, nom: string, prenom: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du téléchargement");
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `attestation_${nom}_${prenom}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Erreur lors du téléchargement de l’attestation:", error);
      setError("Erreur lors du téléchargement de l’attestation");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSessionUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, isEditMode: boolean = false) => {
    const file = e.target.files?.[0] || null;
    if (isEditMode) {
      setEditFormFiles((prev) => ({ ...prev, [field]: file }));
    } else {
      setNewSessionUserFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedSessionUser) return;
    setIsSubmitting(true);
    try {
      if (modalMode === "edit") {
        const uploadedPaths = await uploadFilesToSupabase(selectedSessionUser.user.id.toString(), editFormFiles);
  
        const updatedData = {
          ...editFormData,
          sessionId: parseInt(editFormData.sessionId),
          id_recto: uploadedPaths.id_recto || editFormData.id_recto,
          id_verso: uploadedPaths.id_verso || editFormData.id_verso,
          permis_recto: uploadedPaths.permis_recto || editFormData.permis_recto,
          permis_verso: uploadedPaths.permis_verso || editFormData.permis_verso,
        };
  
        console.log("Données envoyées pour mise à jour :", updatedData);
        await updateRegistration(selectedSessionUser.id, updatedData);
        await fetchSessionUsers();
        setShowRegistrationModal(false);
      } else if (modalMode === "archive") {
        console.log("Tentative de suppression pour l'ID :", selectedSessionUser.id);
        await archiveRegistration(selectedSessionUser.id);
        console.log("Suppression réussie");
        await fetchSessionUsers();
        setShowRegistrationModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      setError(error instanceof Error ? error.message : "Erreur inconnue lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (mode: "edit" | "archive", sessionUser: SessionUser) => {
    setModalMode(mode);
    setSelectedSessionUser(sessionUser);
    setShowRegistrationModal(true);
    if (mode === "edit" && stageList.length === 0) {
      fetchStages(); // Re-fetch si la liste est vide
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des Inscriptions</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
          title="Ajouter une inscription"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <ul className="space-y-4">
        {sessionUsers.length > 0 ? (
          sessionUsers.map((sessionUser) => (
            <li key={sessionUser.id} className="border-b pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {sessionUser.user ? (
                    <>
                      <div className="text-sm text-gray-600">{sessionUser.user.prenom} {sessionUser.user.nom}</div>
                      <div className="text-sm text-gray-600">{sessionUser.user.email}</div>
                      <div className="text-sm text-gray-600">{sessionUser.user.telephone}</div>
                      <div className="text-sm text-gray-600"><span className="font-medium">Numéro Permis:</span> {sessionUser.user.numeroPermis}</div>
                      <div className="text-sm text-gray-600">{sessionUser.user.casStage}</div>
                    </>
                  ) : (
                    <div className="text-sm text-red-600">Données utilisateur manquantes</div>
                  )}
                </div>
                <div>
                  {sessionUser.user ? (
                    <>
                      <div className="text-sm text-gray-600">
                        {sessionUser.session ? (
                          <>
                            <div className="font-bold">{sessionUser.session.numeroStageAnts}</div>
                            <div>
                              Du {new Date(sessionUser.session.startDate).toLocaleDateString()} au{" "}
                              {new Date(sessionUser.session.endDate).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-red-600">Session non disponible</div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="font-bold">Documents:</div>
                        {sessionUser.user.id_recto && (
                          <div>
                            <a href={sessionUser.user.id_recto} target="_blank" className="text-blue-600 hover:underline">
                              Carte d’identité (recto)
                            </a>
                          </div>
                        )}
                        {sessionUser.user.id_verso && (
                          <div>
                            <a href={sessionUser.user.id_verso} target="_blank" className="text-blue-600 hover:underline">
                              Carte d’identité (verso)
                            </a>
                          </div>
                        )}
                        {sessionUser.user.permis_recto && (
                          <div>
                            <a href={sessionUser.user.permis_recto} target="_blank" className="text-blue-600 hover:underline">
                              Permis de conduire (recto)
                            </a>
                          </div>
                        )}
                        {sessionUser.user.permis_verso && (
                          <div>
                            <a href={sessionUser.user.permis_verso} target="_blank" className="text-blue-600 hover:underline">
                              Permis de conduire (verso)
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="font-bold">Attestation:</div>
                        {sessionUser.user.attestationPdfUrl ? (
                          <button
                            onClick={() =>
                              downloadAttestation(
                                sessionUser.user.attestationPdfUrl!,
                                sessionUser.user.nom,
                                sessionUser.user.prenom
                              )
                            }
                            className="text-blue-600 hover:underline"
                          >
                            Télécharger l’attestation
                          </button>
                        ) : (
                          <span className="text-gray-500">Non disponible</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Date d'Inscription:</span>{" "}
                        {new Date(sessionUser.createdAt).toLocaleString()}
                      </div>
                      <div className="text-sm font-semibold">
                        <span className="font-medium">Paiement:</span> {sessionUser.isPaid ? "Payé" : "Non payé"}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                {!sessionUser.isPaid && (
                  <button
                    onClick={() => handleMarkAsPaid(sessionUser.id)}
                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Marquer comme payé
                  </button>
                )}
                <button
                  onClick={() => openModal("edit", sessionUser)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Modifier l'inscription"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openModal("archive", sessionUser)}
                  className="p-2 text-gray-600 hover:text-red-600"
                  title="Archiver"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))
        ) : (
          <li>Aucune inscription trouvée.</li>
        )}
      </ul>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Ajouter une Inscription</h3>
            <form onSubmit={handleAddSessionUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={newSessionUser.nom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={newSessionUser.prenom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newSessionUser.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={newSessionUser.telephone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro de Permis</label>
                  <input
                    type="text"
                    name="numeroPermis"
                    value={newSessionUser.numeroPermis}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de Délivrance</label>
                  <input
                    type="date"
                    name="dateDelivrancePermis"
                    value={newSessionUser.dateDelivrancePermis}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Préfecture</label>
                  <input
                    type="text"
                    name="prefecture"
                    value={newSessionUser.prefecture}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">État du Permis</label>
                  <select
                    name="etatPermis"
                    value={newSessionUser.etatPermis}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="" disabled>Sélectionnez un état</option>
                    <option value="Valide">Valide</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cas de Stage</label>
                  <input
                    type="text"
                    name="casStage"
                    value={newSessionUser.casStage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    name="sessionId"
                    value={newSessionUser.sessionId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="" disabled>Sélectionnez une session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.numeroStageAnts} ({new Date(session.startDate).toLocaleDateString()} -{" "}
                        {new Date(session.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carte d’identité (recto)</label>
                  <input
                    type="file"
                    name="scanIdentiteRecto"
                    onChange={(e) => handleFileChange(e, "scanIdentiteRecto")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    accept="image/*,application/pdf"
                  />
                  {newSessionUser.id_recto && (
                    <a href={newSessionUser.id_recto} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                      Voir le fichier uploadé
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carte d’identité (verso)</label>
                  <input
                    type="file"
                    name="scanIdentiteVerso"
                    onChange={(e) => handleFileChange(e, "scanIdentiteVerso")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    accept="image/*,application/pdf"
                  />
                  {newSessionUser.id_verso && (
                    <a href={newSessionUser.id_verso} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                      Voir le fichier uploadé
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permis (recto)</label>
                  <input
                    type="file"
                    name="scanPermisRecto"
                    onChange={(e) => handleFileChange(e, "scanPermisRecto")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    accept="image/*,application/pdf"
                  />
                  {newSessionUser.permis_recto && (
                    <a href={newSessionUser.permis_recto} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                      Voir le fichier uploadé
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permis (verso)</label>
                  <input
                    type="file"
                    name="scanPermisVerso"
                    onChange={(e) => handleFileChange(e, "scanPermisVerso")}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    accept="image/*,application/pdf"
                  />
                  {newSessionUser.permis_verso && (
                    <a href={newSessionUser.permis_verso} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                      Voir le fichier uploadé
                    </a>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition et d'archivage intégré */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">{modalMode === "edit" ? "Modifier l'inscription" : "Archiver l'inscription"}</h3>
              <button onClick={() => setShowRegistrationModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ✕
              </button>
            </div>
            <div className="p-4">
              {modalMode === "archive" ? (
                <div>
                  <p className="mb-4">Êtes-vous sûr de vouloir archiver cette inscription ?</p>
                  <p className="font-medium mb-6">
                    {selectedSessionUser?.user.prenom} {selectedSessionUser?.user.nom} - Session{" "}
                    {selectedSessionUser?.session?.numeroStageAnts}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowRegistrationModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleModalSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Archiver
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={editFormData.nom}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Prénom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={editFormData.prenom}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Téléphone</label>
                      <input
                        type="text"
                        name="telephone"
                        value={editFormData.telephone}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Numéro de Permis</label>
                      <input
                        type="text"
                        name="numeroPermis"
                        value={editFormData.numeroPermis}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date de Délivrance</label>
                      <input
                        type="date"
                        name="dateDelivrancePermis"
                        value={editFormData.dateDelivrancePermis}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Préfecture</label>
                      <input
                        type="text"
                        name="prefecture"
                        value={editFormData.prefecture}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">État du Permis</label>
                      <select
                        name="etatPermis"
                        value={editFormData.etatPermis}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Sélectionnez un état</option>
                        <option value="Valide">Valide</option>
                        <option value="Suspendu">Suspendu</option>
                        <option value="Annulé">Annulé</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cas de Stage</label>
                      <input
                        type="text"
                        name="casStage"
                        value={editFormData.casStage}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session</label>
                      <select
                        name="sessionId"
                        value={editFormData.sessionId}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Sélectionnez une session</option>
                        {stageList.length > 0 ? (
                          stageList.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.numeroStageAnts}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Chargement des stages...</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Carte d’identité (recto)</label>
                      <input
                        type="file"
                        name="scanIdentiteRecto"
                        onChange={(e) => handleFileChange(e, "scanIdentiteRecto", true)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*,application/pdf"
                      />
                      {editFormData.id_recto && (
                        <a href={editFormData.id_recto} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                          Voir le fichier actuel
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Carte d’identité (verso)</label>
                      <input
                        type="file"
                        name="scanIdentiteVerso"
                        onChange={(e) => handleFileChange(e, "scanIdentiteVerso", true)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*,application/pdf"
                      />
                      {editFormData.id_verso && (
                        <a href={editFormData.id_verso} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                          Voir le fichier actuel
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Permis (recto)</label>
                      <input
                        type="file"
                        name="scanPermisRecto"
                        onChange={(e) => handleFileChange(e, "scanPermisRecto", true)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*,application/pdf"
                      />
                      {editFormData.permis_recto && (
                        <a href={editFormData.permis_recto} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                          Voir le fichier actuel
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Permis (verso)</label>
                      <input
                        type="file"
                        name="scanPermisVerso"
                        onChange={(e) => handleFileChange(e, "scanPermisVerso", true)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        accept="image/*,application/pdf"
                      />
                      {editFormData.permis_verso && (
                        <a href={editFormData.permis_verso} target="_blank" className="text-blue-600 hover:underline mt-1 block">
                          Voir le fichier actuel
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Modifier
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}