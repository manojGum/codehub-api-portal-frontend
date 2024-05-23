import React from "react";
import "./ToolTip.css";
const ToolTip = ({ children, tooltipText }) => {
  return (
    <div>
      
        <div className="tooltip">
        {children}
          <span className="tooltiptext">{tooltipText}</span>
        </div>
    </div>
  );
};

export default ToolTip;
