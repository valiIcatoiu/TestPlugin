import React from "react";

// VARIANTA MANIFEST (compatibilă cu PluginResolver)
function ExternalPluginWidget(props) {
  const {
    settings = {},
    context = {}
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "2px dashed #2563eb",
      padding: "12px 14px",
      borderRadius: "10px",
      background: "#eff6ff",
      fontFamily: "system-ui, sans-serif",
      lineHeight: 1.3
    }
  }, [/*#__PURE__*/React.createElement("strong", {
    key: "t",
    style: {
      display: "block",
      marginBottom: 6
    }
  }, "ExternalPluginWidget (jsDelivr)"), /*#__PURE__*/React.createElement("div", {
    key: "i",
    style: {
      fontSize: 12,
      opacity: 0.8
    }
  }, `tenant: ${context.tenantId || "-"}`), /*#__PURE__*/React.createElement("div", {
    key: "s",
    style: {
      fontSize: 12,
      opacity: 0.8
    }
  }, "settings: " + JSON.stringify(settings))]);
}
export default {
  widgets: [{
    component: ExternalPluginWidget
  }]
};

// Dacă vrei direct componentă în loc de manifest:
// export default ExternalPluginWidget;
