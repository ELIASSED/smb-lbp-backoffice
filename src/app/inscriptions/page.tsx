"use client"
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, PlusCircleIcon } from "@heroicons/react/solid";

type SessionUser = {
  id: number;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  createdAt: string;
  updatedAt: string;
  session: {
    numeroStageAnts: string;
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  user: {
    etatPermis: string;
    prefecture: string;
    casStage: string;
    numeroPermis: string;
    id: number;
    nom: string;
    prenom: string;
    email: string;
    adresse: string;
    telephone: string;
  };
};
type Session = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newSessionUser, setNewSessionUser] = useState({
    numeroPermis: "",
    dateDelivrancePermis: "",
    prefecture: "",
    etatPermis: "",
    casStage: "",
    sessionId: "",
    userId: "",
  });
  const fetchStages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sessions");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await response.json();
      setStages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des stages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  useEffect(() => {
    // Fetch session users data
    const fetchSessionUsers = async () => {
      try {
        const response = await fetch("/api/session-users");
        if (!response.ok) {
          throw new Error("Erreur de récupération des inscriptions");
        }
        const data: SessionUser[] = await response.json();
        setSessionUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionUsers();
  }, []);

const handleAddSessionUser = async () => {
    try {
      const response = await fetch("/api/session-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSessionUser),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'inscription");
      }

      const createdUser = await response.json();
      setSessionUsers([...sessionUsers, createdUser]);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSessionUser((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (mode: string, staffType: string, staff: any) => {
    // Function to handle opening modals
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des Inscriptions</h2> <button
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
            <div className="font-semibold text-gray-800">
              {sessionUser.user.prenom} {sessionUser.user.nom}
            </div>
            <div className="text-sm text-gray-600">
              Email: {sessionUser.user.email || "Non renseigné"}
            </div>
            <div className="text-sm text-gray-600">
              Numéro Permis: {sessionUser.user.numeroPermis || "Non renseigné"}
            </div>
            <div className="text-sm text-gray-600">
              Cas de Stage: {sessionUser.user.casStage || "Non renseigné"}
            </div>
            <div className="text-sm text-gray-600">
              Préfecture: {sessionUser.user.prefecture || "Non renseignée"}
            </div>
            <div className="text-sm text-gray-600">
              État Permis: {sessionUser.user.etatPermis || "Non renseigné"}
            </div>
            <div className="text-sm text-gray-600">
              Date d'Inscription:{" "}
              {new Date(sessionUser.createdAt).toLocaleString() || "Non disponible"}
            </div>
          </div>
          <div className="flex space-x-2">
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
          <div>{sessionUser.session.numeroStageAnts || "Non renseignée"}</div>
          <div>
            Du {new Date(sessionUser.session.startDate).toLocaleDateString()} au{" "}
            {new Date(sessionUser.session.endDate).toLocaleDateString()}
          </div>
        </div>
      </li>
    ))
  ) : (
    <li>Aucune inscription trouvée.</li>
  )}
</ul>

      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h3 className="text-lg font-semibold mb-4">Ajouter une Inscription</h3>
      <form className="space-y-4">
        {/* Champ pour le numéro de permis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Numéro de Permis</label>
          <input
            type="text"
            name="numeroPermis"
            value={newSessionUser.numeroPermis}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Champ pour la date de délivrance du permis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de Délivrance</label>
          <input
            type="date"
            name="dateDelivrancePermis"
            value={newSessionUser.dateDelivrancePermis}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Champ pour la préfecture */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Préfecture</label>
          <input
            type="text"
            name="prefecture"
            value={newSessionUser.prefecture}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Champ pour l'état du permis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">État du Permis</label>
          <select
            name="etatPermis"
            value={newSessionUser.etatPermis}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="" disabled>Sélectionnez un état</option>
            <option value="Valide">Valide</option>
            <option value="Suspendu">Suspendu</option>
            <option value="Annulé">Annulé</option>
          </select>
        </div>

        {/* Champ pour la session (fetch des sessions) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Session</label>
          <select
            name="sessionId"
            value={newSessionUser.sessionId}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="" disabled>Sélectionnez une session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name} ({new Date(session.startDate).toLocaleDateString()} -{" "}
                {new Date(session.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {/* Champ pour l'ID de l'utilisateur */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
          <input
            type="text"
            name="userId"
            value={newSessionUser.userId}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Boutons */}
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
