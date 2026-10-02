import { useRef } from 'react'

export default function PlanControls({ status, planned, hasPlaces, onPlan, onClear }) {
  const dialogRef = useRef(null) // gives us access to the <dialog> element

  function handleClick() {
    // If the plan does not fit, ask before planning. Otherwise plan straight away.
    if (status === 'toomuch') dialogRef.current.showModal()
    else onPlan()
  }

  function planAnyway() {
    dialogRef.current.close()
    onPlan()
  }

  if (planned) {
    return (
      <div className="plan-controls">
        <button type="button" onClick={onClear}>Clear plan</button>
      </div>
    )
  }

  return (
    <div className="plan-controls">
      <button type="button" className="primary" onClick={handleClick} disabled={!hasPlaces}>
        Plan my trip
      </button>
      <dialog ref={dialogRef}>
        <h2>This plan does not fit</h2>
        <p>
          Some places will end up in an "Unscheduled" list. You can go back and fix it first,
          or plan anyway and move things around yourself.
        </p>
        <div className="fixes">
          <button type="button" onClick={() => dialogRef.current.close()}>Go back and fix</button>
          <button type="button" className="primary" onClick={planAnyway}>Plan anyway</button>
        </div>
      </dialog>
    </div>
  )
}
