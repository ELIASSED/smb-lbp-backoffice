"use client";
import React, { useEffect, useState } from "react";
import { updateRegistration, archiveRegistration, getStages } from "../services/registrationApi";

interface Stage {
  id: number;
  numeroStageAnts: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

interface SessionUser {
  id: number;
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    numeroPermis: string;
    dateDelivrancePermis: string;
    prefecture: string;
    etatPermis: string;
    casStage: string;
    id_recto: string;
    id_verso: string;
    permis_recto: string;
    permis_verso: string;
  };
  session: { id: number; numeroStageAnts: string };
  createdAt: string;
  isPaid: boolean;
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

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "edit" | "archive" | null;
  registration?: SessionUser;
  onSubmit: (data: FormData) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  mode,
  registration,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stageList, setStageList] = useState<Stage[]>([]);

  useEffect(() => {
    if (registration && (mode === "edit" || mode === "archive")) {
      setFormData({
        nom: registration.user.nom || "",
        prenom: registration.user.prenom || "",
        email: registration.user.email || "",
        telephone: registration.user.telephone || "",
        numeroPermis: registration.user.numeroPermis || "",
        dateDelivrancePermis: registration.user.dateDelivrancePermis || "",
        prefecture: registration.user.prefecture || "",
        etatPermis: registration.user.etatPermis || "",
        casStage: registration.user.casStage || "",
        sessionId: registration.session?.id.toString() || "",
        id_recto: registration.user.id_recto || "",
        id_verso: registration.user.id_verso || "",
        permis_recto: registration.user.permis_recto || "",
        permis_verso: registration.user.permis_verso || "",
      });
    }
  }, [registration, mode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stages = await getStages();
        setStageList(stages);
      } catch (error) {
        console.error(error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (mode === "edit" && registration?.id) {
        await updateRegistration(registration.id, formData);
        onSubmit(formData);
        onClose();
      } else if (mode === "archive" && registration?.id) {
        await archiveRegistration(registration.id);
        onSubmit(formData);
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Une erreur est survenue. Vérifiez les données et réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "archive") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Archiver l'inscription">
        <div>
          <p className="mb-4">Êtes-vous sûr de vouloir archiver cette inscription ?</p>
          <p className="font-medium mb-6">
            {registration?.user.prenom} {registration?.user.nom} - Session{" "}
            {registration?.session?.numeroStageAnts}
          </p>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Archiver
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'inscription">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro de Permis</label>
            <input
              type="text"
              name="numeroPermis"
              value={formData.numeroPermis}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date de Délivrance</label>
            <input
              type="date"
              name="dateDelivrancePermis"
              value={formData.dateDelivrancePermis}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Préfecture</label>
            <input
              type="text"
              name="prefecture"
              value={formData.prefecture}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">État du Permis</label>
            <select
              name="etatPermis"
              value={formData.etatPermis}
              onChange={handleChange}
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
              value={formData.casStage}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Session</label>
            <select
              name="sessionId"
              value={formData.sessionId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Sélectionnez une session</option>
              {stageList.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.numeroStageAnts}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Carte d’identité (recto)</label>
            <input
              type="text"
              name="id_recto"
              value={formData.id_recto}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Carte d’identité (verso)</label>
            <input
              type="text"
              name="id_verso"
              value={formData.id_verso}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Permis (recto)</label>
            <input
              type="text"
              name="permis_recto"
              value={formData.permis_recto}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Permis (verso)</label>
            <input
              type="text"
              name="permis_verso"
              value={formData.permis_verso}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Modifier
          </button>
        </div>
      </form>
    </Modal>
  );
};