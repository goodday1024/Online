# Online · 地球 Online

> 把生活过成一款游戏:拍照 → 端侧大模型写日记 → 点亮成就勋章 → 把每一天存档。

**Online** 是一款「记忆存档」App。所有 AI 推理均在**端侧**完成,照片与对话从不上传云端。

## 功能

- **拍照即日记** — 上传照片,端侧视觉模型理解画面色调与场景,自动识别成就类别(运动/美食/自然…共 12 类)并生成一篇日记
- **108 枚金属成就勋章** — 12 类别 × 9 阶(青铜→白银→黄金→玫瑰金→曜石),金属光泽、轻点 3D 翻面,背面刻着最近获得日期
- **碎碎念模式** — 照片化为数万个粒子,指尖划过处粒子如布料般凹陷;与端侧 AI 实时语音对话,聊完织成一篇意识流「碎碎念」
- **记忆日历** — 每天的照片堆叠归档;轻点堆叠放大展开,像 iMessage 一样滑动切换,再点进入日记与碎碎念
- **留声机** — 给照片配一段声音,播放时黑胶转动、唱针落下
- **实况照片** — 支持 Live Photo,长按让那一刻重新流动
- **玩家档案** — 等级头衔、生活构成分析、时光机随机回顾、JSON 导出存档

## 仓库结构

```
web/                Web 版(React + TypeScript + Vite + Tailwind,完整可交互原型)
ios/                iOS 工程(SwiftUI 骨架,XcodeGen 生成)
ios/build-ipa.yml   未签名 IPA 构建工作流(启用方式见下)
```

## 构建未签名 IPA

工作流文件已就绪,位于 `ios/build-ipa.yml`。**启用只需一步**:在 GitHub 网页上编辑该文件,把路径重命名为 `.github/workflows/build-ipa.yml` 并提交(仓库令牌无 workflow 写入权限,需在网页端操作一次)。

启用后,push 涉及 `ios/**` 的改动或在 Actions 页手动触发 **Build Unsigned IPA**:

1. `macos-15` runner + XcodeGen 生成工程
2. `xcodebuild` 以 `CODE_SIGNING_ALLOWED=NO` 编译 Release
3. 打包为 `Online-unsigned.ipa` 并上传为 Artifact

未签名 IPA 可通过 AltStore / SideStore / TrollStore 自签安装。

## 端侧 AI 接入说明

`ios/Online/OnDeviceLLM.swift` 预留三套接入路径:Foundation Models(iOS 26+)、MLX Swift(Qwen/Gemma 量化模型)、Speech framework(实时语音对话)。Web 版内置同算法轻量模拟,开箱即可体验完整流程。

## 隐私

所有照片、语音、文字仅保存在设备本地。你的记忆,只属于你。
