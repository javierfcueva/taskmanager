const API_URL = 'https://jsonplaceholder.typicode.com/todos';

// Lanza el error para que lo maneje quien llama
export async function fetchTodos(limit = 20) {
  let response;
  try {
    response = await fetch(`${API_URL}?_limit=${limit}`);
  } catch {
    // fetch solo rechaza por fallas de red, no por códigos HTTP de error
    throw new Error('Sin conexión con el servidor');
  }

  if (!response.ok) {
    throw new Error(`Error del servidor (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Respuesta inesperada del servidor');
  }
  return data;
}
