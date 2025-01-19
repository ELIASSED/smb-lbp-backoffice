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

// ----- Récupération de toutes les sessions -----
export async function getSessions(): Promise<Stage[]> {
  const response = await fetch('/api/sessions');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données.');
  }
  return response.json();
}

// ----- Création d'une nouvelle session -----
export async function createSession(formData: StageFormData): Promise<any> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    // Récupérer le message d'erreur éventuel renvoyé par l'API
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur lors de la création de la session");
  }

  return response.json();
}

// ----- Mise à jour d'une session -----
export async function updateSession(id: number, formData: StageFormData): Promise<any> {
  const response = await fetch(`/api/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, id }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  return response.json();
}

// ----- Suppression (archivage) d'une session -----
export async function deleteSession(id: number): Promise<any> {
  const response = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  return response.json();
}

// ----- Récupération des animateurs (BAFM) -----
export async function getInstructors(): Promise<Instructor[]> {
  const response = await fetch('/api/animateurs');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des animateurs.');
  }
  return response.json();
}

// ----- Récupération des psychologues -----
export async function getPsychologists(): Promise<Psychologist[]> {
  const response = await fetch('/api/psychologues');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des psychologues.');
  }
  return response.json();
}
