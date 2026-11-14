# AGENTS.md

本项目已迁移为 DeepSeek Harness 原生驱动的周度追踪器（原 pi 驱动已移除）。

- 运行：对 DSH 说「跑周报」或加载 `tracker-weekly` 技能；三条采集线 `harness-digest` / `line-trending` / `tracker-merge` 由插件 `dsh-plugin/` 注册为 runtime 技能。
- 脚本：调用脚本一律用插件注入的 `$DSH_TRACKER_SCRIPTS/<脚本>` 绝对路径；项目根为 shell 工作目录。
- 详见 [README.md](README.md) 与 [docs/weekly-tracker-design.md](docs/weekly-tracker-design.md)。
