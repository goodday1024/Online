import SwiftUI

@main
struct OnlineApp: App {
    @StateObject private var store = MemoryStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .preferredColorScheme(.light)
        }
    }
}
