import Foundation
import UIKit
import Vision

/// 端侧大模型服务:所有推理均在设备上完成,数据不出手机。
///
/// 生产实现推荐:
/// - iOS 26+ 使用 Foundation Models framework(`SystemLanguageModel`),
///   内置 ~3B 端侧模型,支持 guided generation 直接产出结构化日记 JSON;
/// - 或接入 MLX Swift(mlx-swift-examples)运行 Qwen / Gemma 量化模型;
/// - 语音对话使用 Speech framework(SFSpeechRecognizer)+ 端侧 TTS。
///
/// 当前骨架:用 Vision 提取图片主色调做类别识别 + 模板化生成,
/// 保证无模型依赖也能完整跑通流程。
actor OnDeviceLLM {
    static let shared = OnDeviceLLM()

    struct VisionResult {
        let category: Category
        let hue: Double
        let confidence: Double
        let sceneWords: [String]
    }

    /// 端侧「视觉理解」:主色调 + 饱和度 → 成就类别
    func analyze(image: UIImage) async throws -> VisionResult {
        guard let cg = image.cgImage else { throw NSError(domain: "LLM", code: -1) }
        let (h, s, l) = try dominantHSL(cgImage: cg)
        let category: Category
        switch (h, s, l) {
        case let (h, s, _) where s < 0.12: category = h > 0 ? .focus : .life
        case (0..<18, _, _), (340...360, _, _): category = [.food, .social, .milestone].randomElement()!
        case (18..<75, _, _): category = [.food, .nature, .sport].randomElement()!
        case (75..<165, _, _): category = [.nature, .outdoor, .sport].randomElement()!
        case (165..<255, _, _): category = [.travel, .outdoor, .reading].randomElement()!
        case (255..<290, _, _): category = [.create, .focus].randomElement()!
        default: category = [.social, .create, .kindness].randomElement()!
        }
        return VisionResult(category: category, hue: h,
                            confidence: min(0.97, 0.72 + s * 0.25),
                            sceneWords: [])
    }

    /// 生成日记(接入 Foundation Models / MLX 时替换此方法体)
    func generateDiary(for result: VisionResult) async -> (title: String, text: String) {
        ("今日手记", "今天是属于「\(result.category.displayName)」的一天。端侧模型已就位,接入 Foundation Models 后,这里将是由照片真正生长出来的文字。")
    }

    /// 实时语音对话一轮(接入 Speech + LLM 流式输出时替换此方法体)
    func chat(userUtterance: String, turn: Int) async -> String {
        "我听到了:「\(userUtterance)」。再多讲一点那个瞬间吧。"
    }

    /// 把对话织成一篇碎碎念
    func weaveSuishuinian(utterances: [String]) async -> String {
        "说起来有点零碎——" + utterances.joined(separator: "。还有,") + "。说完就舒服了,晚安。"
    }

    private func dominantHSL(cgImage: CGImage) throws -> (h: Double, s: Double, l: Double) {
        let size = 48
        var pixels = [UInt8](repeating: 0, count: size * size * 4)
        let ctx = CGContext(data: &pixels, width: size, height: size,
                            bitsPerComponent: 8, bytesPerRow: size * 4,
                            space: CGColorSpaceCreateDeviceRGB(),
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.draw(cgImage, in: CGRect(x: 0, y: 0, width: size, height: size))
        var r = 0.0, g = 0.0, b = 0.0
        for i in stride(from: 0, to: pixels.count, by: 4) {
            r += Double(pixels[i]); g += Double(pixels[i + 1]); b += Double(pixels[i + 2])
        }
        let n = Double(size * size) * 255
        r /= n; g /= n; b /= n
        let maxC = max(r, g, b), minC = min(r, g, b)
        let l = (maxC + minC) / 2
        let s = maxC == minC ? 0 : (maxC - minC) / (1 - abs(2 * l - 1))
        var h = 0.0
        if maxC != minC {
            if maxC == r { h = 60 * ((g - b) / (maxC - minC)).truncatingRemainder(dividingBy: 6) }
            else if maxC == g { h = 60 * ((b - r) / (maxC - minC) + 2) }
            else { h = 60 * ((r - g) / (maxC - minC) + 4) }
        }
        if h < 0 { h += 360 }
        return (h, s, l)
    }
}
