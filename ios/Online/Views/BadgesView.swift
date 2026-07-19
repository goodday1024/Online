import SwiftUI

/// 成就墙:12 类 × 9 阶 = 108 枚金属勋章
/// 轻点翻面(3D 旋转),背面刻最近获得日期;未解锁覆磨砂
struct BadgesView: View {
    @EnvironmentObject private var store: MemoryStore

    private let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 22) {
                    ForEach(Category.allCases, id: \.self) { cat in
                        ForEach(1...9, id: \.self) { tier in
                            let badge = Badge(category: cat, tier: tier)
                            BadgeCoinView(
                                badge: badge,
                                earned: store.earned[badge.id]
                            )
                        }
                    }
                }
                .padding()
            }
            .background(Color(hex: 0xECE4D9))
            .navigationTitle("成就勋章")
        }
    }
}

struct BadgeCoinView: View {
    let badge: Badge
    let earned: (count: Int, latest: String)?

    @State private var flipped = false

    private var metalGradient: AngularGradient {
        let colors: [Color]
        switch badge.metal {
        case "gold": colors = [Color(hex: 0xA67C1A), Color(hex: 0xF6D860), Color(hex: 0x8A6410), Color(hex: 0xFFE98A), Color(hex: 0xA67C1A)]
        case "silver": colors = [Color(hex: 0x8E939B), Color(hex: 0xF4F6F8), Color(hex: 0x6F747C), Color(hex: 0xE8EBEF), Color(hex: 0x8E939B)]
        case "rose": colors = [Color(hex: 0xB76E63), Color(hex: 0xF2B8A9), Color(hex: 0x96544A), Color(hex: 0xFFD0C2), Color(hex: 0xB76E63)]
        case "obsidian": colors = [Color(hex: 0x23202E), Color(hex: 0x5C5570), Color(hex: 0x171420), Color(hex: 0x7D7494), Color(hex: 0x23202E)]
        default: colors = [Color(hex: 0x8C5A2B), Color(hex: 0xD9A05B), Color(hex: 0x6E441F), Color(hex: 0xE8B878), Color(hex: 0x8C5A2B)]
        }
        return AngularGradient(colors: colors, center: .center, startAngle: .degrees(210), endAngle: .degrees(570))
    }

    var body: some View {
        ZStack {
            // 正面
            Circle()
                .fill(metalGradient)
                .overlay(Circle().inset(by: 8).fill(.white.opacity(0.35)))
                .overlay(Image(systemName: iconName).font(.title2).foregroundStyle(.black.opacity(0.55)))
                .opacity(flipped ? 0 : 1)
            // 背面:最近获得日期
            Circle()
                .fill(metalGradient)
                .overlay(
                    VStack(spacing: 2) {
                        Text(earned == nil ? "尚未解锁" : "最近获得")
                            .font(.system(size: 8))
                        if let earned {
                            Text(earned.latest.replacingOccurrences(of: "-", with: "."))
                                .font(.system(size: 11, weight: .bold).monospacedDigit())
                            Text("×\(earned.count)").font(.system(size: 8))
                        }
                    }
                    .foregroundStyle(.black.opacity(0.6))
                    .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
                )
                .opacity(flipped ? 1 : 0)
        }
        .frame(width: 92, height: 92)
        .shadow(color: .black.opacity(0.25), radius: 6, y: 4)
        .saturation(earned == nil ? 0.15 : 1)
        .opacity(earned == nil ? 0.55 : 1)
        .rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (x: 0, y: 1, z: 0), perspective: 0.5)
        .onTapGesture {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.7)) {
                flipped.toggle()
            }
        }
        .accessibilityLabel("\(badge.category.displayName)勋章,第\(badge.tier)阶")
    }

    private var iconName: String {
        switch badge.category {
        case .sport: return "figure.run"
        case .outdoor: return "mountain.2"
        case .food: return "fork.knife"
        case .reading: return "book"
        case .create: return "paintbrush"
        case .social: return "person.2"
        case .travel: return "airplane"
        case .nature: return "leaf"
        case .focus: return "scope"
        case .life: return "house"
        case .kindness: return "heart"
        case .milestone: return "flag"
        }
    }
}
