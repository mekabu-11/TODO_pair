# MCPサーバー設定ガイド

このドキュメントでは、Antigravity（Gemini）でMCPサーバーを追加する方法を説明します。

## MCPサーバーとは？

MCP (Model Context Protocol) サーバーは、AIアシスタントに追加のツールやデータソースへのアクセスを提供する仕組みです。例えば：

- **データベースアクセス**: PostgreSQL、MySQL、SQLiteなど
- **ファイルシステム**: 特定のディレクトリへのアクセス
- **API統合**: GitHub、Slack、Google Driveなど
- **カスタムツール**: 独自のビジネスロジック

## Antigravityでの設定方法

### 1. Gemini設定を開く

Antigravity（Gemini）のMCPサーバーは、**グローバル設定**で管理されます：

1. Gemini/Antigravityの設定画面を開く
2. 「MCP Servers」セクションを探す
3. 新しいサーバーを追加

### 2. MCPサーバーの種類

#### 例1: ファイルシステムサーバー
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"]
  }
}
```

#### 例2: PostgreSQLサーバー
```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@localhost/dbname"]
  }
}
```

#### 例3: GitHubサーバー
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_TOKEN": "your-github-token-here"
    }
  }
}
```

#### 例4: Supabaseサーバー（このプロジェクト用）
```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://postgres:[password]@[host]:5432/postgres"]
  }
}
```

### 3. プロジェクト固有のMCPサーバー

このプロジェクトで役立つMCPサーバー：

#### Supabaseデータベース接続
プロジェクトの`.env`ファイルから接続情報を取得して設定：

```bash
# .envファイルから取得
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

接続文字列を作成：
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

#### カスタムプロジェクトツール
プロジェクト固有のツールを作成する場合：

```javascript
// .agent/mcp-server/todo-pair-tools.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'todo-pair-tools',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// カスタムツールを定義
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'get_user_todos',
    description: 'ユーザーのTODOリストを取得',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string' }
      }
    }
  }]
}));

// サーバーを起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

設定：
```json
{
  "todo-pair-tools": {
    "command": "node",
    "args": ["/Users/zunya/Documents/GitHub/TODO_pair/.agent/mcp-server/todo-pair-tools.js"]
  }
}
```

## トラブルシューティング

### MCPサーバーが表示されない
1. Geminiを再起動
2. 設定ファイルのJSON構文を確認
3. コマンドのパスが正しいか確認

### 接続エラー
1. データベース接続文字列を確認
2. 環境変数が正しく設定されているか確認
3. ファイアウォール設定を確認

## 参考リソース

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [利用可能なMCPサーバー一覧](https://github.com/modelcontextprotocol/servers)
- [カスタムMCPサーバーの作成](https://modelcontextprotocol.io/docs/building-servers)

## 注意事項

- MCPサーバーはグローバル設定なので、すべてのAntigravity会話で利用可能になります
- センシティブな情報（APIキー、パスワード）は環境変数で管理してください
- プロジェクト固有のサーバーは、絶対パスで指定してください
