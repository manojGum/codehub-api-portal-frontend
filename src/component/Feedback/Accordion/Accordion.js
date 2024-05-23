import React, { useState } from "react";
import "./Accordion.css"; // Make sure to create this CSS file
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Accordion = ({ title, attributestype, content, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`accordion ${isExpanded ? "expanded" : ""}`}>
      <div className="accordion-header" onClick={toggleAccordion}>
        <div className="titlee" style={{ width: "85%" }}>
          {title}
        </div>
        <div className="button-header">
          {attributestype ? (
            <h1
              style={{
                border: "1px solid #44a6f5",
                color: "#44a6f5",
                borderRadius: "5px",
                display: "inline-block",
                padding: "7px",
                marginRight: "20px",
                fontSize: "13px",
              }}
            >
              {attributestype}
            </h1>
          ) : (
            <div></div>
          )}
          <div className="accordion-icon">
            {isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
        </div>
      </div>
      {isExpanded && <div className="accordion-content">{content}</div>}
      {isExpanded && <div className="accordion-content">{children}</div>}
    </div>
  );
};

export default Accordion;
