# 💍 ふたりのTODO (TODO_pair)

結婚後の共同生活で発生するタスクを**パートナー2人で共有・管理**できるTODOアプリ

## ✨ 機能

- 📝 **タスク管理** - 作成・編集・削除・完了チェック
- 👥 **担当者設定** - パートナーのどちらが担当か設定
- 📂 **カテゴリ分類** - お金、手続き、イベント、健康など
- 💬 **コメント機能** - タスクへのメモ・相談
- 🔐 **認証** - ログイン・パートナー招待コードでペアリング

## 🛠️ 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18, Vite 5, React Router 6 |
| バックエンド | Supabase (Database, Auth, Storage) |
| データベース | PostgreSQL (Supabase) |
| インフラ | Docker, Docker Compose (Frontend only) |

## 🚀 開発環境セットアップ

### 前提条件
- Docker & Docker Compose
- Node.js (ローカル実行の場合)

### 起動手順

```bash
# 1. 環境変数を設定
cp .env.example .env
# .envを編集してSupabaseのURLとKeyを設定

# 2. Docker起動
docker compose up -d

# 3. アクセス
# Frontend: http://localhost:5174
```

## 📁 ディレクトリ構成

```
TODO_pair/
├── frontend/          # React (Vite)
├── docker-compose.yml # 開発環境
└── docker-compose.prod.yml # 本番環境
```

## 🎨 デザイン

- **User 1**: 青 (#3B82F6)
- **User 2**: 緑 (#10B981)

## 🤖 AI開発サポート（Antigravity）

このプロジェクトは、Antigravityによる開発を効率化するための設定を含んでいます：

### Workflows (`.agent/workflows/`)
よく使うコマンドをワークフローとして定義：
- `dev-start.md` - 開発サーバー起動
- `docker-compose.md` - Docker環境管理
- `build.md` - プロジェクトビルド
- `test.md` - テスト実行

### Rules (`.agent/rules.md`)
プロジェクトのコーディング規約とベストプラクティス

### ガイド
- `.agent/ANTIGRAVITY_GUIDE.md` - Antigravityの使い方
- `.agent/MCP_SETUP.md` - MCPサーバー設定方法

詳細は各ドキュメントを参照してください。

## 📄 ライセンス

MIT