import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { Formik, Form, Field, ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { successInputSwal, invalidInputSwal } from "../../component/Swal";
import { Table, Button, FormGroup, Label, Input } from "reactstrap";
import { useNavigate } from "react-router-dom";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import Pagination from "react-js-pagination";
import Modals from "../../component/Modal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import { BiFilter } from "react-icons/bi";
import { AiOutlineEye } from "react-icons/ai";
import { MdDownloadForOffline } from "react-icons/md";
import Tippy from "@tippyjs/react";
import Switch from "../../component/ToggleButton.js/Switch";
import { SlPencil } from "react-icons/sl";
import { BiGitPullRequest } from "react-icons/bi";
import sampleFileScript from "../../Assets/docs/Solution_Design_Details_for_Script.docx";
import img1 from "../../Assets/images/No records.png";
import { BsPlusSquareFill } from "react-icons/bs";
import { GoCodeReview } from "react-icons/go";
import { FaMedal } from "react-icons/fa";
import { GoProjectSymlink } from "react-icons/go";
import { BiLink } from "react-icons/bi";
import { RiChatCheckLine } from "react-icons/ri";
// import {QUERYsnippets} from "./service"
// and:{ or: [
//   {  isApproved:{notNull:false}},
//     { isApproved: { eq: "accepted" } }
//   ]
//   } 
// { and:[  
//   {  isApproved:{ne:"rejected"}},
// { reviewerEmail: { eq: $userEmail } }
// ]}

const QUERYsnippets = (orderBy, orderDirection) => {
  return gql`
  query services($page: Int, $pageSize: Int, $name: String, $user_idq: ID,$userEmail:String) {
    services(
      filters: 
      {
     
        type: { eq: "snippet" }
        or: [
          { techStack: { contains: $name } },
          { name: { contains: $name } },
        ]
        and:{ or: [
          { userId: { id: { eq: $user_idq } } },
          { reviewerEmail: { eq: $userEmail } }
        ]
        and:{or:[{  isApproved:{notNull:false}}, { isApproved: { eq: "accepted" } }]}
        } 
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
          repoLinks
          authorName
          authorEmail
          isApproved
          reason
          techStack
          totalPoints
          isApplicableMVerticals
          techStackIntBusinessFocus
          reusableOpportinutity
          reviewerEmail
          accuracy
          flexibility
          description
          status
          contributors {
            name
            email
          }
          type
          documentation {
            data {
              id
              attributes {
                name
                url
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

let actionType;
const slugUniquenessCheck = async (value) => {
  if (localStorage.getItem("actionType") === "edit") {
    return true;
  }
  try {
    let data = await axios.get(
      `${process.env.REACT_APP_BACK_END_API_URL}/service-masters?filters[slug]=${value}`
    );
    let arr = data?.data?.data;
    for (let e of arr) {
      if (e.attributes.slug === value) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

const initialValues = {
  name: "",
  slug: "",
  repoLinks: "",
  authorName: "",
  authorEmail: "",
  techStack: "",
  description: "",
  documentation: null,
  contributors: [],
  IsApplicableMVerticals: 0,
  TechStackIntBusinessFocus: 0,
  ReusableOpportinutity: 0,
  Accuracy: 0,
  Flexibility: 0,
  isApproved: "",
  reason: ""
};

const SnippetListing = (props) => {
  const navigate = useNavigate();
  let userData = JSON.parse(localStorage.getItem("user"));
  let item = JSON.parse(localStorage.getItem("token"));
  const userId = userData?.id;
  const [snippetId, setSnippetId] = useState(null);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [serviceMasterId, setServiceMasterId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [documentationName, setDocumentationName] = useState("");
  const [documentationURL, setDocumentationURL] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [packageId, setPackageId] = useState(null);

  // manoj start
  const [serviceName, setServiceName] = useState(null)
  const [showModal1, setShowModal1] = useState(false);
  const [approvedval, setApprovedVal] = useState(null);
  // approval modal state
  const [showModal2, setShowModal2] = useState(false);
  // review state added for modal
  // review state added for modal
  const [toEmail, setEmailto] = useState();
  const [isValid, setIsValid] = useState(true);
  const [emailerror, setemailerror] = useState(true);
  const [bitbucketRivewar, setBitbucketRivewar] = useState();
  const [docAttachment, setDocAttachement] = useState();
  const [fileName, setFilename] = useState();
  const [reviwarId, setReviwarId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [authorEmail, setAuthorEmail] = useState("");
  const [articleurl, SetArticleurl] = useState("");
  const [approved, setApproved] = useState("");
  // end
  const handleClickRivewar = (e) => {
    setIsLoading(false);
    setEmailto("");
    if (e?.attributes?.reviewerEmail) {
      setEmailto(e?.attributes?.reviewerEmail);
    }
    setAuthorEmail(e.attributes.authorEmail);
    SetArticleurl(
      `${process.env.REACT_APP_API_URL}/service/${e.attributes.slug}`
    );
    setReviwarId(e?.id);
    const documentation = e?.attributes.documentation?.data?.attributes;
    if (!documentation) {
      setDocAttachement("Documents not avilable ");
    } else {
      setFilename(documentation?.name);
      setDocAttachement(process.env.REACT_APP_API_URL + documentation?.url);
    }
    if (e.attributes.repoLinks) {
      setBitbucketRivewar(e.attributes.repoLinks);
    } else {
      setBitbucketRivewar("Bitbucket Url not avilable ");
    }
  };

  const handleChangeEmail = (event) => {
    setemailerror(true);
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
    setIsLoading(true);
    let emailpayload = {
      to: toEmail,
      author_email: authorEmail,
      bitbucket_url: bitbucketRivewar,
      file_name: fileName,
      file_path: docAttachment,
      article_url: articleurl,
    };
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
        await axios.post(`${process.env.REACT_APP_BACK_END_API_URL}`, emailpayload, {
          headers: {
            Authorization: "Bearer " + item,
            "Content-Type": "application/json",
          },
        });
        successInputSwal("Successfully Reviewer Assigned");
        setIsLoading(true);
        refetch(response);
        setShowModal1(false);
        setEmailto("");
        setAuthorEmail("");
        setBitbucketRivewar("");
      } catch (error) { }
    } else {
      setemailerror(false);
      console.log("Invalid Google account");
      return;
    }
  };

  const closeModal1 = () => {
    setShowModal1(false);
  };
  const closeModal2 = () => {
    setShowModal2(false);
  };

  // manoj end

  // ordering by manoj start
  const [orderBy, setOrderBy] = useState("id");
  const [orderDirection, setOrderDirection] = useState("asc");
  const [feedbackVale, setFeedbackValue] = useState(null);

  const savedData = {
    IsApplicableMVerticals: feedbackVale?.IsApplicableMVerticals,
    TechStackIntBusinessFocus: feedbackVale?.TechStackIntBusinessFocus,
    ReusableOpportinutity: feedbackVale?.ReusableOpportinutity,
    Accuracy: feedbackVale?.Accuracy,
    Flexibility: feedbackVale?.Flexibility,
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
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ script: "sub" }, { script: "super" }],
      [{ size: [] }],
      [{ font: [] }],
      [{ align: ["right", "center", "justify"] }],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "code-block"],
      [{ color: [] }, { background: [] }],
    ],
    clipboard: { matchVisual: false },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "color",
    "background",
    "align",
    "size",
    "font",
    "script",
    "indent",
    "code-block",
  ];

  const closeModal = () => {
    setShowModal(false);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackValue(null);
  };

  const handleStatusClick = async (e) => {
    const id = e.id; // No need for await here, as id is not a Promise
    const status = !e.attributes.status;

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
              Authorization: "Bearer " + item,
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

  const editServiceSchema = Yup.object({
    name: Yup.string().min(3).max(100).required("Please enter name"),
    authorName: Yup.string()
      .min(3, "Author Name must be at least 3 characters")
      .required("Please enter author name"),
    authorEmail: Yup.string()
      .email("Author Email must be a valid Email")
      .required("Please enter author email"),
    techStack: Yup.string().required("Please enter tech stack"),
    description: Yup.string()
      .min(20, "Description must be at least 20 characters")
      .required("Please enter description"),
    documentation: Yup.string(),
    repoLinks: Yup.string()
      .url("Bitbucket Link must be a valid url")
      .matches(
        /^(https:\/\/(www\.)?)?bitbucket(\.[a-zA-Z0-9_-]+)?(\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+)?$/,
        "Invalid Bitbucket Link"
      ),
  });


  const createServiceSchema = Yup.object({
    name: Yup.string().min(3).max(100).required("Please enter name"),
    authorName: Yup.string()
      .min(3, "Author Name must be at least 3 characters")
      .required("Please enter author name"),
    authorEmail: Yup.string()
      .email("Author Email must be a valid Email")
      .required("Please enter author email"),
    techStack: Yup.string().required("Please enter tech stack"),
    description: Yup.string()
      .min(20, "Description must be at least 20 characters")
      .required("Please enter description"),
    documentation: Yup.string().required("Please select document"),
    repoLinks: Yup.string()
      .url("Bitbucket Link must be a valid url")
      .matches(
        /^(https:\/\/(www\.)?)?bitbucket(\.[a-zA-Z0-9_-]+)?(\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+)?$/,
        "Invalid Bitbucket Link"
      ),
    // .test("is-bitbucket-link", "Invalid Bitbucket Link", (value) => {
    //      /^(https:\/\/(www\.)?bitbucket(\.org)?)?\/?$/,
    //   /^(https:\/\/(www\.)?)?bitbucket(\.[a-zA-Z0-9_-]+)?(\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+)?$/,
    ///^(https?:\/\/(www\.)?)?bitbucket(\.[a-zA-Z0-9_-]+)?(\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+)?$/,
    //   if (!value) {
    //     return true;
    //   }
    //   const bitbucketRegex = /^(https?:\/\/)?(www\.)?bitbucket(\.org)?\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_/-]+$/;

    //   return bitbucketRegex.test(value);
    // })
    // .required("Please enter a valid Bitbucket URL"),
  });

  // api call for edit form auto fill fields
  let autoFillData;
  const editForm = () => {
    if (snippetId == null) {
      setValues({
        name: "",
        slug: "",
        techStack: "",
        repoLinks: "",
        authorName: "",
        description: "",
        authorEmail: "",
        documentation: null,
      });
      setContributors([]);
      setServiceMasterId(0);
      setDocumentationName("");
      setDocumentationURL("");
    } else {
      axios
        .get(
          `${process.env.REACT_APP_BACK_END_API_URL}/services/${snippetId}?populate=%2A`
        )
        .then((res) => {
          autoFillData = res?.data?.data?.attributes;
          setServiceMasterId(autoFillData.service_master.data.id);
          setContributors(autoFillData.contributors);
          setDocumentationName(
            autoFillData?.documentation?.data?.attributes?.name
          );
          setDocumentationURL(
            autoFillData?.documentation?.data?.attributes?.url
          );
          setValues({
            name: autoFillData?.name,
            slug: autoFillData?.slug,
            repoLinks: autoFillData?.repoLinks,
            authorName: autoFillData?.authorName,
            authorEmail: autoFillData?.authorEmail,
            techStack: autoFillData?.techStack,
            description: autoFillData?.description,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const makeSlug = (string) => {
    const str1 = string.replace(/[^a-zA-Z ]/g, "");
    let str2 = str1.toLowerCase().split(" ").join("-");
    return validateSlug(str2);
  };

  const validateSlug = async (name) => {
    let val = Math.floor(1000 + Math.random() * 9000);
    const values = name + "-" + val;
    const isUnique = await slugUniquenessCheck(values);

    if (isUnique === true) {
      return values;
    } else {
      validateSlug(name);
    }
  };

  const pageSize = 20;
  const setPageNo = (e) => {
    setTimeout(() => {
      setName();
    }, 100);
    setPage(e);
  };
  const setName = () => {
    let name = searchValue;
    refetch({ name });
  };
  let name = "";
  const user_idq = isAdmin === true ? undefined : userData?.id;
  const userEmail = isAdmin === true ? undefined : userData?.email;
  const { data, loading, error, refetch } = useQuery(
    QUERYsnippets(orderBy, orderDirection),
    {
      variables: { page, pageSize, name, user_idq, userEmail },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );

  const {
    setFieldValue,
    errors,
    values,
    touched,
    handleBlur,
    setValues,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: initialValues,
    validationSchema:
      documentationName !== null ? editServiceSchema : createServiceSchema,
    onSubmit: async (value, action) => {
      action.resetForm();
      actionType = localStorage.getItem("actionType");
      if (actionType === "edit") {
        if (value?.documentation) {
          const formData = new FormData();

          if (value?.documentation) {
            formData.append(`files.documentation`, value?.documentation);
          }

          formData.append(
            "data",
            JSON.stringify({
              name: value?.name,
              slug: value?.slug,
              techStack: value?.techStack,
              repoLinks: value?.repoLinks,
              authorName: value?.authorName,
              authorEmail: value?.authorEmail,
              description: value?.description,
              contributors: contributors,
              type: "snippet",
            })
          );
          axios
            .put(
              `${process.env.REACT_APP_BACK_END_API_URL}/services/${snippetId}?populate=%2A`,
              formData,
              {
                headers: {
                  Authorization: "Bearer " + item,
                  "Content-Type": "multipart/form-data", // Set the content type as multipart/form-data
                },
              }
            )
            .then((res) => {
              successInputSwal("Snippet Updated Successfully");
              refetch(res);
              setSnippetId(null);
              closeModal();
            })
            .catch((er) => {
              invalidInputSwal("Something went wrong");
            });
        } else {
          axios
            .put(
              `${process.env.REACT_APP_BACK_END_API_URL}/services/${snippetId}?populate=%2A`,
              {
                data: {
                  name: value?.name,
                  slug: value?.slug,
                  techStack: value?.techStack,
                  repoLinks: value?.repoLinks,
                  authorName: value?.authorName,
                  authorEmail: value?.authorEmail,
                  description: value?.description,
                  contributors: contributors,
                  type: "snippet",
                },
              },
              {
                headers: {
                  Authorization: "Bearer " + item,
                  "Content-Type": "application/json",
                },
              }
            )
            .then((res) => {
              successInputSwal("Snippet Updated Successfully");
              refetch(res);
              setSnippetId(null);
              closeModal();
            })
            .catch((er) => {
              invalidInputSwal("Something went wrong");
            });
        }
      } else {
        await axios
          .post(
            `${process.env.REACT_APP_BACK_END_API_URL}/service-masters`,
            {
              data: {
                name: value?.name,
                slug: value?.slug,
                type: "snippet",
                services: [],
              },
            },
            {
              headers: {
                Authorization: "Bearer " + item,
                "Content-Type": "application/json",
              },
            }
          )
          .then(async (res) => {
            const formData = new FormData();
            formData.append(`files.documentation`, value?.documentation);

            formData.append(
              "data",
              JSON.stringify({
                name: value?.name,
                slug: value?.slug,
                techStack: value?.techStack,
                repoLinks: value?.repoLinks,
                authorName: value?.authorName,
                authorEmail: value?.authorEmail,
                description: value?.description,
                service_master: res.data.data.id,
                contributors: contributors,
                type: "snippet",
                userId: userId,
              })
            );
            await axios
              .post(
                `${process.env.REACT_APP_BACK_END_API_URL}/services?populate=%2A`,
                formData,
                {
                  headers: {
                    Authorization: "Bearer " + item,
                    "Content-Type": "multipart/form-data", // Set the content type as multipart/form-data
                  },
                }
              )
              .then((res) => {
                successInputSwal("Created Snippet Successfully");
                refetch(res);
                closeModal();
              })
              .catch((er) => {
                invalidInputSwal("Something went wrong");
              });
          })
          .catch((err) => {
            invalidInputSwal("Something went wrong");
            setSnippetId(null);
            closeModal();
          });
      }
    },
  });

  useEffect(() => {
    editForm();

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then((res) => {
        setIsAdmin(res?.data?.isAdmin);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [snippetId]);

  if (loading) {
    props.loader(true);
    return null;
  } else if (error) {
    return null;
  }

  const snippetsArray = data?.services?.data;
  const metaData = data?.services?.meta;
  const onSearch = () => {
    let name = searchValue;
    let page = 1;
    refetch({ name, page });
  };

  const onReset = () => {
    refetch({ name });
    setSearchValue("");
  };

  const removeContributors = (name) => {
    setContributors((contri) => contri.filter((field) => field !== name));
  };

  const handleQuillChange = (value) => {
    setFieldValue("description", value);
  };

  const handleDownload = (e) => {
    const link = document.createElement("a");
    link.download = "Solution_Design_Details_for_Script";

    link.href = sampleFileScript;

    link.click();
  };

  const handleDownload2 = (e) => {
    const link = document.createElement("a");
    link.download = { documentationName };

    link.href = `${process.env.REACT_APP_API_URL}${documentationURL}`;

    link.click();
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

  function sum(one, two, three, four, five) {
    console.log(one, two, three, four, five);
    return (
      (one === undefined ? 0 : Number(one)) +
      (two === undefined ? 0 : Number(two)) +
      (three === undefined ? 0 : Number(three)) +
      (four === undefined ? 0 : Number(four)) +
      (five === undefined ? 0 : Number(five))
    );
  }


  const isApprovedValidationSchema = Yup.object({
    isApproved: Yup.string().required("Please select the field "),
    reason: Yup.string(),
  });
  const savedIsApprovedData = {
    isApproved: approvedval?.isApproved,
    reason: approvedval?.reason,
  };
  const handleClickIsapproved = (e) => {
    setServiceName(e.attributes.name)
    setEmailto(e.attributes.authorEmail)
    let payload = {};
    setPackageId(e?.id);
    payload.isApproved = e?.attributes.isApproved
    payload.reason = e?.attributes?.reason
    setApprovedVal(payload)
  };
  const isApprovedFun = async (value) => {
    const formData = new FormData();
    let approvalEmail = {}
    if (value.isApproved === "accepted") {
      approvalEmail.name = serviceName;
      approvalEmail.isApproved = true;
      approvalEmail.reason = "";
      approvalEmail.to = toEmail
      formData.append(
        "data",
        JSON.stringify({
          isApproved: value.isApproved,
          reason: ""
        })
      );
    } else {
      approvalEmail.name = serviceName;
      approvalEmail.isApproved = false;
      approvalEmail.reason = value.reason;
      approvalEmail.to = toEmail
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
        <div className="container pt-2">
          <div className="breadcrum" style={{ marginTop: "15px" }}>
            <a onClick={() => navigate("/dashboard")}>Dashboard</a> 》
            <a>Snippets</a>
          </div>
          <h1 className="fs-2 fw-bold text-dark font_cern pt-4">Snippets</h1>
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
            {/* 
            <Button
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
            {/* <Tippy
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
                  <span>Add Snippet</span>
                </span>
              }
            >
              <div
                className="ms-auto"
                onClick={(e) => {
                  localStorage.removeItem("actionType");
                  setSnippetId(null);
                  setShowModal(!showModal);
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
            {snippetsArray?.length !== 0 ? (
              <Table striped hover size="lg" id="table_info">
                <thead>
                  <tr>
                    <th
                      style={{ width: "3%", cursor: "pointer" }}
                      onClick={() => toggleSorting("id")}
                    >
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
                    {/* <th>Slug</th> */}
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSorting("authorEmail")}
                    >
                      <div style={{ display: "flex" }}>
                        <div>Author Email </div>{" "}
                        {orderBy === "authorEmail" ? (
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
                      onClick={() => toggleSorting("techStack")}
                    >
                      <div style={{ display: "flex" }}>
                        <div>Tech Stack </div>{" "}
                        {orderBy === "techStack" ? (
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {snippetsArray?.map((e, i) => {
                    return (
                      <>
                        <tr>
                          <td>{e.id}</td>
                          <td>{e.attributes.name}</td>
                          {/* <td>{e.attributes.slug}</td> */}
                          <td>{e.attributes.authorEmail}</td>
                          <td>{e.attributes.techStack}</td>

                          {/* <td>{e.attributes.status ? "Active": "Inactive"}</td> */}
                          <td
                            style={{
                              cursor: isAdmin ? "pointer" : "",
                            }}
                          >
                            {isAdmin ? (
                              <div
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
                                    e.attributes.status ? "checked" : ""
                                  }
                                  isAdmin={isAdmin}
                                />
                              </div>
                            ) : (
                              <Switch
                                rounded={true}
                                isToggled={e.attributes.status ? "checked" : ""}
                                isAdmin={isAdmin}
                              />
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
                                    <span>
                                      {e?.attributes?.documentation?.data
                                        ?.attributes?.url === undefined
                                        ? "No Document"
                                        : "Document"}
                                    </span>
                                  </span>
                                }
                              >
                                <div
                                  style={
                                    e?.attributes?.documentation?.data
                                      ?.attributes?.url === undefined
                                      ? { opacity: "50%" }
                                      : {}
                                  }
                                >
                                  {e?.attributes?.documentation?.data
                                    ?.attributes?.url === undefined ? (
                                    <div>
                                      {" "}
                                      <GoProjectSymlink size="20" />{" "}
                                    </div>
                                  ) : (
                                    <a
                                      href={
                                        process.env.REACT_APP_API_URL +
                                        e?.attributes?.documentation?.data
                                          ?.attributes?.url
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        color: "black",
                                      }}
                                    >
                                      <GoProjectSymlink size="20" />
                                    </a>
                                  )}
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
                                    <span>
                                      {!e?.attributes?.repoLinks
                                        ? "No bitbucket url "
                                        : "Bitbucket url"}
                                    </span>
                                  </span>
                                }
                              >
                                <div
                                  style={
                                    !e?.attributes?.repoLinks
                                      ? { opacity: "50%" }
                                      : {}
                                  }
                                >
                                  {e?.attributes?.repoLinks === undefined ? (
                                    <BiLink size="20" />
                                  ) : (
                                    <a
                                      href={e?.attributes?.repoLinks}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        color: "black",
                                      }}
                                    >
                                      <BiLink size="20" />
                                    </a>
                                  )}
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

                            {isAdmin ? (
                              <td
                                className="ps-3"
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
                                      setSnippetId(e?.id);
                                      setShowModal(!showModal);
                                    }}
                                  >
                                    <SlPencil
                                      size="16"
                                      color="#8BC440"
                                      strokeWidth="30"
                                    />
                                  </div>
                                </Tippy>
                              </td>
                            ) : userData?.email ===
                              e?.attributes?.userId?.data?.attributes
                                ?.email && e.attributes.status === false ? (
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
                                      setSnippetId(e?.id);
                                      setShowModal(!showModal);
                                    }}
                                  >
                                    <SlPencil
                                      size="16"
                                      color="#8BC440"
                                      strokeWidth="30"
                                    />
                                  </div>
                                </Tippy>
                              </td>
                            ) : userData.email ===
                              e?.attributes?.userId?.data?.attributes?.email ? (
                              <td
                                style={{
                                  borderColor: "transparent",
                                  opacity: "40%",
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
                                      <span>Edit</span>
                                    </span>
                                  }
                                >
                                  <div>
                                    <SlPencil
                                      size="16"
                                      color="#8BC440"
                                      strokeWidth="30"
                                    />
                                  </div>
                                </Tippy>
                              </td>
                            ) : null}
                            {/* // approvel modal open start */}
                            {e.attributes.reviewerEmail &&
                              (isAdmin || userData.email === e.attributes.reviewerEmail) ? (
                                <td
                                  style={{
                                    borderColor: "transparent",
                                    cursor: "pointer",
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
                                </td>
                              ) : null}
                            {/* approvel modal end  */}
                            {/* modal Reviewer table  */}
                            <td
                              id={
                                isAdmin && e?.attributes?.documentation?.data
                                  ? "copy_icon"
                                  : ""
                              }
                              style={{ borderColor: "transparent" }}
                            >
                              {console.log(
                                "e?.attributes?.documentation?.data",
                                e?.attributes?.documentation?.data
                              )}
                              {isAdmin ? (
                                !e?.attributes?.reviewerEmail ? (
                                  <div>
                                    <Tippy
                                      interactive={true}
                                      delay={100}
                                      content={
                                        <span
                                          // {e?.attributes?.documentation?.data ?" Assign Reviewer" : null}
                                          style={
                                            e?.attributes?.documentation?.data
                                              ? {
                                                background: "black",
                                                color: "white",
                                                borderRadius: "10px",
                                                padding: "10px 10px 9px 10px",
                                              }
                                              : null
                                          }
                                        >
                                          {e?.attributes?.documentation?.data
                                            ? " Assign Reviewer"
                                            : null}
                                        </span>
                                      }
                                    >
                                      <div
                                        onClick={() => {
                                          handleClickRivewar(e);
                                          // setShowModal1(!showModal1);
                                          e.attributes?.documentation?.data
                                            ? setShowModal1(!showModal1)
                                            : setShowModal1(showModal1);
                                        }}
                                        style={
                                          e?.attributes?.documentation?.data
                                            ? {
                                              color: "red",
                                              fontWeight: " 900",
                                            }
                                            : {
                                              color: "red",
                                              fontWeight: " 900",
                                              opacity: "50%",
                                            }
                                        }
                                      >
                                        <GoCodeReview size="18" />
                                      </div>
                                    </Tippy>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      handleClickRivewar(e);
                                      // setShowModal1(!showModal1);
                                      e.attributes.repoLinks
                                        ? setShowModal1(!showModal1)
                                        : setShowModal1(showModal1);
                                    }}
                                  >
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
                                            <div>Reviewer Assign</div>
                                            <div>
                                              {e.attributes.reviewerEmail}
                                            </div>
                                          </div>
                                        </span>
                                      }
                                    >
                                      <div>
                                        <RiChatCheckLine
                                          color="#8BC440"
                                          size="18"
                                        />
                                      </div>
                                    </Tippy>
                                  </div>
                                )
                              ) : null}
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
          <div>
            <Modals
              headerName={snippetId == null ? "Create Snippet" : "Edit Snippet"}
              showModal={showModal}
              closeModal={closeModal}
            >
              <div className="">
                <div>
                  <div className="">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                      <div className="row">
                        <div className="form-group col">
                          <label>Title</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="type name..."
                            className="form-control"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            value={values?.name}
                            onChange={async (e) => {
                              setFieldValue("name", e?.target?.value);
                              setFieldValue(
                                "slug",
                                await makeSlug(e?.target?.value)
                              );
                            }}
                            onBlur={handleBlur}
                          />
                          {errors?.name && touched?.name ? (
                            <p style={{ color: "red", fontSize: "14px" }}>
                              {errors?.name}
                            </p>
                          ) : null}
                        </div>
                        {/* <div className="form-group col">
                          <label>Slug</label>
                          <input
                            type="text"
                            name="slug"
                            id="slug"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            placeholder="type slug..."
                            value={values?.slug}
                            onChange={async(e) => {
                              setFieldValue("slug",await makeSlug(e?.target?.value));
                            }}
                            className="form-control"
                            onBlur={handleBlur}
                          />
                          {errors.slug && touched.slug ? (
                            <p style={{ color: "red", fontSize: "14px" }}>
                              {errors.slug}
                            </p>
                          ) : null}
                        </div> */}

                        <div className="form-group col">
                          <label for="repoLinks">Bit Bucket Link</label>
                          <input
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            className="form-control"
                            placeholder="repolink"
                            name="repoLinks"
                            value={values?.repoLinks}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          ></input>
                          {errors?.repoLinks && touched?.repoLinks ? (
                            <p style={{ color: "red", fontSize: "13px" }}>
                              {errors.repoLinks}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col">
                          <label>Author Name</label>
                          <input
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            placeholder="auther name"
                            type="text"
                            className="form-control"
                            value={values?.authorName}
                            name="authorName"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          ></input>
                          {errors?.authorName && touched?.authorName ? (
                            <p style={{ color: "red", fontSize: "13px" }}>
                              {errors.authorName}
                            </p>
                          ) : null}
                        </div>
                        <div className="form-group col px-3">
                          <label>Author Email</label>
                          <input
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            placeholder="author email"
                            type="email"
                            className="form-control"
                            name="authorEmail"
                            value={values?.authorEmail}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          ></input>
                          {errors.authorEmail && touched.authorEmail ? (
                            <p style={{ color: "red", fontSize: "13px" }}>
                              {errors.authorEmail}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="col">
                        <label for="description">Description</label>

                        <ReactQuill
                          theme="snow"
                          value={
                            values.description || initialValues.description
                          }
                          modules={modules}
                          formats={formats}
                          style={{
                            height: "300px",
                            width: "99%",
                            marginBottom: "80px",
                          }}
                          id="description"
                          name="description"
                          placeholder="Enter message here..."
                          onChange={handleQuillChange}
                        />
                        {errors.description && touched.description ? (
                          <p
                            style={{
                              color: "red",
                              fontSize: "14px",
                              marginTop: "-20px",
                            }}
                          >
                            {errors.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="row" style={{ marginTop: "10px" }}>
                        <div className="form-group col">
                          <label for="techStack">Tech Stack </label>
                          <textarea
                            type="text"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              height: "70px",
                            }}
                            className="form-control"
                            placeholder="tech stack"
                            name="techStack"
                            value={values?.techStack}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {errors.techStack && touched.techStack ? (
                            <p style={{ color: "red", fontSize: "13px" }}>
                              {errors.techStack}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="row" style={{ width: "101%" }}>
                        <div className="form-group col">
                          <label>contributors({contributors.length})</label>
                          <span>
                            <div
                              onClick={() =>
                                setContributors((data) => [
                                  ...data,
                                  { name: "", email: "" },
                                ])
                              }
                              className="AddButtonForm"
                            >
                              <BsPlusSquareFill size={32} />
                            </div>
                          </span>
                          <div
                            style={{ marginTop: "15px" }}
                            className={
                              contributors.length
                                ? "border rounded border-info p-1 mb-2"
                                : "border rounded"
                            }
                          >
                            {contributors.map((e, i) => {
                              return (
                                <>
                                  <div
                                    // className=" border rounded"
                                    style={{
                                      //  display: "flex",
                                      //  justifyContent: "space-between",
                                      display: "grid",
                                      gridTemplateColumns: "97.5% 2.5%",
                                      margin: "5px 5px 5px 0px",
                                      width: "100%",
                                      paddingRight: "10px",
                                    }}
                                  >
                                    <div
                                      className="px-31"
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "48% 48%",
                                      }}
                                    >
                                      <FormGroup style={{ padding: "5px" }}>
                                        <Label>Name</Label>
                                        <Input
                                          style={{
                                            width: "250px",
                                            backgroundColor: "transparent",
                                            color: "black",
                                            marginTop: "5px",
                                          }}
                                          defaultValue={e.name || null}
                                          type="text"
                                          name="question"
                                          id="question"
                                          placeholder="name"
                                          className="form_control_2"
                                          onChange={(event) => {
                                            e.name = event.target.value;
                                          }}
                                        />
                                      </FormGroup>
                                      <FormGroup style={{ padding: "5px" }}>
                                        <Label>Email</Label>
                                        <Input
                                          style={{
                                            width: "250px",
                                            backgroundColor: "transparent",
                                            color: "black",
                                            marginTop: "5px",
                                          }}
                                          defaultValue={e.email || null}
                                          type="email"
                                          name="email"
                                          id="email"
                                          placeholder="email"
                                          className="form_control_2"
                                          onChange={(event) => {
                                            e.email = event.target.value;
                                          }}
                                        />
                                      </FormGroup>
                                    </div>
                                    <Button
                                      className="addButt"
                                      style={{
                                        backgroundColor: "red",
                                        color: "black",
                                        border: "none",
                                        fontSize: "15px",
                                        float: "right",
                                        width: "25px",
                                        height: "26px",
                                        marginTop: " 2.8rem",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => removeContributors(e)}
                                    >
                                      X
                                    </Button>
                                  </div>
                                </>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="row" style={{ width: "100.5%" }}>
                        <div className="form-group col">
                          <label htmlFor="documentation">Documentation</label>
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
                                <span>Download Sample Script file</span>
                              </span>
                            }
                          >
                            <span
                              className=""
                              style={{
                                padding: "7px",
                                cursor: "pointer",
                              }}
                            >
                              <a
                                style={{
                                  cursor: "pointer",
                                  padding: "10px 10px 3px 5px",
                                  margin: "10px",
                                  verticalAlign: "top",
                                }}
                                id="bg_blue_3"
                                onClick={(e) => {
                                  handleDownload(e);
                                }}
                              >
                                <MdDownloadForOffline
                                  style={{ verticalAlign: "text-bottom" }}
                                  size={20}
                                />{" "}
                                <span>Download</span>
                              </a>
                            </span>
                          </Tippy>
                          <input
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              padding: "8px",
                            }}
                            type="file"
                            className="form-control"
                            placeholder="Upload File"
                            id="documentation"
                            name="documentation"
                            onChange={(event) => {
                              setFieldValue(
                                "documentation",
                                event.currentTarget.files[0]
                              );
                            }}
                            onBlur={handleBlur}
                          ></input>
                          <span
                            id="downloadFiles"
                            onClick={(e) => {
                              handleDownload2(e);
                            }}
                          >
                            {documentationName}
                          </span>
                        </div>
                      </div>
                      {errors.documentation && touched.documentation ? (
                        <p
                          style={{
                            color: "red",
                            fontSize: "13px",
                            marginTop: "-13px",
                          }}
                        >
                          {errors.documentation}
                        </p>
                      ) : null}
                      <Button
                        type="submit"
                        className="addButton"
                        id="bg_blue"
                        style={{
                          width: "120px",
                          marginLeft: "15px",
                        }}
                      >
                        Submit
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
          {/* //  Assign Reviewer modal */}
          <div>
            <Modals
              headerName="Assign Reviewer"
              showModal={showModal1}
              closeModal={closeModal1}
              width="60%"
            >
              <div className={isLoading ? "overlay" : ""}>
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
                            className={`form-control2 ${emailerror ? "" : "errorcolor"
                              }`}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            value={toEmail}
                            onChange={handleChangeEmail}
                          />
                          {!emailerror ? (
                            <span
                              style={{
                                fontSize: "12px",
                                margin: "0 auto",
                                color: "red",
                              }}
                            >
                              Invalid Google account
                            </span>
                          ) : (
                            ""
                          )}
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
                        onClick={closeModal1}
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

          {/* //  Approved Assign Reviewer modal */}
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
                      validationSchema={isApprovedValidationSchema}
                      render={({ values }) => (
                        <Form>

                          <div
                            style={{
                              width: "98%",
                              display: "grid",
                              gridTemplateColumns: "1fr",
                              rowGap: "0",
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
                              <ErrorMessage name="isApproved" />
                            </div>

                            {values.isApproved === "rejected" && (
                              <div className="form-group col">
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
                                />
                                <ErrorMessage name="reason" />
                              </div>
                            )}
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
          {/* //  pproved Assign Reviewer modal*/}

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
                      render={({ values }) => (
                        <Form>
                          <div
                            style={{
                              width: "98%",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              rowGap: "25px",
                              columnGap: "30px",
                            }}
                          >
                            <div className="form-group col ">
                              <label htmlFor={name}>
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
                              <label htmlFor={name}>Reusable Opportunity</label>
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
                              <label htmlFor={name}>
                                Completeness/Accuracy
                              </label>
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
                              <label htmlFor={name}>
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
                                <li>
                                  applicable for multiple vertical-{" "}
                                  {values.IsApplicableMVerticals}
                                </li>
                                <li style={{ paddingTop: "5px" }}>
                                  Tech Stack - as per INT's business focus-{" "}
                                  {values.TechStackIntBusinessFocus}
                                </li>
                                <li style={{ paddingTop: "5px" }}>
                                  Reusable Opportunity-{" "}
                                  {values.ReusableOpportinutity}
                                </li>
                                <li style={{ paddingTop: "5px" }}>
                                  Completeness/Accuracy- {values.Accuracy}
                                </li>
                                <li style={{ paddingTop: "5px" }}>
                                  Compatibilitty/Flexibility-{" "}
                                  {values.Flexibility}
                                </li>
                                <li style={{ paddingTop: "5px" }}>
                                  Total-{" "}
                                  {sum(
                                    values.Flexibility,
                                    values.Accuracy,
                                    values.ReusableOpportinutity,
                                    values.TechStackIntBusinessFocus,
                                    values.IsApplicableMVerticals
                                  )}
                                </li>
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
                        </Form>
                      )}
                    ></Formik>
                  </div>
                </div>
              </div>
            </Modals>
          </div>
          {snippetsArray?.length !== 0 ? (
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
      </AuthenticatePages>
    </>
  );
};

export default SnippetListing;
