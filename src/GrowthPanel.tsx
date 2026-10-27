import { useState } from "react";
import { Sprout, X, ChevronRight } from "lucide-react";
import type { Runtime } from "./schema";
import "./growth.css";

const stats = [
  ["vocal", "声乐"],
  ["dance", "舞蹈"],
  ["camera", "镜头"],
  ["energy", "体力"],
  ["mood", "心情"],
  ["fans", "人气"],
];
const bonds = [
  ["bond_hae", "海温"],
  ["bond_yun", "允书"],
  ["bond_seo", "瑞安"],
  ["bond_rin", "多凛"],
];

export function GrowthPanel({
  state,
  onChoose,
  onRestart,
}: {
  state: Runtime;
  onChoose: (target: string) => void;
  onRestart: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("today");
  const [confirmReset, setConfirmReset] = useState(false);
  const v = state.variables;
  const finished = state.endings.length > 0;
  return (
    <>
      <button
        className="growth-launch"
        onClick={() => setOpen(true)}
        aria-label="打开今日安排"
      >
        <Sprout size={16} />
        <span>
          DAY {String(v.day).padStart(2, "0")} ·{" "}
          {finished ? "收工手记" : "今日安排"}
        </span>
        <ChevronRight size={14} />
      </button>
      {open && (
        <section
          className="growth-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="微光练习簿"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <header>
            <div>
              <small>AFTERGLOW · 星屿娱乐</small>
              <h2>微光练习簿</h2>
            </div>
            <button
              autoFocus
              onClick={() => setOpen(false)}
              aria-label="收起安排"
            >
              <X size={20} />
            </button>
          </header>
          <nav aria-label="成长面板">
            <button
              aria-pressed={tab === "today"}
              onClick={() => setTab("today")}
            >
              今日
            </button>
            <button
              aria-pressed={tab === "growth"}
              onClick={() => setTab("growth")}
            >
              成长
            </button>
            <button
              aria-pressed={tab === "bonds"}
              onClick={() => setTab("bonds")}
            >
              队友
            </button>
          </nav>
          <div className="growth-scroll">
            {tab === "today" && (
              <>
                <p className="growth-date">
                  出道第 {String(v.day)} 天 / {String(v.period)}
                </p>
                {v.feedback && (
                  <aside className="growth-feedback">
                    <small>刚刚发生</small>
                    <p>{String(v.feedback)}</p>
                  </aside>
                )}
                <h3>{finished ? state.endings.at(-1) : "今天，慢慢来。"}</h3>
                <p className="growth-scene">{String(v.scene)}</p>
                <div className="growth-options">
                  {state.choices.map((c) => (
                    <button key={c.target} onClick={() => onChoose(c.target)}>
                      {c.label}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
                {finished ? (
                  <p className="growth-hint">
                    第一章暂告一段落。手机里的聊天与手记仍可以查看；后续章节会接着这里继续写。
                  </p>
                ) : (
                  <p className="growth-hint">
                    可以先收起安排，看看新消息。选择后时间才会推进，不用赶。
                  </p>
                )}
              </>
            )}
            {tab === "growth" && (
              <>
                <p className="growth-date">每一点变化，都会留下来</p>
                <div className="growth-stats">
                  {stats.map(([key, label]) => (
                    <div key={key}>
                      <span>
                        {label}
                        <b>
                          {Number(v[key])}
                          <small> / 100</small>
                        </b>
                      </span>
                      <progress
                        max={100}
                        value={Number(v[key])}
                        aria-label={label}
                      />
                    </div>
                  ))}
                </div>
                <p className="growth-hint">
                  人气是这一阶段的成长指数，不是实际粉丝人数。休息、练习与相处各有价值。
                </p>
                {!confirmReset ? (
                  <button
                    className="growth-reset"
                    onClick={() => setConfirmReset(true)}
                  >
                    从第一天重新体验
                  </button>
                ) : (
                  <div className="growth-reset-confirm">
                    <p>会清除这次游玩的进度，重新回到第一天。</p>
                    <button
                      onClick={() => {
                        setConfirmReset(false);
                        setOpen(false);
                        onRestart();
                      }}
                    >
                      确认重新开始
                    </button>
                    <button onClick={() => setConfirmReset(false)}>
                      继续当前生活
                    </button>
                  </div>
                )}
              </>
            )}
            {tab === "bonds" && (
              <>
                <p className="growth-date">五个人，慢慢成为一个团</p>
                {bonds.map(([key, label], i) => (
                  <div className="growth-bond" key={key}>
                    <strong>
                      {label}
                      <span>默契 {String(v[key])}</span>
                    </strong>
                    <p>
                      {
                        [
                          "队长。经常提前到，也总记得谁没吃饭。",
                          "主唱。讲话直接，熟悉后会很认真地开玩笑。",
                          "主舞。练习时严格，宿舍里经常找不到钥匙。",
                          "擅长接话，让所有人都有机会加入聊天。",
                        ][i]
                      }
                    </p>
                    <progress
                      max={100}
                      value={Number(v[key])}
                      aria-label={`${label}默契`}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
          <footer>小小的舞台，也值得认真生活。</footer>
        </section>
      )}
    </>
  );
}
