import React, { useState, useEffect } from "react";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import { Button, FormGroup, Label, Input } from "reactstrap";
import "react-markdown-editor-lite/lib/index.css";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { successInputSwal } from "../../swal.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BsPlusSquareFill } from "react-icons/bs";

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
          services {
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
`;

let actionType;
const slugUniquenessCheck = async (value) => {
  if (
    localStorage.getItem("actionType") === "edit" ||
    localStorage.getItem("actionType") === "copy"
  ) {
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

const EndpointForm = () => {
  let item = JSON.parse(localStorage.getItem("token"));
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [endpointId, setEndpointId] = useState(null);
  const [endpointMasterId, setEndpointMasterId] = useState(0);

  const initialRequest = {
    name: "",
    description: "",
    type: "",
    objects: undefined,
    isRequired: "",
  };

  const initialApiRequest = {
    language: "",
    requests: "",
  };

  const initialResponses = {
    name: "",
    description: "",
    objects: undefined,
    type: "",
    isNullable: false,
  };

  const initialResponseMessage = {
    statusCode: "",
    responseModeType: "",
    condition: "",
    payload: undefined,
  };

  const initialValues = {
    requests: [],
    apiRequests: [],
    responses: [],
    responseMessage: [],
    name: "",
    slug: "",
    version: "",
    apiResponse: undefined,
    rateLimitDetails: "",
    versionReleaseNotes: "",
    shortDescription: "",
    method: "",
    description: "",
    errorHandlingDetails: "",
    authenticationDetails: "",
    businessRequirementsRules: "",
    developmentRequirementsRules: "",
    services: "",
  };

  const requestSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    description: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .required("Description is required"),
    type: Yup.string().required("Type is required"),
    isRequired: Yup.string().required("Is Required is required"),
  });

  const apiRequestSchema = Yup.object().shape({
    language: Yup.string().required("Language is required"),
    requests: Yup.string().required("Requests is required"),
  });

  const responsesSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    description: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .required("Description is required"),
    type: Yup.string().required("Type is required"),
    isNullable: Yup.boolean().required("Is Nullable is required"),
  });

  const responseMessageSchema = Yup.object().shape({
    statusCode: Yup.number()
      .required("Status Code is required")
      .typeError("Status Code must be a number"),
    responseModeType: Yup.string().required("Response Mode Type is required"),
    condition: Yup.string().required("Condition is required"),
  });

  const createServiceSchema = Yup.object().shape({
    requests: Yup.array().of(requestSchema),
    apiRequests: Yup.array().of(apiRequestSchema),
    responses: Yup.array().of(responsesSchema),
    responseMessage: Yup.array().of(responseMessageSchema),
    name: Yup.string().min(3).max(100).required("Please enter name"),
    apiResponse: Yup.string().test("json", "Invalid JSON format", (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        return false;
      }
    }),
    rateLimitDetails: Yup.string().min(
      3,
      "Rate limit details must be at least 3 characters"
    ),
    versionReleaseNotes: Yup.string().min(
      3,
      "Version release notes must be at least 3 characters"
    ),
    shortDescription: Yup.string()
      .min(6, "Short description must be at least 6 characters")
      .required("Please enter short description"),
    method: Yup.string().required("Please select a method"),
    services: Yup.string().required("Please select a services"),
    version: Yup.string()
      .matches(/^([a-zA-Z0-9])[a-zA-Z0-9-_.]*$/, "Invalid format")
      .required("Please type version"),
    description: Yup.string()
      .min(20, "Description must be at least 20 characters")
      .required("Please enter description"),
    errorHandlingDetails: Yup.string().min(
      10,
      "Error handling details must be at least 10 characters"
    ),
    authenticationDetails: Yup.string().min(
      10,
      "Authentication must be at least 10 characters"
    ),
    businessRequirementsRules: Yup.string().min(
      10,
      "Buisness requirement rules must be at least 10 characters"
    ),
    developmentRequirementsRules: Yup.string().min(
      10,
      "Development requirement rules must be at least 10 characters"
    ),
  });

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

  // api call for edit form auto fill fields
  let autoFillData;
  const parms = useParams();
  let id = parms.id;

  const editForm = () => {
    setEndpointId(id);
    if (endpointId == null) {
      setValues({
        name: "",
        apiResponse: undefined,
        rateLimitDetails: "",
        version: "",
        versionReleaseNotes: "",
        errorHandlingDetails: "",
        authenticationDetails: "",
        businessRequirementsRules: "",
        slug: "",
        method: "",
        shortDescription: "",
        description: "",
        developmentRequirementsRules: "",
        services: "",
        requests: [],
        apiRequests: [],
        responses: [],
        responseMessage: [],
      });
    } else {
      axios
        .get(
          `${process.env.REACT_APP_BACK_END_API_URL}/endpoints/${endpointId}?populate=%2A`
        )
        .then((res) => {
          autoFillData = res?.data?.data?.attributes;
          setEndpointMasterId(autoFillData?.endpoint_master?.data?.id);
          setValues({
            name: autoFillData.name,
            apiResponse: JSON.stringify(autoFillData.apiResponse),
            rateLimitDetails: autoFillData.rateLimitDetails,
            version: autoFillData.version,
            versionReleaseNotes: autoFillData.versionReleaseNotes,
            errorHandlingDetails: autoFillData.errorHandlingDetails,
            authenticationDetails: autoFillData.authenticationDetails,
            businessRequirementsRules: autoFillData.businessRequirementsRules,
            slug: autoFillData.slug,
            method: autoFillData.method,
            shortDescription: autoFillData.shortDescription,
            description: autoFillData.description,
            developmentRequirementsRules:
              autoFillData.developmentRequirementsRules,
            services: autoFillData?.services.data[0]?.id,
            requests: [...autoFillData.requests],
            apiRequests: [...autoFillData.apiRequests],
            responses: [...autoFillData.responses],
            responseMessage: [...autoFillData.responseMessage],
          });
        })
        .catch((err) => {
          // console.log(err);
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

  useEffect(() => {
    editForm();
    if (localStorage.getItem("actionType")) {
      setIsDisabled(true);
    }

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then((res) => {
        setIsAdmin(res.data.isAdmin);
      })
      .catch((err) => {
        // console.log(err);
      });
  }, [endpointId]);

  const handleDeleteField = (index) => {
    const newData = [...values?.requests];
    newData.splice(index, 1);
    setFieldValue("requests", newData);
  };

  const removeApiRequest = (index) => {
    const newData = [...values?.apiRequests];
    newData.splice(index, 1);
    setFieldValue("apiRequests", newData);
  };

  const removeResponse = (index) => {
    const newData = [...values?.responses];
    newData.splice(index, 1);
    setFieldValue("responses", newData);
  };

  const removeResponseMessage = (index) => {
    const newData = [...values?.responseMessage];
    newData.splice(index, 1);
    setFieldValue("responseMessage", newData);
  };

  const {
    setFieldValue,
    values,
    errors,
    touched,
    setValues,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: initialValues,
    validationSchema: createServiceSchema,
    onSubmit: (value, action) => {
      action.resetForm();
      actionType = localStorage.getItem("actionType");

      // console.log(": VALUE DATA --=-=", value?.responses);
      const parsedResponses = value?.responses.map((response) => {
        if (response.objects !== undefined) {
          try {
            // console.log(response);
            response.objects = JSON.parse(response.objects);
          } catch (error) {
            // console.error("Error parsing JSON:", error);
          }
        }
        return response;
      });

      const parsedRequests = value?.requests.map((res) => {
        if (res.objects !== undefined) {
          try {
            // console.log(res);
            res.objects = JSON.parse(res.objects);
          } catch (error) {
            // console.error("Error parsing JSON:", error);
          }
        }
        return res;
      });

      const parsedResponseMessage = value?.responseMessage.map((resp) => {
        if (resp.payload !== undefined) {
          try {
            // console.log(resp);
            resp.payload = JSON.parse(resp.payload);
          } catch (error) {
            // console.error("Error parsing JSON:", error);
          }
        }
        return resp;
      });

      if (actionType === "edit") {
        axios
          .put(
            `${process.env.REACT_APP_BACK_END_API_URL}/endpoints/${endpointId}`,
            {
              data: {
                name: value.name,
                slug: value.slug,
                requests: parsedRequests,
                apiRequests: [...value?.apiRequests],
                responseMessage: parsedResponseMessage,
                responses: parsedResponses,
                apiResponse: JSON.parse(value?.apiResponse),
                rateLimitDetails: value.rateLimitDetails,
                version: value.version,
                versionReleaseNotes: value.versionReleaseNotes,
                errorHandlingDetails: value.errorHandlingDetails,
                authenticationDetails: value.authenticationDetails,
                businessRequirementsRules: value.businessRequirementsRules,
                method: value.method,
                shortDescription: value.shortDescription,
                description: value.description,
                developmentRequirementsRules:
                  value.developmentRequirementsRules,
                services: value.services,
              },
            },
            {
              headers: {
                Authorization: "Bearer " + item,
                "Content-Type": "application/json",
              },
            }
          )
          .then((re) => {
            successInputSwal("Endpoint updated successfully");
            navigate("/endpoint");
            setEndpointId(null);
          })
          .catch((er) => {
            // invalidInputSwal("Something went wrong");
            // console.log("Something went wrong", er);
          });
      } else if (actionType === "copy") {
        axios
          .post(
            `${process.env.REACT_APP_BACK_END_API_URL}/endpoints`,
            {
              data: {
                name: value.name,
                requests: parsedRequests,
                apiRequests: [...value?.apiRequests],
                responseMessage: parsedResponseMessage,
                responses: parsedResponses,
                apiResponse: JSON.parse(value?.apiResponse),
                rateLimitDetails: value.rateLimitDetails,
                version: value.version,
                versionReleaseNotes: value.versionReleaseNotes,
                errorHandlingDetails: value.errorHandlingDetails,
                authenticationDetails: value.authenticationDetails,
                businessRequirementsRules: value.businessRequirementsRules,
                slug: value.slug,
                method: value.method,
                shortDescription: value.shortDescription,
                description: value.description,
                developmentRequirementsRules:
                  value.developmentRequirementsRules,
                services: value.services,
                endpoint_master: endpointMasterId,
                userId: userId,
              },
            },
            {
              headers: {
                Authorization: "Bearer " + item,
                "Content-Type": "application/json",
              },
            }
          )
          .then((re) => {
            successInputSwal("Endpoint copy created successfully");
            navigate("/endpoint");
            setEndpointId(null);
          })
          .catch((er) => {
            // invalidInputSwal("Something went wrong");
            // console.log("Something went wrong", er);
          });
      } else {
        axios
          .post(
            `${process.env.REACT_APP_BACK_END_API_URL}/endpoint-masters`,
            {
              data: {
                name: value.name,
                slug: value.slug,
                shortDescription: value.shortDescription,
                description: value.description,
                method: value.method,
                service: value.services,
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
            axios
              .post(
                `${process.env.REACT_APP_BACK_END_API_URL}/endpoints`,
                {
                  data: {
                    name: value.name,
                    slug: value.slug,
                    requests: parsedRequests,
                    apiRequests: [...value?.apiRequests],
                    responseMessage: parsedResponseMessage,
                    responses: parsedResponses,
                    apiResponse: JSON.parse(value?.apiResponse),
                    rateLimitDetails: value.rateLimitDetails,
                    version: value.version,
                    versionReleaseNotes: value.versionReleaseNotes,
                    errorHandlingDetails: value.errorHandlingDetails,
                    authenticationDetails: value.authenticationDetails,
                    businessRequirementsRules: value.businessRequirementsRules,
                    method: value.method,
                    shortDescription: value.shortDescription,
                    description: value.description,
                    developmentRequirementsRules:
                      value.developmentRequirementsRules,
                    services: value.services,
                    endpoint_master: res?.data?.data?.id,
                    userId: userId,
                  },
                },
                {
                  headers: {
                    Authorization: "Bearer " + item,
                    "Content-Type": "application/json",
                  },
                }
              )
              .then((re) => {
                // console.log("response", re);
                successInputSwal("Endpoint created successfully");
                navigate("/endpoint");
              })
              .catch((er) => {
                // invalidInputSwal("Something went wrong");
                // console.log("Something went wrong", er);
              });
          })
          .catch((err) => {
            // invalidInputSwal("Something went wrong");

            setEndpointId(null);
            // console.log("Something went wrong", err);
          });
      }
    },
  });

  const user_idq = isAdmin === true ? undefined : userData?.id;

  const { data, loading, error, refetch } = useQuery(QUERY_service_masters, {
    variables: { user_idq },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });
  if (loading) {
    // return <Loading />;
  } else if (error) {
    return null;
  }

  const serviceMaster = data?.serviceMasters?.data;

  // console.log("data value=-", values);

  return (
    <>
      <AuthenticatePages>
        <div className="container">
          <div style={{ marginTop: "15px" }}>
            <span className="breadcrum" onClick={() => navigate("/dashboard")}>
              Dashboard
            </span>{" "}
            》
            <span className="breadcrum" onClick={() => navigate("/service")}>
              Services
            </span>{" "}
            》
            <span className="breadcrum" onClick={() => navigate("/endpoint")}>
              {" "}
              Endpoints
            </span>{" "}
            》<span className="breadcrum"> Add</span>
          </div>
          <h1
            style={{
              marginLeft: "15px",
            }}
            className="fs-2 fw-bold text-dark font_cern pt-4"
          >
            {localStorage.getItem("actionType") === "edit"
              ? "Update an entry"
              : localStorage.getItem("actionType") === "copy"
              ? "Copy an entry"
              : "Create an entry"}
            <p className="api_id text-dark font_cern">API ID : Endpoint</p>
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="form-group col ">
                <label for="method">Method</label>
                <select
                  placeholder="Choose here.."
                  type="select"
                  name="method"
                  id="method"
                  value={values.method}
                  className="form-control type_select minimal select_col"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    padding: "10px 10px",
                    height: "45px",
                  }}
                >
                  <option value="">Choose here...</option>
                  <option value="GET">Get</option>
                  <option value="POST">Post</option>
                  <option value="PUT">Put</option>
                  <option value="DELETE">Delete</option>
                </select>
                {errors.method && touched.method ? (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.method}
                  </p>
                ) : null}
              </div>
              <div
                className="form-group col col_2 "
                style={{
                  margin: "0px 0px 0px 15px",
                }}
              >
                <label for="services">Services</label>
                <select
                  placeholder="Choose here.."
                  type="select"
                  id="services"
                  name="services"
                  value={values.services}
                  className="form-control type_select minimal select_col"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    padding: "10px 10px",
                    height: "45px",
                  }}
                >
                  <option
                    className="form-control"
                    style={{
                      color: "black",
                      backgroundColor: "transparent",
                    }}
                  >
                    Choose here...
                  </option>
                  {serviceMaster?.map((item) => (
                    <option
                      className="form-control"
                      style={{
                        color: "black",
                        backgroundColor: "transparent",
                        textTransform: "uppercase",
                      }}
                      key={
                        item?.attributes.services.data[
                          item?.attributes?.services?.data?.length - 1
                        ]?.id
                      }
                      value={
                        item?.attributes.services.data[
                          item?.attributes?.services?.data?.length - 1
                        ]?.id
                      }
                    >
                      {
                        item?.attributes?.services?.data[
                          item?.attributes?.services?.data.length - 1
                        ]?.attributes?.name
                      }
                    </option>
                  ))}
                </select>
                {errors.services && touched.services ? (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.services}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="row">
              <div className="form-group col px-3">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="type name..."
                  className="form-control"
                  value={values?.name}
                  onChange={async (e) => {
                    setFieldValue("name", e?.target?.value);
                    setFieldValue("slug", await makeSlug(e?.target?.value));
                  }}
                  onBlur={handleBlur}
                  // disabled={isDisabled}
                  style={
                    isDisabled
                      ? {
                          backgroundColor: "transparent",
                          color: "gray",
                          border: "1px solid gray",
                        }
                      : {
                          backgroundColor: "transparent",
                          color: "black",
                        }
                  }
                />
                {errors.name && touched.name ? (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="form-group col col_2">
                <label for="version">Version</label>
                <input
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  className="form-control"
                  placeholder="type version..."
                  type="text"
                  name="version"
                  id="version"
                  value={values.version}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.version && touched.version ? (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.version}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="row">
              <div className="form-group col">
                <label for="inputAddress">Api Response</label>
                <textarea
                  type="text"
                  name="apiResponse"
                  id="inputAddress"
                  value={values?.apiResponse}
                  className="form-control"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="api response..."
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                />
                {errors.apiResponse && touched.apiResponse ? (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.apiResponse}
                  </p>
                ) : null}
              </div>
              <div className="form-group col col_2">
                <label for="rateLimitDetails">Rate Limit Details</label>
                <textarea
                  type="text"
                  name="rateLimitDetails"
                  id="rateLimitDetails"
                  value={values.rateLimitDetails}
                  className="form-control"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="rate limit details..."
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group col ">
                <label for="versionReleaseNotes">Version Release Notes</label>
                <textarea
                  type="text"
                  name="versionReleaseNotes"
                  id="versionReleaseNotes"
                  value={values.versionReleaseNotes}
                  className="form-control"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="version release notes"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                />
              </div>
              <div className="form-group col col_2">
                <label for="shortDescription">Short Description</label>
                <textarea
                  type="text"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  class="form-control"
                  id="shortDescription"
                  placeholder="short description"
                  name="shortDescription"
                  value={values.shortDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.shortDescription && touched.shortDescription ? (
                  <p style={{ color: "red", fontSize: "14px" }}>
                    {errors.shortDescription}
                  </p>
                ) : null}
              </div>
            </div>

            <FormGroup style={{ margin: "0px 5px 15px 15px", width: "99%" }}>
              <label for="examplePassword">Description</label>

              <ReactQuill
                theme="snow"
                value={values.description || initialValues.description}
                modules={modules}
                formats={formats}
                style={{
                  height: "300px",
                  marginBottom: "60px",
                }}
                id="description"
                name="description"
                placeholder="Enter description here..."
                onChange={(value) => {
                  setFieldValue("description", value);
                }}
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
            </FormGroup>
            <div className="mb_3 col_2" style={{ marginLeft: "15px" }}>
              <Label for="exampleEmail">
                Requests ({values?.requests.length})
              </Label>
              <span>
                <div
                  onClick={() => {
                    const updatedRequests = [
                      ...values?.requests,
                      initialRequest,
                    ];
                    setFieldValue("requests", updatedRequests);
                  }}
                  className="AddButtonForm"
                >
                  <BsPlusSquareFill size={32} />
                </div>
              </span>
              {values?.requests?.map((field, index) => {
                return (
                  <div key={index}>
                    <div
                      className="d_flex border rounded border-info p-1 mb-2 "
                      style={{
                        marginTop: "5px",
                        width: "99.5%",
                      }}
                    >
                      <div
                        className="card_bttn"
                        style={{ width: "100%", marginTop: "5px" }}
                      >
                        <FormGroup className="w-25">
                          <Label for="exampleEmail">Name</Label>
                          <Input
                            type="text"
                            name={`requests[${index}].name`}
                            id={`requests[${index}].name`}
                            placeholder="type name..."
                            defaultValue={field.name || null}
                            onChange={(event) => {
                              field.name = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.requests?.[index]?.name &&
                            errors?.requests?.[index]?.name && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.requests[index].name}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          style={{ margin: "0px 0px 0px 25px", width: "100%" }}
                        >
                          <Label>Type</Label>
                          <Input
                            placeholder="Choose here"
                            name={`requests[${index}].type`}
                            id={`requests[${index}].type`}
                            type="select"
                            defaultValue={field.type || null}
                            onChange={(event) => {
                              field.type = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              padding: "10px 10px",
                              height: "45px",
                              width: "100%",
                            }}
                            className="form-control type_select minimal"
                          >
                            <option value="">Choose here</option>
                            <option value="string">string</option>
                            <option value="integer">integer</option>
                            <option value="object">object</option>
                          </Input>
                          {touched?.requests?.[index]?.type &&
                            errors?.requests?.[index]?.type && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors?.requests[index].type}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup style={{ margin: "0px 25px" }}>
                          <Label>Is Required</Label>
                          <Input
                            placeholder="Select type"
                            name={`requests[${index}].isRequired`}
                            id={`requests[${index}].isRequired`}
                            type="select"
                            defaultValue={field.isRequired || null}
                            onChange={(event) => {
                              field.isRequired = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              padding: "10px 10px",
                              height: "45px",
                            }}
                            className="form-control type_select minimal"
                          >
                            <option value="">Choose here</option>
                            <option value="True">True</option>
                            <option value="False">False</option>
                          </Input>
                          {touched?.requests?.[index]?.isRequired &&
                            errors?.requests?.[index]?.isRequired && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors?.requests[index].isRequired}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup className="w-25">
                          <Label>Description</Label>
                          <Input
                            type="textarea"
                            name={`requests[${index}].description`}
                            id={`requests[${index}].description`}
                            placeholder="type description..."
                            defaultValue={field.description || null}
                            onChange={(event) => {
                              field.description = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.requests?.[index]?.description &&
                            errors?.requests?.[index]?.description && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.requests[index].description}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          className="w-50 ms-5"
                          style={{ margin: "0px 0px 10px 25px" }}
                        >
                          <Label>Objects</Label>
                          <Input
                            type="textarea"
                            name={`requests[${index}].objects`}
                            id={`requests[${index}].objects`}
                            defaultValue={JSON.stringify(field.objects) || null}
                            onChange={(event) => {
                              field.objects = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.requests?.[index]?.objects &&
                            errors?.requests?.[index]?.objects && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors?.requests[index].objects}
                              </p>
                            )}
                        </FormGroup>
                      </div>
                      <div style={{ width: "3%" }}>
                        <Button
                          className="addButt"
                          style={{
                            color: "black",
                            border: "none",
                            fontSize: "15px",
                            float: "right",
                            width: "25px",
                            height: "26px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleDeleteField(index)}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mb_3 col_2 " style={{ marginLeft: "15px" }}>
              <Label for="exampleEmail">
                Api Requests ({values?.apiRequests.length})
              </Label>
              <span style={{ marginBottom: "15px" }}>
                <div
                  onClick={() => {
                    const updatedApiRequests = [
                      ...values?.apiRequests,
                      initialApiRequest,
                    ];
                    setFieldValue("apiRequests", updatedApiRequests);
                  }}
                  className="AddButtonForm"
                >
                  <BsPlusSquareFill size={32} />
                </div>
              </span>
              {values?.apiRequests?.map((field, index) => {
                return (
                  <div key={index}>
                    <div
                      className=" border rounded border-info p-1 mb-2 "
                      style={{
                        marginTop: "15px",
                        width: "99.5%",
                      }}
                    >
                      <div
                        className=""
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <FormGroup
                            className="w-25"
                            style={{ width: "170%", margin: "15px" }}
                          >
                            <Label>Language</Label>
                            <Input
                              type="text"
                              name={`apiRequests[${index}].language`}
                              id={`apiRequests[${index}].language`}
                              placeholder="language..."
                              defaultValue={field.language || null}
                              onChange={(event) => {
                                field.language = event.target.value;
                              }}
                              style={{
                                backgroundColor: "transparent",
                                color: "black",
                              }}
                            />
                            {touched?.apiRequests?.[index]?.language &&
                              errors?.apiRequests?.[index]?.language && (
                                <p
                                  style={{
                                    color: "red",
                                    fontSize: "14px",
                                    marginTop: "1px",
                                  }}
                                >
                                  {errors.apiRequests[index].language}
                                </p>
                              )}
                          </FormGroup>
                        </div>
                        <div style={{ width: "3%" }}>
                          <Button
                            className="addButt"
                            style={{
                              color: "black",
                              border: "none",
                              fontSize: "15px",
                              float: "right",
                              width: "25px",
                              height: "26px",
                              // marginTop:" 2.8rem",
                              cursor: "pointer",
                            }}
                            onClick={() => removeApiRequest(index)}
                          >
                            X
                          </Button>
                        </div>
                      </div>
                      <FormGroup style={{ margin: "15px" }}>
                        <Label for="examplePassword">Requests</Label>

                        <ReactQuill
                          theme="snow"
                          defaultValue={field.requests || null}
                          modules={modules}
                          formats={formats}
                          style={{
                            height: "300px",
                            marginBottom: "60px",
                          }}
                          name={`apiRequests[${index}].requests`}
                          id={`apiRequests[${index}].requests`}
                          placeholder="Enter request here..."
                          onChange={(value) => {
                            field.requests = value;
                          }}
                        />
                        {touched?.apiRequests?.[index]?.requests &&
                          errors?.apiRequests?.[index]?.requests && (
                            <p
                              style={{
                                color: "red",
                                fontSize: "14px",
                                marginTop: "-20px",
                              }}
                            >
                              {errors.apiRequests[index].requests}
                            </p>
                          )}
                      </FormGroup>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mb_3 col_2" style={{ marginLeft: "15px" }}>
              <Label for="exampleEmail">
                Responses ({values?.responses.length})
              </Label>
              <span>
                <div
                  onClick={() => {
                    const updatedResponses = [
                      ...values?.responses,
                      initialResponses,
                    ];
                    setFieldValue("responses", updatedResponses);
                  }}
                  className="AddButtonForm"
                >
                  <BsPlusSquareFill size={32} />
                </div>
              </span>
              {values?.responses?.map((field, index) => {
                return (
                  <div key={index}>
                    <div
                      className="d_flex border rounded border-info p-1 mb-2 "
                      style={{
                        marginTop: "5px",
                        width: "99.5%",
                      }}
                    >
                      <div
                        className="card_bttn"
                        style={{ width: "100%", marginTop: "5px" }}
                      >
                        <FormGroup className="w-25">
                          <Label for="exampleEmail">Name</Label>
                          <Input
                            type="text"
                            name={`responses[${index}].name`}
                            id={`responses[${index}].name`}
                            defaultValue={field.name || null}
                            onChange={(event) => {
                              field.name = event.target.value;
                            }}
                            placeholder="type name..."
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responses?.[index]?.name &&
                            errors?.responses?.[index]?.name && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responses[index].name}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          className="w-25 ms-5"
                          style={{ margin: "0px 0px 0px 25px", width: "100%" }}
                        >
                          <Label>Type</Label>
                          <Input
                            placeholder="Select type"
                            name={`responses[${index}].type`}
                            id={`responses[${index}].type`}
                            defaultValue={field.type || null}
                            onChange={(event) => {
                              field.type = event.target.value;
                            }}
                            type="select"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              padding: "10px 10px",
                              height: "45px",
                            }}
                            className="form-control type_select minimal"
                          >
                            <option value="">Choose here</option>
                            <option value="string">string</option>
                            <option value="integer">integer</option>
                            <option value="object">object</option>
                          </Input>
                          {touched?.responses?.[index]?.type &&
                            errors?.responses?.[index]?.type && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responses[index].type}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          className="w-25  ms-5"
                          style={{ margin: "0px 25px" }}
                        >
                          <Label>Is Nullable</Label>
                          <Input
                            placeholder="Select type"
                            name={`responses[${index}].isNullable`}
                            id={`responses[${index}].isNullable`}
                            defaultValue={field.isNullable || false}
                            onChange={(event) => {
                              field.isNullable = event.target.value;
                            }}
                            type="select"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                              padding: "10px 10px",
                              height: "45px",
                            }}
                            className="form-control type_select minimal"
                          >
                            <option value={false}>false</option>
                            <option value={true}>true</option>
                          </Input>
                          {touched?.responses?.[index]?.isNullable &&
                            errors?.responses?.[index]?.isNullable && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responses[index].isNullable}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup className="w-25">
                          <Label>Description</Label>
                          <Input
                            type="textarea"
                            name={`responses[${index}].description`}
                            id={`responses[${index}].description`}
                            defaultValue={field.description || null}
                            onChange={(event) => {
                              field.description = event.target.value;
                            }}
                            placeholder="type description..."
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responses?.[index]?.description &&
                            errors?.responses?.[index]?.description && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responses[index].description}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          className="w-50 ms-5"
                          style={{ margin: "0px 0px 10px 25px" }}
                        >
                          <Label>Objects</Label>
                          <Input
                            type="textarea"
                            name={`responses[${index}].objects`}
                            id={`responses[${index}].objects`}
                            defaultValue={JSON.stringify(field.objects) || null}
                            onChange={(event) => {
                              field.objects = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responses?.[index]?.objects &&
                            errors?.responses?.[index]?.objects && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responses[index].objects}
                              </p>
                            )}
                        </FormGroup>
                      </div>

                      <Button
                        className="addButt"
                        style={{
                          color: "black",
                          border: "none",
                          fontSize: "15px",
                          float: "right",
                          width: "25px",
                          height: "26px",
                          cursor: "pointer",
                        }}
                        onClick={() => removeResponse(index)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mb_3 col_2" style={{ marginLeft: "15px" }}>
              <Label for="exampleEmail">
                Response Messages ({values?.responseMessage.length})
              </Label>
              <span>
                <div
                  onClick={() => {
                    const updatedResponseMessage = [
                      ...values?.responseMessage,
                      initialResponseMessage,
                    ];
                    setFieldValue("responseMessage", updatedResponseMessage);
                  }}
                  className="AddButtonForm"
                >
                  <BsPlusSquareFill size={32} />
                </div>
              </span>
              {values?.responseMessage?.map((field, index) => {
                return (
                  <div key={index}>
                    <div
                      className="d_flex border rounded border-info p-1 mb-2 "
                      style={{
                        marginTop: "5px",
                        width: "99.5%",
                      }}
                    >
                      <div
                        className="card_bttn_2"
                        style={{ width: "100%", marginTop: "5px" }}
                      >
                        <FormGroup className="w-25" style={{ width: "65%" }}>
                          <Label for="exampleEmail">Status Code</Label>
                          <Input
                            type="number"
                            name={`responseMessage[${index}].statusCode`}
                            id={`responseMessage[${index}].statusCode`}
                            defaultValue={field.statusCode || null}
                            onChange={(event) => {
                              field.statusCode = event.target.value;
                            }}
                            placeholder="status code"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responseMessage?.[index]?.statusCode &&
                            errors?.responseMessage?.[index]?.statusCode && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responseMessage[index].statusCode}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          className="w-50 ms-5"
                          style={{ margin: "0px 10px 10px 25px", width: "65%" }}
                        >
                          <Label>Response Mode Type</Label>
                          <Input
                            placeholder="Select type"
                            name={`responseMessage[${index}].responseModeType`}
                            id={`responseMessage[${index}].responseModeType`}
                            defaultValue={field.responseModeType || null}
                            onChange={(event) => {
                              field.responseModeType = event.target.value;
                            }}
                            type="text"
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responseMessage?.[index]
                            ?.responseModeType &&
                            errors?.responseMessage?.[index]
                              ?.responseModeType && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responseMessage[index].responseModeType}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup className="w-25" style={{ width: "65%" }}>
                          <Label>Condition</Label>
                          <Input
                            type="textarea"
                            placeholder="type condition..."
                            name={`responseMessage[${index}].condition`}
                            id={`responseMessage[${index}].condition`}
                            defaultValue={field.condition || null}
                            onChange={(event) => {
                              field.condition = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responseMessage?.[index]?.condition &&
                            errors?.responseMessage?.[index]?.condition && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responseMessage[index].condition}
                              </p>
                            )}
                        </FormGroup>
                        <FormGroup
                          className="w-50 ms-5"
                          style={{ margin: "0px 10px 10px 25px", width: "65%" }}
                        >
                          <Label>Payload</Label>
                          <Input
                            type="textarea"
                            name={`responseMessage[${index}].payload`}
                            id={`responseMessage[${index}].payload`}
                            placeholder="payload"
                            defaultValue={JSON.stringify(field.payload) || null}
                            onChange={(event) => {
                              field.payload = event.target.value;
                            }}
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                          />
                          {touched?.responseMessage?.[index]?.payload &&
                            errors?.responseMessage?.[index]?.payload && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "14px",
                                  marginTop: "1px",
                                }}
                              >
                                {errors.responseMessage[index].payload}
                              </p>
                            )}
                        </FormGroup>
                      </div>

                      <Button
                        className="addButt"
                        style={{
                          color: "black",
                          border: "none",
                          fontSize: "15px",
                          float: "right",
                          width: "25px",
                          height: "26px",
                          cursor: "pointer",
                        }}
                        onClick={() => removeResponseMessage(index)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ margin: "0px 0px 15px 15px", width: "100%" }}>
              <FormGroup style={{ width: "99%", marginTop: "10px" }}>
                <Label for="examplePassword">Error Handling Details</Label>

                <ReactQuill
                  theme="snow"
                  value={
                    values.errorHandlingDetails ||
                    initialValues.errorHandlingDetails
                  }
                  modules={modules}
                  formats={formats}
                  style={{
                    height: "300px",
                    marginBottom: "60px",
                  }}
                  id="errorHandlingDetails"
                  name="errorHandlingDetails"
                  placeholder="Wirte error handling details change..."
                  onChange={(value) => {
                    setFieldValue("errorHandlingDetails", value);
                  }}
                />
              </FormGroup>
              <FormGroup style={{ width: "99%", marginTop: "10px" }}>
                <Label for="examplePassword">Authentication Details</Label>

                <ReactQuill
                  theme="snow"
                  value={
                    values.authenticationDetails ||
                    initialValues.authenticationDetails
                  }
                  modules={modules}
                  formats={formats}
                  style={{
                    height: "300px",
                    marginBottom: "60px",
                  }}
                  id="authenticationDetails"
                  name="authenticationDetails"
                  placeholder="Wirte authentication details..."
                  onChange={(value) => {
                    setFieldValue("authenticationDetails", value);
                  }}
                />
              </FormGroup>
              <FormGroup style={{ width: "99%", marginTop: "10px" }}>
                <Label for="examplePassword">
                  Business Requirements Rules{" "}
                </Label>

                <ReactQuill
                  theme="snow"
                  value={
                    values.businessRequirementsRules ||
                    initialValues.businessRequirementsRules
                  }
                  modules={modules}
                  formats={formats}
                  style={{
                    height: "300px",
                    marginBottom: "60px",
                  }}
                  id="businessRequirementsRules"
                  name="businessRequirementsRules"
                  placeholder="Wirte business requirements rules..."
                  onChange={(value) => {
                    setFieldValue("businessRequirementsRules", value);
                  }}
                />
              </FormGroup>
              <FormGroup style={{ width: "99%", marginTop: "10px" }}>
                <Label for="examplePassword">
                  Development Requirements Rules
                </Label>

                <ReactQuill
                  theme="snow"
                  value={
                    values.developmentRequirementsRules ||
                    initialValues.developmentRequirementsRules
                  }
                  modules={modules}
                  formats={formats}
                  style={{
                    height: "300px",
                    marginBottom: "60px",
                  }}
                  id="developmentRequirementsRules"
                  name="developmentRequirementsRules"
                  placeholder="Wirte development requirements rules..."
                  onChange={(value) => {
                    setFieldValue("developmentRequirementsRules", value);
                  }}
                />
              </FormGroup>
            </div>
            <hr
              style={{
                marginLeft: "15px",
                width: "99%",
              }}
            />
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
            <button
              className="addButton"
              id="resetBttnColor"
              style={{
                marginLeft: "15px",
                width: "120px",
              }}
              onClick={() => {
                navigate({
                  pathname: `/endpoint`,
                });
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      </AuthenticatePages>
    </>
  );
};

export default EndpointForm;
