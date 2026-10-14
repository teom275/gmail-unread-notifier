# Acceso Directo a Gmail con Indicador de No Leídos (Extensión para Chrome)

Extensión de Chrome (Manifest V3) diseñada como un acceso directo rápido a Gmail en la barra de herramientas, con un indicador visual inteligente:

- **Con correos sin leer:** El icono se muestra en **color oficial de Gmail** (rojo, azul, amarillo y verde) y muestra el contador de correos pendientes.
- **Sin correos sin leer (al día):** El icono se muestra en **blanco y negro (escala de grises)**.
- **Acceso directo inteligente:** Al hacer clic en el icono, si ya tienes una pestaña de Gmail abierta en cualquier ventana, se enfoca automáticamente (evitando duplicar pestañas). Si no está abierta, abre una nueva.

---

## 🚀 Cómo instalar la extensión en Google Chrome

Para instalar y probar la extensión en tu navegador, sigue estos sencillos pasos:

1. Abre Google Chrome y escribe en la barra de direcciones:
   ```text
   chrome://extensions
   ```
   *(O ve al menú de los 3 puntos en la esquina superior derecha > **Extensiones** > **Administrar extensiones**).*

2. En la esquina superior derecha de la página de extensiones, activa el interruptor **"Modo de desarrollador"** (Developer mode).

3. Haz clic en el botón **"Cargar descomprimida"** (Load unpacked) que aparecerá en la esquina superior izquierda.

4. Selecciona la carpeta donde clonaste o descargaste este proyecto (la carpeta raíz que contiene el archivo `manifest.json`).

5. **Fijar el icono en la barra de herramientas:**
   - Haz clic en el icono de la pieza de rompecabezas (Extensiones) junto a la barra de direcciones de Chrome.
   - Busca **"Acceso Directo a Gmail"** y haz clic en el icono de la **chincheta / pin** para dejarlo siempre visible en tu barra superior.

---

## 📋 Características y Funcionamiento

### 1. Acceso Directo Inteligente
- Al hacer un clic en el icono de la extensión:
  - Si ya tienes abierta una pestaña de Gmail, Chrome salta inmediatamente a ella y le da foco a la ventana.
  - Si no está abierta, abre tu bandeja de entrada (`mail.google.com`).
  - Realiza una comprobación instantánea del estado de tu bandeja.

### 2. Estados Visuales del Icono
| Estado | Icono | Badge (Contador) | Tooltip |
| :--- | :---: | :---: | :--- |
| **Correos sin leer** | **Color oficial** | Número en rojo (`1`, `5`, `99+`) | `Gmail: X correos no leídos` |
| **Bandeja al día (0 no leídos)** | **Blanco y Negro** | Oculto | `Gmail: Sin correos no leídos` |
| **Sesión no iniciada** | Blanco y Negro | `?` | `Gmail: Inicia sesión...` |

### 3. Sincronización Doble
- **En segundo plano:** Utiliza el feed nativo de Gmail (`feed/atom`) comprobando periódicamente de forma ligera (cada 1 minuto por defecto) sin necesidad de configurar APIs complejas de Google Cloud ni claves OAuth2 (usa tu sesión activa en el navegador).
- **En tiempo real:** Si tienes una pestaña de Gmail abierta y lees correos o llega uno nuevo, detecta los cambios de inmediato a través de los eventos del navegador.

### 4. Menú Contextual (Clic derecho)
Si haces clic derecho sobre el icono de la extensión en la barra de herramientas, encontrarás:
- **Abrir Gmail**
- **Comprobar correos ahora**
- **Configuración...**

### 5. Página de Configuración
Permite personalizar:
- **Cuenta a monitorear:** Si tienes varias cuentas de Google iniciadas en el navegador, puedes elegir cuál seguir (`/u/0/`, `/u/1/`, etc.).
- **Mostrar/Ocultar el número:** Si prefieres un diseño aún más limpio, puedes desactivar el número y dejar que únicamente el color del icono te indique si hay correos.
- **Frecuencia de comprobación:** Configurable entre 1, 2, 5 o 10 minutos.
- **Prueba de conexión:** Botón interactivo para comprobar el estado del enlace con Gmail en tiempo real.

---

## 📁 Estructura del Proyecto

```text
├── manifest.json       # Configuración de la extensión (Manifest V3)
├── background.js       # Service worker: comprobación en segundo plano y gestión de pestañas
├── icons/              # Iconos en color y blanco y negro (16, 32, 48, 128 px)
│   ├── color-16.png, color-32.png, color-48.png, color-128.png
│   └── bw-16.png, bw-32.png, bw-48.png, bw-128.png
├── options/            # Página de configuración visual
│   ├── options.html
│   ├── options.css
│   └── options.js
└── generate_icons.js   # Script utilitario para regenerar iconos si se desea
```
