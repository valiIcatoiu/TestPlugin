import React from "react";

function ExternalDemoWidget(props) {
  const settings = props?.settings || {};
  const context = props?.context || {};
  return React.createElement(
    "div",
    {
      style: {
        border: "2px dashed #16a34a",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "#f0fdf4",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.3
      }
    },
    [
      React.createElement("strong", { key: "t", style: { display: "block", marginBottom: 6 } }, "ExternalDemoWidget"),
      React.createElement(
        "div",
        { key: "d", style: { fontSize: 12, opacity: 0.8 } },
        "tenant: " + (context.tenantId || "-")
      ),
      React.createElement(
        "div",
        { key: "s", style: { fontSize: 12, opacity: 0.8, marginTop: 4 } },
        "settings: " + JSON.stringify(settings)
      )
    ]
  );
}

export default {
  widgets: [{ component: ExternalDemoWidget }]
};
