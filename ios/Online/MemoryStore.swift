import Foundation
import SwiftUI

/// 成就类别(与 Web 版一致的 12 类 × 9 阶 = 108 枚勋章)
enum Category: String, CaseIterable, Codable {
    case sport, outdoor, food, reading, create, social
    case travel, nature, focus, life, kindness, milestone

    var displayName: String {
        switch self {
        case .sport: return "运动"
        case .outdoor: return "户外"
        case .food: return "美食"
        case .reading: return "阅读"
        case .create: return "创作"
        case .social: return "相聚"
        case .travel: return "远行"
        case .nature: return "自然"
        case .focus: return "专注"
        case .life: return "日常"
        case .kindness: return "善意"
        case .milestone: return "里程碑"
        }
    }
}

struct MemoryEntry: Identifiable, Codable {
    var id = UUID()
    var day: String            // YYYY-MM-DD
    var photoData: Data
    var liveVideoURL: URL?     // 实况照片
    var category: Category
    var diaryTitle: String?
    var diary: String?
    var suishuinian: String?
    var voiceURL: URL?         // 留声机录音
}

struct Badge: Identifiable {
    let category: Category
    let tier: Int              // 1...9
    var id: String { "\(category.rawValue)-\(tier)" }
    var metal: String {
        switch tier {
        case 1...3: return "bronze"
        case 4...5: return "silver"
        case 6...7: return "gold"
        case 8: return "rose"
        default: return "obsidian"
        }
    }
}

@MainActor
final class MemoryStore: ObservableObject {
    @Published var entries: [MemoryEntry] = []
    /// badgeID -> (获得次数, 最近获得日期)
    @Published var earned: [String: (count: Int, latest: String)] = [:]

    static let tierThresholds = [1, 3, 5, 7, 9, 12, 15, 18, 21]

    func add(_ entry: MemoryEntry) {
        entries.insert(entry, at: 0)
        refreshBadges(for: entry.category)
    }

    private func refreshBadges(for category: Category) {
        let count = entries.filter { $0.category == category }.count
        guard let tier = (1...9).reversed().first(where: { count >= Self.tierThresholds[$0 - 1] }) else { return }
        let id = "\(category.rawValue)-\(tier)"
        let today = ISO8601DateFormatter().string(from: Date()).prefix(10)
        earned[id] = (count, String(today))
    }
}
