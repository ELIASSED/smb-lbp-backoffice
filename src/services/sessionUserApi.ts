export interface SessionUser {
    id: number;
    sessionId: number;
    userId: number;
    isPaid: boolean;
    createdAt: string;
    updatedAt: string;
    session?: { // Optionnel avec "?"
      id: number;
      numeroStageAnts: string;
      startDate: string;
      endDate: string;
    };
    user?: {
      attestationPdfUrl?: string | null;
      permis_verso: File | null;
      permis_recto: File | null;
      id_verso: File | null;
      id_recto: File | null;
      letter_48N: File | null;
      extraDocument: File | null;
      id: number;
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      numeroPermis: string;
      dateDelivrancePermis: string;
      prefecture: string;
      etatPermis: string;
      casStage: string;
    };
  }
  
  interface Session {
    id: number;
    numeroStageAnts: string;
    location: string;
    startDate: string;
    endDate: string;
    capacity: number;
  }
  
  export interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    numeroPermis: string;
    dateDelivrancePermis: string;
    prefecture: string;
    etatPermis: string;
    casStage: string;
    id_recto?: string | null;
    id_verso?: string | null;
    permis_recto?: string | null;
    permis_verso?: string | null;
    letter_48N?: string | null;
    attestationPdfUrl?: string | null;
  }
  
  export interface FormData {
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
    id_recto?: string;
    id_verso?: string;
    permis_recto?: string;
    permis_verso?: string;
    letter_48N?: string;