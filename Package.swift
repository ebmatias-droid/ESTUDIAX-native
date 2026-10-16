// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ESTUDIAX",
    platforms: [.macOS(.v13)],
    products: [
        .executable(name: "ESTUDIAX", targets: ["ESTUDIAX"]),
        .library(name: "ESTUDIAXCore", targets: ["ESTUDIAXCore"])
    ],
    targets: [
        .target(name: "ESTUDIAXCore"),
        .executableTarget(name: "ESTUDIAX", dependencies: ["ESTUDIAXCore"]),
        .testTarget(name: "ESTUDIAXCoreTests", dependencies: ["ESTUDIAXCore"])
    ]
)
