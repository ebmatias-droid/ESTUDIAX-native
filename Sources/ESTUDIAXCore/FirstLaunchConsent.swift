import Foundation

/// Local-only first-launch consent state. No network request is made.
public struct FirstLaunchConsent {
    private let defaults: UserDefaults
    private let versionKey = "estudiax.acceptedTermsVersion"

    public init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    public func hasAccepted(version: String) -> Bool {
        defaults.string(forKey: versionKey) == version
    }

    public func accept(version: String) {
        defaults.set(version, forKey: versionKey)
    }
}
