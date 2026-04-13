/**
 * TricoloreBar — barra tricolore italiana.
 *
 * Semplicissima: width 100% del genitore, nessun position trick.
 * Va DENTRO il wrapper 720px — sia sopra che sotto la topbar.
 */
export default function TricoloreBar() {
  return (
    <div style={{ display: "flex", height: "2px", width: "100%", flexShrink: 0 }}>
      <div style={{ flex: 1, background: "#009246" }} />
      <div style={{ flex: 1, background: "#ffffff" }} />
      <div style={{ flex: 1, background: "#ce2b37" }} />
    </div>
  );
}
