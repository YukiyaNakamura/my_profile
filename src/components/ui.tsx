"use client";
export type Lang = "ja" | "en";
export const t = (l: Lang, ja: string, en: string) => (l === "ja" ? ja : en);
export const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
};

/** Section layout: heading column on the left, content on the right. */
export function Chapter({ id, n, eyebrow, title, sub, lead, className = "", children }: {
  id: string; n: string; eyebrow: string; title: React.ReactNode; sub?: React.ReactNode; lead?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return <section id={id} className={"chapter container " + className} aria-labelledby={id + "-h"}>
    <header className="chapter-head">
      <p className="section-number">{n} / {eyebrow}</p>
      <h2 id={id + "-h"}>{title}</h2>
      {sub && <p className="chapter-sub">{sub}</p>}
      {lead && <p className="chapter-lead">{lead}</p>}
    </header>
    <div className="chapter-body">{children}</div>
  </section>;
}
