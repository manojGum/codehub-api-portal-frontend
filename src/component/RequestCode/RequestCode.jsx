import { useState } from "react";
import md from "markdown-it";
export const RequestCode = ({ apiRequest }) => {
  const [requestLanguage, setRequestLanguage] = useState(
    apiRequest[0].language
  );
  const [requestCode, setRequestCode] = useState(apiRequest[0].requests);

  const OnRequestLanguageChange = (e) => {
    const language = e.target.value;
    setRequestLanguage(e.target.value);
    setRequestCode(
      apiRequest.filter((e) => language === e.language)[0].requests
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          borderBottom: "2px solid gray",
          backgroundColor: "black",
          padding: "10px",
        }}
      >
        <select
          onChange={OnRequestLanguageChange}
          value={requestLanguage}
          style={{
            backgroundColor: "#3d3a3a",
            color: "white",
            padding: "5px",
          }}
        >
          {apiRequest.map((apiRequest) => {
            {
              return (
                <option value={apiRequest.language} key={apiRequest.id}>
                  {apiRequest.language}
                </option>
              );
            }
          })}
        </select>
      </div>
      <div
        style={{
          backgroundColor: "black",
          padding: "10px",
          color: "white"          
        }}
        dangerouslySetInnerHTML={{ __html: requestCode }}
      ></div>
    </div>
  );
};
