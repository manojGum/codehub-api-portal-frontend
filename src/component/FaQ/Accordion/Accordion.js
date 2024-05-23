import React, { useState } from "react";
import "./Accordion.css"; // Make sure to create this CSS file
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Accordion = ({ title, content }) => {
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
          <div></div>
          <div className="accordion-icon">
           {( isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />)}
          </div>
        </div>
      </div>
      {isExpanded && <div className="accordion-content">{content}</div>}
    </div>
  );
};

export default Accordion;
