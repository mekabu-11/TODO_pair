---
description: プロジェクトをビルドする
---

# プロジェクトのビルド

このワークフローは、フロントエンドとバックエンドをビルドします。

## 手順

// turbo
1. フロントエンドをビルド
```bash
cd frontend && npm run build
```

// turbo
2. バックエンドの依存関係をインストール（必要に応じて）
```bash
cd backend && npm install
```

## ビルド成果物

- フロントエンド: `frontend/dist/`
- バックエンド: Node.jsプロジェクトなのでビルド不要、直接実行
