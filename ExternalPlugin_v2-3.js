// ExternalPlugin.js - A communication-enabled external plugin
const React = globalThis.React;

/**
 * External demo widget that integrates with the host application
 * - Uses bridge.api for data fetching (similar to useFetch/usePost hooks)
 * - Communicates via event bus for real-time updates
 * - Receives context and settings from the host
 */
function ExternalDemoWidget(props) {
  const { settings = {}, context = {}, bridge } = props;
  const [data, setData] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: "" });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  
  // Similar to your useFetch hook but using bridge.api
  React.useEffect(() => {
    // Only fetch if we have an endpoint in settings
    if (!settings.dataEndpoint) return;
    
    setIsLoading(true);
    setError(null);
    
    // Use the bridge API (which will use your apiClient under the hood)
    bridge.api.get(settings.dataEndpoint)
      .then(response => {
        setData(response);
        // Notify host application that data was loaded
        bridge.bus.emit("plugin:data-loaded", { 
          widgetId: props.id,
          dataSize: Array.isArray(response) ? response.length : 1
        });
      })
      .catch(err => {
        const errorMsg = typeof err === 'string' ? err : 'Failed to fetch data';
        setError(errorMsg);
        // Report error to host for logging/analytics
        bridge.bus.emit("plugin:error", {
          widgetId: props.id,
          error: errorMsg,
          endpoint: settings.dataEndpoint
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
      
  }, [settings.dataEndpoint, bridge]);

  // Similar to your usePost hook
  const handleSubmit = () => {
    if (!settings.submitEndpoint) {
      addNotification("error", "No submission endpoint configured");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Use bridge API for POST operation
    bridge.api.post(settings.submitEndpoint, formData)
      .then(response => {
        setData(prev => ({ ...prev, ...response }));
        addNotification("success", "Data submitted successfully!");
        
        // Notify host application
        bridge.bus.emit("plugin:form-submitted", {
          widgetId: props.id,
          formData,
          response
        });
      })
      .catch(err => {
        const errorMsg = typeof err === 'string' ? err : 'Submission failed';
        setError(errorMsg);
        addNotification("error", `Error: ${errorMsg}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Listen for messages from host application
  React.useEffect(() => {
    if (!bridge?.bus) return;
    
    // Subscribe to host notifications
    const unsubscribeNotifications = bridge.bus.on("host:notification", payload => {
      if (payload?.type && payload?.message) {
        addNotification(payload.type, payload.message);
      }
    });
    
    // Subscribe to data refresh commands
    const unsubscribeRefresh = bridge.bus.on("host:refresh-data", payload => {
      if (payload?.widgetId === props.id || !payload?.widgetId) {
        if (settings.dataEndpoint) {
          setIsLoading(true);
          bridge.api.get(settings.dataEndpoint)
            .then(setData)
            .catch(err => setError(String(err)))
            .finally(() => setIsLoading(false));
        }
      }
    });
    
    // Subscribe to configuration updates
    const unsubscribeConfig = bridge.bus.on("host:update-config", payload => {
      if (payload?.widgetId === props.id && payload?.settings) {
        // In a real implementation, you would update local settings
        // This requires coordination with your WidgetRenderer to refresh props
        console.log("Received new settings:", payload.settings);
        bridge.bus.emit("plugin:config-updated", { 
          widgetId: props.id, 
          success: true 
        });
      }
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeNotifications();
      unsubscribeRefresh();
      unsubscribeConfig();
    };
  }, [bridge, props.id]);
  
  // Add notification to local state (simulating your useNotification hook)
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));
  };

  // Render the widget UI
  return React.createElement(
    "div",
    {
      style: {
        border: "1px solid #3b82f6",
        padding: "16px",
        borderRadius: "8px",
        fontFamily: "system-ui, sans-serif",
        background: "#f0f9ff"
      }
    },
    [
      // Header
      React.createElement(
        "div", 
        { 
          key: "header",
          style: { 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px"
          }
        },
        [
          React.createElement("h3", { 
            key: "title",
            style: { margin: 0, fontSize: "16px" }
          }, settings.title || "External Plugin Widget"),
          
          React.createElement("span", {
            key: "tenant",
            style: { 
              fontSize: "12px",
              padding: "3px 8px",
              background: "#dbeafe",
              borderRadius: "12px"
            }
          }, `Tenant: ${context.tenantId || "unknown"}`)
        ]
      ),
      
      // Notifications
      notifications.length > 0 && React.createElement(
        "div",
        { key: "notifications", style: { marginBottom: "12px" } },
        notifications.map(notification => (
          React.createElement("div", {
            key: notification.id,
            style: {
              padding: "8px 12px",
              borderRadius: "4px",
              marginBottom: "4px",
              background: notification.type === "error" ? "#fee2e2" : "#d1fae5",
              color: notification.type === "error" ? "#b91c1c" : "#065f46"
            }
          }, notification.message)
        ))
      ),
      
      // Loading state
      isLoading && React.createElement(
        "div",
        { 
          key: "loading", 
          style: { 
            padding: "12px",
            borderRadius: "4px",
            background: "#f3f4f6",
            marginBottom: "12px",
            textAlign: "center"
          }
        },
        "Loading data..."
      ),
      
      // Error message
      error && React.createElement(
        "div",
        {
          key: "error",
          style: {
            padding: "12px",
            borderRadius: "4px",
            background: "#fee2e2",
            color: "#b91c1c",
            marginBottom: "12px"
          }
        },
        `Error: ${error}`
      ),
      
      // Data display
      data && React.createElement(
        "div",
        {
          key: "data",
          style: {
            padding: "12px",
            borderRadius: "4px",
            background: "#f3f4f6",
            marginBottom: "16px",
            fontSize: "14px"
          }
        },
        [
          React.createElement("strong", { key: "data-title" }, "Data:"),
          React.createElement("pre", { 
            key: "data-json",
            style: {
              overflow: "auto",
              padding: "8px",
              background: "#e5e7eb",
              borderRadius: "4px",
              margin: "8px 0 0 0"
            }
          }, JSON.stringify(data, null, 2))
        ]
      ),
      
      // Form
      React.createElement(
        "div",
        { key: "form", style: { marginBottom: "16px" } },
        [
          React.createElement("div", { key: "form-title", style: { fontWeight: 500, marginBottom: "8px" } }, "Submit Data"),
          
          React.createElement(
            "div",
            { key: "form-row", style: { marginBottom: "12px" } },
            [
              React.createElement("label", { 
                key: "name-label",
                htmlFor: "name",
                style: { 
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px" 
                }
              }, "Name:"),
              
              React.createElement("input", {
                key: "name-input",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                style: {
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box"
                }
              })
            ]
          ),
          
          React.createElement(
            "button",
            {
              key: "submit-btn",
              onClick: handleSubmit,
              disabled: isSubmitting,
              style: {
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1
              }
            },
            isSubmitting ? "Submitting..." : "Submit"
          )
        ]
      ),
      
      // Action buttons
      React.createElement(
        "div",
        { 
          key: "actions",
          style: { 
            display: "flex",
            gap: "8px" 
          }
        },
        [
          React.createElement(
            "button",
            {
              key: "refresh-btn",
              onClick: () => {
                bridge.bus.emit("plugin:action", { 
                  action: "refresh",
                  widgetId: props.id
                });
                
                if (settings.dataEndpoint) {
                  setIsLoading(true);
                  bridge.api.get(settings.dataEndpoint)
                    .then(setData)
                    .catch(err => setError(String(err)))
                    .finally(() => setIsLoading(false));
                }
              },
              style: {
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "13px",
                cursor: "pointer"
              }
            },
            "Refresh"
          ),
          
          React.createElement(
            "button",
            {
              key: "notify-btn",
              onClick: () => {
                bridge.bus.emit("plugin:notification", {
                  type: "info",
                  message: "Message from plugin widget",
                  source: props.id
                });
                addNotification("success", "Notification sent to host");
              },
              style: {
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "13px",
                cursor: "pointer"
              }
            },
            "Send Notification"
          )
        ]
      ),
      
      // Settings debug (only in development)
      settings.showDebug && React.createElement(
        "div",
        { 
          key: "debug",
          style: { 
            marginTop: "16px",
            padding: "12px",
            background: "#1e293b",
            color: "#e2e8f0",
            borderRadius: "4px",
            fontSize: "12px"
          }
        },
        [
          React.createElement("div", { key: "debug-title" }, "Debug Info:"),
          React.createElement("pre", { 
            key: "debug-settings",
            style: { margin: "8px 0 0 0" }
          }, "Settings: " + JSON.stringify(settings, null, 2)),
          React.createElement("pre", {
            key: "debug-context",
            style: { margin: "8px 0 0 0" }
          }, "Context: " + JSON.stringify(context, null, 2))
        ]
      )
    ]
  );
}

/**
 * Plugin initialization function - called once when first loaded
 */
function initPlugin(bridge) {
  console.log("[ExternalPlugin] Initializing plugin");
  
  // Register with host application
  bridge.bus.emit("plugin:ready", {
    name: "demo-plugin",
    version: "1.0.0",
    capabilities: ["data-fetching", "form-submission", "notifications"]
  });
  
  // Listen for global configuration or commands
  bridge.bus.on("host:global-command", payload => {
    console.log("[ExternalPlugin] Received global command:", payload);
  });
  
  // Report plugin initialization status
  bridge.bus.emit("plugin:log", {
    level: "info",
    message: "Plugin initialized successfully",
    timestamp: new Date().toISOString()
  });
}

// Export the plugin manifest
export default {
  name: "demo-plugin",
  version: "1.0.0",
  widgets: [{ 
    type: "externalDemo", 
    component: ExternalDemoWidget 
  }],
  init: initPlugin
};
