"use client";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/solid";
import { SessionUser, Session } from "../../services/sessionUserApi"; // Ajuste le chemin selon ton projet

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

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
      console.log("Données de l'API /api/session-users :", data); // Pour débogage
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

  const handleAddSessionUser = async () => {
    try {
      const response = await fetch("/api/session-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSessionUser),
      });
  
      if (!response.ok) throw new Error("Erreur lors de l'ajout de l'inscription");
  
      await response.json(); // Pas besoin de stocker createdSessionUser si on recharge
      setShowModal(false);
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
      });
  
      // Rafraîchir les données après l'ajout
      await fetchSessionUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const response = await fetch(`/api/session-users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du paiement");

      const updatedSessionUser: SessionUser = await response.json();
      setSessionUsers(sessionUsers.map((su) => (su.id === id ? updatedSessionUser : su)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSessionUser((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (mode: string, staffType: string, staff: any) => {
    // À implémenter si besoin pour édition ou suppression
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des Inscriptions</h2>
        <button
          onClick={() => setShowModal(true)}
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
        <div className="flex justify-between items-center">
          <div>
            {sessionUser.user ? (
              <>
                <div className="font-semibold text-gray-800">
                  {sessionUser.user.prenom} {sessionUser.user.nom}
                </div>
                <div className="text-sm text-gray-600">Email: {sessionUser.user.email}</div>
                <div className="text-sm text-gray-600">Téléphone: {sessionUser.user.telephone}</div>
                <div className="text-sm text-gray-600">Numéro Permis: {sessionUser.user.numeroPermis}</div>
                <div className="text-sm text-gray-600">Cas de Stage: {sessionUser.user.casStage}</div>
                <div className="text-sm text-gray-600">Préfecture: {sessionUser.user.prefecture}</div>
                <div className="text-sm text-gray-600">État Permis: {sessionUser.user.etatPermis}</div>
              </>
            ) : (
              <div className="text-sm text-red-600">Données utilisateur manquantes</div>
            )}
            <div className="text-sm text-gray-600">
              Date d'Inscription: {new Date(sessionUser.createdAt).toLocaleString()}
            </div>
            <div className="text-sm font-semibold">
              Paiement: {sessionUser.isPaid ? "Payé" : "Non payé"}
            </div>
          </div>
          <div className="flex space-x-2">
            {!sessionUser.isPaid && (
              <button
                onClick={() => handleMarkAsPaid(sessionUser.id)}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Marquer comme payé
              </button>
            )}
            <button
              onClick={() => openModal("edit", "sessionUser", sessionUser)}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => openModal("delete", "sessionUser", sessionUser)}
              className="p-2 text-gray-600 hover:text-red-600"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <div className="font-bold">Session:</div>
          {sessionUser.session ? (
            <>
              <div>{sessionUser.session.numeroStageAnts}</div>
              <div>
                Du {new Date(sessionUser.session.startDate).toLocaleDateString()} au{" "}
                {new Date(sessionUser.session.endDate).toLocaleDateString()}
              </div>
            </>
          ) : (
            <div className="text-sm text-red-600">Session non disponible</div>
          )}
        </div>
      </li>
    ))
  ) : (
    <li>Aucune inscription trouvée.</li>
  )}
</ul>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-lg font-semibold mb-4">Ajouter une Inscription</h3>
            <form className="space-y-4">
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
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSessionUser}
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}