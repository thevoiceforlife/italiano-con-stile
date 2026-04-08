export default function Tricolore({ height = 3 }) {
  return (
    <div style={{ display:"flex", height, flexShrink:0 }}>
      <div style={{ flex:1, background:"#009246" }} />
      <div style={{ flex:1, background:"#fff" }} />
      <div style={{ flex:1, background:"#CE2B37" }} />
    </div>
  );
}
