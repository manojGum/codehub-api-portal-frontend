/*  
  Admin Page: Fetch admin list, register admin modal display, logic and  validation has been handled here
*/
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "react-js-pagination";
import { gql, useQuery } from "@apollo/client";
import { Table, Button, Input } from "reactstrap";
import Swal from "sweetalert2";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { BiFilter } from "react-icons/bi";
import Tippy from "@tippyjs/react";
import img1 from "../../Assets/images/No records.png";
import axios from "axios";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import Switch from "../../component/ToggleButton.js/Switch";
import { SlPencil } from "react-icons/sl";
import { PiCopySimple } from "react-icons/pi";
import { AiOutlineEye } from "react-icons/ai";
import { GoCodeReview } from "react-icons/go";
import {FaSortDown} from "react-icons/fa"
import parse from "html-react-parser";

const QUERYservicemaster = gql`
  query ServiceTypeSnippet($q: String, $user_idq: ID) {
    serviceMasters(
      filters: {
        name: { contains: $q }
        type: { eq: "service" }
        services: { userId: { id: { eq: $user_idq } } }
      }
      sort: "name:asc"
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

const QUERYendpoint = (orderBy, orderDirection) => {
  return gql`
query Endpoints(
  $page: Int
  $pageSize: Int
  $service_name: String
  $name: String
  $user_idq: ID
) {
  endpoints(
    filters: {
      or: [{ services: { service_master: { name: { eq: $service_name } } } }]
      and: { name: { contains: $name } }
      userId: { id: { eq: $user_idq } }
    }
    sort: "${orderBy}:${orderDirection}"
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
        method
        version
        services {
          data {
            id
            attributes {
              name
              authorEmail
              status
              service_master {
                data {
                  id
                  attributes {
                    name
                  }
                }
              }
            }
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
// const QUERYendpoint = gql`
//   query Endpoints(
//     $page: Int
//     $pageSize: Int
//     $service_name: String
//     $name: String
//     $user_idq: ID
//   ) {
//     endpoints(
//       filters: {
//         or: [{ services: { service_master: { name: { eq: $service_name } } } }]
//         and: { name: { contains: $name } }
//         userId: { id: { eq: $user_idq } }
//       }
//       sort: "id:desc"
//       pagination: { page: $page, pageSize: $pageSize }
//     ) {
//       data {
//         id
//         attributes {
//           userId {
//             data {
//               id
//               attributes {
//                 username
//                 email
//               }
//             }
//           }
//           name
//           slug
//           method
//           version
//           services {
//             data {
//               id
//               attributes {
//                 name
//                 authorEmail
//                 status
//                 service_master {
//                   data {
//                     id
//                     attributes {
//                       name
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//       meta {
//         pagination {
//           page
//           pageSize
//           total
//           pageCount
//         }
//       }
//     }
//   }
// `;

const EndpointListing = (props) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  let userData = JSON.parse(localStorage.getItem("user"));
  // manoj start
  const [showModal, setShowModal] = useState(false);
  // review state added for modal
  const [emailto, setEmailto] = useState();
  const [emailbody, setEmailbody] = useState();
  const handleChange = (event) => {
    setEmailto(event.target.value);
  };
  const handleChangeemailbody = (event) => {
    setEmailbody(event);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const emailbodyconverted = parse(emailbody);
    console.log(emailbodyconverted.props.children, emailto);
    setEmailbody("");
    setEmailto("");
    setShowModal(false);
  };
  const closeModal = () => {
    setShowModal(false);
  };

  // manoj end

  // ordering by manoj start
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

  useEffect(() => {
    const userId = userData?.id;

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then(async (res) => {
        // console.log(res);
        await setIsAdmin(res.data.isAdmin);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const pageSize = 10;
  const setPageNo = (e) => {
    setTimeout(() => {
      setName()
    }, 100);
    setPage(e);
  };

  const setName = () => {
    let name = searchValue;
    refetch({ name });
   }

  let name;
  let id;
  let service_name;
  const user_idq = isAdmin === true ? undefined : userData?.id;

  const { data, loading, error, refetch } = useQuery(
    QUERYendpoint(orderBy, orderDirection),
    {
      variables: { page, pageSize, name, id, service_name, user_idq },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );

  const serviceMasterData = useQuery(QUERYservicemaster, {
    variables: { user_idq },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  if (loading || serviceMasterData.loading) {
    props.loader(true);
  } else if (error || serviceMasterData.error) {
    return null;
  }
  const endpointArray = data?.endpoints.data;
  const metaData = data?.endpoints.meta;

  const serviceMaster = serviceMasterData?.data?.serviceMasters.data;
  // const serviceMasterRefetch = serviceMasterData?.refetch;

  const onSearch = () => {
    let name = searchValue;
    let page = 1;
    let service_name = serviceType === "all" ? undefined : serviceType;
    refetch({ service_name, name, page });
  };

  const onReset = () => {
    refetch({ service_name, name });
    setServiceType("");
    setSearchValue("");
  };
  const handleStatusClick = async (e) => {
    const id = await e?.attributes?.services?.data[0]?.id;
    let status = await !e?.attributes?.services?.data[0]?.attributes?.status;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to change status",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2368ca",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      width: "25%",
      height: "25%",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACK_END_API_URL}/services/${id}`,
          {
            data: {
              status: status,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        refetch(response);
      } catch (error) {
        console.log("error", error);
      }
    }
  };
  return (
    <>
      <AuthenticatePages>
        <div className="container pt-2">
          <div style={{ marginTop: "15px" }}>
            <a className="breadcrum" onClick={() => navigate("/dashboard")}>
              Dashboard
            </a>{" "}
            》
            <a className="breadcrum" onClick={() => navigate("/service")}>
              Services
            </a>{" "}
            》<a className="breadcrum">Endpoints</a>
          </div>
          <h1 className="fs-2 fw-bold text-dark font_cern pt-4">Endpoints</h1>
          <div className="d_flex g-10">
            <Input
              placeholder="Choose Here.."
              type="select"
              name="method"
              id="method"
              onChange={(event) => {
                setServiceType(event.target.value);
              }}
              value={serviceType}
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
              <option
                className="form-control"
                style={{
                  color: "black",
                  backgroundColor: "transparent",
                }}
              >
                Choose services...
              </option>
              <option
                className="form-control"
                style={{
                  color: "black",
                  backgroundColor: "transparent",
                }}
                value="all"
              >
                All
              </option>

              {serviceMaster?.map((item) => {
                return (
                  <>
                    <option
                      className="form-control"
                      key={item.id}
                      value={item.name}
                    >
                      {item?.attributes?.name}
                    </option>
                  </>
                );
              })}
            </Input>
            {/* <div
              className="input_group searchBox"
              style={{
                backgroundColor: "transparent",
                color: "black",
                width: "230px",
                margin: "20px 10px 20px 0px",
                borderRadius: "7px",
                border: "1px solid #ced4da",
              }}
            >
              <Input
                onChange={(event) => setSearchValue(event.target.value)}
                id="form-input"
                className="text-dark bg-light form-control"
                type="search"
                placeholder="Search endpoints name..."
                aria-label="search"
                value={searchValue}
              /> 
            </div> */}
            <Input
              placeholder="Search endpoints name..."
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
              type="submit"
              onClick={() => onSearch()}
              className="bttn"
              id="bg_blue"
              style={{
                height: "46px",
                width: "180px",
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
              type="submit"
              onClick={() => onReset()}
              className="bttn"
              id="resetBttnColor"
              style={{
                height: "46px",
                width: "180px",
                margin: "20px 0px",
              }}
            >
              Reset
            </Button>

            <Tippy
              interactive={true}
              delay={100}
              content={
                <span
                  style={{
                    background: "black",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px 10px 10px 10px",
                  }}
                >
                  <span>Add Endpoint</span>
                </span>
              }
            >
              <div
                className="ms-auto"
                onClick={() => {
                  localStorage.removeItem("actionType");
                  navigate("/endpoint/add");
                }}
              >
                <BsFillPlusCircleFill
                  size={30}
                  style={{
                    cursor: "pointer",
                    marginTop: "27px",
                    marginRight: "30px",
                  }}
                  id="slPlusIcon"
                />
              </div>
            </Tippy>
          </div>
          <div>
            {endpointArray?.length !== 0 ? (
              <Table striped hover size="lg" id="table_info">
                <thead>
                  <tr>
                    <th
                      style={{ width: "3%", cursor: "pointer" }} onClick={() => toggleSorting("id")} >Id {orderBy === 'id' ? (orderDirection === 'asc' ? <span>▲</span> : <span>▼</span> ) : ''} </th>
                    <th
                      style={{cursor: "pointer" }}
                      onClick={() => toggleSorting("name")}
                    >
                      Name
                      {orderBy === 'name' ? (orderDirection === 'asc' ?  <span>▲</span> : <span>▼</span> ) : ''}
                    </th>
                    {/* <th>Slug</th> */}
                    <th>Service</th>
                    <th  style={{ cursor: "pointer" }}
                      onClick={() => toggleSorting("version")} >Version {orderBy === "version"
                        ? (orderDirection === "asc"
                        ? <span>▲</span> : <span>▼</span> ): ""}
                    </th>
                    <th >Status
                  </th>

                    <th style={{ padding: "12px 0px" }}>method</th>
                    <th style={{ padding: "12px 15px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {endpointArray?.map((e, i) => {
                    return (
                      <>
                        <tr>
                          <td>{e.id}</td>
                          <td>{e?.attributes?.name}</td>
                          {/* <td>{e?.attributes?.slug}</td> */}
                          <td>
                            {e?.attributes?.services?.data?.length !== 0 ? (
                              e?.attributes?.services?.data[
                                e?.attributes?.services?.data?.length - 1
                              ].attributes?.name
                            ) : (
                              <p>NA</p>
                            )}
                          </td>
                          <td>{e?.attributes?.version}</td>
                          {/* <td>{e.attributes.status ? "Active": "Inactive"}</td> */}
                          <td>
                            {isAdmin ? (
                              <div
                                className="status"
                                style={{
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  handleStatusClick(e);
                                }}
                              >
                                {/* <div
                                  style={{
                                    color: e?.attributes?.services?.data[0]
                                      ?.attributes?.status
                                      ? "green"
                                      : "red",
                                  }}
                                >
                                  {e?.attributes?.services?.data[0]?.attributes
                                    ?.status
                                    ? "Active"
                                    : "Inactive"}
                                </div> */}
                                <Switch
                                  rounded={true}
                                  isToggled={
                                    e?.attributes?.services?.data[0]?.attributes
                                      ?.status
                                      ? "checked"
                                      : ""
                                  }
                                  isAdmin={isAdmin}
                                />
                              </div>
                            ) : (
                              // <div
                              //   style={{
                              //     color: e?.attributes?.services?.data[0]
                              //       ?.attributes?.status
                              //       ? "green"
                              //       : "red",
                              //   }}
                              // >
                              //   {e?.attributes?.services?.data[0]?.attributes
                              //     ?.status
                              //     ? "Active"
                              //     : "Inactive"}
                              // </div>
                              <Switch
                                rounded={true}
                                isToggled={
                                  e?.attributes?.services?.data[0]?.attributes
                                    ?.status
                                    ? "checked"
                                    : ""
                                }
                                isAdmin={isAdmin}
                              />
                            )}
                          </td>
                          <td>{e?.attributes?.method}</td>
                          <td>
                            <td
                              id="copy_icon"
                              style={{ borderColor: "transparent" }}
                            >
                              <Tippy
                                interactive={true}
                                delay={100}
                                content={
                                  <span
                                    style={{
                                      background: "black",
                                      color: "white",
                                      borderRadius: "10px",
                                      padding: "10px 10px 9px 10px",
                                    }}
                                  >
                                    <span>View</span>
                                  </span>
                                }
                              >
                                <div
                                  onClick={() => {
                                    localStorage.setItem("eflag", 2);
                                    navigate(`/endpoint-details/${e?.id}`);
                                  }}
                                >
                                  <AiOutlineEye size="20" />
                                </div>
                              </Tippy>
                            </td>

                            <td
                              id="copy_icon"
                              style={{ borderColor: "transparent" }}
                            >
                              <Tippy
                                interactive={true}
                                delay={100}
                                content={
                                  <span
                                    style={{
                                      background: "black",
                                      color: "white",
                                      borderRadius: "10px",
                                      padding: "10px 10px 9px 10px",
                                    }}
                                  >
                                    <span>Copy</span>
                                  </span>
                                }
                              >
                                <div
                                  onClick={() => {
                                    localStorage.setItem("actionType", "copy");
                                    navigate({
                                      pathname: "add",
                                      search: `?id=${e.id}`,
                                    });
                                  }}
                                >
                                  {/* <FaCopy /> */}
                                  <PiCopySimple
                                    size="16"
                                    strokeWidth="5"
                                    color="#0099FA"
                                  />
                                </div>
                              </Tippy>
                            </td>
                            <td
                              id="copy_icon"
                              style={{ borderColor: "transparent" }}
                            >
                              {isAdmin ? (
                                <Tippy
                                  interactive={true}
                                  delay={100}
                                  content={
                                    <span
                                      style={{
                                        background: "black",
                                        color: "white",
                                        borderRadius: "10px",
                                        padding: "10px 10px 9px 10px",
                                      }}
                                    >
                                      <span>Edit</span>
                                    </span>
                                  }
                                >
                                  <div
                                    onClick={() => {
                                      localStorage.setItem(
                                        "actionType",
                                        "edit"
                                      );
                                      navigate(`/endpoint/edit/${e.id}`);
                                    }}
                                  >
                                    <SlPencil
                                      size="16"
                                      color="#8BC440"
                                      strokeWidth="30"
                                    />
                                  </div>
                                </Tippy>
                              ) : userData?.email ===
                                  e?.attributes?.userId?.data?.attributes
                                    ?.email &&
                                e?.attributes?.services?.data[0]?.attributes
                                  ?.status === false ? (
                                <Tippy
                                  interactive={true}
                                  delay={100}
                                  content={
                                    <span
                                      style={{
                                        background: "black",
                                        color: "white",
                                        borderRadius: "10px",
                                        padding: "10px 10px 9px 10px",
                                      }}
                                    >
                                      <span>Edit</span>
                                    </span>
                                  }
                                >
                                  <div
                                    onClick={() => {
                                      localStorage.setItem(
                                        "actionType",
                                        "edit"
                                      );
                                      navigate(`/endpoint/edit/${e.id}`);
                                    }}
                                  >
                                    <SlPencil
                                      size="16"
                                      color="#8BC440"
                                      strokeWidth="30"
                                    />
                                  </div>
                                </Tippy>
                              ) : null}
                            </td>
                            {/* modal Reviewer table  */}

                            {/* <td
                              id={isAdmin ? "copy_icon" : ""}
                              style={{ borderColor: "transparent" }}
                            >
                              {isAdmin ? (
                                <div>
                                  <Tippy
                                    interactive={true}
                                    delay={100}
                                    content={
                                      <span
                                        style={{
                                          background: "black",
                                          color: "white",
                                          borderRadius: "10px",
                                          padding: "10px 10px 9px 10px",
                                        }}
                                      >
                                        Assign Reviewer
                                      </span>
                                    }
                                  >
                                    <div
                                      onClick={(e) => {
                                        setShowModal(!showModal);
                                      }}
                                    >
                                      <GoCodeReview size="18" />
                                    </div>
                                  </Tippy>
                                </div>
                              ) : (
                                <div>
                                  <Tippy
                                    interactive={true}
                                    delay={100}
                                    content={
                                      <span
                                        style={{
                                          background: "black",
                                          color: "white",
                                          borderRadius: "10px",
                                          padding: "10px 10px 9px 10px",
                                        }}
                                      >
                                        Assign Reviewer
                                      </span>
                                    }
                                  >
                                    <div>
                                      <GoCodeReview size="18" />
                                    </div>
                                  </Tippy>
                                </div>
                              )}
                            </td> */}
                            {/* ff */}
                          </td>
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
          {/* //  Assign Reviewer modal end */}
          {/* <div>
            <Modals
              headerName="Assign Reviewer"
              showModal={showModal}
              closeModal={closeModal}
              width="60%"
            >
              <div className="">
                <div>
                  <div className="">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="row">
                        <div className="col">
                          <label>To Email</label>
                          <input
                            type="email"
                            name="ToEmail"
                            id="email"
                            placeholder="type Email..."
                            className="form-control2"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            value={emailto}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col">
                          <label for="emailbody">Email Body</label>

                          <ReactQuill
                            theme="snow"
                            style={{
                              height: "200px",
                              width: "100%",
                              marginBottom: "80px",
                            }}
                            id="EmailBody"
                            name="emailbody"
                            placeholder="Enter message here..."
                            onChange={handleChangeemailbody}
                            value={emailbody}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="addButton"
                        id="bg_blue"
                        style={{
                          width: "120px",
                          marginLeft: "15px",
                        }}
                      >
                        Sent
                      </Button>
                      <Button
                        style={{
                          width: "120px",
                          marginLeft: "10px",
                        }}
                        className="addButton"
                        id="resetBttnColor"
                        onClick={closeModal}
                      >
                        Close
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </Modals>
          </div> */}
          {/* //  Assign Reviewer modal end */}
          {endpointArray?.length !== 0 ? (
            <Pagination
              activePage={page}
              itemsCountPerPage={pageSize}
              totalItemsCount={metaData?.pagination.total}
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
      </AuthenticatePages>
    </>
  );
};
export default EndpointListing;
