import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Input } from "reactstrap";
import Pagination from "react-js-pagination";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import { BiFilter } from "react-icons/bi";
import img1 from "../../Assets/images/No records.png";


const QUERY = (orderBy, orderDirection) => {
  return gql`
  query services(
    $page: Int
    $pageSize: Int
    $q: String
    $serviceMaster: String
    $user_idq: ID
  
  ) {
    services(
      filters: {
        name: { contains: $q }
        service_master: { name: { contains: $serviceMaster } }
        userId: { id: { eq: $user_idq } }
        isApproved: {eq: "rejected"}
      }
     sort:"${orderBy}:${orderDirection}"
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          userId {
            data {
              id
              attributes {
                username
                email
              }
            }
          }
          name
          slug
          shortDescription
          authorName
          isApproved
          status
          totalPoints
          isApplicableMVerticals
          techStackIntBusinessFocus
          reusableOpportinutity
          accuracy
          repoLinks
          flexibility
          type
          version
          authorEmail
          reviewerEmail
          documentation {
            data {
              id
              attributes {
                name
                url
              }
            }
          }
          service_master {
            data {
              id
            }
          }
        }
      }
      meta {
        pagination {
          page
          pageSize
          total
          pageCount
        }
      }
    }
  }
`;
};


const QUERY_service_masters = gql`
  query ServiceMasters($user_idq: ID) {
    serviceMasters(
      filters: {
        type: { eq: "service" }
        services: { userId: { id: { eq: $user_idq } } }
      }
      sort: "name:asc"
      pagination: { limit: 10000 }
    ) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const initialValues = {
  IsApplicableMVerticals: 0,
  TechStackIntBusinessFocus: 0,
  ReusableOpportinutity: 0,
  Accuracy: 0,
  Flexibility: 0
};
/**
 * @desc Handles admin array and registers admin
 * @returns Admin list and register admin modal
 */

const Rejected = (props) => {
  const navigate = useNavigate();
  let item = JSON.parse(localStorage.getItem("token"));
  // const [serviceType, setServiceType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [serviceMaster, setServiceMaster] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  let userData = JSON.parse(localStorage.getItem("user"));
  const [orderBy, setOrderBy] = useState("id");
  const [orderDirection, setOrderDirection] = useState("asc");

  const toggleSorting = (field) => {
    // Toggle sorting order if the field is already selected, else set to ascending
    if (field === orderBy) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrderDirection("asc");
    }
  };
  // ordering by manoj end
  setTimeout(() => {
    props.loader(false);
  }, 500);
  const [page, setPage] = useState(1);
  const pageSize = 20;


  
  useEffect(() => {
    const userId = userData?.id;

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then((res) => {
        setIsAdmin(res.data.isAdmin);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const setPageNo = (e) => {
    setTimeout(() => {
      setName();
    }, 100);
    setPage(e);
  };

  const setName = () => {
    console.log("change page", searchValue);
    let name = searchValue;
    refetch({ name });
  };

  const user_idq = isAdmin === true ? undefined : userData?.id;

  const { data, loading, error, refetch } = useQuery(
    QUERY(orderBy, orderDirection),
    {
      variables: { page, pageSize, user_idq },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );


  const service_master_object = useQuery(QUERY_service_masters, {
    variables: { user_idq },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  if (loading || service_master_object.loading) {
    props.loader(true);
  } else if (error || service_master_object.error) {
    return null;
  }
  const serviceArray = data?.services.data;
  const metaData = data?.services.meta;
  const serviceMasterData = service_master_object?.data?.serviceMasters.data;

  const onFilter = () => {
    let q = searchValue;
    let page = 1;
    refetch({ q, page, pageSize, serviceMaster });
  };

  const onReset = () => {
    setSearchValue("");
    setServiceMaster("");

    refetch({ q: "", page, pageSize, serviceMaster: "" });
  };


  const handleNaviagte = (path) => {
    localStorage.setItem("sideBarCss", 0);
    navigate(`${path}`);
  };



  

  return (
    <>
      <AuthenticatePages>
        <div className="container">
          <div style={{ marginTop: "15px" }}>
            <a
              onClick={() => handleNaviagte("/dashboard")}
              className="breadcrum"
            >
              Dashboard
            </a>{" "}
            》<a className="breadcrum">Rejected</a>
          </div>
          <h1 className="fs-2 fw-bold text-dark font_cern pt-4">Rejected</h1>
          <div className="d_flex g-10">
            {/* <Input
              placeholder="Choose Here.."
              type="select"
              onChange={(event) => {
                setServiceMaster(event.target.value);
              }}
              name="method"
              id="method"
              value={serviceMaster}
              style={{
                backgroundColor: "transparent",
                color: "black",
                width: "290px",
                margin: "22px 10px 22px 0px",
                height: "46px",
                borderRadius: "90px",
                border: "1px solid #828282",
              }}
            >
              <option value="">All Service Masters</option>

              {serviceMasterData?.map((e) => {
                return (
                  <>
                    <option value={e.attributes.name}>
                      {e.attributes.name}
                    </option>
                  </>
                );
              })}
            </Input> */}
            <Input
              placeholder="Search services name..."
              type="search"
              onChange={(event) => setSearchValue(event.target.value)}
              value={searchValue}
              className="searchicon"
              id="searchBarWidth"
              style={{
                backgroundColor: "transparent",
                color: "black",
                margin: "22px 10px 22px 0px",
                height: "46px",
                borderRadius: "90px",
                // border: "1px solid #609ef6",
              }}
            />

            <Button
              onClick={() => onFilter()}
              type="submit"
              className="bttn"
              id="bg_blue_2"
              style={{
                height: "46px",
                margin: "20px 0px",
              }}
            >
              <BiFilter
                style={{
                  width: "26px",
                  height: "24px",
                  flexShrink: "0",
                  verticalAlign: "middle",
                }}
              />
              <span>Apply Filter</span>
            </Button>
            <Button
              onClick={() => onReset()}
              type="submit"
              className="bttn"
              id="resetBttnColor"
              style={{
                height: "46px",
                width: "180px",
                borderRadius: "90px",
                margin: "20px 10px",
              }}
            >
              Reset
            </Button>           
          </div>
          <div>
            {serviceArray?.length !== 0 ? (
              <Table striped hover size="lg" id="table_info">
                <thead>
                  <tr>
                    <th style={{ width: "5%", cursor: "pointer" }} onClick={() => toggleSorting('id')}>
                      <div style={{ display: "flex" }}>
                        <div> Id </div>{" "}
                        {orderBy === "id" ? (
                          orderDirection === "asc" ? (
                            <div className="triangle-up "></div>
                          ) : (
                            <div className="down-arrow"> </div>
                          )
                        ) : (
                          ""
                        )}{" "}
                      </div>
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSorting("name")}
                    >
                      <div style={{ display: "flex" }}>
                        <div> Name </div>{" "}
                        {orderBy === "name" ? (
                          orderDirection === "asc" ? (
                            <div className="triangle-up "></div>
                          ) : (
                            <div className="down-arrow"> </div>
                          )
                        ) : (
                          ""
                        )}{" "}
                      </div>
                    </th>
                    {/* <th style={{ width: "30%" }}>Slug</th> */}
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSorting("authorName")}
                    >
                      <div style={{ display: "flex" }}>
                        <div>Author Name </div>{" "}
                        {orderBy === "authorName" ? (
                          orderDirection === "asc" ? (
                            <div className="triangle-up "></div>
                          ) : (
                            <div className="down-arrow"> </div>
                          )
                        ) : (
                          ""
                        )}{" "}
                      </div>
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSorting("type")}
                    >
                      <div style={{ display: "flex" }}>
                        <div>Type</div>{" "}
                        {orderBy === "type" ? (
                          orderDirection === "asc" ? (
                            <div className="triangle-up "></div>
                          ) : (
                            <div className="down-arrow"> </div>
                          )
                        ) : (
                          ""
                        )}{" "}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {serviceArray?.map((e, i) => {
                    return (
                      <>
                        <tr>
                          <td>{e.id}</td>
                          <td>{e.attributes.name}</td>
                          {/* <td>{e.attributes.slug}</td> */}
                          <td>{e.attributes.authorName}</td>
                          {/* <td>{e.attributes.status ? "Active": "Inactive"}</td> */}
                          <td>{e.attributes.type}</td>
                          

                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
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
          </div>
         
         
          <div style={{ marginTop: "-18px" }}>
            {serviceArray?.length !== 0 ? (
              <Pagination
                activePage={page}
                itemsCountPerPage={pageSize}
                totalItemsCount={metaData?.pagination?.total}
                onChange={setPageNo}
                pageRangeDisplayed={6}
                nextPageText="Next"
                prevPageText="Prev"
                firstPageText="⟨"
                lastPageText="⟩"
                itemClass="page-item"
                linkClass="page-link"
                activeClass="active"
                activeLinkClass="active"
                innerClass="pagination justify-content-end"
              />
            ) : null}
          </div>
        </div>
      </AuthenticatePages>
    </>
  );
};

export default Rejected;
