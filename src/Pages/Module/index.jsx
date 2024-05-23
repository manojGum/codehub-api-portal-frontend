import React, { useEffect, useState } from "react";
import Pagination from "react-js-pagination";
import { useQuery } from "@apollo/client";
import { serviceType, serviceTypeServices, userData } from "./service";
import { useNavigate, useParams } from "react-router-dom";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import "./Module.css";
import { AiOutlineEye } from "react-icons/ai";
import img1 from "../../Assets/images/No records.png";
import Moment from "react-moment";
import parse from "html-react-parser";

/*
 * @desc Handles admin array and registers admin
 * @returns Admin list and register admin modal
 */

const Module = (props) => {
  const router = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const author_email = localStorage.getItem("authorEmail");
  setTimeout(() => {
    props.loader(false);
  }, 500);

  let myquery = router?.id;
  // let type = "service";
  let pageSize = 10;
  const setPageNo = (e) => {
    setPage(e);
  };
  useEffect(() => {
    setPage(1)
  }, [myquery])
  let resultArray;

  let value1;
  let value2;
  let heading;
  if (myquery === "1") {
    value1 = "serviceMasters";
    heading = "Services";
    value2 = "service";
  } else if (myquery === "2") {
    heading = "Snippets";

    value1 = "services";
    value2 = "snippet";
  } else if (myquery === "3") {
    heading = "PoCs";

    value1 = "services";
    value2 = "poc";
  } else if (myquery === "4") {
    heading = "Packages";
    value1 = "services";
    value2 = "package";
  }

  resultArray = useQuery(
    myquery === "1"
      ? serviceType(value1, value2)
      : ( myquery === "5" ? userData(author_email) : serviceTypeServices(value1, value2) ),
    {
      variables: { page, pageSize },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );

  const { data, loading, error } = resultArray;

  if (loading) {
    props.loader(true);
    return null;
  }

  if (error) {
    return null;
  }

  const servicesArray =
    myquery === "1" ? data?.serviceMasters?.data : data?.services?.data;
  const metaArray =
    myquery === "1" ? data?.serviceMasters?.meta : data?.services?.meta;

  const addEllipsis = (str, limit) => {
    return str?.length > limit ? str?.substring(0, limit) + "..." : str;
  };

  if(myquery === "5"){
    heading = servicesArray[0]?.attributes?.authorName
  }

  const handleAuthorCreation = (e, servicesArray) => {
    localStorage.setItem("authorEmail",(servicesArray?.__typename ===
      "ServiceEntity" ? servicesArray?.attributes?.authorEmail : servicesArray?.attributes?.services
      ?.data[0]?.attributes?.authorEmail))
       navigate(`/module/5`);

       e.stopPropagation()
  }

  return (
    <>
      <AuthenticatePages>
        <div>
          <h1>{heading}</h1>
          {metaArray.pagination.total === 0 && (
            <div className="NoDataFoundDiv">
              <img
                src={img1}
                className="NoDataFoundImg"
                alt=""
                style={{ textAlign: "center" }}
              />
              <h1 className="NoDataFound">No Data Found!</h1>
            </div>
          )}
          {servicesArray?.length !== 0 ? (
            <div className="mapingDiv">
              {servicesArray?.map((servicesArray) => {
                return (
                  <>
                    {((servicesArray?.__typename === "ServiceEntity") ||
                      (servicesArray?.__typename === "ServiceMasterEntity" )) && (
                        <div key={servicesArray.id} className="card">
                          <div>
                            <div style={{ maxWidth: "1200px" }}>
                              <div>
                                <div>
                                  <div>
                                    <div>
                                      <h1 className="title">
                                        {servicesArray.attributes.name} 
                                        {
                                          myquery === "5" && <span className="myquery5span" >{servicesArray.attributes.type}</span>
                                        }
                                        
                                      </h1>
                                    </div>
                                    {servicesArray?.__typename ===
                                      "ServiceEntity" ? (
                                      <p className="shortDescription">
                                        {servicesArray.attributes.description !==
                                          null &&
                                          parse(
                                            addEllipsis(
                                              servicesArray.attributes
                                                .description,
                                              50
                                            )
                                          )}
                                      </p>
                                    ) : (
                                      <p className="shortDescription">
                                        {servicesArray?.attributes?.services
                                          ?.data[0]?.attributes?.description !=
                                          null &&
                                          parse(
                                            addEllipsis(
                                              servicesArray?.attributes?.services
                                                ?.data[0]?.attributes
                                                ?.description,
                                              50
                                            )
                                          )}
                                      </p>
                                    )}

                                    <div className="author" >
                                      <div style={{cursor:"pointer"}} onClick={(e)=> handleAuthorCreation(e, servicesArray)}>
                                      Author : &nbsp;
                                      <span style={{ color: "#2368CA" }}>
                                        {servicesArray?.__typename ===
                                          "ServiceEntity"
                                          ? servicesArray?.attributes?.authorName
                                          : servicesArray?.attributes?.services
                                            ?.data[0]?.attributes?.authorName}
                                      </span>
                                      </div>
                                      <div className="author publish">
                                        Published on:{" "}
                                        <Moment fromNow>
                                          {servicesArray?.attributes?.publishedAt}
                                        </Moment>
                                      </div>
                                      <div className="cardIcons">
                                        <div
                                          onClick={() => {
                                            props.loader(true);
                                            localStorage.setItem("eflag", 1)
                                            navigate(
                                              `/service/${servicesArray.attributes.slug}`
                                            );
                                          }}
                                        >
                                          <AiOutlineEye className="Icon" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </>
                );
              })}
            </div>
          ) : null
            // <h1 style={{ textAlign: "center" }}>No data found</h1>
          }
          {servicesArray?.length !== 0 && metaArray.pagination.total !== 0 ? (
            <Pagination
              activePage={page}
              itemsCountPerPage={pageSize}
              totalItemsCount={metaArray.pagination.total}
              onChange={setPageNo}
              pageRangeDisplayed={6}
              prevPageText="Prev"
              nextPageText="Next"
              firstPageText="⟨"
              lastPageText="⟩"
              itemClass="page-item"
              linkClass="page-link"
              activeClass="active"
              activeLinkClass="active"
              innerClass="pagination justify-content-center"
            />
          ) : null}
        </div>
      </AuthenticatePages>
    </>
  );
};

export default Module;
