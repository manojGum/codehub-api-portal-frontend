import { useEffect, useState } from "react";

export const NestedCollapseBtn = ({ data }) => {
  const [btnState, setBtnState] = useState(false);

  const handleClick = () => {
    setBtnState(!btnState);
  };

  useEffect(() => {}, [btnState]);

  return (
    <>
      <div>
        {btnState ? (
          <div>
            <span
              onClick={handleClick}
              style={{ fontSize: "12px", cursor: "pointer", opacity: "0.6" }}
            >
              Collapse All ^
            </span>
            {data.map((e,i) => {
              return (
                <div  style={{ padding: "5px", margin: "3px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h4>{e.name}</h4>
                    <p>{e.type}</p>
                  </div>
                  <h5>{e.description}</h5>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <span
              onClick={handleClick}
              style={{ fontSize: "12px", cursor: "pointer", opacity: "0.6" }}
            >
              Expand All ˅
            </span>
          </div>
        )}
      </div>
    </>
  );
};
