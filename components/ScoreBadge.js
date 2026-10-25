/*
This component shows one offer's ranking score in a compact badge.
The same score is used for all retailers in a product group.
*/

/** Display an offer's numeric score and rank label. */
export default function ScoreBadge({ score, rank }) {
  return (
    <span className="score-badge" title={`Rank ${rank} with score ${score} out of 100`}>
      <strong>{score}</strong><span>/100</span>
    </span>
  );
}
