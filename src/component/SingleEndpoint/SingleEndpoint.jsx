import { useState } from "react";
import { CollapseAllButton } from "../CollapsButton/CollapseButton";
import { RequestCode } from "../RequestCode/RequestCode";
import copy from "copy-to-clipboard";
import "./singleEndpoint.css";
import parse from "html-react-parser";

export const SingleEndPoint = ({ endpoint }) => {
  const [copyText, setCopyText] = useState("◊◊");
  const endpointObject = endpoint.attributes;
  const errorHandlingDetails = endpointObject.errorHandlingDetails
    ? endpointObject.errorHandlingDetails
    : "";
  const businessRequirementsRules = endpointObject.businessRequirementsRules
    ? endpointObject.businessRequirementsRules
    : "";
  const developmentRequirementsRules =
    endpointObject.developmentRequirementsRules
      ? endpointObject.developmentRequirementsRules
      : "";
  const authenticationDetails = endpointObject.authenticationDetails
    ? endpointObject.authenticationDetails
    : "";
  const responseMessageArray = endpointObject.responseMessage;
  const requests = endpointObject.requests;
  const responses = endpointObject.responses;
  const apiResponse = JSON.stringify(endpointObject.apiResponse, null, 2);
  let apiRequest = endpointObject.apiRequests;
  
  const copyToClipboard = (e) => {
    copy(JSON.stringify(endpointObject?.apiResponse));
    setCopyText("✔");
  };

  if (apiRequest.length === 0) {
    apiRequest = [{ language: "NA", requests: "No data available" }];
  }

  return (
    <>
      <div className="fs_3">
        <div
          className="d_flex justify_content_between"
          style={{ marginTop: "15px" }}
        >
          <h2 className="fs_3 fw_normal text-dark">
            {endpointObject.shortDescription}
          </h2>
          <p className="p_tag" style={{ paddingRight: "5px", width: "13%" }}>
            Method : {endpointObject.method}
          </p>
        </div>
        {endpointObject.description ? (
          <div
            className="fw_normal text-black-75 text_wrap"

          >{parse(endpointObject.description)}</div>
        ) : null}

        <hr className="extrenal_hr" />
      </div>

      <div className="d_flex justify_content_between">
        {requests.length !== 0 ? (
          <div style={{ margin: "10px" }} className="w_50 ">
            <h4 className="fw_bold text-dark ">Request fields</h4>

            <div style={{}}>
              {requests.map((requests) => {
                const nestedObjDataRequest = requests.objects || null;

                let typeChecker = false;
                if (requests.type === "object") {
                  typeChecker = true;
                }
                return (
                  <div
                    key={requests.id}
                    style={{
                      padding: "5px",
                      margin: "3px",
                    }}
                  >
                    <div className="d_flex justify_content_between">
                      <h4>{requests.name}</h4>
                      <p>{requests.type}</p>
                    </div>
                    <h5 style={{ margin: "0px", fontWeight: "400" }}>
                      {requests.description}
                    </h5>
                    <div>
                      {typeChecker ? (
                        <CollapseAllButton objectData={nestedObjDataRequest} />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (<div style={{ margin: "10px" }} className="w_50 "> </div>)}
        {apiRequest.length !== 0 &&
          <div style={{ margin: "10px" }} className="w_50 ">
            <div style={{ position: "relative" }}>
              <h2>Request Example</h2>

              <RequestCode apiRequest={apiRequest} />
            </div>
          </div>
        }

      </div>


      <div className="d_flex justify_content_between">
        {responses?.length !== 0 ? (
          <div style={{ margin: "10px" }} className="w_50 ">
            <h4 className="fs-4 fw_bold text-dark">Response fields</h4>

            <div style={{}}>
              {responses.map((responses) => {
                const nestedObjDataResponse = responses.objects || null;
                let typeChecker = false;
                if (responses.type === "object") {
                  typeChecker = true;
                }
                return (
                  <div
                    key={responses.id}
                    style={{
                      padding: "5px",
                      margin: "3px",
                    }}
                  >
                    <div className="d_flex justify_content_between">
                      <h4>{responses.name}</h4>
                      <p>{responses.type}</p>
                    </div>

                    <h5 style={{ margin: "0px", fontWeight: "400" }}>
                      {responses.description}
                    </h5>
                    <div>
                      {console.log("nestedObjDataResponse", nestedObjDataResponse)}
                      {typeChecker ? (
                        <div>
                          <CollapseAllButton
                            objectData={nestedObjDataResponse}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (<div style={{ margin: "10px" }} className="w_50 "> </div>)}
        {endpointObject?.apiResponse !== null &&
          <div style={{ margin: "10px" }} className="w_50 ">
            <div>
              <h2>Response Example</h2>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "2px solid gray",
                  backgroundColor: "black",
                  padding: "10px",
                }}
              >
                <span
                  style={{
                    flex: "50%",
                    marginLeft: "auto",
                    color: "white",
                    padding: "5px",
                  }}
                >
                  {" "}
                  API Object
                </span>
                <span
                  style={{
                    flex: "20%",
                    textAlign: "end",
                    color: "white",
                    padding: "10px 25px 0px 0px",
                    fontSize: "25px",
                    margin: "-4px",
                    letterSpacing: "-7px",
                    cursor: "pointer",
                  }}
                  onClick={copyToClipboard}
                >
                  {" "}
                  {copyText}
                </span>
              </div>
              <pre style={{ backgroundColor: "black", padding: "10px" }}>
                <code style={{ backgroundColor: "black", color: "white" }} dangerouslySetInnerHTML={{ __html: JSON.stringify(endpointObject?.apiResponse )}}>

                </code>
              </pre>
            </div>
          </div>
        }
      </div>


      <div className="faq-body">
        <div className="faq-list">
          {errorHandlingDetails && (
            <div>
              <details>
                <summary title="Error handling and troubleshooting information">
                  Error handling and troubleshooting information
                </summary>
                {errorHandlingDetails ? (
                  <div className="faq-content sidedesign">{parse(errorHandlingDetails)}</div>
                ) : null}
              </details>
            </div>
          )}
          {businessRequirementsRules && (
            <div>
              <details>
                <summary title="Business Requirements Rules">
                  Business Requirements Rules
                </summary>
                {businessRequirementsRules ? (
                  <div className="faq-content sidedesign" >{parse(businessRequirementsRules)}</div>
                ) : null}
              </details>
            </div>
          )}
          {developmentRequirementsRules && (
            <div>
              <details>
                <summary title="Development Requirements Rules">
                  Development Requirements Rules
                </summary>
                {developmentRequirementsRules ? (
                  <div
                    className="faq-content sidedesign">{parse(developmentRequirementsRules)}</div>
                ) : null}
              </details>
            </div>
          )}
          {authenticationDetails && (
            <div>
              <details>
                <summary title="Authentication information">
                  Authentication information
                </summary>
                {authenticationDetails ? (
                  <div className="faq-content sidedesign">{parse(authenticationDetails)}</div>
                ) : null}
              </details>
            </div>
          )}

          {endpointObject.rateLimitDetails && (
            <div>
              <details>
                <summary title="API Rate Limit information">
                  API Rate Limit information
                </summary>
                <p className="faq-content sidedesign">
                  {endpointObject.rateLimitDetails
                    ? parse(endpointObject.rateLimitDetails)
                    : null}
                </p>
              </details>
            </div>
          )}
          {responseMessageArray.length !== 0 && (
            <div>
              <details>
                <summary title="Authentication information">
                  Response Message
                </summary>
                {responseMessageArray.length !== 0 ? (
                  <>
                    <table class="table table-hover">
                      <thead className="b-1">
                        <tr>
                          <th scope="col"> s. no </th>
                          <th scope="col"> Response Mode type</th>
                          <th scope="col"> Status Code </th>
                          <th scope="col"> Condition </th>
                          <th scope="col">Payload</th>
                        </tr>
                      </thead>
                      {responseMessageArray.map((e) => {
                        let payload = JSON.stringify(e.payload);
                        return (
                          <>
                            <tbody>
                              <tr>
                                <td> {e.id}</td>
                                <td>{e.responseModeType}</td>
                                <td>{e.statusCode}</td>
                                <td>{e.condition}</td>
                                <td>
                                  {payload ? (
                                    <pre>
                                      <code>{payload}</code>
                                    </pre>
                                  ) : null}
                                </td>
                              </tr>
                            </tbody>
                          </>
                        );
                      })}
                    </table>
                  </>
                ) : // <div className="faq-content sidedesign" dangerouslySetInnerHTML={{
                  // 	__html: md().render(responseMessageArray[0].id),
                  // }}></div>

                  null}
              </details>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
