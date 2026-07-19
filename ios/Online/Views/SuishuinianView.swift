import SwiftUI

/// 碎碎念模式:照片粒子化(Metal/Canvas),触摸处粒子凹陷,
/// 与端侧 AI 实时语音对话,聊完织成一篇碎碎念。
///
/// 骨架说明:粒子系统建议用 Metal Performance Shaders 或 SpriteKit
/// 实现 5 万级粒子;触摸凹陷使用高斯衰减力场(与 Web 版同一算法)。
struct SuishuinianView: View {
    let entry: MemoryEntry
    @State private var chat: [(role: String, text: String)] = []
    @State private var result: String?
    @State private var recording = false

    var body: some View {
        VStack(spacing: 16) {
            // TODO: 粒子化照片视图(Metal)——触摸处高斯凹陷
            if let img = UIImage(data: entry.photoData) {
                Image(uiImage: img)
                    .resizable().scaledToFit()
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(
                        Text("粒子视图占位:接入 Metal 粒子场")
                            .font(.caption2).foregroundStyle(.white)
                            .padding(6).background(.black.opacity(0.5))
                            .clipShape(Capsule()).padding(8),
                        alignment: .bottom
                    )
            }

            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(Array(chat.enumerated()), id: \.offset) { _, msg in
                        Text(msg.text)
                            .padding(10)
                            .background(msg.role == "me" ? Color(hex: 0xF54001) : Color(hex: 0x2B251D))
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .frame(maxWidth: .infinity, alignment: msg.role == "me" ? .trailing : .leading)
                    }
                    if let result {
                        Text(result)
                            .padding()
                            .background(Color(hex: 0x241F18))
                            .foregroundStyle(Color(hex: 0xECE4D9))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                }
            }

            HStack {
                Button {
                    recording.toggle()
                    // TODO: SFSpeechRecognizer 实时识别 → OnDeviceLLM.shared.chat
                } label: {
                    Image(systemName: recording ? "stop.circle.fill" : "mic.circle.fill")
                        .font(.largeTitle)
                        .foregroundStyle(recording ? .red : Color(hex: 0xF54001))
                }
                Button("生成碎碎念") {
                    Task {
                        let mine = chat.filter { $0.role == "me" }.map(\.text)
                        result = await OnDeviceLLM.shared.weaveSuishuinian(utterances: mine)
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(Color(hex: 0xC49A3F))
            }
        }
        .padding()
        .background(Color(hex: 0x1C1813).ignoresSafeArea())
    }
}
