import SwiftUI
import PhotosUI

/// 今天:拍照/选图 → 端侧 AI 分析 → 生成日记 + 点亮成就
struct TodayView: View {
    @EnvironmentObject private var store: MemoryStore
    @State private var pickedItem: PhotosPickerItem?
    @State private var analyzing = false
    @State private var latestDiary: MemoryEntry?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    PhotosPicker(selection: $pickedItem, matching: .any(of: [.images, .videos])) {
                        HStack {
                            Image(systemName: "camera.fill")
                            Text(analyzing ? "端侧 AI 理解中…" : "拍一张照片,存档此刻")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(hex: 0xF54001))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    .disabled(analyzing)

                    if let diary = latestDiary {
                        DiaryCard(entry: diary)
                    }

                    Text("时光流")
                        .font(.title3.bold())
                    ForEach(store.entries) { entry in
                        DiaryCard(entry: entry)
                    }
                }
                .padding()
            }
            .background(Color(hex: 0xECE4D9))
            .navigationTitle("地球·Online")
        }
        .onChange(of: pickedItem) { _, item in
            Task { await handlePicked(item) }
        }
    }

    private func handlePicked(_ item: PhotosPickerItem?) async {
        guard let item else { return }
        analyzing = true
        defer { analyzing = false }
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else { return }
        // 端侧推理:不经过任何服务器
        if let result = try? await OnDeviceLLM.shared.analyze(image: image) {
            let diary = await OnDeviceLLM.shared.generateDiary(for: result)
            let entry = MemoryEntry(
                day: String(ISO8601DateFormatter().string(from: Date()).prefix(10)),
                photoData: data,
                category: result.category,
                diaryTitle: diary.title,
                diary: diary.text
            )
            store.add(entry)
            latestDiary = entry
        }
    }
}

struct DiaryCard: View {
    let entry: MemoryEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let img = UIImage(data: entry.photoData) {
                Image(uiImage: img)
                    .resizable()
                    .scaledToFit()
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            Text(entry.category.displayName)
                .font(.caption)
                .padding(.horizontal, 10).padding(.vertical, 4)
                .background(Color(hex: 0xF54001).opacity(0.12))
                .clipShape(Capsule())
            if let title = entry.diaryTitle {
                Text(title).font(.headline)
            }
            if let diary = entry.diary {
                Text(diary).font(.body).foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color(hex: 0xFFFBF5))
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
}
