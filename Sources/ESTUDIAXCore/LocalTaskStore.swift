import Foundation

/// File-backed storage. It does not contact a server or require an account.
public actor LocalTaskStore {
    private let fileURL: URL
    private var tasks: [StudyTask] = []

    public init(fileURL: URL? = nil) {
        if let fileURL {
            self.fileURL = fileURL
        } else {
            let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
            let directory = support.appendingPathComponent("ESTUDIAX", isDirectory: true)
            try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            self.fileURL = directory.appendingPathComponent("tasks.json")
        }
        self.tasks = Self.read(from: self.fileURL)
    }

    public func allTasks() -> [StudyTask] {
        tasks.sorted { $0.createdAt > $1.createdAt }
    }

    public func save(_ task: StudyTask) throws {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
        } else {
            tasks.append(task)
        }
        try persist()
    }

    public func delete(id: UUID) throws {
        tasks.removeAll { $0.id == id }
        try persist()
    }

    private func persist() throws {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let data = try encoder.encode(tasks)
        try FileManager.default.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try data.write(to: fileURL, options: [.atomic, .completeFileProtectionUnlessOpen])
    }

    private static func read(from url: URL) -> [StudyTask] {
        guard let data = try? Data(contentsOf: url) else { return [] }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return (try? decoder.decode([StudyTask].self, from: data)) ?? []
    }
}
