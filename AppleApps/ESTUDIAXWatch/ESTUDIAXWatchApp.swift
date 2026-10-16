import SwiftUI
import UserNotifications

@main
struct ESTUDIAXWatchApp: App {
    var body: some Scene { WindowGroup { WatchCalendarView() } }
}

private struct WatchCalendarView: View {
    @AppStorage("estudiax.watch.events.v1") private var eventData = "[]"
    @State private var reminderEnabled = false
    @State private var title = ""
    @State private var eventDate = Date()

    private var events: [WatchEvent] {
        (try? JSONDecoder().decode([WatchEvent].self, from: Data(eventData.utf8))) ?? []
    }
    private func save(_ list: [WatchEvent]) {
        if let data = try? JSONEncoder().encode(list) { eventData = String(decoding:data,as:UTF8.self) }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text(Date.now.formatted(date:.complete,time:.omitted)).font(.headline)
                    Text("Calendario ESTUDIAX").font(.caption).foregroundStyle(.secondary)
                }
                Section("Próximos eventos") {
                    ForEach(events.filter{$0.date >= Calendar.current.startOfDay(for:.now)}.sorted{$0.date<$1.date}) { event in
                        VStack(alignment:.leading,spacing:3) {
                            Text(event.title).font(.headline)
                            Text(event.date,style:.date).font(.caption2).foregroundStyle(.secondary)
                        }
                    }
                    if events.isEmpty { Text("Añade eventos desde el reloj o sincroniza desde tu iPhone cuando esa función esté configurada.").font(.caption) }
                }
                Section("Añadir evento") {
                    TextField("Examen o entrega",text:$title)
                    DatePicker("Fecha",selection:$eventDate,displayedComponents:.date)
                    Button("Guardar evento") {
                        guard !title.trimmingCharacters(in:.whitespaces).isEmpty else{return}
                        var list=events;let event=WatchEvent(id:UUID().uuidString,title:title,date:eventDate);list.append(event);save(list);schedule(event);title=""
                    }
                }
                Section("Notificaciones") {
                    Button("Activar recordatorios") { requestNotifications() }
                    Text("Los avisos se programan localmente en el reloj; no necesitan un servidor.").font(.caption2).foregroundStyle(.secondary)
                }
            }.navigationTitle("ESTUDIAX")
        }
    }

    private func requestNotifications() {
        UNUserNotificationCenter.current().requestAuthorization(options:[.alert,.sound]) { granted,_ in
            guard granted else{return}
            DispatchQueue.main.async { reminderEnabled=true; for event in events { schedule(event) } }
        }
    }

    private func schedule(_ event: WatchEvent) {
        guard reminderEnabled else{return}
        let content=UNMutableNotificationContent();content.title="ESTUDIAX";content.body="Próximo evento: \(event.title)";content.sound = .default
        let comps=Calendar.current.dateComponents([.year,.month,.day],from:event.date)
        let trigger=UNCalendarNotificationTrigger(dateMatching:comps,repeats:false)
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier:event.id,content:content,trigger:trigger))
    }
}

private struct WatchEvent: Codable, Identifiable {
    var id:String
    var title:String
    var date:Date
}
