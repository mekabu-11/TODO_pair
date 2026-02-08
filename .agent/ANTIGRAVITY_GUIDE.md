# Antigravity使用ガイド

このドキュメントでは、Antigravityの機能とCursorとの違いについて説明します。

## 主要機能の比較

| 機能 | Cursor | Antigravity |
|------|--------|-------------|
| **Rules** | `.cursorrules` | `user_rules`（グローバル設定）または `.agent/rules.md`（参考用） |
| **Commands** | Cursor Commands | `.agent/workflows/*.md` |
| **MCP Servers** | 設定ファイル | 設定ファイル（グローバル） |
| **コンテキスト** | `@`メンション | `@`メンション、自動検索 |

## 1. Rules（ルール）の設定

### Cursorの場合
```
.cursorrules
```
プロジェクトルートに配置

### Antigravityの場合

#### オプション1: グローバルルール（推奨）
Antigravity設定で「User Rules」を設定すると、すべての会話で適用されます。

#### オプション2: プロジェクトルール（参考用）
`.agent/rules.md`を作成すると、AIが参照できる参考情報として機能します。
（ただし、自動適用はされないため、会話の中で明示的に参照する必要があります）

## 2. Workflows（ワークフロー）

`.agent/workflows/`ディレクトリにMarkdownファイルを作成：

```markdown
---
description: ワークフローの簡単な説明
---

# ワークフロー名

手順の説明

## 手順

// turbo
1. 自動実行してほしいステップ
```bash
command to run
```

2. 通常のステップ
```bash
another command
```
```

### 使い方
- ワークフローは自動的に検出されます
- 関連するタスクを依頼すると、AIが適切なワークフローを参照します
- `// turbo`アノテーションで自動実行を指定できます

## 3. MCPサーバー

詳細は[MCP_SETUP.md](./MCP_SETUP.md)を参照してください。

MCPサーバーは**グローバル設定**で管理され、すべてのAntigravity会話で利用可能です。

## 4. コンテキストの指定

### ファイルの参照
```
このファイルを確認してください:
/Users/zunya/Documents/GitHub/TODO_pair/frontend/src/App.jsx
```

### 特定の会話の参照
会話IDをメンション（Antigravityが提供する会話サマリーから）

### Knowledge Items (KI)
以前の会話から作成された知識アイテムを自動的に検索・活用

## 5. アーティファクトとタスク管理

Antigravityは、複雑なタスクを管理するための特別なアーティファクトを作成します：

- **task.md**: タスクのチェックリスト
- **implementation_plan.md**: 実装計画
- **walkthrough.md**: 完了した作業のまとめ

これらは`.gemini/antigravity/brain/[conversation-id]/`に保存されます。

## 6. よくある使い方

### 開発サーバーの起動
```
開発サーバーを起動して
```
→ `.agent/workflows/dev-start.md`を参照

### コーディング規約の確認
```
このプロジェクトのコーディング規約に従って、新しいコンポーネントを作成して
```
→ `.agent/rules.md`を参照

### データベース操作（MCP使用）
```
データベースから最近のTODOを取得して
```
→ MCPサーバー経由でSupabaseにアクセス

## 7. ベストプラクティス

### ✅ DO
- 明確で具体的な指示を出す
- プロジェクト固有のルールを`.agent/rules.md`に記載
- 繰り返し使うコマンドはワークフローに定義
- MCPサーバーでデータソースに直接アクセス

### ❌ DON'T
- 曖昧な指示（「なんとかして」など）
- センシティブ情報をルールファイルに直接記載
- 複雑すぎるワークフロー（シンプルに保つ）

## 8. トラブルシューティング

### ワークフローが認識されない
- `.agent/workflows/`ディレクトリが正しいか確認
- Markdownのフロントマター（YAML）が正しいか確認
- ファイル名が`.md`で終わっているか確認

### ルールが適用されない
- Antigravityの「User Rules」設定を確認
- `.agent/rules.md`は参考情報なので、明示的に参照する必要があります

### MCPサーバーが動作しない
- [MCP_SETUP.md](./MCP_SETUP.md)のトラブルシューティングセクションを参照
- Antigravity設定でサーバーが有効になっているか確認

## 参考リンク

- [Antigravity公式ドキュメント](https://deepmind.google/technologies/gemini/)
- [MCP公式サイト](https://modelcontextprotocol.io/)
