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
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    adresse: string;
    telephone: string;
  };
};

export default function SessionsPage() {
  const [sessionUsers, setSessionUsers] = useState<SessionUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const openModal = (mode: string, staffType: string, staff: any) => {
    // Function to handle opening modals
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des Inscriptions</h2>
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
                    Email: {sessionUser.user.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    Numéro Permis: {sessionUser.numeroPermis}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cas de Stage: {sessionUser.casStage}
                  </div>
                  <div className="text-sm text-gray-600">
                    Préfecture: {sessionUser.prefecture}
                  </div>
                  <div className="text-sm text-gray-600">
                    État Permis: {sessionUser.etatPermis}
                  </div>
                  <div className="text-sm text-gray-600">
                    Date d'Inscription: {new Date(sessionUser.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal('edit', 'sessionUser', sessionUser)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal('delete', 'sessionUser', sessionUser)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div className="font-semibold">Session:</div>
                <div>{sessionUser.session.name}</div>
                <div>
                  Du {new Date(sessionUser.session.startDate).toLocaleDateString()} au {new Date(sessionUser.session.endDate).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li>Aucune inscription trouvée.</li>
        )}
      </ul>
    </div>
  );
}
