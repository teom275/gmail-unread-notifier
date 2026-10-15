# Directivas de Ciberseguridad y Protocolo de Repositorio Público Seguro

Este repositorio es de código abierto y visibilidad **PÚBLICA**. Toda contribución, automatización o agente inteligente debe adherirse de forma rigurosa a este protocolo de DevSecOps para garantizar la integridad, privacidad y seguridad de los usuarios.

---

## 1. Política Zero-Leak (Cero Fugas)
* **Secretos y Credenciales Prohibidos**: Queda terminantemente prohibido incorporar al código fuente o commitear:
  - Archivos de clave privada (`.pem`, `.key`, `.pfx`) usados para empaquetar o firmar extensiones de Chrome Web Store.
  - Credenciales de Google Cloud Console (`credentials.json`, `client_secret*.json`, `token.json`).
  - Tokens de acceso de APIs, webhooks o variables de entorno reales.
* **Sanitización de Entorno Local**: Prohibido commitear rutas absolutas locales (`C:\Users\...`, `/home/...`) o referencias privadas de los desarrolladores.

---

## 2. Privacidad y Seguridad de la Extensión (AppSec)
* **Principio de Menor Privilegio (Least Privilege)**:
  - Los permisos en `manifest.json` deben limitarse estrictamente a lo necesario (`alarms`, `storage`, `tabs`, `contextMenus`).
  - `host_permissions` debe restringirse únicamente al origen oficial de Gmail (`https://mail.google.com/*`). Prohibido agregar permisos globales como `<all_urls>` o `*://*/*`.
* **Cero Telemetría y Cero Recolección de Datos**:
  - Prohibido integrar scripts de analítica de terceros (Google Analytics, Sentry, Mixpanel, etc.).
  - Los datos de conteo de correos deben procesarse en memoria del navegador y nunca transmitirse a servidores externos.
* **Prevención de Inyección y XSS**:
  - No utilizar `eval()`, `new Function()` ni cadenas ejecutadas en el contexto de la extensión.
  - Al manipular elementos de la interfaz en `options/`, utilizar siempre propiedades seguras (`textContent`, `setAttribute`) en lugar de `innerHTML` con variables externas.

---

## 3. Checklist Pre-Commit para Repositorio Público
Antes de cada commit:
- [ ] Ejecutar `git status` para verificar que ningún archivo de empaquetado (`.crx`, `.zip`, `.pem`) esté en stage.
- [ ] Inspeccionar `git diff --cached` para garantizar ausencia de tokens, secretos o rutas personales.
- [ ] Confirmar que el archivo `.gitignore` cubre todas las dependencias y temporales.
