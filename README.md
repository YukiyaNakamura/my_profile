# Personal site

Next.js App Router + TypeScript の1ページの自己紹介サイトです。プロフィールは仮の内容です。

## 起動

Node.js 20.9 以上を使用してください。

```sh
npm install
npm run dev
```

http://localhost:3000 を開きます。

## 本番ビルド・起動

```sh
npm run build
npm run typecheck
npm start
```

## 編集箇所

- 名前・文章・スキル・連絡先・ページタイトルと説明: `src/data/profile.ts`
- 写真: `public/profile.jpg` を追加し、同ファイルの `photo.src` を `/profile.jpg` に変更。`photo.alt` も編集。
- 連絡先: `contact.links` に `{ label: "SNS名", href: "https://実際のURL" }` を追加。メールは `mailto:` を使用。空配列では準備中と表示します。
- 色・余白・フォント: `src/app/globals.css`
- 構成: `src/app/page.tsx`

日本語は Noto Sans JP、英字見出しは Cormorant Garamond を Google Fonts から読み込みます。取得できない場合は端末の日本語フォントとセリフ体を使用。ビルド時のフォント取得は不要です。

写真はローカルの public フォルダを想定。外部画像には next.config.ts の remotePatterns が必要です。
