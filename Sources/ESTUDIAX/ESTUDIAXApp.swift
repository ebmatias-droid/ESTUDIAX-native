import SwiftUI
import ESTUDIAXCore

@main
struct ESTUDIAXApp: App {
    @AppStorage("estudiax.acceptedTermsVersion") private var acceptedTermsVersion = ""
    private let termsVersion = "1"

    var body: some Scene {
        WindowGroup {
            Group {
                if acceptedTermsVersion != termsVersion {
                    FirstLaunchView {
                        acceptedTermsVersion = termsVersion
                    }
                } else {
                    HomeView()
                }
            }
            .frame(minWidth: 680, minHeight: 480)
        }
        .commands {
            CommandGroup(replacing: .newItem) {}
        }
    }
}

private struct FirstLaunchView: View {
    let onAccept: () -> Void
    @State private var checked = false

    var body: some View {
        VStack(spacing: 18) {
            Image(systemName: "book.closed.fill")
                .font(.system(size: 44))
                .foregroundStyle(.blue)
            Text("Bienvenido a ESTUDIAX")
                .font(.largeTitle.bold())
            Text("Tus tareas y materiales se guardan en este dispositivo. La app no necesita conectarse a un servidor para abrirse ni para usar sus funciones locales.")
                .multilineTextAlignment(.center)
                .frame(maxWidth: 480)
            Toggle("He leído y acepto los términos y el aviso de privacidad.", isOn: $checked)
                .toggleStyle(.checkbox)
                .frame(maxWidth: 480)
            Button("Continuar") { onAccept() }
                .buttonStyle(.borderedProminent)
                .disabled(!checked)
            Text("Las funciones de IA y Google Drive solo se conectarán cuando decidas utilizarlas.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(32)
    }
}

private struct HomeView: View {
    @State private var tasks: [StudyTask] = []
    @State private var newTitle = ""
    @State private var newSubject = ""
    @State private var store = LocalTaskStore()

    var body: some View {
        NavigationSplitView {
            List {
                Label("Tablón", systemImage: "rectangle.grid.1x2")
                Label("Tareas", systemImage: "checklist")
                Label("Tarjetas", systemImage: "rectangle.stack")
                Label("Calendario", systemImage: "calendar")
                Label("Progreso", systemImage: "chart.bar")
            }
            .navigationTitle("ESTUDIAX")
        } detail: {
            VStack(alignment: .leading, spacing: 16) {
                Text("Tu espacio de estudio")
                    .font(.largeTitle.bold())
                Text("Tus tareas permanecen en este dispositivo. No se necesita conexión.")
                    .foregroundStyle(.secondary)
                HStack {
                    TextField("Nueva tarea", text: $newTitle)
                    TextField("Materia", text: $newSubject)
                        .frame(maxWidth: 160)
                    Button("Añadir") { addTask() }
                        .disabled(newTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                List {
                    ForEach(tasks) { task in
                        HStack {
                            Button { toggle(task) } label: {
                                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                            }
                            .buttonStyle(.plain)
                            VStack(alignment: .leading) {
                                Text(task.title)
                                if !task.subject.isEmpty {
                                    Text(task.subject).font(.caption).foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                            Button(role: .destructive) { delete(task) } label: {
                                Image(systemName: "trash")
                            }
                            .buttonStyle(.borderless)
                        }
                    }
                }
            }
            .padding(24)
            .task { await reload() }
        }
    }

    private func addTask() {
        let task = StudyTask(title: newTitle.trimmingCharacters(in: .whitespacesAndNewlines),
                             subject: newSubject.trimmingCharacters(in: .whitespacesAndNewlines))
        newTitle = ""
        newSubject = ""
        Task { try? await store.save(task); await reload() }
    }

    private func toggle(_ task: StudyTask) {
        var updated = task
        updated.isCompleted.toggle()
        let taskToSave = updated
        Task { try? await store.save(taskToSave); await reload() }
    }

    private func delete(_ task: StudyTask) {
        Task { try? await store.delete(id: task.id); await reload() }
    }

    private func reload() async {
        tasks = await store.allTasks()
    }
}
