"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaFilePdf, FaCheckCircle, FaPencilAlt, FaTrash, FaFile } from "react-icons/fa";

// Types
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

interface Stage {
  id: number;
  numeroAnts: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  sessionUsers: SessionUser[];
}

// API pour récupérer les détails du stage et les inscrits
const fetchSessionData = async (sessionId: number): Promise<Stage> => {
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
    console.log("Session data:", data);
    return data;
  } catch (error) {
    console.error("Erreur fetchSessionData:", error);
    throw error;
  }
};

// Composant Breadcrumbs
const Breadcrumbs = ({ numeroAnts }: { numeroAnts: string }) => (
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
            Stages
          </Link>
        </div>
      </li>
      <li>
        <div className="flex items-center">
          <span className="text-gray-500">/</span>
          <Link
            href={`/sessions/${numeroAnts}`}
            className="ml-1 md:ml-2 text-sm text-gray-700 hover:text-blue-600"
          >
            Stage {numeroAnts}
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

const StageInscritsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("sessionId from useParams:", sessionId);

  // Fonctions d'action (implémentées avec appels API)
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

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue lors de la génération");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (sessionUserId: number) => {
    try {
      const response = await fetch("/api/session-users/mark-as-paid", {
        method: "POST",
        body: JSON.stringify({ id: sessionUserId }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Marqué comme payé");
        // Rafraîchir les données si nécessaire
      } else {
        throw new Error("Erreur lors du marquage comme payé");
      }
    } catch (error) {
      console.error("Erreur marquage comme payé:", error);
      alert("Erreur lors du marquage comme payé");
    }
  };

  const openEditModal = (sessionUser: SessionUser) => {
    console.log(`Ouvrir modal édition pour ${sessionUser.user.prenom} ${sessionUser.user.nom}`);
    // Implémenter l'ouverture d'un modal (non fourni ici)
  };

  const handleArchiveSessionUser = async (sessionUserId: number) => {
    try {
      const response = await fetch("/api/session-users/archive", {
        method: "POST",
        body: JSON.stringify({ id: sessionUserId }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Inscription archivée");
        // Rafraîchir les données si nécessaire
      } else {
        throw new Error("Erreur lors de l'archivage");
      }
    } catch (error) {
      console.error("Erreur archivage:", error);
      alert("Erreur lors de l'archivage");
    }
  };

  const fetchData = async () => {
    if (!sessionId || isNaN(Number(sessionId))) {
      setError("ID de session invalide");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const sessionData = await fetchSessionData(Number(sessionId));
      setStage(sessionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchData();
  }, [sessionId]);

  if (loading) return <div className="p-6 text-gray-600">Chargement...</div>;
  if (error) return <div className="p-6 text-red-600">Erreur : {error}</div>;
  if (!sessionId) return <div className="p-6 text-red-600">Erreur : ID de stage manquant</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg min-h-screen">
      <Breadcrumbs numeroAnts={stage?.numeroAnts ?? sessionId} />

      {/* Affichage des informations du stage */}
      {stage ? (
        <div className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-gray-800 mb-4">Détails du stage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-sm text-gray-600">Numéro ANTS: {stage.numeroAnts}</p>
            <p className="text-sm text-gray-600">
              Date: {new Date(stage.dateDebut).toLocaleDateString()} -{" "}
              {new Date(stage.dateFin).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mb-8">Aucune information sur le stage disponible.</p>
      )}

      {/* Tableau des inscrits */}
      <h3 className="text-xl font-medium text-gray-800 mb-4">Inscrits</h3>
      {stage?.sessionUsers.length > 0 ? (
        <div className="overflow-x-auto">
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
              {stage.sessionUsers.map((su) => (
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Aucun inscrit pour ce stage.</p>
      )}
    </div>
  );
};

export default StageInscritsPage;