import React from "react";

function Layout({ children }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* Watermark Background */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-30deg)",
        fontSize: "10vw",
        fontWeight: "900",
        color: "rgba(0,0,0,0.04)",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
        whiteSpace: "nowrap"
      }}>
        The Academic Spot
      </div>

      {/* Header */}
      <div style={{
        width: "100%",
        padding: "1vw 2vw",
        background: "linear-gradient(135deg,#1e293b,#0f172a)",
        color: "white",
        fontWeight: "900",
        fontSize: "1.4vw",
        letterSpacing: "0.1em",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        🎓 The Academic Spot
      </div>

      {/* Page Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>

    </div>
  );
}

export default Layout;