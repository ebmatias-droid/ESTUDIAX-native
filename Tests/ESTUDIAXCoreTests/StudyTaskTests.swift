import XCTest
@testable import ESTUDIAXCore

final class StudyTaskTests: XCTestCase {
    func testTaskRoundTrip() throws {
        let task = StudyTask(title: "Repasar física", subject: "Ciencias")
        let data = try JSONEncoder().encode(task)
        let decoded = try JSONDecoder().decode(StudyTask.self, from: data)
        XCTAssertEqual(decoded.title, task.title)
        XCTAssertEqual(decoded.subject, task.subject)
        XCTAssertEqual(decoded.isCompleted, false)
    }
}
