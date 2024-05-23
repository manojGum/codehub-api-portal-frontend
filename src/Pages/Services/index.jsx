import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Input } from "reactstrap";
import { SlPencil } from "react-icons/sl";
import { PiCopySimple } from "react-icons/pi";
import Pagination from "react-js-pagination";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import Swal from "sweetalert2";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { GoProjectSymlink } from "react-icons/go";
import { BiLink } from "react-icons/bi";
import { BiFilter } from "react-icons/bi";
import Tippy from "@tippyjs/react";
import { IoIosArrowForward } from "react-icons/io";
import Switch from "../../component/ToggleButton.js/Switch";
import img1 from "../../Assets/images/No records.png";
import { GoCodeReview } from "react-icons/go";
import Modals from "../../component/Modal";
import {RiChatCheckLine} from "react-icons/ri"
import parse from "html-react-parser";
import {BiGitPullRequest} from "react-icons/bi"
import { FaMedal } from "react-icons/fa";
import { successInputSwal, invalidInputSwal } from "../../component/Swal";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";

const QUERY = (orderBy, orderDirection) => {
  return gql`
  query services(
    $page: Int
    $pageSize: Int
    $q: String
    $serviceMaster: String
    $user_idq: ID
    $userEmail:String
  
  ) {
    services(
      filters: {
        type: { contains: "service" }
        name: { contains: $q }
        service_master: { name: { contains: $serviceMaster } }
       or: [
          { userId: { id: { eq: $user_idq } } },
          { reviewerEmail: { eq: $userEmail } }
        ]
        and:{or:[{  isApproved:{notNull:false}}, { isApproved: { eq: "accepted" } }]}
        
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
          reason
          status
          techStack
          totalPoints
          isApplicableMVerticals
          techStackIntBusinessFocus
          reusableOpportinutity
          accuracy
          repoLinks
          reviewerEmail
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

// const QUERY = gql`
//   query services(
//     $page: Int
//     $pageSize: Int
//     $q: String
//     $serviceMaster: String
//     $user_idq: ID

//   ) {
//     services(
//       filters: {
//         type: { contains: "service" }
//         name: { contains: $q }
//         service_master: { name: { contains: $serviceMaster } }
//         userId: { id: { eq: $user_idq } }
//       }
//      sort:"id:desc"
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
//           shortDescription
//           authorName
//           status
//           type
//           version
//           authorEmail
//           documentation {
//             data {
//               id
//               attributes {
//                 name
//               }
//             }
//           }
//           service_master {
//             data {
//               id
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
  Flexibility: 0,
  isApproved: "",
  reason:""
};
/**
 * @desc Handles admin array and registers admin
 * @returns Admin list and register admin modal
 */

const ServiceListing = (props) => {
  const navigate = useNavigate();
  let item = JSON.parse(localStorage.getItem("token"));
  // const [serviceType, setServiceType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [serviceMaster, setServiceMaster] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  let userData = JSON.parse(localStorage.getItem("user"));
  // manoj start
    // approval modal state
    const [showModal2, setShowModal2] = useState(false);
    const [serviceName,setServiceName]=useState(null)
    const [approvedval,setApprovedVal]=useState(null);
  const [showModal, setShowModal] = useState(false);
  const [packageId, setPackageId] = useState(null);
  // review state added for modal
  const [toEmail, setEmailto] = useState();
  const [isValid, setIsValid] = useState(true);
  const [emailerror,setemailerror]=useState(true)
  const [bitbucketRivewar, setBitbucketRivewar] = useState();
  const [docAttachment, setDocAttachement] = useState();
  const [reviwarId, setReviwarId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [authorEmail,setAuthorEmail] = useState("");
  const [articleurl,SetArticleurl]= useState("")

  // end
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackVale, setFeedbackValue] = useState(null);
  const [fileName, setFilename] = useState();

  const savedData = {
    IsApplicableMVerticals: feedbackVale?.IsApplicableMVerticals,
    TechStackIntBusinessFocus: feedbackVale?.TechStackIntBusinessFocus,
    ReusableOpportinutity: feedbackVale?.ReusableOpportinutity,
    Accuracy: feedbackVale?.Accuracy,
    Flexibility: feedbackVale?.Flexibility,
  };

  // rivewar modal start

  const handleClickRivewar = (e) => {
    setIsLoading(false)
    setEmailto("")
    if(e?.attributes?.reviewerEmail){
      setEmailto(e?.attributes?.reviewerEmail)
    }
    setAuthorEmail(e.attributes.authorEmail)
    SetArticleurl(`${process.env.REACT_APP_API_URL}/service/${e.attributes.slug}`)
    setReviwarId(e?.id);
    const documentation = e?.attributes.documentation?.data?.attributes;
    if (!documentation) {
      setDocAttachement("Documents not avilable ");
    } else {
      setFilename(documentation?.name);
      setDocAttachement(process.env.REACT_APP_API_URL + documentation?.url);
    }
    if(e.attributes.repoLinks){

      setBitbucketRivewar(e.attributes.repoLinks);
    }
    else{
      setBitbucketRivewar("Bitbucket Url not avilable");
    }
  };

  const handleChangeEmail = (event) => {
    setemailerror(true)
    const { value } = event.target;
    setEmailto(value);
    setIsValid(value.endsWith("@indusnet.co.in"));
  };
  const handleSubmitReviewer = async (e) => {
    e.preventDefault();
    if (!toEmail) {
      setemailerror(false);
      return;
    }
    setIsLoading(true)
    let emailpayload = {
      to: toEmail,
      author_email:authorEmail,
      bitbucket_url: bitbucketRivewar,
      file_name: fileName,
      file_path: docAttachment,
      article_url :articleurl
    }
    if (isValid) {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_BACK_END_API_URL}/services/${reviwarId}`,
          {
            data: {
              reviewerEmail: toEmail,
            },
          },
          {
            headers: {
              Authorization: "Bearer " + item,
              "Content-Type": "application/json",
            },
          }
        );

        await axios.post( `${process.env.REACT_APP_URL}`,emailpayload,
          {
            headers: {
              Authorization: "Bearer " + item,
              "Content-Type": "application/json",
            },
          }
        );
        setIsLoading(false)
        refetch(response);
        setShowModal(false);
        setEmailto("");
        setAuthorEmail("")
        setBitbucketRivewar("");
      } catch (error) {}
    } else {
      setemailerror(false)
      console.log("Invalid Google account");
      return
    }
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
  const [page, setPage] = useState(1);
  const [statuschange, setStatuschange] = useState(false);
  const pageSize = 20;

  //handleSubmitReviewer
  const handleStatusClick = async (e) => {
    const id = e.id; // No need for await here, as id is not a Promise
    const status = !e.attributes.status;

    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      text: "You want to change status",
      // icon: "warning",
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
              Authorization: "Bearer " + item,
              "Content-Type": "application/json",
            },
          }
        );
        setStatuschange(!statuschange);
        refetch(response);
      } catch (error) { }
    }
  };

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
  const userEmail = isAdmin === true ? undefined : userData?.email;

  const { data, loading, error, refetch } = useQuery(
    QUERY(orderBy, orderDirection),
    {
      variables: { page, pageSize, user_idq,userEmail },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );
  console.log("datass", data);

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

  // const onDelete = (e) => {
  //   let serviceMasterId = e.attributes.service_master.data.id;
  //   let serviceId = e.id;
  //   axios
  //     .delete(
  //       `${process.env.REACT_APP_BACK_END_API_URL}/service-masters/${serviceMasterId}`,
  //       {
  //         headers: {
  //           Authorization: "Bearer " + item,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       axios
  //         .delete(
  //           `${process.env.REACT_APP_BACK_END_API_URL}/services/${serviceId}`,
  //           {
  //             headers: {
  //               Authorization: "Bearer " + item,
  //               "Content-Type": "application/json",
  //             },
  //           }
  //         )
  //         .then((re) => {
  //           alert("Entity deleted successfully");
  //           refetch({ page, pageSize });
  //         })
  //         .catch((err) => {
  //           alert("Eror while deleting service");
  //         });
  //     })
  //     .catch((err) => {
  //       alert("Error while deleting service masters");
  //     });
  // };

  // const onDelete = async (e) => {
  //   let serviceMasterId = e.attributes.service_master.data.id;
  //   let serviceId = e.id;

  //   const result = await Swal.fire({
  //     title: "Are you sure?",
  //     text: "You want to delete entry?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#2368ca",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes",
  //     width: "20%",
  //     height: "20%",
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       await axios.delete(
  //         `${process.env.REACT_APP_BACK_END_API_URL}/service-masters/${serviceMasterId}`,
  //         {
  //           headers: {
  //             Authorization: "Bearer " + item,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       await axios.delete(
  //         `${process.env.REACT_APP_BACK_END_API_URL}/services/${serviceId}`,
  //         {
  //           headers: {
  //             Authorization: "Bearer " + item,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       alert("Entity deleted successfully");
  //       refetch({ page, pageSize });
  //     } catch (error) {
  //       alert("Error while deleting service or service masters");
  //     }
  //   }
  // };

  const handleNaviagte = (path) => {
    localStorage.setItem("sideBarCss", 0);
    navigate(`${path}`);
  };

  const handleFeedbackValue = (value) => {
    console.log("value", value);
    let payload = {};
    payload.IsApplicableMVerticals = value?.isApplicableMVerticals;
    payload.TechStackIntBusinessFocus = value?.techStackIntBusinessFocus;
    payload.ReusableOpportinutity = value?.reusableOpportinutity;
    payload.Accuracy = value?.accuracy;
    payload.Flexibility = value?.flexibility;
    setFeedbackValue(payload);
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackValue(null);
  };

  const handleFeedbackSubmit = async (value) => {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        isApplicableMVerticals: value.IsApplicableMVerticals,
        techStackIntBusinessFocus: value.TechStackIntBusinessFocus,
        reusableOpportinutity: value.ReusableOpportinutity,
        accuracy: value.Accuracy,
        flexibility: value.Flexibility,
        totalPoints:
          Number(value.IsApplicableMVerticals) +
          Number(value.TechStackIntBusinessFocus) +
          Number(value.ReusableOpportinutity) +
          Number(value.Accuracy) +
          Number(value.Flexibility),
      })
    );
    await axios
      .put(
        `${process.env.REACT_APP_BACK_END_API_URL}/services/${packageId}?populate=%2A`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + item,
            "Content-Type": "multipart/form-data", // Set the content type as multipart/form-data
          },
        }
      )
      .then((res) => {
        successInputSwal("Package Updated Successfully");
        refetch(res);
        setPackageId(null);
        closeFeedbackModal();
      })
      .catch((er) => {
        invalidInputSwal("Something went wrong");
      });
  };
  function sum(one, two, three, four, five){
    console.log( one, two, three, four, five)
    return ((one === undefined ? 0 : Number(one)) + (two === undefined ? 0 : Number(two)) + (three === undefined ? 0 : Number(three)) + (four === undefined ? 0 : Number(four)) + (five === undefined ? 0 : Number(five)) )
  }

  const closeModal2 = () => {
    setShowModal2(false);
  };
  const savedIsApprovedData = {
    isApproved: approvedval?.isApproved,
    reason: approvedval?.reason,
    };
    const handleClickIsapproved = (e) => {
      let payload = {};
      setPackageId(e?.id);
      setServiceName(e.attributes.name)
      setEmailto(e.attributes.authorEmail)
      payload.isApproved=e?.attributes.isApproved
      payload.reason=e?.attributes?.reason
      setApprovedVal(payload)
    };
//   const isApprovedFun= async(value)=>{
    
// const formData = new FormData();
// if(value.isApproved==="accepted"){
//   formData.append(
//     "data",
//     JSON.stringify({
//       isApproved: value.isApproved,
//       reason:""
//     })
//   );
// }else{
//   formData.append(
//     "data",
//     JSON.stringify({
//       isApproved: value.isApproved,
//       reason:value.reason
//     })
//   );
// }
// await axios
//   .put(
//     `${process.env.REACT_APP_BACK_END_API_URL}/services/${packageId}?populate=%2A`,
//     formData,
//     {
//       headers: {
//         Authorization: "Bearer " + item,
//         "Content-Type": "multipart/form-data", // Set the content type as multipart/form-data
//       },
//     }
//   )
//   .then((res) => {
//     successInputSwal("Package Updated Successfully");
//     refetch(res);
//     setPackageId(null);
//     setShowModal2(!showModal2);
//   })
//   .catch((er) => {
//     invalidInputSwal("Something went wrong");
//   });
//   }

const isApprovedFun = async (value) => {
  const formData = new FormData();
  let approvalEmail = {}
  if (value.isApproved === "accepted"){
    approvalEmail.name=serviceName;
    approvalEmail.isApproved=true;
    approvalEmail.reason="";
    approvalEmail.to=toEmail
    formData.append(
      "data",
      JSON.stringify({
        isApproved: value.isApproved,
        reason: ""
      })
    );
  } else {
    approvalEmail.name=serviceName;
    approvalEmail.isApproved=false;
    approvalEmail.reason=value.reason;
    approvalEmail.to=toEmail
    formData.append(
      "data",
      JSON.stringify({
        isApproved: value.isApproved,
        reason: value.reason
      })
    );
  }
  await axios
    .put(
      `${process.env.REACT_APP_BACK_END_API_URL}/services/${packageId}?populate=%2A`,
      formData,
      {
        headers: {
          Authorization: "Bearer " + item,
          "Content-Type": "multipart/form-data", // Set the content type as multipart/form-data
        },
      }
    )
    .then(async (res) => {
      await axios.post(`${process.env.REACT_APP_BACK_END_API_URL}/sendApproveRejectEmail`, approvalEmail, {
        headers: {
          Authorization: `Bearer ${item}`,
          "Content-Type": "application/json",
        },
      });
      successInputSwal("Package Updated Successfully");
      refetch(res);
      setPackageId(null);
      setShowModal2(!showModal2);
    })
    .catch((er) => {
      invalidInputSwal("Something went wrong");
    });
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
            》<a className="breadcrum">Services</a>
          </div>
          <h1 className="fs-2 fw-bold text-dark font_cern pt-4">Services</h1>
          <div className="d_flex g-10">
            <Input
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
            </Input>
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

            {/* <div
              className=""
              style={{
                backgroundColor: "transparent",
                color: "black",
                margin: "25px 100px 0px 0px",
                border: "1px solid transparent",
                width: "290px",
                // padding: "2px 10px",
              }}
            > */}
            {/* <Input
                onChange={(event) => setSearchValue(event.target.value)}
                id="form-input"
                value={searchValue}
                className=""
                type="search"
                placeholder="Search services name..."
                aria-label="search"
              /> */}
            {/* <div className="mainserchDiv">
                <input
                  style={{
                    border: "1px solid #C4C4C4",
                    backgroundColor: "#FFF",
                    borderRadius: "90px",
                    width: "290px",
                  }}
                  onChange={(event) => setSearchValue(event.target.value)}
                  value={searchValue}
                  className="nosubmit"
                  type="search"
                  placeholder="Search services name..."
                  aria-label="search"
                  // onChange={(e) => serachFunction(e)}
                />
                <button type="submit" className="submitButton">
                  {" "}
                </button>
              </div>
            </div> */}
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

            <Button
              onClick={() => handleNaviagte("/endpoint")}
              type="submit"
              className="bttn"
              id="bg_blue_2"
              style={{
                height: "46px",
                margin: "20px 0px 20px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "13px",
                padding: "0px 18px",
              }}
            >
              Endpoints
              <IoIosArrowForward style={{ margin: "0px -7px 0px 20px" }} />
            </Button>
            {/* <Tippy
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
                  <span>Add Service</span>
                </span>
              }
            >
              <div
                // className="ms-auto"
                onClick={() => {
                  localStorage.removeItem("actionType");
                  navigate("/service/add");
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
            </Tippy> */}
          </div>
          <div>
            {serviceArray?.length !== 0 ? (
              <Table striped hover size="lg" id="table_info">
                <thead>
                  {/* //authorName */}
                  {/* columns.isSorted ? (columns.isSortedDesc ? ' 🔽' : ' 🔼') : "" */}
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
                      onClick={() => toggleSorting("status")}
                    >
                      <div style={{ display: "flex" }}>
                        <div>Status </div>{" "}
                        {orderBy === "status" ? (
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
                    <th>Rating</th>
                    <th>Verison</th>
                    <th style={{ padding: "12px 15px" }}>Actions</th>
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
                          <td>
                            {isAdmin ? (
                              <div
                                className="status"
                                // style={{
                                //   cursor: "pointer",
                                // }}
                                onClick={() => {
                                  handleStatusClick(e);
                                }}
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
                                      <span>
                                        {e.attributes.status
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                                    </span>
                                  }
                                >
                                  {/* <div>
                              <Switch rounded={true} isToggled={e.attributes.status ? "checked" :""}/>
                              </div> */}
                                </Tippy>
                                <Switch
                                  rounded={true}
                                  isToggled={
                                    e.attributes.status ? "checked" : ""
                                  }
                                  isAdmin={isAdmin}
                                />
                              </div>
                            ) : (
                              // <div
                              //   style={{
                              //     color: e.attributes.status ? "green" : "red",
                              //   }}
                              // >
                              //   {e.attributes.status ? "Active" : "Inactive"}
                              // </div>
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
                                      <span>
                                        {e.attributes.status
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                                    </span>
                                  }
                                >
                                  <div>
                                    <Switch
                                      rounded={true}
                                      isToggled={
                                        e.attributes.status ? "checked" : ""
                                      }
                                      isAdmin={isAdmin}
                                    />
                                  </div>
                                </Tippy>
                              </div>
                            )}
                          </td>
                          <td>
                            {isAdmin ? (
                              <div
                                style={{
                                  marginLeft: "13px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  e.attributes.totalPoints != null
                                    ? handleFeedbackValue(e?.attributes)
                                    : setShowFeedbackModal(true);
                                  setPackageId(e?.id);
                                }}
                              >
                                {e.attributes.totalPoints != null ? (
                                  e.attributes.totalPoints
                                ) : (
                                  <FaMedal size={23} />
                                )}
                              </div>
                            ) : (
                              <div style={{ marginLeft: "13px" }}>
                                {e.attributes.totalPoints != null ? (
                                  e.attributes.totalPoints
                                ) : (
                                  <FaMedal size={23} />
                                )}
                              </div>
                            )}
                          </td>

                          <td>{e.attributes.version}</td>

                          <td>
                            <td
                              id="copy_iconfordorepo"
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
                                   <span>{!e?.attributes?.documentation?.data?.attributes?.url ? "No Document" : "Document"}</span>
                                  </span>
                                }
                              >
                                 <div style={! e?.attributes?.documentation?.data?.attributes?.url ? { opacity: "50%" } : {}}>{
                                    !e?.attributes?.documentation?.data?.attributes?.url ? <GoProjectSymlink size="20" /> :

                                      <a
                                        href={
                                          process.env.REACT_APP_API_URL + e?.attributes?.documentation?.data?.attributes?.url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          color:"black"
                                        }}
                                      >

                                        <GoProjectSymlink size="20" />
                                      </a>

                                  }
                                </div>
                              </Tippy>
                            </td>

                            <td
                              id="copy_iconfordorepo"
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
                                        <span>{!e?.attributes?.repoLinks ? "No bitbucket url "
                                        : "Bitbucket url"}</span>
                                  </span>
                                }
                              >
                               <div style={!e?.attributes?.repoLinks  ? { opacity: "50%" } : {}}>
                                  {
                                    !e?.attributes?.repoLinks ? <BiLink size="20" /> :

                                      <a
                                        href={
                                           e?.attributes?.repoLinks
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          color:"black"
                                        }}
                                      >

                                        <BiLink size="20" />
                                      </a>

                                  }

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
                                    <span>View</span>
                                  </span>
                                }
                              >
                                <div
                                  onClick={() => {
                                    localStorage.setItem("eflag", 2);
                                    navigate(`/service/${e.attributes.slug}`);
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
                                  <PiCopySimple
                                    size="16"
                                    strokeWidth="5"
                                    color="#0099FA"
                                  />
                                </div>
                              </Tippy>
                            </td>
                            <td
                              id={
                                isAdmin || 
                                (userData?.email === e?.attributes?.userId?.data?.attributes?.email && e.attributes.status === false)
                                  ? "copy_icon"
                                  : " "
                              }
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
                                      navigate(`/serviceEdit/${e.id}`);
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
                                  ?.email && e.attributes.status === false ? (
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
                                      navigate(`/serviceEdit/${e.id}`);
                                    }}
                                  >
                                    <SlPencil
                                      size="16"
                                      color="#8BC440"
                                      strokeWidth="30"
                                    />
                                  </div>
                                </Tippy>
                              ) : userData.email ===
                              e?.attributes?.userId?.data?.attributes?.email ? (<div style={{opacity:"40%"}}> <Tippy
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
                                >
                                  <SlPencil
                                    size="16"
                                    color="#8BC440"
                                    strokeWidth="30"
                                  />
                                </div>
                              </Tippy></div>):null}
                            </td>
                            {/* delete button */}

                            {/* <td className="ps-3 text-danger">
                              {isAdmin ? (
                                <RiDeleteBin5Line
                                  style={{ cursor: "pointer" }}
                                  onClick={() => onDelete(e)}
                                />
                              ) : null}
                            </td> */}
                               {/* // approvel modal open start */}
                               { e.attributes.reviewerEmail && (isAdmin || userData.email ===
                             e.attributes.reviewerEmail) ?
                             <td
                              style={{
                                borderColor: "transparent",
                                cursor:"pointer"
                              }}
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
                                    <span>Change approved status</span>
                                  </span>
                                }
                              >
                                <div
                                  onClick={() => {
                                    handleClickIsapproved(e);
                                    setShowModal2(!showModal2);
                                    // e.attributes?.documentation?.data ? setShowModal2(!showModal2) : setShowModal1(showModal1);
                                  }}
                                >
                                  <BiGitPullRequest size="16" />
                                </div>
                              </Tippy>
                            </td>:null}
                            {/* approvel modal end  */}
                            {/* modal Reviewer table  */}

                            <td
                              id={isAdmin &&  e?.attributes?.repoLinks ? "copy_icon" : ""}
                              style={{ borderColor: "transparent" }}
                            >
                              {isAdmin ? ( !e?.attributes?.reviewerEmail ? (
                                <div>
                                  <Tippy
                                    interactive={true}
                                    delay={100}
                                    content={
                                      <span
                                      style={e?.attributes?.repoLinks ?{
                                        background: "black",
                                        color: "white",
                                        borderRadius: "10px",
                                        padding: "10px 10px 9px 10px",
                                      } : null}
                                    >
                                     {e?.attributes?.repoLinks ?" Assign Reviewer" : null} 
                                     
                                      </span>
                                    }
                                  >
                                    <div
                                      onClick={() => {
                                        handleClickRivewar(e);
                                        e.attributes.repoLinks ?  setShowModal(!showModal) : setShowModal(showModal);
                                        // setShowModal(!showModal);
                                      }}
                                      style={
                                        e?.attributes?.repoLinks 
                                          
                                          ? {color: "red", fontWeight:" 900" }
                                          : {color: "red", fontWeight:" 900",   opacity: "50%"}
                                      }
                                    >
                                      <GoCodeReview size="18" />
                                    </div>
                                  </Tippy>
                                </div>
                              ) : (
                                <div   onClick={() => {
                                  handleClickRivewar(e);
                                  // setShowModal(!showModal);
                                  e.attributes.repoLinks ?  setShowModal(!showModal) : setShowModal(showModal);
                                }}>
                                  <Tippy
                                    interactive={true}
                                    delay={100}
                                    content={
                                      <span>
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            backgroundColor: "black",
                                            color: "white",
                                            borderRadius: "10px",
                                            padding: "10px 10px 9px 10px",
                                          }}
                                        >
                                          <div>Reviewer Assign </div>
                                          <div>
                                            {e.attributes.reviewerEmail}
                                          </div>
                                        </div>
                                      </span>
                                    }
                                  >
                                    <div>
                                      <RiChatCheckLine color="#8BC440" size="18" />
                                    </div>
                                  </Tippy>
                                </div>
                              )):null}
                            </td>
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
          <div>
            <Modals
              headerName="Assign Reviewer"
              showModal={showModal}
              closeModal={closeModal}
              width="50%"
            >
              <div  className={isLoading? "overlay":""}>
                <div>
                  <div className="">
                    <form
                      onSubmit={handleSubmitReviewer}
                      encType="multipart/form-data"
                    >
                      <div className="row marginBottom">
                        <div className="col">
                          <label>To Email</label>
                          <input
                            type="email"
                            name="ToEmail"
                            id="email"
                            placeholder="Type email..."
                            className={`form-control2 ${emailerror ? '' : 'errorcolor'}`}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            value={toEmail}
                            onChange={handleChangeEmail}
                          />
                          {!emailerror? <span style={{fontSize:"12px",margin:"0 auto", color:"red"}}>Invalid Google account</span>:""}
                        </div>
                      </div>
                      <div className="row marginBottom">
                        <div className="col">
                          <label>Bitbucket Repo</label>
                          <div>
                          <a href={bitbucketRivewar}>{bitbucketRivewar}</a>
                          </div>
                        </div>
                      </div>

                      <div className="row marginBottom ">
                        <div className="col">
                          <label>Doc Attachement</label>
                          <div>
                            <a href={docAttachment}>{docAttachment}</a>
                          </div>
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
          </div>
          {/* //  Assign Reviewer modal end */}
          <div>
            <Modals
              headerName="Rate POC"
              showModal={showFeedbackModal}
              closeModal={closeFeedbackModal}
            >
              <div style={{ paddingTop: "30px" }}>
                <div>
                  <div className="">
                    <Formik
                      initialValues={savedData || initialValues}
                      onSubmit={handleFeedbackSubmit}
                      // validationSchema={"validationSchema"}
                      render={
                        ({
                          values
                        
                        }) => (  
                          <Form>
                          <div
                            style={{
                              width: "98%",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              rowGap: "25px",
                              columnGap:"30px"
                            }}
                          >
                            <div className="form-group col ">
                              <label >
                                Is applicable for multiple vertical?
                              </label>
                              <Field
                                as="select"
                                name="IsApplicableMVerticals"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  padding: "10px 10px",
                                  height: "45px",
                                }}
                                autoComplete="off"
                                placeholder="Choose here.."
                                className="form-control type_select minimal feedback_select_col"
                              >
                                <option value="">Choose here...</option>
                                <option value={10}>Single Domain</option>
                                <option value={20}>Multiple Domain</option>
                                <option value={30}>All Domain</option>
                                <option value={0}>Not Applicable</option>
                              </Field>
                              {/* <ErrorMessage name='name' /> */}
                            </div>
                            <div className="form-group col ">
                              <label>
                                Tech Stack - as per INT's business focus?
                              </label>
                              <Field
                                as="select"
                                name="TechStackIntBusinessFocus"
                                autoComplete="off"
                                className="form-control type_select minimal feedback_select_col"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  padding: "10px 10px",
                                  height: "45px",
                                }}
                              >
                                <option value="">Choose here...</option>
                                <option value={10}>Somehow</option>
                                <option value={15}>Matched</option>
                                <option value={20}>Emerging Tech</option>
                              </Field>
                              {/* <ErrorMessage name='address' /> */}
                            </div>
                            <div className="form-group col ">
                              <label >Reusable Opportunity</label>
                              <Field
                                as="select"
                                name="ReusableOpportinutity"
                                autoComplete="off"
                                className="form-control type_select minimal feedback_select_col"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  padding: "10px 10px",
                                  height: "45px",
                                }}
                              >
                                <option value="">Choose here...</option>
                                <option value={20}>High</option>
                                <option value={15}>Medium</option>
                                <option value={10}>Low</option>
                              </Field>
                              {/* <ErrorMessage name='phone' /> */}
                            </div>
                            <div className="form-group col ">
                              <label>Completeness/Accuracy</label>
                              <Field
                                as="select"
                                name="Accuracy"
                                autoComplete="off"
                                className="form-control type_select minimal feedback_select_col"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  padding: "10px 10px",
                                  height: "45px",
                                }}
                              >
                                <option value="">Choose here...</option>
                                <option value={15}>High</option>
                                <option value={10}>Medium</option>
                                <option value={5}>Low</option>
                              </Field>
                              {/* <ErrorMessage name='email' /> */}
                            </div>
                            <div className="form-group col ">
                              <label >
                                Compatibilitty/Flexibility
                              </label>
                              <Field
                                as="select"
                                name="Flexibility"
                                autoComplete="off"
                                className="form-control type_select minimal feedback_select_col"
                                style={{
                                  width: "98% !important",
                                  backgroundColor: "transparent",
                                  color: "black",
                                  padding: "10px 10px",
                                  height: "45px",
                                }}
                              >
                                <option value="">Choose here...</option>
                                <option value={15}>High</option>
                                <option value={10}>Medium</option>
                                <option value={5}>Low</option>
                              </Field>
                              {/* <ErrorMessage name='confirmPassword' /> */}
                            </div>
                            <div className="form-group col ">
                              <ul>
                              <li>applicable for multiple vertical- {values.IsApplicableMVerticals}</li>
                              <li  style={{paddingTop:"5px"}}>Tech Stack - as per INT's business focus- {values.TechStackIntBusinessFocus}</li>
                              <li  style={{paddingTop:"5px"}}>Reusable Opportunity- {values.ReusableOpportinutity}</li>
                              <li  style={{paddingTop:"5px"}}>Completeness/Accuracy- {values.Accuracy}</li>
                              <li  style={{paddingTop:"5px"}}>Compatibilitty/Flexibility- {values.Flexibility}</li>
                              <li  style={{paddingTop:"5px"}}>Total- { sum(values.Flexibility, values.Accuracy, values.ReusableOpportinutity , values.TechStackIntBusinessFocus, values.IsApplicableMVerticals)}</li>
                              </ul>
                              
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="addButton"
                            id="bg_blue"
                            style={{
                              marginLeft: "15px",
                              width: "120px",
                            }}
                          >
                            Submit
                          </button>
                        </Form>)}
                    >
                     
                    </Formik>
                  </div>
                </div>
              </div>
            </Modals>
          </div>
            {/* //  Approved Assign is approvel modal */}
            <div>
            <Modals
              headerName=" Change approved status"
              showModal={showModal2}
              closeModal={closeModal2}
              width="30%"
            >
              <div className={isLoading ? "overlay" : ""}>
                <div>
                  <div className="">
                  <Formik
                      initialValues={savedIsApprovedData || initialValues}
                      onSubmit={isApprovedFun}
                      // validationSchema={"validationSchema"}
                      render={({ values }) => (
                        <Form>
                          <div
                            style={{
                              width: "98%",
                              display: "grid",
                              gridTemplateColumns: "1fr",
                              rowGap: "0px",
                              columnGap: "30px",
                            }}
                            
                          >
                          <div className="form-group col ">
                        {/* <label>Is Approved</label> */}
                        <Field
                                as="select"
                          name="isApproved"
                          style={{
                            backgroundColor: "transparent",
                            color: "black",
                            padding: "10px 10px",
                            height: "45px",
                          }}
                          autoComplete="off"
                          placeholder="Choose here.."
                          className="form-control type_select minimal feedback_select_col"
                        >
                          <option value="">Choose here...</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </Field>
                         <ErrorMessage name='isApproved' />
                      </div>
                      {values.isApproved==="rejected" &&  <div className="form-group col ">
                              <label>Reason</label>
                              <Field
                                as="input"
                                name="reason"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  padding: "10px 10px",
                                  height: "45px",
                                }}
                                autoComplete="off"
                                placeholder="Write reason.."
                                className="form-control type_select minimal"
                                required
                              >
                              </Field>
                              <ErrorMessage name="reason" />
                            </div>}

                           </div>
                          <button
                            type="submit"
                            className="addButton"
                            id="bg_blue"
                            style={{
                              marginLeft: "15px",
                              width: "120px",
                            }}
                          >
                            Submit
                          </button>
                        </Form>
                      )}
                    ></Formik>
                
                  </div>
                </div>
              </div>
            </Modals>
          </div>
          {/* //  pproved is approvel modal*/}
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

export default ServiceListing;
