import React, { useState } from 'react'

const Crausal = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const imageStyle = {
        width: "80%",
        height: "100%",
        borderRadious: "10px",

        backgroundPosition: "center",
        marginLeft:"10%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100%",
        backgroundImage: `url(${process.env.REACT_APP_API_URL + data[currentIndex]?.attributes?.url})`,
    }

    const leftArrowStyle = {
        position: "absolute",
        top: "50%",
        transform: "translate(0, -50%)",
        left: "32px",
        fontSize: "45px",
        color: "#2368ca",
        zIndex: 1,
        cursor: "pointer"
    }
    const rightArrowStyle = {
        position: "absolute",
        top: "50%",
        transform: "translate(0, -50%)",
        right: "32px",
        fontSize: "45px",
        color: "#2368ca",
        zIndex: 1,
        cursor: "pointer"
    }

    const gotoprevioud = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? data.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);

    }

    const gotonext = () => {
        const isLastSlide = currentIndex === data.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }
    return (
        <div style={{ height: "100%", position: "relative"}}>
            <div style={leftArrowStyle} onClick={gotoprevioud}>⮘</div>
            <div style={rightArrowStyle} onClick={gotonext}>⮚</div>
            <div style={imageStyle} >
            </div>
        </div>
    )
}

export default Crausal