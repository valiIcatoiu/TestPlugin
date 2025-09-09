const React = globalThis.React;

function ExternalDemoWidget(props) {
  const settings = props?.settings || {};
  return React.createElement(
    "div",
    { style: { border: "1px dashed #16a34a", padding: 10, borderRadius: 8, fontFamily: "sans-serif" } },
    [
      React.createElement("strong", { key: "t" }, "ExternalDemoWidget"),
      React.createElement("div", { key: "s", style: { fontSize: 12, marginTop: 6 } }, "settings: " + JSON.stringify(settings))
    ]
  );
}

export default {
  name: "demo-plugin",
  version: "1.0.0",
  widgets: [{ type: "externalDemo", component: ExternalDemoWidget }]
};
