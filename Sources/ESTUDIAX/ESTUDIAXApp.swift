import SwiftUI
import AppKit
import UserNotifications
import ESTUDIAXCore

@main
struct ESTUDIAXApp: App {
    @AppStorage("estudiax.acceptedTermsVersion") private var acceptedTermsVersion = ""
    private let termsVersion = "1"

    var body: some Scene {
        WindowGroup {
            Group {
                if acceptedTermsVersion != termsVersion {
                    FirstLaunchView { acceptedTermsVersion = termsVersion }
                } else {
                    HomeView()
                }
            }
            .frame(minWidth: 760, minHeight: 520)
        }
        .commands { CommandGroup(replacing: .newItem) {} }
    }
}

private struct FirstLaunchView: View {
    let onAccept: () -> Void
    @State private var checked = false

    var body: some View {
        VStack(spacing: 18) {
            Image(systemName: "book.closed.fill").font(.system(size: 44)).foregroundStyle(.blue)
            Text("Bienvenido a ESTUDIAX").font(.largeTitle.bold())
            Text("Tus tareas, tarjetas y progreso se guardan en este Mac. La app no necesita conectarse a un servidor para abrirse ni para usar sus funciones locales.")
                .multilineTextAlignment(.center).frame(maxWidth: 500)
            HStack {
                Link("Términos", destination: URL(string: "https://estudiax.higgsfield.app")!)
                Text("·")
                Link("Aviso de privacidad", destination: URL(string: "https://estudiax.higgsfield.app")!)
            }.font(.callout)
            Toggle("He leído y acepto los términos y el aviso de privacidad.", isOn: $checked)
                .toggleStyle(.checkbox).frame(maxWidth: 500)
            Button("Aceptar y continuar") { onAccept() }
                .buttonStyle(.borderedProminent).disabled(!checked)
            Text("La IA y Google Drive solo se conectan cuando decides abrir esas funciones en línea.")
                .font(.footnote).foregroundStyle(.secondary).multilineTextAlignment(.center)
        }.padding(32)
    }
}

private enum StudySection: String, CaseIterable, Identifiable {
    case tasks = "Tareas"
    case calendar = "Calendario"
    case cards = "Tarjetas"
    case progress = "Progreso"
    case settings = "Ajustes"
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .tasks: "checklist"
        case .calendar: "calendar"
        case .cards: "rectangle.stack"
        case .progress: "chart.bar"
        case .settings: "gearshape"
        }
    }
}

private struct StudyCard: Codable, Identifiable {
    var id: UUID = UUID()
    var question: String
    var answer: String
}

private struct HomeView: View {
    @State private var selected: StudySection? = .tasks
    @State private var tasks: [StudyTask] = []
    @State private var newTitle = ""
    @State private var newSubject = ""
    @State private var newDueDate = Date()
    @State private var hasDueDate = false
    @State private var store = LocalTaskStore()
    @AppStorage("estudiax.mac.cards.v1") private var cardData = "[]"
    @State private var question = ""
    @State private var answer = ""
    @State private var revealed = Set<UUID>()

    private var cards: [StudyCard] {
        (try? JSONDecoder().decode([StudyCard].self, from: Data(cardData.utf8))) ?? []
    }
    private func saveCards(_ value: [StudyCard]) {
        if let data = try? JSONEncoder().encode(value) { cardData = String(decoding: data, as: UTF8.self) }
    }

    var body: some View {
        NavigationSplitView {
            List(StudySection.allCases, selection: $selected) { section in
                Label(section.rawValue, systemImage: section.symbol).tag(section)
            }.navigationTitle("ESTUDIAX")
        } detail: {
            Group {
                switch selected ?? .tasks {
                case .tasks: tasksView
                case .calendar: calendarView
                case .cards: cardsView
                case .progress: progressView
                case .settings: settingsView
                }
            }.padding(24)
        }
        .task { await reload() }
    }

    private var tasksView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Mis tareas").font(.largeTitle.bold())
            Text("Tus datos se guardan localmente y están disponibles sin conexión.").foregroundStyle(.secondary)
            HStack {
                TextField("Nombre de la tarea", text: $newTitle)
                TextField("Materia", text: $newSubject).frame(maxWidth: 160)
            }
            Toggle("Añadir fecha de entrega", isOn: $hasDueDate)
            if hasDueDate { DatePicker("Entrega", selection: $newDueDate, displayedComponents: .date).datePickerStyle(.compact) }
            HStack {
                Button("Añadir tarea") { addTask() }
                    .buttonStyle(.borderedProminent)
                    .disabled(newTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                Spacer()
            }
            List {
                ForEach(tasks) { task in
                    HStack(spacing: 12) {
                        Button { toggle(task) } label: {
                            Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        }.buttonStyle(.plain)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(task.title).strikethrough(task.isCompleted)
                            Text(task.subject.isEmpty ? "Sin materia" : task.subject)
                                .font(.caption).foregroundStyle(.secondary)
                            if let due = task.dueDate {
                                Text(due.formatted(date: .abbreviated, time: .omitted))
                                    .font(.caption2).foregroundStyle(.secondary)
                            }
                        }
                        Spacer()
                        Button(role: .destructive) { delete(task) } label: { Image(systemName: "trash") }
                            .buttonStyle(.borderless)
                    }.padding(.vertical, 3)
                }
            }
        }
    }

    private var calendarView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Calendario de estudio").font(.largeTitle.bold())
            DatePicker("Ir a fecha", selection: $newDueDate, displayedComponents: .date).datePickerStyle(.graphical)
            let dated = tasks.filter { $0.dueDate != nil }.sorted { ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture) }
            Text("Entregas").font(.title2.bold())
            List(dated) { task in
                HStack {
                    VStack(alignment: .leading) {
                        Text(task.title)
                        Text(task.subject.isEmpty ? "Sin materia" : task.subject).font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer()
                    if let date = task.dueDate { Text(date.formatted(date: .abbreviated, time: .omitted)).font(.caption) }
                    if task.isCompleted { Image(systemName: "checkmark.circle.fill").foregroundStyle(.green) }
                }
            }
        }
    }

    private var cardsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Tarjetas de estudio").font(.largeTitle.bold())
            TextField("Pregunta o concepto", text: $question)
            TextField("Respuesta", text: $answer)
            Button("Guardar tarjeta") {
                let q = question.trimmingCharacters(in: .whitespacesAndNewlines)
                let a = answer.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !q.isEmpty, !a.isEmpty else { return }
                saveCards(cards + [StudyCard(question: q, answer: a)])
                question = ""; answer = ""
            }.buttonStyle(.borderedProminent)
            List {
                ForEach(cards) { card in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(card.question).font(.headline)
                        if revealed.contains(card.id) { Text(card.answer).foregroundStyle(.secondary) }
                        HStack {
                            Button(revealed.contains(card.id) ? "Ocultar respuesta" : "Ver respuesta") {
                                if revealed.contains(card.id) { revealed.remove(card.id) } else { revealed.insert(card.id) }
                            }
                            Spacer()
                            Button(role: .destructive) { saveCards(cards.filter { $0.id != card.id }); revealed.remove(card.id) } label: { Image(systemName: "trash") }
                                .buttonStyle(.borderless)
                        }.font(.caption)
                    }.padding(.vertical, 4)
                }
            }
        }
    }

    private var progressView: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Tu progreso").font(.largeTitle.bold())
            LabeledContent("Tareas completadas", value: "\(tasks.filter { $0.isCompleted }.count)")
            LabeledContent("Tareas pendientes", value: "\(tasks.filter { !$0.isCompleted }.count)")
            LabeledContent("Tarjetas creadas", value: "\(cards.count)")
            ProgressView(value: tasks.isEmpty ? 0 : Double(tasks.filter { $0.isCompleted }.count) / Double(tasks.count))
            Text("El progreso se calcula en este Mac; no se envía a un servidor.").font(.footnote).foregroundStyle(.secondary)
            Spacer()
        }
    }

    private var settingsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Ajustes y privacidad").font(.largeTitle.bold())
            Label("Datos locales", systemImage: "internaldrive")
            Text("La aplicación no requiere cuenta ni conexión al iniciar. No integra Turnstile ni envía telemetría obligatoria.")
                .foregroundStyle(.secondary)
            Button("Activar recordatorios locales") {
                UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
                    guard granted else { return }
                    Task { await scheduleReminders() }
                }
            }.buttonStyle(.borderedProminent)
            Button("Copiar copia de seguridad", action: {
                let taskLines = tasks.map { "\($0.title) | \($0.subject) | \($0.dueDate?.description ?? "") | completada: \($0.isCompleted)" }.joined(separator: "\n")
                let cardLines = cards.map { "\($0.question) → \($0.answer)" }.joined(separator: "\n")
                NSPasteboard.general.clearContents()
                NSPasteboard.general.setString("Tareas:\n\(taskLines)\n\nTarjetas:\n\(cardLines)", forType: .string)
            })
            Button("Borrar tareas y tarjetas locales", role: .destructive) {
                Task { for task in await store.allTasks() { try? await store.delete(id: task.id) }; saveCards([]); await reload() }
            }
            Divider()
            Text("Funciones en línea opcionales").font(.title2.bold())
            Text("Para usar el tutor IA, los exámenes con IA y Google Drive, abre la versión web cuando decidas conectarte.")
                .foregroundStyle(.secondary)
            Link("Abrir ESTUDIAX Web ↗", destination: URL(string: "https://estudiax.higgsfield.app")!)
            Link("Código fuente ↗", destination: URL(string: "https://github.com/ebmatias-droid/ESTUDIAX-native")!)
            Spacer()
        }
    }

    private func addTask() {
        let title = newTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !title.isEmpty else { return }
        let task = StudyTask(title: title, subject: newSubject.trimmingCharacters(in: .whitespacesAndNewlines),
                             dueDate: hasDueDate ? Calendar.current.startOfDay(for: newDueDate) : nil)
        newTitle = ""; newSubject = ""; hasDueDate = false
        Task { try? await store.save(task); await reload() }
    }

    private func toggle(_ task: StudyTask) {
        var updated = task
        updated.isCompleted.toggle()
        let updatedTask = updated
        Task { try? await store.save(updatedTask); await reload() }
    }

    private func delete(_ task: StudyTask) {
        Task { try? await store.delete(id: task.id); await reload() }
    }

    private func reload() async { tasks = await store.allTasks() }

    private func scheduleReminders() async {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        for task in await store.allTasks() where !task.isCompleted {
            guard let due = task.dueDate, let reminder = Calendar.current.date(byAdding: .day, value: -1, to: due), reminder > .now else { continue }
            var components = Calendar.current.dateComponents([.year, .month, .day], from: reminder)
            components.hour = 9; components.minute = 0
            let content = UNMutableNotificationContent()
            content.title = "ESTUDIAX · Entrega próxima"
            content.body = task.title
            content.sound = .default
            try? await center.add(UNNotificationRequest(identifier: task.id.uuidString, content: content,
                                             trigger: UNCalendarNotificationTrigger(dateMatching: components, repeats: false)))
        }
    }
}
