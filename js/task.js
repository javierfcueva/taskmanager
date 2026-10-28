export const PRIORITIES = ['alta', 'media', 'baja'];

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTask({
  title,
  priority,
  completed = false,
  createdAt = new Date().toISOString(),
  id = generateId(),
}) {
  return { id, title: title.trim(), priority, completed, createdAt };
}

// Filtra registros de localStorage que no tengan la forma esperada
export function isTask(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.title === 'string' &&
    PRIORITIES.includes(value.priority) &&
    typeof value.completed === 'boolean' &&
    !Number.isNaN(Date.parse(value.createdAt))
  );
}
