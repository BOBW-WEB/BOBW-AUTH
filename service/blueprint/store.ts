interface Store {
name: string;
  artist: string;
  recordCompany: string;
  label?: string;
  apiKey: string;
  plan?: string;
}
export async function addStoreInDB(data: Store): Promise<void> {
    try {
        const res = await fetch('https://charts.bobw.app/api/new_store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },  
            body: JSON.stringify(data),
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Erreur lors de l\'ajout du store:', res.status, errorText);
            throw new Error(`Erreur ${res.status}: ${errorText}`);
        }
        
        const result = await res.json();
        console.log('Store ajouté avec succès:', result);
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du store:', error);
        throw error;
    }
}
    