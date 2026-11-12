/**
 * Fixed decorative layers behind the home page. Each .fx-bg-move wrapper is
 * shifted by FxRuntime as the page scrolls (the grid must stay the last one).
 */
export default function Backdrop() {
  return (
    <>
      <div className="fx-progress" aria-hidden />
      <div className="fx-bg" aria-hidden>
        <div className="fx-bg-move" data-speed="0.12">
          <div className="fx-aurora a1" />
        </div>
        <div className="fx-bg-move" data-speed="0.2">
          <div className="fx-aurora a2" />
        </div>
        <div className="fx-bg-move" data-speed="0.16">
          <div className="fx-aurora a3" />
        </div>
        <div className="fx-grid-mask">
          <div className="fx-bg-move" data-speed="0.25">
            <div className="fx-grid" />
          </div>
        </div>
        <div className="fx-spotlight" />
        <div className="fx-grain" />
      </div>
    </>
  );
}
