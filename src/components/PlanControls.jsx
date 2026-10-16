// Shuffle re-runs the planner against whatever places/trip are currently
// set, so it doubles as "replan" too — there's no separate "plan" step
// anymore, since adding a place already plans automatically. The reset
// action now lives further down the stack (after the packing-list CTA),
// so this only renders Shuffle.
export default function PlanControls({ onShuffle }) {
  return (
    <div className="plan-controls">
      <button type="button" className="primary full-width" onClick={onShuffle}>
        Shuffle plan
      </button>
    </div>
  )
}
