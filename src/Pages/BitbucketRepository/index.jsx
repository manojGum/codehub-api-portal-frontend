import React, { useState, useEffect } from "react";
import { Table, Button, Input } from "reactstrap";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import Swal from "sweetalert2";
import Pagination from "react-js-pagination";
import "react-quill/dist/quill.snow.css";
import Switch from "../../component/ToggleButton.js/Switch";
import img1 from "../../Assets/images/No records.png";
import { BiFilter } from "react-icons/bi";
import Tippy from "@tippyjs/react";
import { BsFillPlusCircleFill } from "react-icons/bs";

const QUERYbitbucket = gql`
  query bitbucketReqeustHistories($page: Int, $pageSize: Int) {
    bitbucketReqeustHistories( pagination: { page: $page, pageSize: $pageSize },
      sort:"createdAt:desc"){
      data{
        id
        attributes{
          createdAt
          status
          serviceId{
            data{
              id
              attributes{
                name
                repoLinks
              }
            }
          }
          userId{
            data{
              id
              attributes{
                username
              }
            }
          }
        }
      },
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

const PackageLisiting = (props) => {
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;
  // const [packageId, setPackageId] = useState(null);
  const [page, setPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  setTimeout(() => {
    props.loader(false);
  }, 500);
  const pageSize = 10;
  const setPageNo = (e) => {
    setPage(e);
  };
  useEffect(() => {

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then((res) => {
        setIsAdmin(res?.data?.isAdmin);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  let name = "";
  // const user_idq = isAdmin === true ? undefined : userData?.id;
  const { data, loading, error, refetch } = useQuery(QUERYbitbucket, {
    variables: { page, pageSize, name},
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });
  
  if (loading) {
    props.loader(true)
    return null;
  } else if (error) {
    return null;
  }

  function formatDate(inputDate) {
    const parts = inputDate.split("-");
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return formattedDate;
  }

  const onReset = () => {
    refetch({ name });
    setSearchValue("");
  };

  const handleStatusClick = async (e) => {
    const id = e.id; // No need for await here, as id is not a Promise
    var status ;
    // console.log("handleStatusClick",e.attributes.status)
    if(e.attributes.status==="requested"){
      status="request_given"
    }else{
      status ="requested"
    }
    // console.log("handleStatusClick2",status)

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to change status",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2368ca",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      width: "20%",
      height: "20%",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACK_END_API_URL}/bitbucket-reqeust-histories/${id}`,
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
        console.log("status error", error);
      }
    }
  };

  const onSearch = () => {
    let name = searchValue;
    let page = 1;
    refetch({ name, page });
  };


  const bitbucketArray = data?.bitbucketReqeustHistories?.data;
  const metaData = data?.bitbucketReqeustHistories?.meta;
  return (
    <>
      <AuthenticatePages>
        <div className="container pt-2">
         
          <h1 className="fs-2 fw-bold text-dark font_cern pt-4">Bitbucket Repository Access Histories</h1>
          <div className="d_flex g-10">
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
              className="bttn ms-4"
              id="resetBttnColor"
              style={{
                height: "46px",
                width: "180px",
                margin: "20px 0px",
              }}
            >
              Reset
            </Button>

            {/* <Button
              className="bttn ms-auto"
              id="bg_blue"
              style={{
                height: "50px",
                width: "120px",
                margin: "20px",
              }}
              onClick={(e) => {
                localStorage.removeItem("actionType");
                setSnippetId(null);
                setShowModal(!showModal);
              }}
            >
              + Add
            </Button> */}
         
          </div>
          <div>
            {bitbucketArray?.length !== 0 ? (
              <Table striped hover size="lg" id="table_info">
                <thead>
                  <tr>
                    <th style={{ width: "1%" }}>Id</th>
                    <th>User</th>
                    <th>Service</th>
                    <th>Bitbucket URL</th>
                    <th>Status</th>
                    <th>Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bitbucketArray?.map((e, i) => {
                     const createdDate = e.attributes.createdAt.split("T")[0];
                     const formattedDate = formatDate(createdDate);
                    return (
                      <>
                        <tr id={i}>
                          <td>{e.id}</td>
                          <td>{e.attributes.userId.data.attributes.username}</td>
                          <td>{e.attributes.serviceId.data.attributes.name}</td>
                          <td>{e.attributes.serviceId.data.attributes.repoLinks}</td>
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
                                <Switch
                                  rounded={true}
                                  isToggled={
                                    e.attributes.status==="request_given" ? "checked" : ""
                                  }
                                />
                              </div>
                            ) : (
                              <Switch
                                rounded={true}
                                isToggled={e.attributes.status==="request_given" ? "checked" : ""}
                              />
                            )}
                          </td>
                          <td>{formattedDate}</td>
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
          {bitbucketArray?.length !== 0 ? (
            <Pagination
              activePage={page}
              itemsCountPerPage={pageSize}
              totalItemsCount={metaData?.pagination?.total}
              onChange={setPageNo}
              pageRangeDisplayed={3}
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

export default PackageLisiting;
