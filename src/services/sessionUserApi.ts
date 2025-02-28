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
  
  export interface Session {
    id: number;
    numeroStageAnts: string;
    startDate: string;
    endDate: string;
  }