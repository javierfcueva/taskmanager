# TaskManager

Aplicación de gestión de tareas en JavaScript vanilla (ES6+), sin librerías ni frameworks, con persistencia en `localStorage` y carga inicial desde la API de JSONPlaceholder.

Actividad Integradora 2 — Programación de Sistemas Web, ECOTEC.

**Demo:** https://javierfcueva.github.io/taskmanager/

## Funcionalidades

- **CRUD:** crear, editar, eliminar (con confirmación) y marcar tareas como completadas. El formulario valida en JS que el título no esté vacío y que se elija una prioridad.
- **Filtros y búsqueda:** Todas / Pendientes / Completadas y búsqueda en tiempo real por título, sin distinguir mayúsculas. Se pueden combinar.
- **Ordenamiento:** por fecha de creación (más recientes o más antiguas) o por prioridad (alta a baja o baja a alta). En empate de prioridad, primero la más reciente.
- **Métricas:** total, pendientes y completadas, actualizadas con cada cambio.
- **Carga inicial desde la API:** si `localStorage` no tiene datos, se importan 20 tareas de `https://jsonplaceholder.typicode.com/todos` sin duplicar. Los errores de red o del servidor se avisan con una notificación.
- **Persistencia:** cada cambio se guarda en `localStorage` y se recupera al recargar.
- **Diseño adaptable** a pantallas pequeñas y tema claro u oscuro según el sistema.

## Estructura

```
taskmanager/
├── index.html
├── favicon.svg
├── css/
│   └── styles.css
└── js/
    ├── app.js       Estado de la aplicación y orquestación de los módulos
    ├── api.js       Servicio de la API (fetch + async/await)
    ├── storage.js   Lectura y escritura en localStorage
    ├── task.js      Modelo de tarea: creación y validación
    └── ui.js        Render y eventos del DOM
```

## Módulos ES6

Cada responsabilidad vive en su propio módulo y expone solo lo necesario con `export`:

- `storage.js` guarda las tareas con `JSON.stringify()` y las recupera con `JSON.parse()`. Si el dato guardado está corrupto, lo descarta.
- `api.js` hace la petición con `fetch` y traduce los fallos a mensajes claros.
- `task.js` define la forma de una tarea y valida las que vienen de `localStorage` o de la API.
- `ui.js` es el único módulo que toca el DOM: dibuja la lista y las métricas, y entrega los eventos del usuario a `app.js`.
- `app.js` importa los demás, mantiene el estado (tareas, filtro, búsqueda, orden, tarea en edición) y decide qué guardar y qué dibujar.

El navegador carga `app.js` con `<script type="module">`, y desde ahí resuelve los `import` del resto.

## Decisiones técnicas

- La lista se dibuja con `createElement` y `textContent`, nunca con `innerHTML`, para que el texto de una tarea no se interprete como HTML.
- Filtrar y ordenar trabajan sobre una copia: el arreglo guardado mantiene el orden de inserción.
- La API solo se consulta si la clave no existe en `localStorage`. Si el usuario borró todas sus tareas (`[]`), no se vuelven a importar.
- La API no trae prioridad ni fecha de creación; se asignan al importar.
- Los ids locales se generan con `Date.now()` y `Math.random()`, sin `crypto.randomUUID()`, que solo existe en contextos seguros (HTTPS o `localhost`).
- Sin fuentes externas, para que la interfaz funcione sin conexión.

## Ejecución local

La aplicación usa módulos ES6, por lo que debe servirse desde un servidor HTTP (no funciona abriendo `index.html` directamente):

```bash
npx serve .
# o
python -m http.server 8000
```

## Estado

Terminado.
