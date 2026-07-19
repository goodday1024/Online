import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            TodayView()
                .tabItem { Label("今天", systemImage: "sun.max") }
            CalendarArchiveView()
                .tabItem { Label("日历", systemImage: "calendar") }
            BadgesView()
                .tabItem { Label("成就", systemImage: "medal") }
            ProfileView()
                .tabItem { Label("我的", systemImage: "person") }
        }
        .tint(Color(hex: 0xF54001))
        .background(Color(hex: 0xECE4D9).ignoresSafeArea())
    }
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}

#Preview {
    ContentView()
        .environmentObject(MemoryStore())
}
