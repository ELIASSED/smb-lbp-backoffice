// services/stageApi.ts

export interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Psychologist {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Stage {
  id: number;
  numeroStageAnts: string;
  price: number;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  instructor: Instructor;
  psychologue: Psychologist;
  isArchived: boolean;
}

export interface StageFormData {
  description: string | number | readonly string[] | undefined;
  numeroStageAnts: string;
  location: string;
  capacity: number;
  price: string;
  startDate: string;
  endDate: string;
  instructorId: string;
  psychologueId: string;
}

const API_URL = "/api/sessions";

// ✅ Fonction générique pour les appels API
const fetchApi = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

// 🔹 Obtenir toutes les sessions
export const getSessions = async () => {
  return await fetchApi(API_URL);
};

// 🔹 Obtenir une session par ID
export const getSessionById = async (id: number) => {
  return await fetchApi(`${API_URL}/${id}`);
};

// 🔹 Créer une session (avec protection contre le double appel)
export const createSession = async (data: any) => {
  return await fetchApi(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

// 🔹 Mettre à jour une session
export const updateSession = async (id: number, data: any) => {
  return await fetchApi(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

// 🔹 Supprimer une session
export const deleteSession = async (id: number) => {
  return await fetchApi(`${API_URL}/${id}`, { method: "DELETE" });
};

// 🔹 Récupérer les instructeurs et psychologues (évite les appels redondants)
export const getInstructors = async () => {
  return await fetchApi("/api/animateurs");
};

export const getPsychologists = async () => {
  return await fetchApi("/api/psychologues");
};

