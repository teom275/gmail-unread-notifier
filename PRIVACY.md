# Política de Privacidad — Acceso Directo para Gmail

**Última actualización:** 16 de octubre de 2026

La extensión para Google Chrome **"Acceso Directo para Gmail"** (desarrollada de forma abierta en [GitHub](https://github.com/teom275/gmail-unread-notifier)) está comprometida con la protección de la privacidad y los datos de sus usuarios. Esta política de privacidad describe detalladamente cómo se maneja la información al utilizar la extensión.

---

## 1. Principio Fundamental: Cero Recopilación de Datos

* **Sin servidores externos:** La extensión no posee, no utiliza ni se conecta a ningún servidor o backend propiedad del desarrollador ni de terceros. Toda la lógica de la extensión se ejecuta de forma estrictamente local en el navegador del usuario.
* **Sin telemetría ni analíticas:** No incluimos herramientas de seguimiento, píxeles espía, Google Analytics, Mixpanel ni ninguna biblioteca de analítica.
* **Sin venta o comercialización de datos:** Jamás recopilamos, compartimos, vendemos, alquilamos ni transferimos información o hábitos de navegación de los usuarios a terceros bajo ninguna circunstancia.

---

## 2. Permisos del Navegador y su Uso Específico

La extensión utiliza únicamente los permisos estrictamente necesarios para cumplir su único propósito:

1. **Permiso de Host (`https://mail.google.com/*`)**:
   - **Propósito:** Se utiliza exclusivamente para consultar el feed nativo de Gmail (`feed/atom`) correspondiente a la cuenta activa del usuario y extraer únicamente el recuento numérico de mensajes no leídos (`<fullcount>`).
   - **Enfoque de pestañas:** Permite verificar si el usuario ya tiene una pestaña de `mail.google.com` abierta para enfocarla inmediatamente al hacer clic en el icono, evitando crear pestañas duplicadas.
   - **Sin almacenamiento de correos:** La extensión **no lee, no procesa, no guarda ni transmite** el contenido de tus correos electrónicos, remitentes, asuntos ni archivos adjuntos.

2. **Almacenamiento Local (`chrome.storage`)**:
   - **Propósito:** Almacena exclusivamente en el almacenamiento local del navegador (`chrome.storage.sync` / `chrome.storage.local`) las preferencias que el usuario configura:
     - El índice de la cuenta de Gmail a monitorear (`/u/0/`, `/u/1/`, etc.).
     - Si se muestra o no el número sobre el icono.
     - El intervalo de comprobación periódica seleccionado.
     - El último estado de comprobación para la vista previa de las opciones.
   - Estos datos nunca salen de tu navegador ni se sincronizan con servidores externos fuera de la infraestructura propia de tu cuenta de Google Chrome Sync si la tienes habilitada.

3. **Alarmas (`chrome.alarms`)**:
   - **Propósito:** Ejecutar un temporizador ligero en segundo plano a intervalos definidos por el usuario (ej. cada 1 minuto) para verificar el estado de la bandeja cuando no hay pestañas de Gmail abiertas.

4. **Menús Contextuales (`chrome.contextMenus`)**:
   - **Propósito:** Mostrar las opciones de clic derecho sobre el icono de la extensión en la barra de herramientas ("Abrir Gmail", "Comprobar correos ahora", "Configuración...").

---

## 3. Autenticación y Credenciales

* La extensión **no solicita, no almacena ni tiene acceso a tu contraseña de Google ni a tokens OAuth2**.
* Utiliza la sesión activa que ya tienes iniciada en tu navegador de forma segura a través de las cookies nativas gestionadas directamente por Google Chrome. Si cierras tu sesión de Google, la extensión simplemente indicará que no hay sesión iniciada (`?`).

---

## 4. Código Fuente Abierto y Transparente

Para máxima tranquilidad y auditoría independiente, el 100% del código fuente de esta extensión es público, auditable y está disponible bajo la licencia libre **Apache 2.0** en:
👉 **[https://github.com/teom275/gmail-unread-notifier](https://github.com/teom275/gmail-unread-notifier)**

---

## 5. Contacto

Si tienes alguna consulta, sugerencia o inquietud sobre esta Política de Privacidad, puedes abrir un reporte (Issue) en el repositorio oficial de GitHub:
👉 **[https://github.com/teom275/gmail-unread-notifier/issues](https://github.com/teom275/gmail-unread-notifier/issues)**
