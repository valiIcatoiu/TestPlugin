// SimpleFetchPlugin.js
// External single-widget plugin (expects window.React disponibil în host)
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
      let result;
      if (bridge?.api?.get) {
        result = await bridge.api.get(endpoint+window.pageTarget?.ObjectId);
      } else {
        const r = await fetch(endpoint);
        if (!r.ok) throw new Error("HTTP " + r.status);
        result = await r.json();
      }
      setData(result);
      bridge?.bus?.emit?.("plugin:data-loaded", {
        widgetType: "simpleFetch",
        endpoint
      });
    } catch (e) {
      const msg = e?.message || "Fetch failed";
      setError(msg);
      bridge?.bus?.emit?.("plugin:error", { endpoint, message: msg });
    } finally {
      setLoading(false);
    }
  }, [endpoint, bridge]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Ascultă refresh din host
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
      { style: { border: "1px solid #ccc", padding: 8, fontFamily: "sans-serif", fontSize: 13 } },
      "Missing settings.endpoint"
    );
  }

  return React.createElement(
    "div",
    { style: { border: "1px solid #ccc", padding: 10, borderRadius: 6, fontFamily: "sans-serif", fontSize: 13 } },
    [
      React.createElement("div", { key: "title", style: { fontWeight: 600, marginBottom: 6 } }, "SimpleFetchWidget"),
      React.createElement("button", {
        key: "btn",
        onClick: load,
        disabled: loading,
        style: { marginBottom: 8, padding: "4px 10px", cursor: loading ? "not-allowed" : "pointer" }
      }, loading ? "Loading..." : "Reload"),
      error && React.createElement("div", { key: "err", style: { color: "#b91c1c", marginBottom: 6 } }, "Error: " + error),
      !error && !loading && data && React.createElement(
        "pre",
        {
          key: "data",
          style: {
            background: "#f5f5f5",
            padding: 8,
            margin: 0,
            maxHeight: 200,
            overflow: "auto",
            fontSize: 12
          }
        },
        JSON.stringify(data, null, 2)
      )
    ]
  );
}

// Init (opțional)
function init(bridge) {
  bridge?.bus?.emit?.("plugin:ready", {
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
