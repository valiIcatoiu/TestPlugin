// SimpleFetchPlugin.js
// External single-widget plugin (no React import - relies on window.React)
const React = globalThis.React;

function SimpleFetchWidget(props) {
  const { settings = {}, bridge } = props;
  const endpoint = settings.endpoint;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const result = bridge?.api
        ? await bridge.api.get(endpoint)
        : await fetch(endpoint).then(r => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          });
      setData(result);
      bridge?.bus?.emit("plugin:data-loaded", {
        widgetType: "simpleFetch",
        endpoint
      });
    } catch (e) {
      const msg = e?.message || "Fetch failed";
      setError(msg);
      bridge?.bus?.emit("plugin:error", { endpoint, message: msg });
    } finally {
      setLoading(false);
    }
  }, [endpoint, bridge]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Optional: listen for host refresh event
  React.useEffect(() => {
    if (!bridge?.bus) return;
    const off = bridge.bus.on("host:refresh-data", (p) => {
      if (!p || !p.widgetType || p.widgetType === "simpleFetch") load();
    });
    return () => off && off();
  }, [bridge, load]);

  if (!endpoint) {
    return React.createElement(
      "div",
      { style: boxStyle("#fee2e2") },
      "No endpoint configured (settings.endpoint missing)"
    );
  }

  return React.createElement(
    "div",
    { style: boxStyle("#f1f5f9") },
    [
      React.createElement("div", { key: "h", style: headerStyle }, "SimpleFetchWidget"),
      React.createElement(
        "button",
        {
          key: "btn",
          onClick: load,
          disabled: loading,
          style: {
            padding: "6px 12px",
            fontSize: 12,
            cursor: loading ? "not-allowed" : "pointer",
            border: "1px solid #94a3b8",
            background: "#e2e8f0",
            borderRadius: 4,
            marginBottom: 8
          }
        },
        loading ? "Loading..." : "Reload"
      ),
      error &&
        React.createElement(
          "div",
          { key: "err", style: statusStyle("#fee2e2", "#b91c1c") },
          "Error: " + error
        ),
      !error && !loading && data &&
        React.createElement(
          "pre",
          {
            key: "data",
            style: {
              background: "#fff",
              padding: 8,
              fontSize: 11,
              lineHeight: 1.3,
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              maxHeight: 240,
              overflow: "auto",
              margin: 0
            }
          },
          JSON.stringify(data, null, 2)
        )
    ]
  );
}

function boxStyle(bg) {
  return {
    border: "1px solid #cbd5e1",
    background: bg,
    padding: 12,
    borderRadius: 8,
    fontFamily: "system-ui, sans-serif",
    fontSize: 13
  };
}

function headerStyle() {
  return {
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 14
  };
}

function statusStyle(bg, color) {
  return {
    background: bg,
    color,
    padding: "6px 8px",
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 8
  };
}

// Optional init (fires once)
function init(bridge) {
  bridge?.bus?.emit("plugin:ready", {
    name: "simple-fetch-plugin",
    version: "1.0.0"
  });
}

export default {
  name: "simple-fetch-plugin",
  version: "1.0.0",
  widget: {
    type: "simpleFetch",
    component: SimpleFetchWidget
  },
  init
};
