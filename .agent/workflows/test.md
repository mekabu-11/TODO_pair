---
description: テストを実行する
---

# テストの実行

このワークフローは、プロジェクトのテストを実行します。

## 手順

// turbo
1. フロントエンドのテストを実行
```bash
cd frontend && npm test
```

// turbo
2. バックエンドのテストを実行
```bash
cd backend && npm test
```

// turbo-all
3. カバレッジ付きでテストを実行
```bash
cd frontend && npm run test:coverage
cd backend && npm run test:coverage
```
