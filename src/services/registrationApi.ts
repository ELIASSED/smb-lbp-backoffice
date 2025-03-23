// Dans registrationApi.ts
export const getStages = async () => {
    const response = await fetch('/api/stages');
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
  
  export const archiveRegistration = async (id: string) => {
    const response = await fetch(`/api/registrations/${id}/archive`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  };