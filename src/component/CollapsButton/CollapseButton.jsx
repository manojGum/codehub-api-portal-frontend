import { useState } from "react";
import { NestedCollapseBtn } from "../NestedCollapsBtn/NestedCollapsBtn";

export const CollapseAllButton = ({ objectData }) => {
  const [nestedBox, setNestedBox] = useState(false);
  console.log("objectData", objectData)
  // const [nestedBoxNext, setNestedBoxNext] = useState(false);

  // const nestedCollapse = () => {
  //   setNestedBoxNext(!nestedBoxNext);
  // };

  // useEffect(() => {}, [nestedBox, nestedBoxNext]);

  const onCollapse = () => {
    setNestedBox(!nestedBox);
  };

  if (!objectData) {
    return (
      <>
        <p onClick={onCollapse} style={{ fontSize: "12px", cursor: "pointer" }}>
          {nestedBox ? (
            <span style={{ opacity: "0.7" }}>Collapse All ˅ </span>
          ) : (
            <span style={{ opacity: "0.7" }}>Expand All ˅ </span>
          )}
        </p>
        {nestedBox ? <p>no data</p> : null}
      </>
    );
  }
  const mydata = objectData;
  console.log("mydata", mydata)

  return (
    <>
      <div>
        {nestedBox ? (
          <div>
            <p
              onClick={onCollapse}
              style={{ fontSize: "12px", cursor: "pointer" }}
            >
              <span style={{ opacity: "0.7" }}>Collapse All ^</span>
            </p>{" "}
            {typeof mydata=== "object" ? (
                   
                       <pre>
                        <code>
                          {JSON.stringify(mydata, null, 2)}
                        </code>
                       </pre>
                  
                    ) : mydata}
            {/* { mydata?.foreach((mydata) => {
              return (
                <>
                  <div
                    style={{
                      padding: "8px",
                      margin: "5px",
                    }}
                  >
                    <div className="d_flex justify_content_between">
                      <h4>{mydata.name}</h4>
                      <p>{mydata.type}</p>
                    </div>
                    <h5>{mydata?.description}</h5>
               {mydata.type === "object" ? (
                      <NestedCollapseBtn data={mydata?.data} />
                    ) : null}
                  </div>
                </>
              );
            })} */}
          </div>
        ) : (
          <div>
            <p
              onClick={onCollapse}
              style={{ fontSize: "12px", cursor: "pointer" }}
            >
              <span style={{ opacity: "0.7" }}>Expand All ˅</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
};
