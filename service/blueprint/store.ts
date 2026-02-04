interface Store {
name: string;
  artist: string;
  recordCompany: string;
  label?: string;
  apiKey: string;
  plan?: string;
}
export function addStoreInDB(data: Store): void {
    const res = fetch('https://charts.bobw.app/api/new_store', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },  
        body: JSON.stringify(data),
    });
    console.log(res);
    return;
}
    