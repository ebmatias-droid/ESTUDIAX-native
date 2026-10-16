import Foundation

public struct StudyTask: Identifiable, Codable, Equatable {
    public var id: UUID
    public var title: String
    public var subject: String
    public var dueDate: Date?
    public var isCompleted: Bool
    public var createdAt: Date

    public init(
        id: UUID = UUID(),
        title: String,
        subject: String = "",
        dueDate: Date? = nil,
        isCompleted: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.subject = subject
        self.dueDate = dueDate
        self.isCompleted = isCompleted
        self.createdAt = createdAt
    }
}
