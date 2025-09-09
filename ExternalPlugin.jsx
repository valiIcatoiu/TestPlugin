// ExternalPlugin.jsx
import React from "react";

function ExternalDemoWidget(props) {
  const { settings = {}, context = {} } = props;
  return (
    <div style={{ border: "2px dashed #16a34a", padding: 12, borderRadius: 8 }}>
      <strong>ExternalDemoWidget</strong>
      <div style={{ fontSize: 12, marginTop: 6 }}>
        tenant: {context.tenantId || "-"}
        <br />
        settings: {JSON.stringify(settings)}
      </div>
    </div>
  );
}

export default {
  widgets: [{ component: ExternalDemoWidget }]
};
