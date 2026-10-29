const STORAGE_KEY = 'taskmanager.tasks';

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    // Datos corruptos: se descartan para no bloquear la aplicación
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

// Distingue "nunca se guardó nada" de "el usuario borró todas las tareas" ([])
export function hasStoredTasks() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
