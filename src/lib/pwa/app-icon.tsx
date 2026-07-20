export function AppIconMark({ size }: { size: number }) {
  const fontSize = size * 0.43;
  const accentWidth = size * 0.07;
  const accentHeight = size * 0.02;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#6935b8",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: accentWidth,
            height: accentHeight,
            background: "#dccbf2",
            borderRadius: accentHeight,
            transform: "rotate(-35deg)",
            marginBottom: size * 0.02,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 700,
            color: "#f8f8fa",
            letterSpacing: -fontSize * 0.04,
          }}
        >
          B2
        </div>
      </div>
    </div>
  );
}
