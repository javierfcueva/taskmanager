const API_URL = 'https://jsonplaceholder.typicode.com/todos';

// Lanza el error para que lo maneje quien llama
export async function fetchTodos(limit = 20) {
  const response = await fetch(`${API_URL}?_limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Error del servidor (${response.status})`);
  }

  return response.json();
}
