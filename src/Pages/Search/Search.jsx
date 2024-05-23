import React, { useState } from "react";
import Moment from "react-moment";
import { useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import Tippy from "@tippyjs/react";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import { QUERYservice, QUERYendpoint } from "./Service";
import styles from "./Search.module.css";
import img1 from '../../Assets/images/No records.png'
// const QUERYservices = gql`
//   query Services($q: String) {
//     services(
//       filters: { name: { contains: $q } }
//       sort: "id:desc"
//       pagination: { start: 0, limit: 100 }
//     ) {
//       data {
//         id
//         attributes {
//           publishedAt
//           shortDescription
//           name
//           type
//           authorName
//           authorEmail
//           repoLinks
//           tags {
//             name
//           }
//         }
//       }
//       meta {
//         pagination {
//           page
//           pageSize
//           pageCount
//           total
//         }
//       }
//     }
//   }
// `;

// const QUERYendpoint = gql`
//   query endpointMasters($q: String) {
//     endpointMasters(
//       filters: { name: { contains: $q } }
//       pagination: { page: 1, pageSize: 10 }
//     ) {
//       data {
//         id
//         attributes {
//           publishedAt
//           shortDescription
//           name
//           method
//         }
//       }
//       meta {
//         pagination {
//           page
//           pageSize
//           pageCount
//           total
//         }
//       }
//     }
//   }
// `;

/**
 * @desc Handles admin array and registers admin
 * @returns Admin list and register admin modal
 */

const Search = ({ loader }) => {
  const [change, setChange] = useState("1");
  const router = useParams();
  const q = router.query;
  const navigate = useNavigate();

  setTimeout(() => {
    loader(false);
  }, 500);

  const selectChange = (e) => {
    setChange(e.target.value);
  };
  let value1;
  let value2;
  if (change === "1") {
    value1 = "1";
  } else if (change === "2") {
    value1 = "2";
    value2 = "service";
  } else if (change === "3") {
    value1 = "2";
    value2 = "snippet";
  } else if (change === "4") {
    value1 = "2";
    value2 = "poc";
  } else if (change === "5") {
    value1 = "2";
    value2 = "package";
  }
  const servicesObject = useQuery(QUERYservice(value1, value2), {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { q },
  });

  const endpointsObject = useQuery(QUERYendpoint(), {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { q },
  });

  if (servicesObject.loading || endpointsObject.loading) {
    loader(true)
    return null;
  }

  if (servicesObject.error || endpointsObject.error) {
    return null;
  }

  const resultsServices = servicesObject?.data?.services.data;
  const resultsEndpoints = endpointsObject?.data?.endpointMasters.data;

  const addEllipsis = (str, limit) => {
    return str?.length > limit ? str.substring(0, limit) + "..." : str;
  };

  return (
    <>
      <AuthenticatePages>
        <div style={{ top: "30px", marginTop: "30px" }}>
          <select onChange={selectChange} className={styles.searchSelect}>
            <option value="1" className={styles.vijit}>
              All Services
            </option>
            <option value="2" className={styles.vijit}>
              Service
            </option>
            <option value="3" className={styles.vijit}>
              Snippet
            </option>
            <option value="4" className={styles.vijit}>
              PoCs
            </option>
            <option value="5" className={styles.vijit}>
              Packages
            </option>
          </select>
        </div>
        {resultsEndpoints?.length !== 0 || resultsServices?.length !== 0 ? (
          <div className="">
            <h1 className="" style={{ fontWeight: "bold" }}>
              Search Page :
            </h1>
            <div>
              <h2>
                Results from{" "}
                {change === "1"
                  ? "Services, Snippets, Pocs & Packages"
                  : change === "2"
                    ? "Services"
                    : change === "3"
                      ? "Snippets"
                      : change === "4"
                        ? "POCS"
                        : "Packages"}
              </h2>
              {resultsServices?.length !== 0 ? (
                <div className="mapingDiv">
                  {resultsServices?.map((results) => {
                    return (
                      <>
                        <div
                          key={results.id}
                          className="card"
                          onClick={() => navigate(`/service/${results?.id}`)}
                          style={{ maxWidth: "1200px" }}
                        >
                          <div className="">
                            <div
                              className="d_flex"
                              style={{ justifyContent: "space-between" }}
                            >
                              <h1 className="title">
                                {results.attributes.name}
                              </h1>
                              <div
                                className="text-decoration-none   search_card_author typeTag active"
                                title={results.attributes.type}
                              >
                                {results.attributes.type}
                              </div>
                            </div>
                          </div>

                          <p className="shortDescription mb-1">
                            {addEllipsis(
                              results.attributes.shortDescription,
                              65
                            )}
                          </p>

                          <div className="">
                            <div className="">
                              <div
                                className="author"
                                style={{ padding: "5px 0px 0px 15px" }}
                              >
                                Author : &nbsp;
                                <Tippy
                                  interactive={true}
                                  delay={100}
                                  content={
                                    <span
                                      style={{
                                        background: "#2368CA",
                                        color: "white",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        marginLeft: "10px",
                                      }}
                                    >
                                      <span>
                                        {results.attributes.authorEmail}
                                      </span>
                                    </span>
                                  }
                                >
                                  <a
                                    href="#"
                                    className="mt-1 text-decoration-none text-capitalize"
                                    title={results.attributes.authorName}
                                  >
                                    {results.attributes.authorName}
                                  </a>
                                </Tippy>
                              </div>
                              <div
                                className="author"
                                style={{ padding: "0px 0px 10px 15px" }}
                              >
                                Published on : &nbsp;
                                <Moment fromNow>
                                  {results.attributes.publishedAt}
                                </Moment>
                              </div>
                            </div>

                            <div
                              className="cardIcons shortDescription mb-2"
                              onClick={() =>{
                                loader(true)
                                navigate(`/service/${results.attributes.slug}`)
                              }}
                            >
                              <AiOutlineEye className="Icon" />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              ) : (
                <>
                  <h3>
                    No Data Found For Keyword :{" "}
                    <span style={{ color: "red", fontSize: "20px" }}>{q}</span>
                  </h3>
                </>
              )}
            </div>
            <div>
              <br></br>
              {resultsEndpoints?.length !== 0 ? (
                <div>
                  <h2>Results From Endpoints</h2>
                  {resultsEndpoints?.length !== 0 ? (
                    <div className="mapingDiv">
                      {resultsEndpoints?.map((results) => {
                        return (
                          <>
                            <div
                              key={results.id}
                              className="card"
                              onClick={() =>
                                navigate(`/endpoint-details/${results?.id}`)
                              }
                              style={{ maxWidth: "1200px" }}
                            >
                              <div className="">
                                <div
                                  className="d_flex"
                                  style={{ justifyContent: "space-between" }}
                                >
                                  <h1 className="title">
                                    {results.attributes.name}
                                  </h1>
                                  <div
                                    className="text-decoration-none   search_card_author typeTag text-bg-success"
                                    title={results.attributes.method}
                                  >
                                    {results.attributes.method}
                                  </div>
                                </div>
                              </div>
                              <p className="shortDescription mb-1">
                                {addEllipsis(
                                  results.attributes.shortDescription,
                                  65
                                )}
                              </p>
                              <div className="">
                                <div
                                  className=""
                                  style={{ padding: "5px 0px 0px 5px" }}
                                >
                                  {/* <div
                                  className="author"
                                  style={{ padding: "5px 0px 0px 15px" }}
                                >
                                  Author : &nbsp;
                                  <Tippy
                                    interactive={true}
                                    delay={100}
                                    content={
                                      <span
                                        style={{
                                          background: "#2368CA",
                                          color: "white",
                                          borderRadius: "10px",
                                          padding: "10px",
                                          marginLeft: "10px",
                                        }}
                                      >
                                        <a>{results.attributes.authorEmail}</a>
                                      </span>
                                    }
                                  >
                                    <a
                                      href="#"
                                      className="mt-1 text-decoration-none text-capitalize"
                                      title={results.attributes.authorName}
                                    >
                                      {results.attributes.authorName}
                                    </a>
                                  </Tippy>
                                </div> */}
                                  <div
                                    className="author"
                                    style={{ padding: "0px 0px 10px 15px" }}
                                  >
                                    Published on : &nbsp;
                                    <Moment fromNow>
                                      {results.attributes.publishedAt}
                                    </Moment>
                                  </div>
                                </div>

                                <div
                                  className="cardIcons shortDescription mb-2"
                                  onClick={() =>
                                    navigate(
                                      `/endpoint/${results.attributes.id}`
                                    )
                                  }
                                >
                                  <AiOutlineEye className="Icon" />
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="NoDataFoundDiv">
                        <img src={img1} className="NoDataFoundImg" alt="" style={{ textAlign: "center" }} />
                        <h2 style={{ marginLeft: "-130px" }}>
                          {`No results found for keyword : `}{" "}
                          <span style={{ color: "red", fontSize: "25px" }}>{q}</span>
                        </h2>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="NoDataFoundDiv">
            <img src={img1} className="NoDataFoundImg" alt="" style={{ textAlign: "center" }} />
            <h2 style={{ marginLeft: "-130px" }}>
              {`No results found for keyword : `}{" "}
              <span style={{ color: "red", fontSize: "25px" }}>{q}</span>
            </h2>
          </div>
        )}
      </AuthenticatePages>
    </>
  );
};

export default Search;
