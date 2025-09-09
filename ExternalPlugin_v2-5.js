// ExternalPlugin.js - Fixed version
const React = globalThis.React;

function ExternalDemoWidget(props) {
  // Safely extract props with defaults
  const settings = props?.settings || {};
  const context = props?.context || {};
  // NO bridge prop expectation - we'll use window events directly
  
  const [data, setData] = React.useState(null);
  const [formData, setFormData] = React.useState({ name: "" });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  
  // Direct event emission helper (doesn't rely on bridge)
  const emitEvent = React.useCallback((type, payload) => {
    window.dispatchEvent(new CustomEvent("app:bus", { 
      detail: { type, payload } 
    }));
  }, []);
  
  // Direct fetch helper (doesn't rely on bridge)
  const fetchData = React.useCallback(async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
  }, []);

  // Load data on mount if endpoint provided
  React.useEffect(() => {
    if (!settings.dataEndpoint) return;
    
    setIsLoading(true);
    setError(null);
    
    fetch(settings.dataEndpoint)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.json();
      })
      .then(response => {
        setData(response);
        emitEvent("plugin:data-loaded", { 
          widgetId: props.id,
          dataSize: Array.isArray(response) ? response.length : 1
        });
      })
      .catch(err => {
        const errorMsg = err.message || 'Failed to fetch data';
        setError(errorMsg);
        emitEvent("plugin:error", {
          widgetId: props.id,
          error: errorMsg,
          endpoint: settings.dataEndpoint
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
      
  }, [settings.dataEndpoint, emitEvent]);

  // Submit form data
  const handleSubmit = () => {
    if (!settings.submitEndpoint) {
      addNotification("error", "No submission endpoint configured");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    fetch(settings.submitEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.json();
      })
      .then(response => {
        setData(prev => ({ ...prev, ...response }));
        addNotification("success", "Data submitted successfully!");
        emitEvent("plugin:form-submitted", {
          widgetId: props.id,
          formData,
          response
        });
      })
      .catch(err => {
        const errorMsg = err.message || 'Submission failed';
        setError(errorMsg);
        addNotification("error", `Error: ${errorMsg}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Listen for messages from host application
  React.useEffect(() => {
    const handleHostMessages = (e) => {
      if (!e.detail) return;
      const { type, payload } = e.detail;
      
      if (type === "host:notification" && payload?.message) {
        addNotification(payload.type || "info", payload.message);
      }
      
      if (type === "host:refresh-data") {
        if (payload?.widgetId === props.id || !payload?.widgetId) {
          if (settings.dataEndpoint) {
            setIsLoading(true);
            fetch(settings.dataEndpoint)
              .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
              .then(setData)
              .catch(err => setError(err.message))
              .finally(() => setIsLoading(false));
          }
        }
      }
    };
    
    window.addEventListener("app:bus", handleHostMessages);
    return () => window.removeEventListener("app:bus", handleHostMessages);
  }, [props.id, settings.dataEndpoint]);
  
  // Add notification to local state
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

  // Basic UI - simplified
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
      React.createElement("h3", { key: "title" }, 
        settings.title || "External Plugin Widget"
      ),
      
      React.createElement("div", { key: "tenant" }, 
        `Tenant: ${context.tenantId || "unknown"}`
      ),
      
      // Notifications
      notifications.length > 0 && React.createElement(
        "div",
        { key: "notifications", style: { marginBottom: "12px" } },
        notifications.map(n => React.createElement("div", {
          key: n.id,
          style: { 
            padding: "8px", 
            margin: "4px 0",
            background: n.type === "error" ? "#fee2e2" : "#d1fae5",
          }
        }, n.message))
      ),
      
      // Loading state
      isLoading && React.createElement(
        "div",
        { key: "loading" },
        "Loading data..."
      ),
      
      // Error message
      error && React.createElement(
        "div",
        { key: "error", style: { color: "red" } },
        `Error: ${error}`
      ),
      
      // Data display
      data && React.createElement(
        "div",
        { key: "data" },
        [
          React.createElement("strong", { key: "d1" }, "Data:"),
          React.createElement("pre", { key: "d2" }, JSON.stringify(data, null, 2))
        ]
      ),
      
      // Form
      React.createElement(
        "div",
        { key: "form" },
        [
          React.createElement("label", { key: "f1" }, "Name:"),
          React.createElement("input", {
            key: "f2",
            name: "name",
            value: formData.name,
            onChange: handleInputChange,
            style: { display: "block", margin: "8px 0" }
          }),
          React.createElement(
            "button",
            {
              key: "f3",
              onClick: handleSubmit,
              disabled: isSubmitting,
            },
            isSubmitting ? "Submitting..." : "Submit"
          )
        ]
      ),
      
      // Action buttons
      React.createElement(
        "div",
        { key: "actions", style: { marginTop: "16px" } },
        [
          React.createElement(
            "button",
            {
              key: "b1",
              onClick: () => {
                emitEvent("plugin:action", { 
                  action: "refresh",
                  widgetId: props.id
                });
                
                if (settings.dataEndpoint) {
                  setIsLoading(true);
                  fetch(settings.dataEndpoint)
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then(setData)
                    .catch(() => setError("Refresh failed"))
                    .finally(() => setIsLoading(false));
                }
              },
              style: { marginRight: "8px" }
            },
            "Refresh"
          ),
          
          React.createElement(
            "button",
            {
              key: "b2",
              onClick: () => {
                emitEvent("plugin:notification", {
                  type: "info",
                  message: "Message from plugin widget",
                  source: props.id
                });
                addNotification("success", "Notification sent to host");
              }
            },
            "Send Notification"
          )
        ]
      )
    ]
  );
}

// Init function - now using direct window events
function initPlugin() {
  console.log("[ExternalPlugin] Initializing plugin");
  
  // Register with host application
  window.dispatchEvent(new CustomEvent("app:bus", { 
    detail: {
      type: "plugin:ready",
      payload: {
        name: "demo-plugin",
        version: "1.0.0"
      }
    }
  }));
}

// Export the plugin manifest
export default {
  name: "demo-plugin",
  version: "1.0.0",
  widget: { 
    type: "externalDemo", 
    component: ExternalDemoWidget 
  },
  init: initPlugin
};
