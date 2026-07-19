import SwiftUI

/// 记忆日历:每天的照片堆叠在一起,轻点展开,左右滑动切换(类 iMessage)
struct CalendarArchiveView: View {
    @EnvironmentObject private var store: MemoryStore
    @State private var displayedMonth = Date()
    @State private var selectedDay: String?

    private var byDay: [String: [MemoryEntry]] {
        Dictionary(grouping: store.entries, by: \.day)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                let days = monthDays(for: displayedMonth)
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 10) {
                    ForEach(days, id: \.self) { day in
                        if let entries = byDay[day], !entries.isEmpty {
                            PhotoStackThumbnail(entries: entries)
                                .onTapGesture { selectedDay = day }
                        } else {
                            Text(day.suffix(2))
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                    }
                }
                .padding()
            }
            .background(Color(hex: 0xECE4D9))
            .navigationTitle("记忆日历")
            .sheet(item: Binding(
                get: { selectedDay.map(DayWrapper.init) },
                set: { selectedDay = $0?.day }
            )) { wrapper in
                DayDetailSheet(day: wrapper.day, entries: byDay[wrapper.day] ?? [])
            }
        }
    }

    private func monthDays(for date: Date) -> [String] {
        var cal = Calendar(identifier: .gregorian)
        cal.firstWeekday = 1
        let range = cal.range(of: .day, in: .month, for: date) ?? 1..<2
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM"
        let prefix = fmt.string(from: date)
        return range.map { String(format: "%@-%02d", prefix, $0) }
    }
}

private struct DayWrapper: Identifiable {
    let day: String
    var id: String { day }
}

struct PhotoStackThumbnail: View {
    let entries: [MemoryEntry]

    var body: some View {
        ZStack {
            ForEach(Array(entries.prefix(3).enumerated()), id: \.element.id) { i, entry in
                if let img = UIImage(data: entry.photoData) {
                    Image(uiImage: img)
                        .resizable().scaledToFill()
                        .frame(width: 40, height: 40)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(.white, lineWidth: 2))
                        .rotationEffect(.degrees(Double(i - 1) * 9))
                        .offset(y: CGFloat(-i * 2))
                        .zIndex(Double(i))
                }
            }
            if entries.count > 1 {
                Text("\(entries.count)")
                    .font(.system(size: 9, weight: .bold))
                    .padding(4)
                    .background(Color(hex: 0xF54001))
                    .foregroundStyle(.white)
                    .clipShape(Circle())
                    .offset(x: 18, y: -18)
                    .zIndex(10)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 48)
    }
}

/// 日详情:堆叠放大展开 → 滑动切换 → 再点显示日记与碎碎念
struct DayDetailSheet: View {
    let day: String
    let entries: [MemoryEntry]
    @State private var index = 0
    @State private var showDiary = false

    var body: some View {
        NavigationStack {
            VStack {
                TabView(selection: $index) {
                    ForEach(Array(entries.enumerated()), id: \.element.id) { i, entry in
                        Group {
                            if let img = UIImage(data: entry.photoData) {
                                Image(uiImage: img)
                                    .resizable().scaledToFit()
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                                    .onTapGesture { showDiary = true }
                            }
                        }
                        .tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .automatic))
                .animation(.spring(response: 0.45), value: index)

                if showDiary, entries.indices.contains(index) {
                    ScrollView {
                        DiaryCard(entry: entries[index])
                    }
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding()
            .background(Color(hex: 0xECE4D9))
            .navigationTitle(day)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
