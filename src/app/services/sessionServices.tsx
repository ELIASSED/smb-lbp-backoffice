// services/sessionService.ts
export const fetchSessions = async () => {
    const response = await fetch("/api/sessions");
    if (!response.ok) throw new Error("Erreur lors de la récupération des sessions");
    return response.json();
  };
  
  export const createSession = async (sessionData: any) => {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) throw new Error("Erreur lors de la création de la session");
    return response.json();
  };
  
  export const updateSession = async (id: string, sessionData: any) => {
    const response = await fetch(`/api/sessions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...sessionData }),
    });
    if (!response.ok) throw new Error("Erreur lors de la mise à jour de la session");
    return response.json();
  };
  
  export const deleteSession = async (id: string) => {
    const response = await fetch(`/api/sessions?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression de la session");
    return response.json();
  };
  