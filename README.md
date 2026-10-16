# ESTUDIAX Native

Aplicación de estudio **local-first** de ESTUDIAX. El sitio web original seguirá existiendo por separado.

## Objetivos de plataforma

- **macOS:** app SwiftUI, distribución prevista como DMG.
- **iPhone/iPad:** experiencia web instalable mediante «Añadir a pantalla de inicio»; una app nativa podrá evaluarse después.
- **Windows y Linux:** cliente de escritorio multiplataforma planificado, con paquetes propios por sistema.
- **Android:** APK planificado.
- **Web:** permanece disponible en https://estudiax.higgsfield.app.

## Principios de privacidad

1. Las funciones esenciales deben funcionar sin conexión.
2. Tareas, tarjetas, progreso y preferencias se guardan localmente.
3. No se requiere cuenta ni conexión al servidor para abrir y usar las funciones locales.
4. Los términos y el aviso de privacidad se muestran una sola vez por instalación; la app guarda localmente que el usuario los aceptó. Los cambios materiales podrán requerir una nueva aceptación.
5. IA y Google Drive son integraciones opcionales que se conectan solo cuando el usuario las usa.
6. No incluir Turnstile, CAPTCHA ni credenciales de servidor en el arranque de la app.
7. No incrustar claves secretas de Groq/OpenAI en el ejecutable. Las claves personales, si se admiten, deben almacenarse en el llavero seguro del sistema.
8. Las solicitudes en línea deben ser explícitas, mínimas y documentadas. No telemetría obligatoria.

## Estado

Este repositorio inicia la base de la app macOS y documenta la arquitectura multiplataforma. Los instaladores de Windows/Linux/Android y el DMG solo deben publicarse después de que sus builds y pruebas pasen en CI; no se deben presentar artefactos de prueba como versiones estables.

## Desarrollo macOS

Requisitos: macOS y Swift 5.9 o posterior.

```sh
swift build
swift run
```

También se puede abrir `Package.swift` directamente en Xcode.

## Estructura

- `Sources/ESTUDIAX/`: interfaz macOS.
- `Sources/ESTUDIAXCore/`: modelos y almacenamiento local.
- `Tests/`: pruebas del núcleo.
- `.github/workflows/`: automatización de compilación.

## Licencia

La licencia se elegirá antes de una publicación pública. No se debe asumir que el repositorio privado actual ya tiene licencia open-source.
