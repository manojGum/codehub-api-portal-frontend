import { useEffect, useRef, useState } from "react";
import "./Modal.css";

const Modals = ({ showModal, closeModal, headerName, children,width,marginTop }) => {
  const [animationState, setAnimationState] = useState(false);

  useEffect(() => {
    if (showModal) setTimeout(() => setAnimationState(true), 0);
  }, [showModal]);

  const element = useRef(null);

  const close = () => {
    setAnimationState(false);
    setTimeout(closeModal, 100);
  };

  const isCloseModal = (e) => !element.current.contains(e.target) && close();

  return showModal ? (
    <div
      className={`modalAbsolute ${animationState ? "animation" : ""}`}
      onClick={isCloseModal}
    >
      <div
        className={`modalContent ${animationState ? "animation2" : ""}`}
        style={{ width: width ? width :"70%", marginTop: marginTop?marginTop:"5%" }}
        ref={element}
      >
        <div className="closeX" onClick={close}>
          X
        </div>
        <div className="blockContent">{headerName}</div>
        {children}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "end",
          }}
        ></div>
      </div>
    </div>
  ) : null;
};

export default Modals;
