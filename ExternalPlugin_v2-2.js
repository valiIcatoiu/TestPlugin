// ExternalPlugin.js
const React = globalThis.React;

/**
 * External demo widget that demonstrates bidirectional communication with host app
 */
function ExternalDemoWidget(props) {
  const settings = props?.settings || {};
  const context = props?.context || {};
  const bridge = props?.bridge;
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Fetch data from API when component mounts
  React.useEffect(() => {
    if (bridge?.api) {
      setIsLoading(true);
      // Example API call to host - replace with your actual endpoint
      bridge.api.get('/api/demo-data')
        .then(response => {
          setData(response);
          setIsLoading(false);
          // Notify host that data was loaded
          bridge.bus?.emit('plugin:data-loaded', { 
            pluginId: props.id,
            timestamp: new Date().toISOString() 
          });
        })
        .catch(err => {
          setError(err.message || 'Error fetching data');
          setIsLoading(false);
        });
    }

    // Subscribe to host events
    const unsubscribe = bridge?.bus?.on('host:data-update', payload => {
      console.log('Received data update from host:', payload);
      if (payload?.data) setData(prevData => ({ ...prevData, ...payload.data }));
    });

    // Cleanup subscription
    return () => unsubscribe?.();
  }, []);

  // Send event to host app
  const handleAction = () => {
    if (bridge?.bus) {
      bridge.bus.emit('plugin:action', { 
        action: settings.actionType || 'click',
        widgetId: props.id,
        tenantId: context.tenantId
      });
    }
  };

  return React.createElement(
    "div",
    {
      style: {
        border: "1px solid #3b82f6",
        padding: "12px 16px",
        borderRadius: "8px",
        background: "#f0f9ff",
        fontFamily: "system-ui, sans-serif"
      }
    },
    [
      React.createElement("strong", { key: "title" }, "ExternalDemoWidget"),
      
      React.createElement("div", { 
        key: "context",
        style: { fontSize: 13, marginTop: 8 } 
      }, "Tenant: " + (context.tenantId || "unknown")),
      
      React.createElement("div", { 
        key: "settings",
        style: { fontSize: 12, marginTop: 4 } 
      }, "Settings: " + JSON.stringify(settings)),
      
      isLoading && React.createElement("div", { 
        key: "loading",
        style: { fontSize: 13, marginTop: 8, color: "#6b7280" } 
      }, "Loading data..."),
      
      data && React.createElement("div", { 
        key: "data",
        style: { fontSize: 13, marginTop: 8, fontWeight: 500 } 
      }, "Data: " + JSON.stringify(data)),
      
      error && React.createElement("div", { 
        key: "error",
        style: { fontSize: 13, marginTop: 8, color: "#ef4444" } 
      }, "Error: " + error),
      
      React.createElement("button", { 
        key: "button",
        onClick: handleAction,
        style: {
          marginTop: 12,
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: 13
        }
      }, settings.buttonText || "Send Event to Host")
    ]
  );
}

// Plugin initialization - called once when first loaded
function initPlugin(bridge) {
  // Register with the host application
  bridge.bus.emit('plugin:initialized', {
    name: "demo-plugin",
    version: "1.0.0"
  });
  
  // Listen for global messages from host
  bridge.bus.on('host:broadcast', payload => {
    console.log('Received broadcast from host:', payload);
  });
  
  console.log('Plugin initialized with tenant:', bridge.context?.tenantId);
}

export default {
  name: "demo-plugin",
  version: "1.0.0",
  widgets: [{ type: "externalDemo", component: ExternalDemoWidget }],
  init: initPlugin
};
