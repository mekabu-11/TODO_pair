---
description: Docker Composeで環境を起動する
---

# Docker Compose環境の起動

このワークフローは、Docker Composeを使用して完全な開発環境を起動します。

## 手順

// turbo
1. Docker Composeで環境を起動
```bash
docker compose up -d
```

// turbo
2. ログを確認
```bash
docker compose logs -f
```

// turbo
3. 環境を停止する場合
```bash
docker compose down
```

## 本番環境

// turbo
本番環境を起動する場合:
```bash
docker compose -f docker-compose.prod.yml up -d
```
