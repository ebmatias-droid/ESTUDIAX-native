import SwiftUI
import UIKit

@main
struct ESTUDIAXiOSApp: App {
    var body: some Scene {
        WindowGroup { MobileHomeView() }
    }
}

private struct MobileHomeView: View {
    @AppStorage("estudiax.mobile.acceptedTerms.v1") private var accepted = false
    @AppStorage("estudiax.mobile.tasks") private var taskData = "[]"
    @AppStorage("estudiax.mobile.cards") private var cardData = "[]"
    @State private var tab = 0
    @State private var title = ""
    @State private var subject = ""
    @State private var due = Date()
    @State private var front = ""
    @State private var back = ""
    @State private var reveal = Set<String>()

    private var tasks: [StudyTask] {
        (try? JSONDecoder().decode([StudyTask].self, from: Data(taskData.utf8))) ?? []
    }
    private var cards: [MobileCard] {
        (try? JSONDecoder().decode([MobileCard].self, from: Data(cardData.utf8))) ?? []
    }
    private func saveTasks(_ value: [StudyTask]) {
        if let data = try? JSONEncoder().encode(value) { taskData = String(decoding: data, as: UTF8.self) }
    }
    private func saveCards(_ value: [MobileCard]) {
        if let data = try? JSONEncoder().encode(value) { cardData = String(decoding: data, as: UTF8.self) }
    }

    var body: some View {
        Group {
            if !accepted {
                VStack(spacing: 18) {
                    Image(systemName: "book.closed.fill").font(.system(size: 44)).foregroundStyle(.blue)
                    Text("Bienvenido a ESTUDIAX").font(.title.bold())
                    Text("Tus tareas y tarjetas se guardan en este dispositivo. No necesitas una cuenta ni conexión para usar las funciones locales. La IA y Google Drive serán opciones en línea separadas.")
                        .multilineTextAlignment(.center).font(.callout)
                    Button("Aceptar condiciones y continuar") { accepted = true }
                        .buttonStyle(.borderedProminent)
                }.padding(28)
            } else {
                TabView(selection: $tab) {
                    taskPage.tabItem { Label("Tareas", systemImage: "checklist") }.tag(0)
                    calendarPage.tabItem { Label("Calendario", systemImage: "calendar") }.tag(1)
                    cardsPage.tabItem { Label("Tarjetas", systemImage: "rectangle.stack") }.tag(2)
                    progressPage.tabItem { Label("Progreso", systemImage: "chart.bar") }.tag(3)
                    settingsPage.tabItem { Label("Ajustes", systemImage: "gearshape") }.tag(4)
                }.tint(.blue)
            }
        }
    }

    private var taskPage: some View {
        NavigationStack {
            List {
                Section("Nueva tarea") {
                    TextField("Nombre de la tarea", text: $title)
                    TextField("Materia", text: $subject)
                    DatePicker("Entrega", selection: $due, displayedComponents: .date)
                    Button("Añadir tarea") {
                        guard !title.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                        var updated = tasks
                        updated.append(StudyTask(title: title.trimmingCharacters(in: .whitespacesAndNewlines), subject: subject, dueDate: due))
                        saveTasks(updated); title = ""; subject = ""
                    }.disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                Section("Mis tareas") {
                    if tasks.isEmpty { Text("Todavía no tienes tareas.").foregroundStyle(.secondary) }
                    ForEach(tasks) { task in
                        HStack {
                            Button { var a=tasks; if let i=a.firstIndex(where:{$0.id==task.id}) { a[i].isCompleted.toggle(); saveTasks(a) } } label: {
                                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                            }.buttonStyle(.plain)
                            VStack(alignment: .leading) {
                                Text(task.title).strikethrough(task.isCompleted)
                                Text(task.subject.isEmpty ? "Sin materia" : task.subject).font(.caption).foregroundStyle(.secondary)
                                if let d=task.dueDate { Text(d, style: .date).font(.caption2).foregroundStyle(.secondary) }
                            }
                            Spacer()
                            Button(role: .destructive) { saveTasks(tasks.filter{$0.id != task.id}) } label: { Image(systemName: "trash") }
                        }
                    }
                }
            }.navigationTitle("ESTUDIAX")
        }
    }

    private var calendarPage: some View {
        NavigationStack {
            List {
                Section("Próximas entregas") {
                    ForEach(tasks.filter{$0.dueDate != nil}.sorted{($0.dueDate ?? .distantFuture)<($1.dueDate ?? .distantFuture)}) { task in
                        HStack { VStack(alignment:.leading){Text(task.title);Text(task.subject).font(.caption).foregroundStyle(.secondary)};Spacer();if let d=task.dueDate{Text(d,style:.date).font(.caption)} }
                    }
                    if tasks.allSatisfy({$0.dueDate == nil}) { Text("Añade fechas a tus tareas para verlas aquí.").foregroundStyle(.secondary) }
                }
                Section("Este mes") { DatePicker("Ir a fecha", selection:$due, displayedComponents:.date) }
            }.navigationTitle("Calendario")
        }
    }

    private var cardsPage: some View {
        NavigationStack {
            List {
                Section("Crear tarjeta") {
                    TextField("Pregunta",text:$front)
                    TextField("Respuesta",text:$back,axis:.vertical)
                    Button("Guardar tarjeta") {
                        guard !front.isEmpty && !back.isEmpty else { return }
                        var a=cards; a.append(MobileCard(id:UUID().uuidString,front:front,back:back));saveCards(a);front="";back=""
                    }
                }
                Section("Mi mazo") {
                    ForEach(cards,id:\.id) { card in
                        VStack(alignment:.leading,spacing:8) {
                            Text(card.front).font(.headline)
                            if reveal.contains(card.id) { Text(card.back).foregroundStyle(.secondary) }
                            HStack {
                                Button(reveal.contains(card.id) ? "Ocultar" : "Ver respuesta") { if reveal.contains(card.id){reveal.remove(card.id)}else{reveal.insert(card.id)} }
                                Spacer()
                                Button(role:.destructive) { saveCards(cards.filter{$0.id != card.id});reveal.remove(card.id) } label:{Image(systemName:"trash")}
                            }.font(.caption)
                        }
                    }
                }
            }.navigationTitle("Tarjetas")
        }
    }

    private var progressPage: some View {
        NavigationStack {
            List {
                LabeledContent("Tareas completadas", value:"\(tasks.filter{$0.isCompleted}.count)")
                LabeledContent("Tareas pendientes", value:"\(tasks.filter{!$0.isCompleted}.count)")
                LabeledContent("Tarjetas creadas", value:"\(cards.count)")
                ProgressView(value: tasks.isEmpty ? 0 : Double(tasks.filter{$0.isCompleted}.count)/Double(tasks.count))
                Text("El progreso se calcula localmente y no se envía a ningún servidor.").font(.footnote).foregroundStyle(.secondary)
            }.navigationTitle("Progreso")
        }
    }

    private var settingsPage: some View {
        NavigationStack {
            List {
                Section("Privacidad") {
                    Label("Datos almacenados en este dispositivo",systemImage:"iphone")
                    Label("Sin conexión obligatoria al iniciar",systemImage:"wifi.slash")
                    Button("Exportar mis datos") {
                        let payload = ["tasks": taskData, "cards": cardData]
                        let text = payload.map{"\($0.key): \($0.value)"}.joined(separator:"\n")
                        UIPasteboard.general.string = text
                    }
                    Button("Borrar datos locales",role:.destructive) { taskData="[]";cardData="[]" }
                }
                Section("Servicios opcionales") {
                    Text("La IA y Google Drive requieren una integración configurada. Esta versión nativa no se conecta automáticamente al servidor.")
                }
            }.navigationTitle("Ajustes")
        }
    }
}

private struct MobileCard: Codable, Identifiable {
    var id: String
    var front: String
    var back: String
}
