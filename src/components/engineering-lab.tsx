"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Chapter, type Lang } from "./ui";
const text=(l:Lang,j:string,e:string)=>l==='ja'?j:e;
export function GithubIcon(){return <img className="github-mark" src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/github.svg" width="22" height="22" alt="" aria-hidden="true"/>}

/* ---------- Research demo: how meeting audio becomes a summary ---------- */
const UTTERANCES=[
 {sp:'A',ja:'公開日は金曜でどうですか？',en:'Shall we release on Friday?',act:['提案','proposal']},
 {sp:'B',ja:'テストが終われば賛成です。',en:'Yes, provided testing is finished.',act:['条件付き賛成','conditional agreement']},
 {sp:'A',ja:'では、テスト完了を条件に金曜にしましょう。',en:'Friday it is, subject to completing the tests.',act:['意思決定','decision']},
];
// segments flagged 1 appear in both the generated and the reference summary
const SUMMARY={
 ja:{gen:[["テスト",1],["完了",1],["を",0],["条件",1],["に、",0],["公開",1],["日を",0],["金曜",1],["とすることで合意した。",0]],ref:[["テスト",1],["の",0],["完了",1],["を",0],["条件",1],["として、",0],["金曜",1],["日に",0],["公開",1],["することが決定した。",0]]},
 en:{gen:[["Agreed ",0],["to release on Friday",1],[", subject ",0],["to",1],[" completing ",0],["the tests",1],[".",0]],ref:[["Decided ",0],["to release on Friday",1],[" once ",0],["the tests",1],[" are complete.",0]]},
} as const;
const STEPS=[
 {model:'Whisper',ja:'音声認識',en:'Speech recognition',dja:'会議の音声をWhisperで文字に起こします。',den:'Whisper transcribes the meeting audio into text.'},
 {model:'BERT',ja:'構造推定',en:'Structure prediction',dja:'BERTで、各発話の話者と意図・立場（対話行為ラベル）を推定します。',den:'BERT predicts the speaker and intent/stance (dialogue act label) of each utterance.'},
 {model:'mT5-small',ja:'要約生成',en:'Summarization',dja:'推定した構造情報を入力に加え、mT5-smallで要約を生成します。構造情報の有無で入力を切り替えて比較しました。',den:'The predicted structure is added to the input and mT5-small generates a summary. Inputs with and without structure were compared.'},
 {model:'ROUGE',ja:'評価',en:'Evaluation',dja:'生成した要約と参照要約の一致度をROUGEで評価し、性能に影響する要因を分析します。',den:'ROUGE measures overlap between generated and reference summaries, and the factors affecting performance are analyzed.'},
];
const BARS=Array.from({length:60},(_,i)=>0.25+Math.abs(Math.sin(i*1.9)*Math.cos(i*.43))*0.75);

export function EngineeringLab({lang}:{lang:Lang}){
 const [step,setStep]=useState(0),[structured,setStructured]=useState(true),[heard,setHeard]=useState(3),[run,setRun]=useState(0),[auto,setAuto]=useState(false),[focus,setFocus]=useState(-1);
 const ja=lang==='ja',L=(j:string,e:string)=>ja?j:e;
 // step 1: reveal the transcript utterance by utterance, as the audio "plays"
 useEffect(()=>{if(step!==0)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){setHeard(3);return}setHeard(0);const ids=[1,2,3].map(n=>setTimeout(()=>setHeard(n),n*900));return()=>ids.forEach(clearTimeout)},[step,run]);
 useEffect(()=>{if(!auto)return;const id=setTimeout(()=>{if(step<3)setStep(step+1);else setAuto(false)},4200);return()=>clearTimeout(id)},[auto,step]);
 const go=(n:number)=>{setAuto(false);setStep(Math.max(0,Math.min(3,n)))};
 const tabKey=(e:React.KeyboardEvent)=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;const n=(step+d+4)%4;go(n);document.getElementById('step-'+n)?.focus()};
 // Back/Next sit below the step, so on a tall phone layout bring the stepper back into view
 const goFromNav=(n:number)=>{go(n);const stepper=document.querySelector('.stepper');if(stepper&&stepper.getBoundingClientRect().top<0)stepper.scrollIntoView({block:'start'})};
 const hl=(i:number)=>({onMouseEnter:()=>setFocus(i),onMouseLeave:()=>setFocus(-1),onFocus:()=>setFocus(i),onBlur:()=>setFocus(-1),tabIndex:0,'data-hl':focus===i});
 const line=(u:typeof UTTERANCES[number],i:number,label=false)=><li key={i} className="utt" data-sp={u.sp} {...hl(i)}><b className="chip">{L('話者','Speaker')} {u.sp}</b>{label&&<b className="chip act">{u.act[ja?0:1]}</b>}<span>{u[lang]}</span></li>;
 const S=SUMMARY[lang];
 const io=[
  [<><p className="io-label">{L('入力：会議の音声','Input: meeting audio')}</p><div className="audio"><button className="audio-play" onClick={()=>setRun(r=>r+1)} aria-label={L('音声をもう一度再生','Replay audio')}>↻</button><div className="audio-wave" aria-hidden="true" data-playing={heard<3} key={run}>{BARS.map((b,i)=><i key={i} data-sp={i<20?'A':i<38?'B':'A'} data-done={heard*20>i} style={{height:`${b*100}%`}}/>)}</div><div className="audio-legend" aria-hidden="true"><span data-sp="A">{L('話者','Speaker')} A</span><span data-sp="B">{L('話者','Speaker')} B</span><span data-sp="A">{L('話者','Speaker')} A</span></div></div></>,
   <><p className="io-label">{L('出力：文字起こし','Output: transcript')}</p><ol className="utt-list" aria-live="polite">{UTTERANCES.slice(0,heard).map((u,i)=>line(u,i))}{heard<3&&<li className="utt pending">{L('文字起こし中…','Transcribing…')}</li>}</ol></>],
  [<><p className="io-label">{L('入力：文字起こし','Input: transcript')}</p><ol className="utt-list">{UTTERANCES.map((u,i)=>line(u,i))}</ol></>,
   <><p className="io-label">{L('出力：話者と対話行為ラベル','Output: speaker & dialogue act')}</p><ol className="utt-list reveal">{UTTERANCES.map((u,i)=>line(u,i,true))}</ol></>],
  [<><p className="io-label">{L('入力：要約モデルへの入力','Input: what the model receives')}</p><div className="seg" role="radiogroup" aria-label={L('入力条件','Input condition')}><button role="radio" aria-checked={!structured} onClick={()=>setStructured(false)}>{L('構造情報なし','Without structure')}</button><button role="radio" aria-checked={structured} onClick={()=>setStructured(true)}>{L('構造情報あり','With structure')}</button></div><pre className="model-input" key={String(structured)}>{structured?UTTERANCES.map(u=>`[${L('話者','Speaker')} ${u.sp}][${u.act[ja?0:1]}] ${u[lang]}`).join('\n'):UTTERANCES.map(u=>u[lang]).join(' ')}</pre><p className="io-note">{structured?L('話者と発話の意図をタグとして付与します。','Speaker and intent are attached as tags.'):L('発話をそのまま連結した比較条件です。','Comparison condition: utterances simply concatenated.')}</p></>,
   <><p className="io-label">{L('出力：生成された要約（例）','Output: generated summary (example)')}</p><div className="summary-card"><span className="summary-model">mT5-small</span><p>{S.gen.map(s=>s[0]).join('')}</p></div><p className="io-note">{L('研究では、この2つの入力条件で生成した要約を比較しました。','The research compared summaries generated under these two input conditions.')}</p></>],
  [<><p className="io-label">{L('入力：生成要約と参照要約','Input: generated vs reference')}</p><div className="compare"><div><small>{L('生成要約','Generated')}</small><p>{S.gen.map((s,i)=><span key={i} className={s[1]?'match':''}>{s[0]}</span>)}</p></div><div><small>{L('参照要約（人が作成）','Reference (human-written)')}</small><p>{S.ref.map((s,i)=><span key={i} className={s[1]?'match':''}>{s[0]}</span>)}</p></div></div><p className="io-note"><span className="match">{L('ハイライト','Highlighted')}</span>{L('が両者で一致する語句です。一致が多いほどROUGEスコアは高くなります。','phrases appear in both. More overlap means a higher ROUGE score.')}</p></>,
   <><p className="io-label">{L('出力：分析の観点','Output: what was analyzed')}</p><ul className="factors">{[['音声認識の誤り','ASR errors'],['ラベル予測の誤り','Label prediction errors'],['入力表現','Input representation'],['データ量','Dataset size']].map(f=><li key={f[0]}>{f[ja?0:1]}</li>)}</ul><p className="io-note">{L('20件のデータを用いた比較実験で、性能に影響する要因を切り分けて分析しました。','Comparative experiments on 20 samples isolated the factors that affect performance.')}</p></>],
 ];
 return <Chapter id="lab" n="02" eyebrow="RESEARCH DEMO" title={L("研究デモ","Research demo")} sub={L('会議音声の自動要約パイプライン','Meeting summarization pipeline')} lead={L('会議の音声が要約になるまでの流れを、4つのステップで紹介します。ステップを選択するか「次へ」で進めてください。','Follow how meeting audio becomes a summary, in four steps. Pick a step or press “Next”.')} className="engineering-lab">
 <div className="demo">
  <div className="demo-question"><span>{L('研究の問い','Research question')}</span><p>{L('話者や発話の意図といった「会話の構造」を入力に加えると、会議の要約はより良くなるか？','Does adding conversational structure — who spoke, and with what intent — produce better meeting summaries?')}</p></div>
  <div className="stepper" role="tablist" aria-label={L('処理ステップ','Pipeline steps')} onKeyDown={tabKey} style={{'--progress':step/3} as React.CSSProperties}>{STEPS.map((s,i)=><button key={s.model} id={'step-'+i} role="tab" aria-selected={step===i} aria-controls="step-panel" tabIndex={step===i?0:-1} data-done={i<step} onClick={()=>go(i)}><span className="step-n">{i<step?'✓':i+1}</span><strong>{s[lang]}</strong><small>{s.model}</small></button>)}</div>
  <div className="demo-stage" role="tabpanel" id="step-panel" aria-labelledby={'step-'+step} key={step}>
   <div className="stage-head"><p className="stage-step">STEP {step+1} / 4</p><h3>{STEPS[step][lang]}<small>{STEPS[step].model}</small></h3><p>{ja?STEPS[step].dja:STEPS[step].den}</p></div>
   <div className="io"><div className="io-col">{io[step][0]}</div><div className="io-arrow" aria-hidden="true"><span>{STEPS[step].model}</span>→</div><div className="io-col out">{io[step][1]}</div></div>
  </div>
  <div className="demo-nav"><button onClick={()=>goFromNav(step-1)} disabled={step===0}>← {L('前へ','Back')}</button><button className="demo-auto" onClick={()=>{if(auto)setAuto(false);else{setStep(0);setRun(r=>r+1);setAuto(true)}}} aria-pressed={auto}>{auto?L('■ 停止','■ Stop'):L('▶ 通しで見る','▶ Play all steps')}</button><button className="demo-next" onClick={()=>goFromNav(step+1)} disabled={step===3}>{L('次へ','Next')} →</button></div>
  <p className="demo-note">{L('会話例と要約は説明用に作成したものです。学習済みモデルによる推論や、精度の実測は行っていません。発話にカーソルを合わせるかタップすると、同じ発話が強調されます。','The dialogue and summaries are illustrative. This demo does not run trained models or report measured accuracy. Hover or tap an utterance to highlight it.')}</p>
 </div>
 </Chapter>
}

/* ---------- Skills: each language shown with real code you can run ---------- */
type CodeLang='py'|'java'|'ts';
const KEYWORDS:Record<CodeLang,RegExp>={py:/^(def|return|for|in|if|else|sum|min|set|len|split)$/,java:/^(import|new|String|Queue|ArrayDeque|java|util)$/,ts:/^(type|const|string)$/};
function Code({src,lang,file}:{src:string;lang:CodeLang;file:string}){
 const re=/("[^"]*"|\/\/.*$|#.*$|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/gm;
 const cls=(p:string)=>p.startsWith('"')?'tk-str':p.startsWith('//')||p.startsWith('#')?'tk-com':/^\d/.test(p)?'tk-num':KEYWORDS[lang].test(p)?'tk-kw':'';
 return <div className="code"><div className="code-bar"><span className="code-dots" aria-hidden="true"><i/><i/><i/></span>{file}</div><pre>{src.split('\n').map((ln,i)=><span className="code-line" key={i}><i aria-hidden="true">{i+1}</i>{ln.split(re).map((p,j)=>j%2?<span key={j} className={cls(p)}>{p}</span>:p)}{'\n'}</span>)}</pre></div>;
}
const PY_SRC=`def rouge1(candidate, reference):
    c, r = candidate.split(), reference.split()
    # 両方に現れる単語の数（重複は少ない方まで）
    overlap = sum(min(c.count(w), r.count(w)) for w in set(c))
    precision = overlap / len(c)
    recall = overlap / len(r)
    return 2 * precision * recall / (precision + recall)`;
const JAVA_SRC=`import java.util.ArrayDeque;
import java.util.Queue;

Queue<String> tasks = new ArrayDeque<>();`;
const TS_SRC=`type Lang = "ja" | "en";

const label = (l: Lang, ja: string, en: string) =>
  l === "ja" ? ja : en;`;
const words=(s:string)=>s.toLowerCase().split(/[\s.,!?、。]+/).filter(Boolean);
function rouge1(c:string,r:string){
 const a=words(c),b=words(r),count=(xs:string[],w:string)=>xs.filter(x=>x===w).length;
 const overlap=[...new Set(a)].reduce((s,w)=>s+Math.min(count(a,w),count(b,w)),0);
 const p=a.length?overlap/a.length:0,rc=b.length?overlap/b.length:0;
 return {p,r:rc,f:overlap?2*p*rc/(p+rc):0,shared:new Set(a.filter(w=>b.includes(w)))};
}
const Marked=({s,shared}:{s:string;shared:Set<string>})=><>{s.split(/(\s+)/).map((w,i)=>shared.has(words(w)[0]??'')?<mark key={i}>{w}</mark>:w)}</>;
const queueDefaults=(l:Lang)=>l==='ja'?['要件を整理する','小さく実装する','動作を確認する']:['Clarify requirements','Build it small','Check that it works'];

export function LanguageSkills({lang}:{lang:Lang}) {
 const ja=lang==='ja',L=(j:string,e:string)=>ja?j:e;
 const [active,setActive]=useState(0);
 const [cand,setCand]=useState('release on friday once the tests finish'),[ref,setRef]=useState('the release is friday after the tests finish');
 const [queue,setQueue]=useState<string[]>(()=>queueDefaults(lang)),[task,setTask]=useState(''),[log,setLog]=useState<string[]>([]);
 const [call,setCall]=useState<'ja'|'en'|'fr'|null>(null);
 useEffect(()=>{setQueue(queueDefaults(lang));setLog([])},[lang]);
 const score=rouge1(cand,ref);
 const push=(line:string)=>setLog(l=>[...l.slice(-5),line]);
 const offer=()=>{const v=task.trim();if(!v||queue.length>=6)return;setQueue([...queue,v]);push(`tasks.offer("${v}");`);setTask('')};
 const poll=()=>{if(!queue.length){push(`tasks.poll();  // → null`);return}push(`tasks.poll();  // → "${queue[0]}"`);setQueue(queue.slice(1))};
 const groups=[
  {name:L('自然言語処理・音声','NLP & speech'),items:['自然言語処理','音声認識','Whisper','BERT','mT5','LLM']},
  {name:L('開発','Development'),items:['Python','Java','TypeScript','Google Apps Script','API']},
  {name:L('語学','Languages'),items:['TOEIC 880点','実用英語技能検定1級']},
 ];
 const en:Record<string,string>={'自然言語処理':'Natural language processing','音声認識':'Speech recognition','TOEIC 880点':'TOEIC 880','実用英語技能検定1級':'EIKEN Grade 1'};
 const langs=[
  {name:'Python',icon:'python',use:L('研究・データ処理','Research & data'),desc:L('研究で扱う音声認識・自然言語処理のモデル（Whisper、BERT、mT5）の利用や、評価指標の計算などのデータ処理に使用しています。','Used for research — working with speech and language models (Whisper, BERT, mT5) and computing evaluation metrics.'),what:L('要約の評価に使われる指標「ROUGE-1」を計算します。2つの文を書き換えると、一致する単語とスコアがその場で変わります。','Computes ROUGE-1, a metric used to evaluate summaries. Edit either sentence and the shared words and scores update instantly.')},
  {name:'Java',icon:'java',use:L('オブジェクト指向・データ構造','OOP & data structures'),desc:L('大学の授業を通じて、オブジェクト指向プログラミングやデータ構造を学んでいます。','Studied at university for object-oriented programming and data structures.'),what:L('先入れ先出し（FIFO）のキューを操作します。ボタンを押すと、実行されたJavaのコードがコンソールに表示されます。','Operate a first-in, first-out queue. Each button shows the Java call it runs in the console.')},
  {name:'TypeScript',icon:'typescript',use:L('Web開発','Web development'),desc:L('このポートフォリオサイトは、TypeScriptとNext.js（React）で開発しています。','This portfolio site is built with TypeScript and Next.js (React).'),what:L('このサイトの日本語・英語の切り替えに使っている関数です。引数を変えて実行すると、型による誤りの検出も確認できます。','The function this site uses to switch between Japanese and English. Try different arguments to see type checking catch a mistake.')},
 ];
 const tabKey=(e:React.KeyboardEvent)=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;const n=(active+d+3)%3;setActive(n);document.getElementById('lang-tab-'+n)?.focus()};
 const cur=langs[active];
 return <Chapter id="stack" n="04" eyebrow="SKILLS" title={L('スキル','Skills')} sub={L('使用言語：Python・Java・TypeScript','Languages: Python, Java & TypeScript')} lead={L('研究や開発で扱ってきた技術と資格です。プログラミング言語は、それぞれの用途に沿った短いコードを実際に動かして確認できます。','Technologies and qualifications from my research and development work. For each programming language, you can run a short piece of code related to how I use it.')}>
 <div className="skill-groups">{groups.map(g=><div key={g.name}><h3>{g.name}</h3><ul>{g.items.map(s=><li key={s}>{ja?s:en[s]??s}</li>)}</ul></div>)}</div>
 <div className="langs">
  <div className="lang-tabs" role="tablist" aria-label={L('プログラミング言語','Programming languages')} onKeyDown={tabKey}>{langs.map((x,i)=><button key={x.name} id={'lang-tab-'+i} role="tab" tabIndex={active===i?0:-1} aria-selected={active===i} aria-controls="lang-panel" onClick={()=>setActive(i)}><img src={`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${x.icon}/${x.icon}-original.svg`} alt="" width="28" height="28"/><span><strong>{x.name}</strong><small>{x.use}</small></span></button>)}</div>
  <div className="lang-panel" role="tabpanel" id="lang-panel" aria-labelledby={'lang-tab-'+active} key={active}>
   <div className="lang-info"><p className="lang-use">{L('用途','Used for')}</p><h3>{cur.use}</h3><p>{cur.desc}</p><div className="lang-what"><b>{L('このデモ','This demo')}</b><p>{cur.what}</p></div></div>
   <div className="lang-run">
    {active===0?<><Code src={PY_SRC} lang="py" file="rouge.py"/>
     <div className="run-inputs"><label>{L('生成された要約','Candidate')}<input value={cand} onChange={e=>setCand(e.target.value)} spellCheck={false}/></label><label>{L('参照要約','Reference')}<input value={ref} onChange={e=>setRef(e.target.value)} spellCheck={false}/></label></div>
     <div className="console" aria-live="polite"><p className="prompt">&gt;&gt;&gt; rouge1(candidate, reference)</p><div className="scores">{([['Precision',score.p],['Recall',score.r],['F1',score.f]] as const).map(([k,v])=><div key={k}><span>{k}</span><b>{v.toFixed(2)}</b><i style={{width:`${v*100}%`}}/></div>)}</div><p className="console-text"><Marked s={cand} shared={score.shared}/></p><p className="console-text"><Marked s={ref} shared={score.shared}/></p></div>
     <p className="run-note">{L('単語は空白で区切って数えます（英語の文で試すのがおすすめです）。','Words are split on spaces.')}</p></>
    :active===1?<><Code src={JAVA_SRC} lang="java" file="TaskQueue.java"/>
     <div className="queue-viz" aria-label={L('キューの中身','Queue contents')}><span className="q-end">{L('先頭','head')}</span><ol>{queue.map((q,i)=><li key={q+i}>{q}</li>)}{!queue.length&&<li className="q-empty">{L('空','empty')}</li>}</ol><span className="q-end">{L('末尾','tail')}</span></div>
     <form className="run-inputs row" onSubmit={e=>{e.preventDefault();offer()}}><input value={task} maxLength={30} onChange={e=>setTask(e.target.value)} placeholder={L('追加するタスク','Task to add')} aria-label={L('追加するタスク','Task to add')}/><button disabled={!task.trim()||queue.length>=6}>offer()</button><button type="button" onClick={poll}>poll()</button></form>
     <div className="console" aria-live="polite">{log.length?log.map((l,i)=><p key={i} className="console-code">{l}</p>):<p className="console-muted">{L('// ボタンを押すと、実行したコードがここに表示されます','// The code you run appears here')}</p>}<p className="console-muted">tasks.size();  // → {queue.length}</p></div></>
    :<><Code src={TS_SRC} lang="ts" file="label.ts"/>
     <div className="run-inputs row">{(['ja','en','fr'] as const).map(a=><button key={a} type="button" aria-pressed={call===a} onClick={()=>setCall(a)}>label(&quot;{a}&quot;, …)</button>)}</div>
     <div className="console" aria-live="polite"><p className="console-code">label({call?`"${call}"`:'…'}, &quot;研究デモ&quot;, &quot;Research demo&quot;)</p>{call===null?<p className="console-muted">{L('// 引数を選んで実行してください','// Pick an argument to run it')}</p>:call==='fr'?<p className="console-error">error TS2345: Argument of type &apos;&quot;fr&quot;&apos; is not assignable to parameter of type &apos;Lang&apos;.</p>:<p className="console-ok">→ &quot;{call==='ja'?'研究デモ':'Research demo'}&quot;</p>}</div>
     <p className="run-note">{call==='fr'?L('"fr" は型 Lang に含まれないため、実行前のコンパイル時点で誤りとして検出されます。','"fr" is not part of the Lang type, so the mistake is caught at compile time, before the code runs.'):L('画面右上の JA / EN ボタンも、この関数で表示を切り替えています。','The JA / EN button at the top of this page uses this function too.')}</p></>}
   </div>
  </div>
 </div></Chapter>
}

export function ExperienceJournal({lang}:{lang:Lang}) {
 return <Chapter id="experience" n="03" eyebrow="EXPERIENCE" title={text(lang,'職務経験','Experience')} lead={text(lang,'企業でのインターンシップやハッカソンなど、大学外での経験を紹介します。','Internships and a hackathon — experience beyond university.')}>
 <ol className="experience-list">
  <li className="exp"><div className="exp-meta"><span className="exp-status"><i aria-hidden="true"/>{text(lang,'在籍中','Current')}</span><span>{text(lang,'長期インターン','Long-term internship')}</span></div><div className="exp-body"><h3>{text(lang,'株式会社ASAP','ASAP Inc.')}<small>{text(lang,'システムエンジニア','System engineer')}</small></h3><p>{text(lang,'システムエンジニアとして長期インターンに従事しています。','I am currently working as a system engineering intern.')}</p></div></li>
  <li className="exp"><div className="exp-meta"><span>{text(lang,'9月1日〜9月30日','Sep 1 – Sep 30')}</span><span>{text(lang,'インターンシップ','Internship')}</span></div><div className="exp-body"><h3>{text(lang,'楽天モバイル','Rakuten Mobile')}<small>{text(lang,'ネットワークエンジニア','Network engineer')}</small></h3><p>{text(lang,'ネットワークエンジニアとしてインターンシップに参加しました。多国籍の社員が日常的に英語でコミュニケーションを取る環境で業務に携わり、多様な文化や価値観を持つメンバーと協働する中で、相互理解を前提に仕事を進めることの重要性を実感しました。','I worked as a network engineer intern in an environment where colleagues from different countries communicated in English every day. Working alongside people with diverse cultures and perspectives reinforced the importance of mutual understanding.')}</p><figure className="exp-photo"><Image src="/rakuten-office.png" width={1108} height={1477} sizes="(max-width: 700px) 90vw, 360px" alt={text(lang,'楽天のロゴがあるオフィスのエントランス','Office entrance with Rakuten logo')}/></figure></div></li>
  <li className="exp"><div className="exp-meta"><span>{text(lang,'ハッカソン','Hackathon')}</span></div><div className="exp-body"><h3>{text(lang,'ハウテレビジョン','Howtelevision')}<small>{text(lang,'ハッカソン参加','Participant')}</small></h3><p>{text(lang,'ハッカソンに参加し、限られた時間の中でプロダクト開発に取り組みました。日常の研究・開発とは異なる環境で、短期間でアイデアを形にする経験を得ました。','I took part in a hackathon, building a product under tight time constraints — a different setting from my everyday research and development.')}</p><figure className="exp-photo wide"><Image src="/howtelevision-office.png" width={948} height={392} sizes="(max-width: 700px) 90vw, 480px" alt={text(lang,'ハウテレビジョンのオフィス受付','Howtelevision office reception')}/></figure></div></li>
 </ol></Chapter>
}

export function PortfolioControls({lang}:{lang:Lang}){
 const dialog=useRef<HTMLDialogElement>(null),[query,setQuery]=useState('');
 const routes=[{name:'研究・プロジェクト / Research & Projects',url:'/#work'},{name:'研究デモ / Research demo',url:'/#lab'},{name:'職務経験 / Experience',url:'/#experience'},{name:'スキル / Skills',url:'/#stack'},{name:'大切にしていること / Values',url:'/#about'},{name:'学歴 / Education',url:'/#education'},{name:'経歴 / Timeline',url:'/#timeline'},{name:'GitHub',url:'/#github'},{name:'Now',url:'/now'}];
 useEffect(()=>{const open=()=>{if(!dialog.current?.open)dialog.current?.showModal()};const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}};document.addEventListener('keydown',onKey);window.addEventListener('open-search',open);return()=>{document.removeEventListener('keydown',onKey);window.removeEventListener('open-search',open)}},[]);
 const r=routes.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));
 return <><dialog ref={dialog} className="command-dialog" onClose={()=>setQuery('')} onClick={e=>{if(e.target===dialog.current)dialog.current?.close()}}><div className="command-top"><input aria-label={text(lang,'セクションを検索','Find a section')} placeholder={text(lang,'移動先を入力してください','Where would you like to go?')} value={query} onChange={e=>setQuery(e.target.value)}/><button onClick={()=>dialog.current?.close()} aria-label={text(lang,'閉じる','Close')}>Esc</button></div><div className="command-results">{r.map(x=><a key={x.url} href={x.url} onClick={()=>dialog.current?.close()}>{x.name}<span aria-hidden="true">↵</span></a>)}{!r.length&&<p>{text(lang,'該当するセクションがありません。','No matching sections.')}</p>}</div></dialog></>
}
export const openSearch=()=>window.dispatchEvent(new Event('open-search'));

export function SchoolJournal({lang}:{lang:Lang}) {
 const schools=[
  {logo:'/ritsumeikan-logo.png',width:256,height:192,alt:'立命館大学のロゴ',ja:'立命館大学 情報理工学部',en:'Ritsumeikan University',period:text(lang,'2024年4月入学 / 2028年3月卒業予定','April 2024 – Expected graduation March 2028'),detail:text(lang,'情報理工学科・e-Society研究室に所属。研究室では会議音声の自動要約に取り組み、現在は卒業研究のテーマを検討しています。','College of Information Science and Engineering, e-Society Laboratory. I worked on meeting summarization and am currently exploring topics for my graduation research.')},
  {logo:'/ashiya-logo.jpg',width:165,height:84,alt:'県立芦屋国際中等教育学校のロゴ',ja:'県立芦屋国際中等教育学校',en:'Ashiya International Secondary School',period:text(lang,'2021年1月入学 / 2024年3月卒業','January 2021 – March 2024'),detail:text(lang,'2021年1月、オランダからの帰国に合わせて入学しました。','I entered the school in January 2021 after returning to Japan from the Netherlands.')},
  {logo:'/ise-logo.jpg',width:360,height:360,alt:'ISE — International School Eindhoven',ja:'ISE（International School Eindhoven）',en:'International School Eindhoven (ISE)',period:text(lang,'オランダ滞在中に在籍（2016年8月〜2021年1月）','Attended during my time in the Netherlands (August 2016 – January 2021)'),detail:text(lang,'多様な文化的背景を持つ生徒とともに学ぶ環境で、相手の背景を理解したうえでコミュニケーションを取る姿勢を身につけました。','Learning alongside students from different cultural backgrounds taught me to communicate with an understanding of other perspectives.')}
 ];
 return <Chapter id="education" n="06" eyebrow="EDUCATION" title={text(lang,'学歴','Education')} lead={text(lang,'オランダのインターナショナルスクールから、芦屋国際中等教育学校を経て、立命館大学へ。','From an international school in the Netherlands, through Ashiya International, to Ritsumeikan University.')}><div className="school-rows">{schools.map(s=><article className="school-row" key={s.logo}><div className="school-logo"><Image src={s.logo} width={s.width} height={s.height} alt={s.alt}/></div><div className="school-detail"><h3>{lang==='ja'?s.ja:s.en}</h3><p className="school-period">{s.period}</p><p>{s.detail}</p></div></article>)}</div></Chapter>;
}
