export type ProfileLink = { label: string; href: string };
export const profile = {
  name: "中村 由希也",
  logo: "Yukiya Nakamura.",
  role: "Technology with curiosity and purpose.",
  metadata: {
    title: "中村 由希也 | ポートフォリオ",
    description: "立命館大学情報理工学部・中村由希也の研究、経験、強みを紹介します。",
  },
  hero: {
    label: "YUKIYA NAKAMURA / PORTFOLIO",
    title: ["人と技術をつなぎ、", "課題を形にする。"],
    introduction: "現場への理解と好奇心を大切に。情報技術を通じて、人に役立つ解決策を探求しています。",
  },
  photo: { src: "/profile.jpg", alt: "中村由希也のポートレート" },
  about: [
    "立命館大学 情報理工学部 情報理工学科に在籍し、2028年3月に卒業予定です。技術を使う人や現場の視点を大切にしながら、課題解決に取り組んでいます。",
    "日本語の会議音声を対象に、話者や発話意図、立場といった会話構造を活用した自動要約を研究しています。音声認識から構造の推定、要約生成、評価までのパイプラインを構築し、性能の課題を分析しています。",
    "大学のPBLでは、保護団体へのヒアリングを踏まえ、猫の画像再識別システムをチームで開発しました。長期インターンでは、LLMやGoogle Apps Script、Google Sheets、APIを活用した業務効率化に取り組みました。",
    "オランダでの4年半の生活と、多様な文化的背景を持つ人々との交流を通じて、相手の価値観を理解し、変化に柔軟に対応する姿勢を培いました。英検1級取得に向けては、課題を分析し学習方法を改善しながら挑戦を続けました。",
  ],
  skills: ["自然言語処理", "音声認識", "Whisper", "BERT", "mT5", "LLM", "Google Apps Script", "API", "TOEIC 880点", "実用英語技能検定1級"],
  contact: {
    description: "研究やものづくり、これまでの経験について、お気軽にお声がけください。",
    emptyMessage: "お問い合わせ先は準備中です。",
    links: [] as ProfileLink[],
  },
};
