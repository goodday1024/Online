import SwiftUI
import AVFoundation

/// 留声机:给照片录一段声音;播放时黑胶旋转、唱针落下
struct PhonographView: View {
    let entry: MemoryEntry
    @State private var recorder: AVAudioRecorder?
    @State private var player: AVAudioPlayer?
    @State private var recording = false
    @State private var playing = false

    var body: some View {
        HStack(spacing: 16) {
            ZStack(alignment: .topTrailing) {
                Circle()
                    .fill(RadialGradient(colors: [Color(hex: 0x2B251D), Color(hex: 0x1C1813)],
                                         center: .center, startRadius: 4, endRadius: 36))
                    .frame(width: 72, height: 72)
                    .overlay(Circle().stroke(.black.opacity(0.4), lineWidth: 1))
                    .rotationEffect(.degrees(playing ? 360 : 0))
                    .animation(playing ? .linear(duration: 2.4).repeatForever(autoreverses: false) : .default,
                               value: playing)
                Rectangle()
                    .fill(Color(hex: 0x4F483E))
                    .frame(width: 3, height: 40)
                    .rotationEffect(.degrees(playing ? -12 : -38), anchor: .top)
                    .animation(.spring(response: 0.6), value: playing)
                    .offset(x: 2, y: -4)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("留声机").font(.caption).tracking(2).foregroundStyle(.secondary)
                Button(recording ? "停止并保存" : "录一段声音") {
                    recording ? stopRecording() : startRecording()
                }
                .font(.subheadline.weight(.medium))
                .buttonStyle(.borderedProminent)
                .tint(recording ? Color(hex: 0xF54001) : Color(hex: 0x4F483E))

                if entry.voiceURL != nil {
                    Button(playing ? "暂停" : "播放") { togglePlay() }
                        .font(.caption)
                }
            }
            Spacer()
        }
        .padding()
        .background(Color(hex: 0xF4F0EA))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func startRecording() {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("\(entry.id).m4a")
        let settings: [String: Any] = [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 44100]
        recorder = try? AVAudioRecorder(url: url, settings: settings)
        recorder?.record()
        recording = true
    }

    private func stopRecording() {
        recorder?.stop()
        recording = false
        // TODO: 将录音 URL 持久化到 entry.voiceURL(需写回 store)
    }

    private func togglePlay() {
        if playing { player?.pause(); playing = false; return }
        guard let url = entry.voiceURL, let p = try? AVAudioPlayer(contentsOf: url) else { return }
        player = p
        p.play()
        playing = true
    }
}
