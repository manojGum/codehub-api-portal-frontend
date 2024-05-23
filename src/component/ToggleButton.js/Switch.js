import React from 'react';
import "./Switch.css";
import cx from "classnames";

const Switch = ({ rounded = false, isToggled, isAdmin }) => {
    const sliderCx = cx(isAdmin ? "slider" : "slider2" , {
        rounded: rounded
    });

    return (
        <label className="switch">
            <input type="checkbox" checked={isToggled} />
            <span className={sliderCx}></span>
        </label>
    );
};

export default Switch;