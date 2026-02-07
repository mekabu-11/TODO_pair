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
| バックエンド | Ruby on Rails 7, Ruby 3.2 |
| データベース | MySQL 8.0 |
| インフラ | Docker, Docker Compose |

## 🚀 開発環境セットアップ

### 前提条件
- Docker & Docker Compose

### 起動手順

```bash
# 1. 環境変数を設定
cp .env.example .env
# .envを編集してパスワードなどを設定

# 2. Docker起動
docker compose up -d

# 3. DBマイグレーション
docker compose exec backend rails db:create db:migrate

# 4. アクセス
# Frontend: http://localhost:5174
# API: http://localhost:8000/api
```

## 📁 ディレクトリ構成

```
TODO_pair/
├── frontend/          # React (Vite)
├── backend/           # Rails API
├── docker/            # Docker設定
├── docker-compose.yml # 開発環境
└── docker-compose.prod.yml # 本番環境
```

## 🎨 デザイン

- **User 1**: 青 (#3B82F6)
- **User 2**: 緑 (#10B981)

## 📄 ライセンス

MIT