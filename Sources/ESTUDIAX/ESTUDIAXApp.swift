import SwiftUI
import ESTUDIAXCore

@main
struct ESTUDIAXApp: App {
    var body: some Scene {
        WindowGroup { DesktopHomeView() }
            .windowStyle(.titleBar)
            .commands { CommandGroup(replacing: .newItem) {} }
    }
}

private enum StudySection: String, CaseIterable, Identifiable {
    case dashboard = "Tablón", tasks = "Tareas", calendar = "Calendario"
    case cards = "Tarjetas", exam = "Exámenes", tutor = "Tutor sin conexión"
    case progress = "Progreso", settings = "Privacidad"
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .dashboard: return "rectangle.grid.1x2"
        case .tasks: return "checklist"
        case .calendar: return "calendar"
        case .cards: return "rectangle.stack"
        case .exam: return "checkmark.seal"
        case .tutor: return "book"
        case .progress: return "chart.bar"
        case .settings: return "hand.raised"
        }
    }
}

private struct StudyCard: Codable, Identifiable {
    var id: UUID = UUID()
    var front: String
    var back: String
}

private struct QuizQuestion: Identifiable {
    var id = UUID()
    var question: String
    var answer: String
}

private struct DesktopHomeView: View {
    @AppStorage("estudiax.acceptedTermsVersion") private var acceptedTermsVersion = ""
    @AppStorage("estudiax.tasks.json") private var taskJSON = "[]"
    @AppStorage("estudiax.cards.json") private var cardJSON = "[]"
    @State private var selected: StudySection? = .dashboard
    @State private var taskTitle = ""
    @State private var taskSubject = ""
    @State private var dueDate = Date()
    @State private var cardFront = ""
    @State private var cardBack = ""
    @State private var revealed = Set<UUID>()
    @State private var tutorQuestion = ""
    @State private var tutorAnswer = ""
    @State private var quizTopic = ""
    @State private var quizQuestions: [QuizQuestion] = []
    @State private var acceptedCheck = false

    private var tasks: [StudyTask] {
        (try? JSONDecoder().decode([StudyTask].self, from: Data(taskJSON.utf8))) ?? []
    }
    private var cards: [StudyCard] {
        (try? JSONDecoder().decode([StudyCard].self, from: Data(cardJSON.utf8))) ?? []
    }
    private func saveTasks(_ value: [StudyTask]) {
        if let data = try? JSONEncoder().encode(value) { taskJSON = String(decoding: data, as: UTF8.self) }
    }
    private func saveCards(_ value: [StudyCard]) {
        if let data = try? JSONEncoder().encode(value) { cardJSON = String(decoding: data, as: UTF8.self) }
    }

    var body: some View {
        Group {
            if acceptedTermsVersion != "1" {
                firstLaunch
            } else {
                NavigationSplitView {
                    List(selection: $selected) {
                        ForEach(StudySection.allCases) { section in
                            Label(section.rawValue, systemImage: section.symbol).tag(section as StudySection?)
                        }
                    }
                    .listStyle(.sidebar)
                    .navigationTitle("ESTUDIAX")
                    .safeAreaInset(edge: .bottom) {
                        Label("Datos en este Mac", systemImage: "lock.fill")
                            .font(.caption).foregroundStyle(.secondary).padding()
                    }
                } detail: {
                    detail
                        .frame(minWidth: 520, minHeight: 440)
                }
                .frame(minWidth: 850, minHeight: 580)
            }
        }
    }

    private var firstLaunch: some View {
        VStack(spacing: 18) {
            Image(systemName: "book.closed.fill").font(.system(size: 48)).foregroundStyle(.blue)
            Text("Bienvenido a ESTUDIAX").font(.largeTitle.bold())
            Text("Tus tareas, tarjetas y progreso se guardan en este Mac. La app abre y funciona sin conexión. La IA y Google Drive serán servicios opcionales que solo se conectarán cuando los elijas.")
                .multilineTextAlignment(.center).frame(maxWidth: 520)
            Toggle("He leído y acepto los términos y el aviso de privacidad.", isOn: $acceptedCheck)
                .toggleStyle(.checkbox).frame(maxWidth: 520)
            Button("Continuar") { acceptedTermsVersion = "1" }
                .buttonStyle(.borderedProminent).disabled(!acceptedCheck)
            Text("No se ejecuta Turnstile ni se contacta al servidor al iniciar.")
                .font(.footnote).foregroundStyle(.secondary)
        }.padding(36).frame(minWidth: 640, minHeight: 420)
    }

    @ViewBuilder private var detail: some View {
        switch selected ?? .dashboard {
        case .dashboard:
            VStack(alignment: .leading, spacing: 22) {
                Text("Tu espacio de estudio").font(.largeTitle.bold())
                Text("Todo lo esencial, incluso sin internet.").foregroundStyle(.secondary)
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))], spacing: 14) {
                    stat("Pendientes", "\(tasks.filter { !$0.isCompleted }.count)", "checklist")
                    stat("Completadas", "\(tasks.filter { $0.isCompleted }.count)", "checkmark.circle")
                    stat("Tarjetas", "\(cards.count)", "rectangle.stack")
                    stat("Próximas entregas", "\(tasks.filter { !$0.isCompleted && ($0.dueDate ?? .distantPast) >= Calendar.current.startOfDay(for: .now) }.count)", "calendar")
                }
                Text("Acceso rápido").font(.title2.bold())
                HStack {
                    quick("Añadir tarea", "plus.circle", .tasks)
                    quick("Estudiar tarjetas", "rectangle.stack", .cards)
                    quick("Practicar examen", "checkmark.seal", .exam)
                }
                Spacer()
            }.padding(30)
        case .tasks: tasksView
        case .calendar: calendarView
        case .cards: cardsView
        case .exam: examView
        case .tutor: tutorView
        case .progress: progressView
        case .settings: settingsView
        }
    }

    private func stat(_ title: String, _ value: String, _ symbol: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: symbol).font(.title2).foregroundStyle(.blue)
            Text(value).font(.system(size: 30, weight: .bold, design: .rounded))
            Text(title).font(.caption).foregroundStyle(.secondary)
        }.frame(maxWidth: .infinity, alignment: .leading).padding(18)
            .background(.quaternary.opacity(0.35), in: RoundedRectangle(cornerRadius: 14))
    }
    private func quick(_ title: String, _ symbol: String, _ section: StudySection) -> some View {
        Button { selected = section } label: {
            Label(title, systemImage: symbol).frame(maxWidth: .infinity).padding(12)
        }.buttonStyle(.bordered)
    }

    private var tasksView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Mis tareas").font(.largeTitle.bold())
            GroupBox("Añadir tarea") {
                VStack(alignment: .leading, spacing: 10) {
                    TextField("Nombre de la tarea", text: $taskTitle)
                    TextField("Materia", text: $taskSubject)
                    DatePicker("Fecha de entrega", selection: $dueDate, displayedComponents: .date)
                    Button("Guardar tarea") {
                        guard !taskTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
                        var updated = tasks
                        updated.append(StudyTask(title: taskTitle.trimmingCharacters(in: .whitespacesAndNewlines), subject: taskSubject, dueDate: dueDate))
                        saveTasks(updated); taskTitle = ""; taskSubject = ""
                    }.buttonStyle(.borderedProminent)
                }.padding(6)
            }
            List {
                ForEach(tasks) { task in
                    HStack {
                        Button { var a = tasks; if let i = a.firstIndex(where: {$0.id == task.id}) { a[i].isCompleted.toggle(); saveTasks(a) } } label: {
                            Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        }.buttonStyle(.plain)
                        VStack(alignment: .leading) {
                            Text(task.title).strikethrough(task.isCompleted)
                            Text(task.subject.isEmpty ? "Sin materia" : task.subject).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        if let date = task.dueDate { Text(date, style: .date).font(.caption).foregroundStyle(.secondary) }
                        Button(role: .destructive) { saveTasks(tasks.filter { $0.id != task.id }) } label: { Image(systemName: "trash") }.buttonStyle(.borderless)
                    }.padding(.vertical, 3)
                }
            }
        }.padding(24)
    }

    private var calendarView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Calendario").font(.largeTitle.bold())
            Text(Date.now.formatted(.dateTime.month(.wide).year())).font(.title2)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 8) {
                ForEach(["L","M","X","J","V","S","D"], id: \.self) { Text($0).font(.caption.bold()).frame(maxWidth: .infinity) }
                ForEach(1...Calendar.current.range(of: .day, in: .month, for: .now)!.count, id: \.self) { day in
                    VStack(spacing: 4) {
                        Text("\(day)").font(.callout)
                        let matches = tasks.filter { task in
                            guard let date = task.dueDate else { return false }
                            return Calendar.current.component(.day, from: date) == day && Calendar.current.isDate(date, equalTo: .now, toGranularity: .month)
                        }
                        Circle().fill(matches.isEmpty ? .clear : .blue).frame(width: 5, height: 5)
                    }.frame(maxWidth: .infinity, minHeight: 42).background(Calendar.current.component(.day, from: .now) == day ? Color.blue.opacity(0.15) : .clear, in: RoundedRectangle(cornerRadius: 8))
                }
            }
            Text("Entregas próximas").font(.title2.bold())
            List(tasks.filter { $0.dueDate != nil }.sorted { ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture) }) { task in
                HStack { Text(task.title); Spacer(); if let date=task.dueDate { Text(date,style:.date).font(.caption).foregroundStyle(.secondary) } }
            }
        }.padding(24)
    }

    private var cardsView: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Tarjetas de estudio").font(.largeTitle.bold())
            GroupBox("Crear tarjeta") {
                VStack(spacing: 8) {
                    TextField("Pregunta o concepto", text: $cardFront)
                    TextField("Respuesta", text: $cardBack)
                    Button("Añadir al mazo") {
                        guard !cardFront.isEmpty && !cardBack.isEmpty else { return }
                        var a=cards; a.append(StudyCard(front:cardFront,back:cardBack)); saveCards(a); cardFront="";cardBack=""
                    }.buttonStyle(.borderedProminent)
                }.padding(6)
            }
            List {
                ForEach(cards) { card in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(card.front).font(.headline)
                        if revealed.contains(card.id) { Text(card.back).foregroundStyle(.secondary) }
                        HStack {
                            Button(revealed.contains(card.id) ? "Ocultar respuesta" : "Mostrar respuesta") { if revealed.contains(card.id) { revealed.remove(card.id) } else { revealed.insert(card.id) } }
                            Spacer()
                            Button(role: .destructive) { saveCards(cards.filter { $0.id != card.id }); revealed.remove(card.id) } label: { Image(systemName: "trash") }
                        }.font(.caption)
                    }.padding(.vertical, 4)
                }
            }
        }.padding(24)
    }

    private var examView: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Práctica de examen").font(.largeTitle.bold())
            Text("Crea preguntas de repaso sin conexión usando tus propios apuntes o tarjetas.")
                .foregroundStyle(.secondary)
            TextField("Tema del examen", text: $quizTopic)
            Button("Generar práctica con mis tarjetas") {
                quizQuestions = cards.filter { $0.front.localizedCaseInsensitiveContains(quizTopic) || quizTopic.isEmpty }.map { QuizQuestion(question:$0.front,answer:$0.back) }
            }.buttonStyle(.borderedProminent)
            if quizQuestions.isEmpty {
                VStack(spacing: 10) {
                    Image(systemName: "checkmark.seal").font(.largeTitle).foregroundStyle(.secondary)
                    Text("Tu práctica aparecerá aquí").font(.headline)
                    Text("Crea tarjetas primero y luego conviértelas en preguntas de repaso.").foregroundStyle(.secondary)
                }.frame(maxWidth: .infinity, minHeight: 120)
            } else {
                List(quizQuestions) { q in VStack(alignment:.leading,spacing:6){Text(q.question).font(.headline);Text(q.answer).foregroundStyle(.secondary)} }
            }
            Text("Esta modalidad es local; no es el tutor de IA en línea.").font(.footnote).foregroundStyle(.secondary)
            Spacer()
        }.padding(24)
    }

    private var tutorView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Tutor de estudio local").font(.largeTitle.bold())
            Text("Sin conexión no se utiliza un modelo de IA. Puedes consultar tus tarjetas o convertir una duda en una nota para estudiar.")
                .foregroundStyle(.secondary)
            TextEditor(text: $tutorQuestion).frame(minHeight: 100).overlay(RoundedRectangle(cornerRadius: 8).stroke(.quaternary))
            Button("Preparar guía de repaso") {
                let related = cards.filter { $0.front.localizedCaseInsensitiveContains(tutorQuestion) || $0.back.localizedCaseInsensitiveContains(tutorQuestion) }
                tutorAnswer = related.isEmpty ? "Guía de estudio\n\n1. Escribe qué sabes del tema.\n2. Divide el tema en tres conceptos.\n3. Busca un ejemplo y explícalo con tus palabras.\n4. Crea tarjetas de pregunta y respuesta.\n\nNo se envió tu consulta a ningún servidor." : related.map { "• \($0.front)\n  \($0.back)" }.joined(separator:"\n\n")
            }.buttonStyle(.borderedProminent)
            if !tutorAnswer.isEmpty { ScrollView { Text(tutorAnswer).frame(maxWidth:.infinity,alignment:.leading).padding() }.background(.quaternary.opacity(0.3),in:RoundedRectangle(cornerRadius:10)) }
            Spacer()
        }.padding(24)
    }

    private var progressView: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("Tu progreso").font(.largeTitle.bold())
            stat("Completadas", "\(tasks.filter{$0.isCompleted}.count)", "checkmark.circle")
            stat("Pendientes", "\(tasks.filter{!$0.isCompleted}.count)", "clock")
            stat("Tarjetas", "\(cards.count)", "rectangle.stack")
            ProgressView(value: tasks.isEmpty ? 0 : Double(tasks.filter{$0.isCompleted}.count)/Double(tasks.count)) {
                Text("Tareas completadas")
            }
            Spacer()
        }.padding(24)
    }

    private var settingsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Privacidad y datos").font(.largeTitle.bold())
            Label("Sin cuenta ni conexión obligatoria", systemImage: "wifi.slash")
            Label("Tareas y tarjetas guardadas localmente", systemImage: "internaldrive")
            Label("Sin Turnstile ni telemetría de inicio", systemImage: "hand.raised.fill")
            Text("La IA y Google Drive no están conectados en esta compilación nativa; no se enviarán datos. Las claves secretas no se incluyen en la aplicación.")
                .foregroundStyle(.secondary)
            Button("Borrar todos los datos locales", role: .destructive) { taskJSON = "[]"; cardJSON = "[]" }
            Spacer()
        }.padding(24)
    }
}
