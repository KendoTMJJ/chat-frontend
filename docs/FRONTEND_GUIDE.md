# Guía del Frontend — chat-widget

Stack: **React 18 + TypeScript + Vite + TailwindCSS + Socket.io-client**

---

## Rutas de la aplicación

```
/                    → HomePage        (selector: Chat Público / Panel Admin)
/dev/chat            → ChatPage        (chat embebido, útil para desarrollo)
/widget/chat         → Chat            (widget standalone, se embebe en iframes)
/admin               → AdminPage       (panel completo, requiere JWT)
/login               → AdminLoginPage  (login de administrador)
/admin/reset-password→ ResetPasswordPage (resetear contraseña con token)
```

> **`/widget/chat`** es la ruta diseñada para embeber en otras páginas via `<iframe>`. Renderiza solo el componente `Chat` sin el layout de la aplicación.

---

## Estructura de archivos

```
src/
├── components/
│   ├── Chat.tsx          Widget de chat completo (toda la lógica de UI del chat)
│   └── ChatButton.tsx    Botón reutilizable con variantes (confirm, default, url)
│
├── pages/
│   ├── Home/
│   │   └── HomePage.tsx  Pantalla de inicio con selector de módulo
│   ├── Chat/
│   │   └── ChatPage.tsx  Wrapper de Chat para la ruta /dev/chat
│   └── Admin/
│       ├── AdminPage.tsx       Panel principal con tabs
│       ├── AdminLoginPage.tsx  Login + recuperación de contraseña
│       ├── ResetPasswordPage.tsx Reset con token del correo
│       ├── HelpdeskPage.tsx    CRUD de categorías de mesa de ayuda
│       └── PosgradosPage.tsx   Gestión de conocimiento (subir Excel)
│
├── hooks/
│   ├── useAuth.ts              Token JWT en localStorage, headers, logout
│   ├── useAdminConversations.ts Fetch y gestión de conversaciones
│   ├── useSupportChannels.ts   CRUD de canales de soporte
│   ├── useHelpdeskResponses.ts CRUD de categorías helpdesk + subir documentos
│   └── useProfile.ts           Perfil del admin, cambio de contraseña
│
├── socket/
│   ├── socket.ts         Instancia de Socket.io (singleton, autoConnect: false)
│   ├── useChatSocket.ts  Hook de suscripción a todos los eventos del socket
│   └── connectSocket.ts  Helper para conectar y emitir mensajes
│
├── router/
│   ├── index.tsx         Definición de rutas (createBrowserRouter)
│   └── ProtectedRoute.tsx Guarda que redirige a /login si no hay token
│
└── layouts/
    └── RootLayout.tsx    Layout base con <Outlet />
```

---

## Componente principal: `Chat.tsx`

El widget de chat está completamente contenido en un solo componente. Maneja:

### Tipos de mensaje en la UI

```typescript
type TextMessage = {
  type: "text";
  userId: string;
  name: string;
  message: string;          // soporta markdown (ReactMarkdown)
  sender: "user" | "bot";
  conversationId: string | null;
  buttons?: Array<{
    label: string;
    message?: string;       // texto que se envía al hacer clic
    url?: string;           // abre enlace externo en nueva pestaña
  }>;
};

type OptionsMessage = {     // botones de sí/no para escalación
  type: "options";
  id: string;
  question: string;
  options: { id: string; label: string; confirmed: boolean }[];
  answered: boolean;
};

type ConfirmationMessage = { // pantalla de confirmación de datos antes de escalar
  type: "confirmation";
  id: string;
  name: string;
  email: string;
  reason: string;
  answered: boolean;
};
```

### Tematización por contexto

El componente tiene un sistema de temas declarativo por contexto. `CONTEXT_CONFIG` define colores, iconos y labels para `posgrados` (azul) y `mesa_ayuda` (verde). Todos los elementos visuales del chat usan estas clases de Tailwind en lugar de colores hardcodeados.

```typescript
const cfg = CONTEXT_CONFIG[context];
// Uso: <button className={cfg.sendBtn}>...</button>
```

### Estados internos principales

| Estado | Tipo | Descripción |
|---|---|---|
| `context` | `ChatContext \| null` | Contexto seleccionado por el usuario |
| `messages` | `ChatMessage[]` | Lista de mensajes renderizados |
| `isBotTyping` | `boolean` | Muestra indicador de "escribiendo..." |
| `escalated` | `boolean` | true cuando la sesión escaló exitosamente |
| `showEscalatePrompt` | `boolean` | Muestra el prompt de escalación |
| `conversationId` | `string \| null` | ID de conversación activa en DB |
| `sessionExpired` | `boolean` | Muestra pantalla de sesión expirada |

### Flujo de inicio

1. Usuario ve `WelcomeScreen` y selecciona contexto (`posgrados` o `mesa_ayuda`).
2. Se llama a `connectSocket(userId, tabId, context)`.
3. El socket recibe `chat-session` → se guarda `chatSessionId`.
4. El socket recibe `on-message` con el mensaje de bienvenida del servidor.
5. El usuario empieza a escribir → `emitSendMessage(message, context, meta)`.

### Identificación del usuario

- `userId`: generado con `crypto.randomUUID()`, guardado en `sessionStorage`.
- `tabId`: generado con `crypto.randomUUID()`, guardado en `sessionStorage`.
- Persisten durante la sesión del navegador. Al cerrar y reabrir la pestaña se generan nuevos IDs.

---

## Hooks

### `useAuth`

Gestiona el token JWT almacenado en `localStorage`.

```typescript
const { getAuthHeaders, logout } = useAuth();

// getAuthHeaders() devuelve los headers con Authorization o redirige a /login
// logout() limpia el token y redirige a /login
```

**Importante:** `getAuthHeaders()` siempre añade `Content-Type: application/json`. Para peticiones multipart (subir archivos), se debe extraer solo el header `Authorization` manualmente:
```typescript
const { Authorization } = getAuthHeaders();
fetch(url, { method: "POST", headers: { Authorization }, body: formData });
```

---

### `useAdminConversations`

Carga y gestiona conversaciones del panel admin.

```typescript
const {
  conversations,   // ConversationSummary[]
  chatHistory,     // ChatMessage[] — historial de la conversación seleccionada
  loading,
  error,
  fetchHistory,    // (id: string) => void
  refetch,
  closeConversation,  // (id: string) => void
  deleteConversation, // (id: string) => void
} = useAdminConversations();
```

---

### `useSupportChannels`

CRUD completo de canales de soporte (WhatsApp / email por contexto e intent).

```typescript
const {
  channels,     // SupportChannel[]
  loading,
  saving,
  error,
  successMsg,
  createChannel,  // ({ context, intent?, whatsapp, email }) => void
  updateChannel,  // (channel: SupportChannel) => void
  deleteChannel,  // (id: string) => void
  refetch,
} = useSupportChannels();
```

---

### `useHelpdeskResponses` → `useHelpdeskCategories`

CRUD de categorías de helpdesk incluyendo subida y eliminación de documentos.

```typescript
const {
  categories,       // HelpdeskCategory[]
  loading,
  create,           // (dto) => Promise<number | null>  ← devuelve el id creado
  update,           // (id, dto) => Promise<void>
  remove,           // (id) => Promise<void>
  uploadDocument,   // (id, file: File) => Promise<void>
  deleteDocument,   // (id) => Promise<void>
} = useHelpdeskCategories();
```

> `create()` devuelve el `id` de la categoría creada para poder encadenar inmediatamente `uploadDocument(newId, file)`.

---

### `useChatSocket`

Suscribe a todos los eventos Socket.io. Se debe llamar una sola vez por montaje del componente.

```typescript
useChatSocket({
  onConnect, onDisconnect, onChatJoined, onChatExpired,
  onHistory, onMessage, onSessionError, onSessionExpired,
  onChatEscalated, onShowEscalateButton, onShowConfirmation
});
```

Ver [`../chat/docs/WEBSOCKET_EVENTS.md`](../../chat/docs/WEBSOCKET_EVENTS.md) para la referencia completa de eventos.

---

## Panel de Administración (`AdminPage.tsx`)

Aplicación de una sola página con sistema de tabs lateral.

| Tab | Componente/sección | Descripción |
|---|---|---|
| `conversations` | Inline en AdminPage | Lista y detalle de conversaciones escaladas |
| `channels` | Inline en AdminPage | CRUD de canales de soporte (WhatsApp/email) |
| `helpdesk` | `HelpdeskPage` (panel) | CRUD de categorías y documentos de mesa de ayuda |
| `posgrados` | `PosgradosPage` (panel) | Subida de Excel con programas de posgrado |
| `profile` | Inline en AdminPage | Cambio de nombre, email y contraseña |

### Autenticación del panel

- El token se guarda en `localStorage` con clave `access_token`.
- `ProtectedRoute` verifica que exista antes de renderizar el panel.
- Si cualquier llamada a la API devuelve `401`, `useAuth.logout()` limpia el token y redirige a `/login`.
- El login incluye recuperación de contraseña por correo (flujo en 3 pasos dentro del mismo componente).

---

## Integración como iframe (embed)

El widget está diseñado para embeberse en cualquier página HTML:

```html
<iframe
  src="https://chat.midominio.com/widget/chat"
  style="width: 400px; height: 600px; border: none;"
  allow="clipboard-write"
/>
```

La ruta `/widget/chat` renderiza solo `<Chat />` sin ningún layout extra. El componente es responsivo y se adapta al tamaño del contenedor.

---

## Sistema de diseño

El proyecto usa TailwindCSS con colores personalizados definidos en `tailwind.config`:

| Token | Uso |
|---|---|
| `usta-bg` | Fondo principal (azul oscuro profundo) |
| `usta-card` | Fondo de tarjetas y elementos elevados |
| `usta-blue` | Color primario — contexto posgrados |
| `usta-blue-lt` | Variante clara del azul primario |
| `usta-blue-dark` | Variante oscura del azul |
| `usta-green` | Color secundario — contexto mesa de ayuda |
| `usta-green-dark` | Variante oscura del verde |

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SERVER_URL` | URL del servidor NestJS. Ej: `http://localhost:3225` |

> En producción, actualizar `VITE_SERVER_URL` a la URL pública del servidor NestJS. Esta variable se incluye en el bundle de producción, no es secreta.
