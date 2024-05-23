import React, { useEffect } from "react";
import animationData from "../../Assets/images/9450-3-dot-load.json";
import Lottie from "lottie-react";
// import groovyWalkAnimation from "./groovyWalk.json";

// const defaultOptions = {
//   loop: true,
//   autoplay: true,
//   animationData: animationData,
//   rendererSettings: {
//     preserveAspectRatio: "xMidYMid slice",
//   },
// };
function Loader(props) {
  const [loads, setloads] = React.useState(false);

  useEffect(() => {
    setloads(props.loader);
  }, [props.loader]);
  return (
    <div>
      {loads ? (
        <div
          style={{
            background: "#6E6C6C",
            opacity: "0.95",
            width: "100%",
            height: "100%",
            position: "fixed",
            left: "0",
            top: "0",
            zIndex: "1000",
          }}
        >
          <div
            style={{
              textAlign: "center",
              left: "50%",
              top: "50%",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              transform: "translate(-50%, -50%)",
              width: "300px",
              height: "300px",
            }}
          >
            {/* <Lottie options={defaultOptions} height={300} width={300} /> */}
            <Lottie animationData={animationData} loop={true} />;
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Loader;
