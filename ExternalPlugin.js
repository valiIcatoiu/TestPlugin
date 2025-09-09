import React from "react";

/**
 * DemoExternalWidget – widget extern ESM fără JSX.
 * Props: { settings?: object, context?: { tenantId?: string } }
 */
function DemoExternalWidget(props) {
  const settings = props?.settings || {};
  const context = props?.context || {};
  const ts = new Date().toLocaleTimeString();

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
      React.createElement(
        "strong",
        { key: "title", style: { display: "block", marginBottom: 6 } },
        "DemoExternalWidget (jsDelivr)"
      ),
      React.createElement(
        "div",
        { key: "info", style: { fontSize: 12, opacity: 0.8 } },
        [
          `tenant: ${context.tenantId || "-"}`,
          React.createElement("br", { key: "b1" }),
          "settings: " + JSON.stringify(settings),
          React.createElement("br", { key: "b2" }),
          "time: " + ts
        ]
      ),
      settings.ctaText
        ? React.createElement(
            "button",
            {
              key: "btn",
              style: {
                marginTop: 10,
                background: "#16a34a",
                color: "white",
                border: 0,
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13
              },
              onClick: () => {
                if (typeof settings.onClickMessage === "string") {
                  console.log("[DemoExternalWidget]", settings.onClickMessage);
                } else {
                  console.log("[DemoExternalWidget] clicked");
                }
              }
            },
            settings.ctaText
          )
        : null
    ]
  );
}

/**
 * Manifest compatibil cu PluginResolver:
 * export default { widgets: [{ component: DemoExternalWidget }] }
 */
const manifest = {
  widgets: [{ component: DemoExternalWidget }]
};

export default manifest;

// Dacă preferi export direct al componentei (și ai suport deja):
// export default DemoExternalWidget;
