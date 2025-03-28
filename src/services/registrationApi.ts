// Dans registrationApi.ts
export const getStages = async (): Promise<Stage[]> => {
    const response = await fetch("/api/sessions"); // Ou une autre route selon votre API
    if (!response.ok) throw new Error("Erreur lors de la récupération des stages");
    return response.json();
  };
  
  export const getUsers = async () => {
    const response = await fetch('/api/users');
    return response.json();
  };
  
  export const updateRegistration = async (id: string, data: RegistrationFormData) => {
    const response = await fetch(`/api/registrations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  };
  

export const archiveRegistration = async (id: number) => {
    try {
      const response = await fetch(`/api/session-users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur lors de la suppression de l'inscription ${id}`);
      }
  
      return { success: true, message: `Inscription ${id} supprimée avec succès` };
    } catch (error) {
      console.error("Erreur dans archiveRegistration :", error);
      throw error; // Relance l'erreur pour la gérer dans le composant
    }
  };