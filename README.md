# Banco Digital del Sistema Braille

Primera versión funcional de una plataforma web educativa para la consulta, el reconocimiento y la práctica inicial del sistema Braille.

## Características

- Consulta de las letras del alfabeto español, incluida la Ñ.
- Vocales acentuadas en Braille.
- Números del 0 al 9 con prefijo numérico.
- Signos básicos de puntuación.
- Palabras básicas de uso cotidiano.
- Búsqueda por símbolo, nombre, descripción o categoría.
- Filtros por categoría.
- Diseño accesible, responsivo y sin dependencias externas.

## Archivos

- `index.html`: estructura y contenido principal de la plataforma.
- `estilos.css`: diseño visual, adaptación responsiva y estados de accesibilidad.
- `app.js`: carga de datos, búsqueda, filtros y renderizado de tarjetas.
- `braille.json`: banco inicial de contenidos en formato JSON.

## Ejecutar en el equipo

La página carga `braille.json` mediante `fetch`, por lo que debe abrirse desde un servidor web y no directamente con doble clic sobre `index.html`.

Con Python instalado:

```bash
python -m http.server 8000
```

Después, abre `http://localhost:8000` en el navegador.

También puede utilizarse la extensión Live Server de Visual Studio Code.

## Publicar en GitHub Pages

1. Sube todos los archivos a la rama principal del repositorio.
2. En GitHub, abre **Settings > Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama principal y la carpeta raíz `/`.
5. Guarda la configuración y espera a que GitHub publique la dirección del sitio.

Antes de publicar, reemplaza el enlace temporal `#` del botón **Volver al inicio CREBE** por la dirección institucional definitiva.

## Alcance pedagógico

Este recurso facilita la consulta visual del sistema Braille. No reemplaza el aprendizaje táctil en material impreso en relieve.

## Créditos

Desarrollado por Gabriel Bermúdez con apoyo institucional del CREBE "Señor de los Milagros" - Ucayali. Plataforma educativa sin fines de lucro.
