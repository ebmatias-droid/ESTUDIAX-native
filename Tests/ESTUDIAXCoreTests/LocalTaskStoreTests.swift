import XCTest
@testable import ESTUDIAXCore

final class LocalTaskStoreTests: XCTestCase {
    func testSavePersistsAcrossStoreInstances() async throws {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("ESTUDIAXTests-\(UUID().uuidString)", isDirectory: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        let fileURL = directory.appendingPathComponent("tasks.json")
        let dueDate = Date(timeIntervalSince1970: 1_700_000_000)
        let task = StudyTask(title: "Repasar física", subject: "Ciencias", dueDate: dueDate)

        let store = LocalTaskStore(fileURL: fileURL)
        try await store.save(task)

        let reloadedStore = LocalTaskStore(fileURL: fileURL)
        let savedTasks = await reloadedStore.allTasks()
        XCTAssertEqual(savedTasks.count, 1)
        XCTAssertEqual(savedTasks.first?.id, task.id)
        XCTAssertEqual(savedTasks.first?.title, task.title)
        XCTAssertEqual(savedTasks.first?.subject, task.subject)
        XCTAssertEqual(savedTasks.first?.dueDate, dueDate)
    }

    func testSavingSameIDUpdatesInsteadOfDuplicating() async throws {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("ESTUDIAXTests-\(UUID().uuidString)", isDirectory: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        let store = LocalTaskStore(fileURL: directory.appendingPathComponent("tasks.json"))
        let id = UUID()
        try await store.save(StudyTask(id: id, title: "Borrador"))
        try await store.save(StudyTask(id: id, title: "Entrega final", isCompleted: true))

        let tasks = await store.allTasks()
        XCTAssertEqual(tasks.count, 1)
        XCTAssertEqual(tasks.first?.title, "Entrega final")
        XCTAssertEqual(tasks.first?.isCompleted, true)
    }

    func testDeletePersistsAcrossStoreInstances() async throws {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("ESTUDIAXTests-\(UUID().uuidString)", isDirectory: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        let fileURL = directory.appendingPathComponent("tasks.json")
        let store = LocalTaskStore(fileURL: fileURL)
        let task = StudyTask(title: "Eliminar")
        try await store.save(task)
        try await store.delete(id: task.id)

        let reloadedStore = LocalTaskStore(fileURL: fileURL)
        XCTAssertTrue(await reloadedStore.allTasks().isEmpty)
    }
}
