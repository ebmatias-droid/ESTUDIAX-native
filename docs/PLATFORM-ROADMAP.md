# Platform status

| Platform | Delivery | Status |
|---|---|---|
| macOS | SwiftUI app + DMG | Starter app and local task core; CI builds unsigned DMG |
| iPhone / iPad | Native SwiftUI app | Xcode project and Apple signing not yet configured |
| Apple Watch | Calendar display + local notifications | Watch target and iPhone companion not yet configured |
| Windows | Tauri installer EXE | Local tasks, calendar, cards, progress, export/delete; CI installer |
| Linux | AppImage + DEB | Same Tauri desktop UI; CI packages |
| Android | APK | Kotlin local task/calendar/progress app; debug APK |
| Web | Hosted ESTUDIAX | Remains available |

## Release integrity
CI artifacts are test builds, not signed consumer releases. Android APK is debug-signed; macOS DMG is not notarized; Windows installer is unsigned. iPhone/iPad and Watch require Xcode targets, entitlements, companion data, and Apple signing before device installation/distribution.
