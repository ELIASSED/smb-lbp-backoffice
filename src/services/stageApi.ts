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
  numeroStageAnts: string;
  location: string;
  description: string;
  capacity: number;
  price: string;
  startDate: string;
  endDate: string;
  instructorId: string;
  psychologueId: string;
}

const API_URL = "/api/sessions";

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

export const getSessions = async (): Promise<Stage[]> => {
  return await fetchApi(API_URL);
};

export const getSessionById = async (id: number): Promise<Stage> => {
  return await fetchApi(`${API_URL}/${id}`);
};

export const createSession = async (data: StageFormData): Promise<Stage> => {
  return await fetchApi(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export async function updateSession(id: number, data: StageFormData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("Réponse d'erreur du serveur:", text);
    throw new Error(text || `Erreur ${response.status}: ${response.statusText}`);
  }

  return text ? JSON.parse(text) : {};
}

export const deleteSession = async (id: number): Promise<void> => {
  await fetchApi(`${API_URL}/${id}`, { method: "DELETE" });
};

export const unarchiveSession = async (id: number): Promise<void> => {
  await fetchApi(`${API_URL}/${id}`, { method: "PATCH" });
};

export const getInstructors = async (): Promise<Instructor[]> => {
  return await fetchApi("/api/animateurs");
};

export const getPsychologists = async (): Promise<Psychologist[]> => {
  return await fetchApi("/api/psychologues");
};