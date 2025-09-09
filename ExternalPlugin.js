import React from "react";

/**
 * Widget extern demo (ESM).
 * Acceptă props: { settings?: {}, context?: { tenantId?: string } }
 * Nu folosește dependențe în afară de react.
 */
function DemoExternalWidget(props) {
  const { settings = {}, context = {} } = props;
  const ts = new Date().toLocaleTimeString();
  return (
    <div
      style={{
        border: "2px dashed #16a34a",
        padding: "12px 14px",
        borderRadius: "10px",
        background: "#f0fdf4",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.3
      }}
    >
      <strong style={{ display: "block", marginBottom: 6 }}>
        DemoExternalWidget (jsDelivr)
      </strong>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        tenant: {context.tenantId || "-"}
        <br />
        settings: {JSON.stringify(settings)}
        <br />
        time: {ts}
      </div>
      {settings.ctaText && (
        <button
          style={{
            marginTop: 10,
            background: "#16a34a",
            color: "white",
            border: 0,
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13
          }}
          onClick={() => {
            if (typeof settings.onClickMessage === "string") {
              console.log("[DemoExternalWidget]", settings.onClickMessage);
            } else {
              console.log("[DemoExternalWidget] clicked");
            }
          }}
        >
          {settings.ctaText}
        </button>
      )}
    </div>
  );
}

/**
 * Manifest compatibil cu PluginResolver:
 *  - export default { widgets: [ { component: <ReactComponent> } ] }
 */
const manifest = {
  widgets: [
    {
      component: DemoExternalWidget
    }
  ]
};

export default manifest;

/* Variante alternative (dacă vrei direct componenta):
   export default DemoExternalWidget;
   În PluginResolver ai deja suport pentru ambele formate.
*/
