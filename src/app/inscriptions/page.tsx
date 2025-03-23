"use client";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { SessionUser, Session } from "../../services/sessionUserApi"; // Ajuste le chemin
import { RegistrationModal } from "../../components/RegistrationModal"; // Ajuste le chemin

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"edit" | "archive" | null>(null);
  const [selectedSessionUser, setSelectedSessionUser] = useState<SessionUser | undefined>(undefined);

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
      console.log("Données de l'API /api/session-users :", data);
      setSessionUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchSessionUsers();
  }, []);

  const handleAddSessionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
          sessionId: newSessionUser.sessionId,
          adresse: "Adresse par défaut",
          codePostal: "00000",
          ville: "Ville par défaut",
          nationalite: "Française",
          dateNaissance: "1990-01-01",
          codePostalNaissance: "00000",
          id_recto: newSessionUser.id_recto,
          id_verso: newSessionUser.id_verso,
          permis_recto: newSessionUser.permis_recto,
          permis_verso: newSessionUser.permis_verso,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout de l'inscription");

      await response.json();
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
      await fetchSessionUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const response = await fetch(`/api/session-users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: true }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du paiement");

      const updatedSessionUser: SessionUser = await response.json();
      setSessionUsers(sessionUsers.map((su) => (su.id === id ? updatedSessionUser : su)));
      await fetchSessionUsers(); // Rafraîchir pour obtenir l'attestation si générée
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

  const openModal = (mode: "edit" | "archive", sessionUser: SessionUser) => {
    setModalMode(mode);
    setSelectedSessionUser(sessionUser);
    setShowRegistrationModal(true);
  };

  const handleModalSubmit = async () => {
    await fetchSessionUsers();
    setShowRegistrationModal(false);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des Inscriptions</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Ajouter une inscription
        </button>
      </div>
      <ul className="space-y-4">
        {sessionUsers.length > 0 ? (
          sessionUsers.map((sessionUser) => (
            <li key={sessionUser.id} className="border-b pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 1 : Informations personnelles */}
                <div>
                 
                  {sessionUser.user ? (
                    <>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium"></span> {sessionUser.user.prenom} {sessionUser.user.nom}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium"></span> {sessionUser.user.email}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium"></span> {sessionUser.user.telephone}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Numéro Permis:</span> {sessionUser.user.numeroPermis}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium"></span> {sessionUser.user.casStage}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-red-600">Données utilisateur manquantes</div>
                  )}
                </div>

                {/* Section 2 : Informations de session et documents */}
                <div>
                  {sessionUser.user ? (
                    <>
                      <div className="text-sm text-gray-600">
                      
                        {sessionUser.session ? (
                          <>  <div className="font-bold">  <div>{sessionUser.session.numeroStageAnts}</div></div>
                         
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

              {/* Boutons d'action */}
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
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openModal("archive", sessionUser)}
                  className="p-2 text-gray-600 hover:text-red-600"
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
                    type="text"
                    name="id_recto"
                    value={newSessionUser.id_recto}
                    onChange={handleInputChange}
                    placeholder="URL du fichier"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Carte d’identité (verso)</label>
                  <input
                    type="text"
                    name="id_verso"
                    value={newSessionUser.id_verso}
                    onChange={handleInputChange}
                    placeholder="URL du fichier"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permis (recto)</label>
                  <input
                    type="text"
                    name="permis_recto"
                    value={newSessionUser.permis_recto}
                    onChange={handleInputChange}
                    placeholder="URL du fichier"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permis (verso)</label>
                  <input
                    type="text"
                    name="permis_verso"
                    value={newSessionUser.permis_verso}
                    onChange={handleInputChange}
                    placeholder="URL du fichier"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition et d'archivage */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        mode={modalMode}
        registration={selectedSessionUser}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}