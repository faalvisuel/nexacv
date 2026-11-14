import { scoreLabel } from '../lib/ats.js';

export function ScoreRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const { tone } = scoreLabel(score);
  return (
    <svg className={`ring ring-${tone}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score ATS ${score} sur 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle">{score}</text>
    </svg>
  );
}

export default function AtsPanel({ report, onGo, compact = false }) {
  const { score, checks, keywords } = report;
  const label = scoreLabel(score);
  const todo = checks.filter((c) => !c.ok).sort((a, b) => b.weight - a.weight);
  const done = checks.filter((c) => c.ok);
  return (
    <div className="ats">
      <div className="ats-head">
        <ScoreRing score={score} />
        <div>
          <p className="ats-title">Score ATS : {label.text}</p>
          <p className="ats-sub">{todo.length === 0 ? 'Tous les critères sont remplis.' : `${todo.length} point${todo.length > 1 ? 's' : ''} à améliorer`}</p>
        </div>
      </div>
      {keywords.ratio !== null && (
        <p className="ats-kw">Mots-clés de l’offre présents : <strong>{keywords.found.length}/{keywords.keywords.length}</strong></p>
      )}
      {!compact && (
        <ul className="ats-list">
          {todo.slice(0, 6).map((c) => (
            <li key={c.id} className="ats-todo">
              <button type="button" onClick={() => onGo && onGo(c.step)}>
                <span className="ats-dot" aria-hidden="true" />
                <span><strong>{c.label}</strong><br /><span className="ats-fix">{c.fix}</span></span>
              </button>
            </li>
          ))}
          {done.slice(0, todo.length ? 3 : 8).map((c) => (
            <li key={c.id} className="ats-done"><span className="ats-check" aria-hidden="true">✓</span>{c.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
