import SwiftUI

/// 玩家档案:等级、统计、生活构成、随机回顾、导出存档
struct ProfileView: View {
    @EnvironmentObject private var store: MemoryStore

    private static let titles = ["初来乍到的旅人", "生活的记录者", "时光的收藏家", "世界观察员", "地球资深玩家", "行走的传奇"]

    private var level: Int { min(Self.titles.count, store.entries.count / 4 + 1) }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 14) {
                        Text("玩")
                            .font(.title.bold())
                            .frame(width: 56, height: 56)
                            .background(Color(hex: 0xF54001))
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        VStack(alignment: .leading) {
                            Text("Lv.\(level) \(Self.titles[level - 1])").font(.headline)
                            Text("地球 Online · 不删档测试中").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
                Section("统计") {
                    LabeledContent("记忆存档", value: "\(store.entries.count)")
                    LabeledContent("在线天数", value: "\(Set(store.entries.map(\.day)).count)")
                    LabeledContent("点亮勋章", value: "\(store.earned.count)/108")
                }
                Section("数据") {
                    Button("随机回顾一天") {}
                    Button("导出记忆存档(JSON)") {}
                    Label("所有识别与生成均在端侧完成", systemImage: "lock.shield")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("玩家档案")
        }
    }
}
