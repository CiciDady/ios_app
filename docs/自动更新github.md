# 自动更新到 GitHub（每天 12:30 / 21:30）

> 目标：每天中午 **12:30** 和晚上 **21:30** 自动把本地改动提交并推送到 GitHub，方便记录与回退。
> 提供的脚本：[`scripts/auto_commit_push.sh`](../scripts/auto_commit_push.sh)

## 脚本做了什么

`scripts/auto_commit_push.sh` 会：
1. 切到仓库根目录；
2. 若无改动 → 直接退出（不产生空提交）；
3. 有改动 → `git add -A` + `git commit`（提交信息带时间戳）+ `git push` 到**当前分支**（失败自动重试）。

手动测试一下：

```bash
bash scripts/auto_commit_push.sh
```

## 一、在你的 Mac 上定时（推荐用 launchd）

macOS 推荐用 `launchd`（比 cron 更可靠）。

1. 新建文件 `~/Library/LaunchAgents/com.ciciapp.autopush.plist`，内容如下
   （把 `/Users/你的用户名/path/to/ios_app` 换成你本地仓库的实际绝对路径）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ciciapp.autopush</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/你的用户名/path/to/ios_app/scripts/auto_commit_push.sh</string>
    </array>

    <key>WorkingDirectory</key>
    <string>/Users/你的用户名/path/to/ios_app</string>

    <!-- 每天 12:30 和 21:30 各跑一次 -->
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key><integer>12</integer>
            <key>Minute</key><integer>30</integer>
        </dict>
        <dict>
            <key>Hour</key><integer>21</integer>
            <key>Minute</key><integer>30</integer>
        </dict>
    </array>

    <key>StandardOutPath</key>
    <string>/tmp/ciciapp-autopush.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/ciciapp-autopush.err</string>
</dict>
</plist>
```

2. 加载它：

```bash
launchctl load ~/Library/LaunchAgents/com.ciciapp.autopush.plist
```

> 修改后要先 `launchctl unload ...` 再 `launchctl load ...`。日志在 `/tmp/ciciapp-autopush.log`。

## 二、在 Linux 上定时（用 cron）

```bash
crontab -e
```
加入两行（把路径换成你的仓库路径）：

```cron
30 12 * * * cd /path/to/ios_app && bash scripts/auto_commit_push.sh >> /tmp/autopush.log 2>&1
30 21 * * * cd /path/to/ios_app && bash scripts/auto_commit_push.sh >> /tmp/autopush.log 2>&1
```

## 三、重要说明（务必了解）

- **定时任务只在「有本地改动的那台机器上」有意义。** 一般就是你写代码的 **Mac**——脚本会把你当天的改动定时推上去。
- **Cloud Agent（云端）这边不需要这个定时器**：我（AI agent）**每完成一步就会立即 commit + push**，所以云端产生的改动是实时更新到 GitHub 的，不用等 12:30/21:30。
- 定时任务需要电脑处于开机联网状态；Mac 睡眠时 `launchd` 会在唤醒后补跑错过的任务。
- 首次要保证该机器的 git 已能免密推送到 GitHub（配置好 SSH key 或凭证）。
- 若希望「无人值守的云端」也定时跑，可用 **Cursor 的 Scheduled Agent（定时代理）** 或 **GitHub Actions**，而不是本机 cron。
