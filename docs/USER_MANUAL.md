# Manual de Usuario — Panel de Administración

Este manual está dirigido al administrador del sistema de chat. No se requieren conocimientos técnicos.

---

## Acceso al panel

1. Abrir el navegador y dirigirse a la URL del sistema (ej: `https://chat.usta.edu.co/login`)
2. Ingresar el correo y la contraseña de administrador
3. Hacer clic en **Iniciar sesión**

El panel tiene una barra lateral izquierda con las secciones disponibles.

---

## Recuperar contraseña olvidada

1. En la pantalla de login, hacer clic en **¿Olvidaste tu contraseña?**
2. Ingresar el correo del administrador y hacer clic en **Enviar enlace**
3. Revisar el correo (incluyendo la carpeta de spam)
4. Hacer clic en el enlace del correo — abre una página para crear la nueva contraseña
5. Ingresar la nueva contraseña (dos veces para confirmar) y guardar

> El enlace de recuperación expira en 30 minutos. Si expira, repetir el proceso.

---

## Secciones del panel

### Conversaciones

Muestra todas las conversaciones que los usuarios han escalado (solicitado atención humana).

**Columnas de la lista:**
- **Nombre** — nombre del usuario que escaló
- **Correo** — correo de contacto del usuario
- **Contexto** — `posgrados` o `mesa_ayuda`
- **Motivo** — descripción breve del problema
- **Estado** — `active`, `closed`, `expired` o `escalated`
- **Fecha** — cuándo inició la conversación

**Ver el historial de mensajes:**  
Hacer clic en una fila de la lista para ver el historial completo de la conversación en el panel derecho.

**Cerrar una conversación:**  
En el panel de detalle, hacer clic en **Cerrar conversación**. Esto cambia el estado a `closed` y la conversación ya no aparece como activa.

**Eliminar una conversación:**  
En el panel de detalle, hacer clic en **Eliminar**. Esta acción es irreversible — se eliminan la conversación y todos sus mensajes.

---

### Canales de soporte

Configura los datos de contacto (WhatsApp y correo) que el bot muestra al usuario cuando escala su consulta.

**Tipos de canal:**
- **Canal por defecto de contexto** — se usa cuando no hay un canal específico para el intent del usuario
- **Canal por intent** — se usa solo cuando el usuario tiene un intent específico (ej: `pagos`, `certificados`)

**Crear un canal:**
1. Hacer clic en **Nuevo canal**
2. Seleccionar el contexto (`posgrados` o `mesa_ayuda`)
3. (Opcional) Seleccionar un intent específico. Si no se selecciona, será el canal por defecto del contexto
4. Ingresar el número de WhatsApp (formato internacional, ej: `+573001234567`)
5. Ingresar el correo del área responsable
6. Hacer clic en **Guardar**

**Editar un canal:**  
Hacer clic en el botón de edición (lápiz) en la fila del canal, modificar los datos y guardar.

**Eliminar un canal:**  
Hacer clic en el botón de eliminación (papelera) en la fila del canal. Se pedirá confirmación.

> Si un contexto no tiene ningún canal configurado, el bot completará la escalación sin mostrar datos de contacto.

---

### Mesa de ayuda

Gestiona las categorías de temas que el bot de mesa de ayuda puede reconocer y responder.

#### Categorías

Cada categoría tiene:
- **Intent** — identificador interno (ej: `pagos`, `certificados`). Solo letras minúsculas, números y guión bajo. No se puede cambiar después de crearlo.
- **Etiqueta** — nombre para mostrar al usuario (se genera automáticamente del intent)
- **Descripción** — explicación del tema que cubre la categoría
- **Documento** — archivo adjunto (PDF, Word, PowerPoint) que el bot puede mostrar al usuario

**Crear una categoría:**
1. Hacer clic en **Nueva categoría**
2. Ingresar el intent y la descripción
3. (Opcional) Subir un documento
4. Hacer clic en **Guardar**

**Editar una categoría:**  
Hacer clic en el ícono de edición en la tarjeta de la categoría.

**Subir o reemplazar un documento:**
1. Abrir la edición de la categoría
2. En el campo "Documento", seleccionar el nuevo archivo
3. Guardar — el documento anterior se reemplaza automáticamente

**Tipos de archivo aceptados:** PDF, Word (`.doc`, `.docx`), PowerPoint (`.ppt`, `.pptx`)  
**Tamaño máximo:** 20 MB

**Eliminar el documento (sin eliminar la categoría):**  
En la edición de la categoría, hacer clic en **Eliminar documento**.

**Eliminar una categoría:**  
Hacer clic en el ícono de papelera en la tarjeta. Se eliminan la categoría y su documento adjunto.

> **Intents reservados:** `saludo`, `despedida` y `desconocida` son manejados automáticamente por el sistema y no aparecen en esta lista.

---

### Posgrados

Permite cargar o actualizar el catálogo de programas de posgrado que el bot puede consultar.

**Subir o actualizar el catálogo:**
1. Preparar el archivo Excel (`.xlsx`) con el formato requerido
2. Hacer clic en **Seleccionar archivo** y elegir el archivo
3. Hacer clic en **Subir**
4. Esperar a que el sistema procese el archivo — puede tardar algunos minutos
5. El sistema mostrará cuántos programas se insertaron, actualizaron o tuvieron errores

> Subir un archivo actualiza los programas existentes (por nombre) y agrega los nuevos. No elimina programas que no estén en el archivo.

---

### Perfil

Permite al administrador actualizar sus datos personales y cambiar la contraseña.

**Cambiar nombre o correo:**
1. Editar los campos en la sección "Datos personales"
2. Hacer clic en **Guardar cambios**

**Cambiar contraseña:**
1. Ingresar la contraseña actual
2. Ingresar la nueva contraseña (dos veces para confirmar)
3. Hacer clic en **Cambiar contraseña**

---

## Cerrar sesión

Hacer clic en el botón **Salir** en la parte inferior de la barra lateral. El sistema cierra la sesión y redirige a la pantalla de login.

La sesión también se cierra automáticamente si el token de seguridad expira (el sistema redirige a login automáticamente).

---

## Preguntas frecuentes

**¿Puedo tener múltiples administradores?**  
Actualmente el sistema tiene un solo usuario administrador. Para agregar más, se requiere intervención técnica directa en la base de datos.

**¿Los usuarios del chat pueden ver mis datos de administrador?**  
No. El panel y el chat son sistemas completamente separados. Los usuarios del chat nunca tienen acceso al panel.

**¿Qué pasa si elimino una conversación?**  
Se elimina permanentemente junto con todos sus mensajes. No hay forma de recuperarla.

**¿Puedo exportar el historial de conversaciones?**  
No existe esta función en el panel actualmente. Para exportar datos se requiere acceso directo a la base de datos.

**¿Qué significan los estados de una conversación?**

| Estado | Significado |
|---|---|
| `active` | El usuario sigue activo en el chat |
| `escalated` | El usuario solicitó atención humana — pendiente de atender |
| `closed` | El administrador marcó la conversación como atendida |
| `expired` | La sesión del usuario expiró por inactividad |
