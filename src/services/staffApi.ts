// services/staffApi.ts
export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    numeroAutorisationPrefectorale: string;
    email: string;
    phone: string;
  }
  
  export type StaffType = "instructor" | "psychologist";
  
  /**
   * Récupère la liste des instructeurs
   */
  export async function getInstructors(): Promise<Staff[]> {
    const res = await fetch("/api/animateurs");
    if (!res.ok) {
      throw new Error("Erreur lors de la récupération des instructeurs");
    }
    return res.json();
  }
  
  /**
   * Récupère la liste des psychologues
   */
  export async function getPsychologists(): Promise<Staff[]> {
    const res = await fetch("/api/psychologues");
    if (!res.ok) {
      throw new Error("Erreur lors de la récupération des psychologues");
    }
    return res.json();
  }
  
  /**
   * Crée un nouveau staff (instructeur ou psychologue)
   */
  export async function createStaff(staffType: StaffType, data: any) {
    const baseUrl =
      staffType === "instructor" ? "/api/animateurs" : "/api/psychologues";
  
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la création");
    }
    return res.json();
  }
  
  /**
   * Met à jour un staff existant
   */
  export async function updateStaff(staffType: StaffType, id: string, data: any) {
    const baseUrl =
      staffType === "instructor" ? "/api/animateurs" : "/api/psychologues";
  
    const res = await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la mise à jour");
    }
    return res.json();
  }
  
  /**
   * Archive (ou supprime) un staff existant
   */
  export async function archiveStaff(staffType: StaffType, id: string) {
    const baseUrl =
      staffType === "instructor" ? "/api/animateurs" : "/api/psychologues";
  
    const res = await fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de l'archivage");
    }
    return res.json();
  }
  