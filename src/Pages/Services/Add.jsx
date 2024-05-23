import React, { useState, useEffect } from "react";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import { Button, FormGroup, Label, Input } from "reactstrap";
import "react-markdown-editor-lite/lib/index.css";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { successInputSwal, invalidInputSwal } from "../../swal.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import sampleFileService from "../../Assets/docs/Solution_Design_Details_for_Service.docx";
import Tippy from "@tippyjs/react";
import { MdDownloadForOffline } from "react-icons/md";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { BsPlusSquareFill } from "react-icons/bs";
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

const initialValues = {
  name: "",
  slug: "",
  type: "",
  shortDescription: "",
  authorName: "",
  authorEmail: "",
  releaseNotes: "",
  repoLink: "",
  version: "",
  description: "",
  getStarted: "",
  documentation: null,
  techStack:""
};

const CreateService = () => {
  let item = JSON.parse(localStorage.getItem("token"));
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  const navigate = useNavigate();

  const [serviceId, setServiceId] = useState(null);
  const [serviceMasterId, setServiceMasterId] = useState(0);
  const [serviceDocumentationId, setServiceDocumentationId] = useState(0);
  const [tags, setTags] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [kbArticles, setKBArticles] = useState([]);
  const [targetBusinessDomains, setTargetBusinessDomains] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [documentationName, setDocumentationName] = useState("");
  const [documentationURL, setDocumentationURL] = useState("");

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

  const editServiceSchema = Yup.object({
    name: Yup.string().min(3).max(100).required("Please enter name"),
    techStack: Yup.string().required("Please enter techstack"),
    shortDescription: Yup.string()
      .min(6, "Short description must be at least 6 characters")
      .required("Please enter short description"),
    authorName: Yup.string()
      .min(3, "Author Name must be at least 3 characters")
      .required("Please enter author name"),
    authorEmail: Yup.string()
      .email("Author Email must be a valid Email")
      .required("Please enter author email"),
    releaseNotes: Yup.string()
      .min(3, "Release Note must be at least 3 characters")
      .required("Please enter release note"),
    version: Yup.string()
      .matches(/^([a-zA-Z0-9])[a-zA-Z0-9-_.]*$/, "Invalid format")
      .required("Please type version"),
    description: Yup.string()
      .min(20, "Description must be at least 20 characters")
      .required("Please enter description"),
    documentation: Yup.string(),
  });
  const createServiceSchema = Yup.object({
    name: Yup.string().min(3).max(100).required("Please enter name"),
    techStack: Yup.string().required("Please enter techstack"),
    shortDescription: Yup.string()
      .min(6, "Short description must be at least 6 characters")
      .required("Please enter short description"),
    authorName: Yup.string()
      .min(3, "Author Name must be at least 3 characters")
      .required("Please enter author name"),
    authorEmail: Yup.string()
      .email("Author Email must be a valid Email")
      .required("Please enter author email"),
    releaseNotes: Yup.string()
      .min(3, "Release Note must be at least 3 characters")
      .required("Please enter release note"),
    version: Yup.string()
      .matches(/^([a-zA-Z0-9])[a-zA-Z0-9-_.]*$/, "Invalid format")
      .required("Please type version"),
    description: Yup.string()
      .min(20, "Description must be at least 20 characters")
      .required("Please enter description"),
    documentation: Yup.string().required("Please select the document"),
  });

  // api call for edit form auto fill fields

  const params = useParams();
  let id = params.id;
  let autoFillData;
  const editForm = () => {
    setServiceId(id);
    if (serviceId == null) {
      setValues({
        name: "",
        slug: "",
        shortDescription: "",
        authorName: "",
        authorEmail: "",
        releaseNotes: "",
        repoLink: "",
        version: "",
        techStack:"",
        description: "",
        getStarted: "",
        documentation: null,
      });
      setTags([]);
      setContributors([]);
      setKBArticles([]);
      setTargetBusinessDomains([]);
      setServiceDocumentationId(0);
      setDocumentationName("");
      setDocumentationURL("");
    } else {
      axios
        .get(
          `${process.env.REACT_APP_BACK_END_API_URL}/services/${serviceId}?populate=%2A`
        )
        .then((res) => {
          autoFillData = res?.data?.data?.attributes;
          console.log("autoFillData", autoFillData);
          setServiceMasterId(autoFillData?.service_master?.data?.id);
          setServiceDocumentationId(autoFillData?.documentation?.data?.id);
          setDocumentationName(
            autoFillData?.documentation?.data?.attributes?.name
          );
          setDocumentationURL(
            autoFillData?.documentation?.data?.attributes?.url
          );
          setTags(autoFillData?.tags);
          setContributors(autoFillData?.contributors);
          setKBArticles(autoFillData?.kbArticles);
          setTargetBusinessDomains(autoFillData?.targetBusinessDomains);
          setValues({
            name: autoFillData.name,
            techStack:autoFillData.techStack,
            slug: autoFillData.slug,
            shortDescription: autoFillData.shortDescription,
            authorName: autoFillData.authorName,
            authorEmail: autoFillData.authorEmail,
            releaseNotes: autoFillData.versionReleaseNotes,
            repoLink: autoFillData.repoLinks,
            version: autoFillData.version,
            description: autoFillData.description,
            getStarted: autoFillData.gettingStartedGuide,
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

  useEffect(() => {
    editForm();

    if (localStorage.getItem("actionType")) {
      setIsDisabled(true);
    }
  }, [serviceId]);
  const removeTags = (name) => {
    setTags((removeTags) => removeTags.filter((field) => field !== name));
  };

  const removeTargetBusinessDomains = (name) => {
    setTargetBusinessDomains((removeDomains) =>
      removeDomains.filter((field) => field !== name)
    );
  };
  const removeContributors = (name) => {
    setContributors((contri) => contri.filter((field) => field !== name));
  };

  const removeKbArticles = (name) => {
    setKBArticles((kb) => kb.filter((field) => field !== name));
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
    validationSchema:
      documentationName !== null ? editServiceSchema : createServiceSchema,
    onSubmit: (value, action) => {
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
              name: value.name,
              slug: value.slug,
              type: "service",
              description: value.description,
              shortDescription: value.shortDescription,
              gettingStartedGuide: value.getStarted,
              authorEmail: value.authorEmail,
              authorName: value.authorName,
              repoLinks: value.repoLink,
              techStack:value.techStack,
              versionReleaseNotes: value.releaseNotes,
              version: value.version,
              tags: tags,
              contributors: contributors,
              kbArticles: kbArticles,
              targetBusinessDomains: targetBusinessDomains,
            })
          );
          axios
            .put(
              `${process.env.REACT_APP_BACK_END_API_URL}/services/${serviceId}?populate=%2A`,
              formData,
              {
                headers: {
                  Authorization: "Bearer " + item,
                  "Content-Type": "multipart/form-data", // Set the content type as multipart/form-data
                },
              }
            )
            .then((re) => {
              console.log("edit servce--- with doc=", re);
              successInputSwal("Service updated successfully");
              navigate("/service");
              setServiceId(null);
            })
            .catch((er) => {
              invalidInputSwal("Something went wrong");
            });
        } else {
          axios
            .put(
              `${process.env.REACT_APP_BACK_END_API_URL}/services/${serviceId}?populate=%2A`,
              {
                data: {
                  name: value.name,
                  slug: value.slug,
                  type: "service",
                  description: value.description,
                  shortDescription: value.shortDescription,
                  gettingStartedGuide: value.getStarted,
                  authorEmail: value.authorEmail,
                  authorName: value.authorName,
                  repoLinks: value.repoLink,
                  techStack:value.techStack,
                  versionReleaseNotes: value.releaseNotes,
                  version: value.version,
                  tags: tags,
                  contributors: contributors,
                  kbArticles: kbArticles,
                  targetBusinessDomains: targetBusinessDomains,
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
              console.log("edit servce---= not doc", res);
              successInputSwal("Service updated successfully");
              navigate("/service");
              setServiceId(null);
            })
            .catch((er) => {
              invalidInputSwal("Something went wrong");
            });
        }
      } else if (actionType === "copy") {
        const formData = new FormData();

        if (value?.documentation) {
          formData.append(`files.documentation`, value?.documentation);
        }

        formData.append(
          "data",
          JSON.stringify({
            name: value.name,
            slug: value.slug,
            type: "service",
            description: value.description,
            shortDescription: value.shortDescription,
            gettingStartedGuide: value.getStarted,
            authorEmail: value.authorEmail,
            authorName: value.authorName,
            repoLinks: value.repoLink,
            versionReleaseNotes: value.releaseNotes,
            version: value.version,
            tags: tags,
            contributors: contributors,
            kbArticles: kbArticles,
            targetBusinessDomains: targetBusinessDomains,
            service_master: serviceMasterId,
            documentation: serviceDocumentationId,
            userId: userId,
          })
        );

        axios
          .post(
            `${process.env.REACT_APP_BACK_END_API_URL}/services?populate=%2A`,
            formData,
            {
              headers: {
                Authorization: "Bearer " + item,
                "Content-Type": "multipart/form-data",
              },
            }
          )
          .then((re) => {
            console.log("copy services----------", re);
            successInputSwal("Service copy created successfully");
            navigate("/service");
            setServiceId(null);
          })
          .catch((er) => {
            invalidInputSwal("Something went wrong");
          });
      } else {
        axios
          .post(
            `${process.env.REACT_APP_BACK_END_API_URL}/service-masters`,
            {
              data: {
                name: value?.name,
                slug: value?.slug,
                type: "service",
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
                type: "service",
                description: value.description,
                shortDescription: value.shortDescription,
                gettingStartedGuide: value.getStarted,
                authorEmail: value.authorEmail,
                authorName: value.authorName,
                techStack:value.techStack,
                repoLinks: value.repoLink,
                versionReleaseNotes: value.releaseNotes,
                version: value.version,
                service_master: res?.data?.data?.id,
                tags: tags,
                contributors: contributors,
                kbArticles: kbArticles,
                targetBusinessDomains: targetBusinessDomains,
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
              .then((re) => {
                console.log("create with Dcoument", re);
                successInputSwal("Service created successfully");
                navigate("/service");
              })
              .catch((er) => {
                invalidInputSwal("Something went wrong");
              });
          })
          .catch((err) => {
            invalidInputSwal("Something went wrong");
            setServiceId(null);
          });
      }
    },
  });

  const handleDownload = (e) => {
    const link = document.createElement("a");
    link.download = "Solution_Design_Details_for_Service";

    link.href = sampleFileService;

    link.click();
  };
  const handleDownload2 = (e) => {
    const link = document.createElement("a");
    link.download = { documentationName };

    link.href = `${process.env.REACT_APP_API_URL}${documentationURL}`;

    link.click();
  };

  return (
    <>
      <AuthenticatePages>
        <div className="container">
          <div style={{ marginTop: "14px" }}>
            <span onClick={() => navigate("/dashboard")} className="breadcrum">
              Dashboard
            </span>{" "}
            》
            <span onClick={() => navigate("/service")} className="breadcrum">
              Services
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
              ? "Edit Service"
              : localStorage.getItem("actionType") === "copy"
              ? "Copy Service"
              : "Create Service"}
          </h1>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="form-group col px-3">
                <label for="inputName">Name</label>

                <input
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
                  type="text"
                  className="form-control "
                  placeholder="name"
                  name="name"
                  value={values?.name}
                  onChange={async (e) => {
                    setFieldValue("name", e?.target?.value);
                    setFieldValue("slug", await makeSlug(e?.target?.value));
                  }}
                  onBlur={handleBlur}
                />
                {errors.name && touched.name ? (
                  <p style={{ color: "red", fontSize: "13px" }}>
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="form-group col px-3">
                <label for="inputAddress">Short Description</label>
                <input
                  type="text"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  className="form-control"
                  id="inputAddress"
                  placeholder="short description"
                  name="shortDescription"
                  value={values.shortDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.shortDescription && touched.shortDescription ? (
                  <p style={{ color: "red", fontSize: "13px" }}>
                    {errors.shortDescription}
                  </p>
                ) : null}
              </div>

              
            </div>
            <div className="row">
              <div className="form-group col px-3">
                <label for="version">Version</label>
                <input
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  className="form-control"
                  placeholder="version"
                  type="text"
                  name="version"
                  id="version"
                  value={values.version}
                  onChange={handleChange}
                  onBlur={handleBlur}
                ></input>
                {errors.version && touched.version ? (
                  <p style={{ color: "red", fontSize: "13px" }}>
                    {errors.version}
                  </p>
                ) : null}
              </div>
              <div className="form-group col px-3">
                <label>Version Release Notes</label>
                <input
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  className="form-control"
                  placeholder="release note"
                  name="releaseNotes"
                  value={values.releaseNotes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                ></input>
                {errors.releaseNotes && touched.releaseNotes ? (
                  <p style={{ color: "red", fontSize: "13px" }}>
                    {errors.releaseNotes}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="row">
              <div className="form-group col px-3">
                <label>Repo Link</label>
                <input
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  className="form-control"
                  placeholder="repo link"
                  name="repoLink"
                  value={values.repoLink}
                  onChange={handleChange}
                  onBlur={handleBlur}
                ></input>
              </div>
              <div className="form-group col px-3">
                <label>Author Name</label>
                <input
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                  placeholder="auther name"
                  type="text"
                  className="form-control"
                  value={values.authorName}
                  name="authorName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                ></input>
                {errors.authorName && touched.authorName ? (
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
                  value={values.authorEmail}
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
            <FormGroup style={{ margin: "0px 0px 15px 15px" }}>
              <Label>Description</Label>
              {/* <Editor
                ref={mdEditor}
                value={values.description || initialValues.description}
                placeholder="write description here"
                onChange={(data) =>
                  handleChange(
                    {
                      target: { name: "description", value: data.text },
                    },
                  )
                }
                onBlur={handleBlur}
                name="description"
                style={{ height: "200px", fontSize: "20px" }}
                renderHTML={(text) => (
                  <ReactMarkdown children={text} style={{ height: "200px" }} />
                )}
              /> */}

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

            <FormGroup style={{ margin: "0px 0px 15px 15px" }}>
              <Label>Getting Started Guide</Label>
              {/* <Editor
                ref={mdEditor}
                value={values.getStarted || initialValues.getStarted}
                placeholder="write getting started guide"
                onChange={(data) =>
                  handleChange({
                    target: { name: "getStarted", value: data.text },
                  })
                }
                onBlur={handleBlur}
                name="getStarted"
                style={{ height: "200px", fontSize: "20px" }}
                renderHTML={(text) => (
                  <ReactMarkdown children={text} style={{ height: "200px" }} />
                )}
              /> */}
              <ReactQuill
                theme="snow"
                value={values.getStarted || initialValues.getStarted}
                modules={modules}
                formats={formats}
                style={{
                  height: "300px",
                  marginBottom: "60px",
                }}
                id="getStarted"
                name="getStarted"
                placeholder="Enter getting started guide..."
                onChange={(value) => {
                  setFieldValue("getStarted", value);
                }}
              />
            </FormGroup>

            <div className="row" style={{ width: "100%" }}>
              <div className="form-group col px-3">
                <label>Tags({tags.length})</label>{" "}
                <span>
                  <div
                    onClick={() => setTags((data) => [...data, { name: "" }])}
                    className="AddButtonForm"
                  >
                    <BsPlusSquareFill size={32} />
                  </div>
                </span>
                <div
                  style={{ marginTop: "15px" }}
                  className={
                    tags.length
                      ? "border rounded border-info p-1 mb-2 border rounded p-1 "
                      : "border rounded p-1"
                  }
                >
                  {tags.map((e) => {
                    return (
                      <>
                        <div
                          // className=" border rounded p-1 "
                          style={{
                            // display: "flex",
                            // justifyContent: "space-between",
                            display: "grid",
                            gridTemplateColumns: "97.5% 2.5%",
                            margin: "5px",
                            width: "100%",
                          }}
                        >
                          <div className="px-3">
                            <FormGroup style={{ padding: "5px" }}>
                              <Label>Tag Name</Label>
                              <Input
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  marginTop: "5px",
                                }}
                                type="text"
                                name="tag"
                                id="tag"
                                className="form_control_2"
                                placeholder="name"
                                defaultValue={e.name || null}
                                onChange={(event) => {
                                  e.name = event.target.value;
                                }}
                              />
                            </FormGroup>
                          </div>
                          <Button
                            // className="addButton"
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
                              marginRight: "10px",
                              cursor: "pointer",
                            }}
                            onClick={() => removeTags(e)}
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
            <div className="row">
              <div className="form-group col px-3">
                <label>
                  Target Business Domains ({targetBusinessDomains.length})
                </label>
                <span>
                  <div
                    onClick={() =>
                      setTargetBusinessDomains((data) => [
                        ...data,
                        { domain: "" },
                      ])
                    }
                    className="AddButtonForm"
                  >
                    {/* <BsFillPlusCircleFill size={25} /> */}
                    <BsPlusSquareFill size={32} />
                  </div>
                </span>
                <div
                  style={{ marginTop: "15px" }}
                  className={
                    targetBusinessDomains.length
                      ? "border rounded border-info p-1 mb-2 border rounded p-1 "
                      : "border rounded p-1"
                  }
                >
                  {targetBusinessDomains.map((e) => {
                    return (
                      <>
                        <div
                          // className=" border rounded"
                          style={{
                            // display: "flex",
                            // justifyContent: "space-between",
                            display: "grid",
                            gridTemplateColumns: "97.5% 2.5%",
                            margin: "5px",
                            width: "100%",
                          }}
                        >
                          <div className=" px-3">
                            <FormGroup style={{ padding: "5px" }}>
                              <Label>Domain</Label>
                              <Input
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  width: "250px",
                                  marginTop: "5px",
                                }}
                                defaultValue={e.domains || null}
                                type="text"
                                name="tag"
                                id="tag"
                                placeholder="name"
                                className="form_control_2"
                                onChange={(event) => {
                                  e.domains = event.target.value;
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
                            onClick={() => removeTargetBusinessDomains(e)}
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
            <div className="row">
              <div className="form-group col px-3">
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
                  {contributors.map((e) => {
                    return (
                      <>
                        <div
                          // className=" border rounded"
                          style={{
                            // display: "flex",
                            // justifyContent: "space-between",
                            display: "grid",
                            gridTemplateColumns: "97.5% 2.5%",
                            margin: "5px",
                            width: "100%",
                          }}
                        >
                          <div
                            className="px-3"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "47% 47%",
                            }}
                          >
                            <FormGroup style={{ padding: "5px" }}>
                              <Label>Name</Label>
                              <Input
                                style={{
                                  width: "45rem",
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
                                  width: "45rem",
                                  backgroundColor: "transparent",
                                  color: "black",
                                  marginTop: "5px",
                                }}
                                value={e.email || null}
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
            <div className="row">
              <div className="form-group col ">
                {/* px-3 */}
                <label>kbArticles({kbArticles.length})</label>
                <span>
                  <div
                    onClick={() =>
                      setKBArticles((data) => [...data, { url: "" }])
                    }
                    className="AddButtonForm"
                  >
                    <BsPlusSquareFill size={32} />
                  </div>
                </span>
                <div
                  style={{ marginTop: "15px" }}
                  className={
                    kbArticles.length
                      ? "border rounded border-info p-1 mb-2 border rounded p-1 "
                      : "border rounded p-1"
                  }
                >
                  {kbArticles.map((e) => {
                    return (
                      <>
                        <div
                          // className=" border rounded p-1 "
                          style={{
                            display: "grid",
                            gridTemplateColumns: "97.5% 2.5%",
                            margin: "5px",
                            width: "100%",
                          }}
                        >
                          <div className="px-3">
                            <FormGroup style={{ padding: "5px" }}>
                              <Label>Url</Label>
                              <Input
                                style={{
                                  backgroundColor: "transparent",
                                  color: "black",
                                  width: "89px",
                                  marginTop: "5px",
                                }}
                                defaultValue={e.url || null}
                                type="text"
                                name="question"
                                id="question"
                                className="form_control_2"
                                placeholder="name"
                                onChange={(event) => {
                                  e.url = event.target.value;
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
                            onClick={() => removeKbArticles(e)}
                          >
                            X
                          </Button>
                        </div>
                      </>
                    );
                  })}
                </div>

                {/* <div style={{ marginTop: "15px" }}  className={tags.length ? "border rounded border-info p-1 mb-2 border rounded p-1 " : "border rounded p-1" }>
                {tags.map((e) => {
                  return (
                    <>
                      <div
                        // className=" border rounded p-1 "
                        style={{
                          display: "grid",
                          gridTemplateColumns:"97.5% 2.5%",
                          margin: "5px",
                          width: "100%",
                        }}
                      >
                        <div className="px-3" >
                          <FormGroup style={{ padding: "5px" }}>
                            <Label>Tag Name</Label>
                            <Input
                              style={{
                                backgroundColor: "transparent",
                                color: "black",
                                width: "89px",
                                marginTop: "5px",
                              }}
                              type="text"
                              name="tag"
                              id="tag"
                              placeholder="name"
                              defaultValue={e.name || null}
                              onChange={(event) => {
                                e.name = event.target.value;
                              }}
                            />
                          </FormGroup>
                        </div>
                        <Button
                          // className="addButton"
                          className="addButt"
                          style={{
                            backgroundColor: "red",
                            color: "black",
                            border: "none",
                            fontSize: "15px",
                            float:"right",
                            width: "25px",
                            height: "26px",
                            marginTop:" 2.8rem",
                            cursor:"pointer"
                            
                          }}
                          onClick={() => removeTags(e)}
                        >
                          X
                        </Button>
                      </div>
                    </>
                  );
                })}
                </div> */}
              </div>
            </div>
            <div className="row">
              <div
                className="form-group col px-3"
                // style={{ margin: "0px 0px 0px 10px" }}
              >
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
                      <span>Download Sample Service file</span>
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
                    <span
                      style={{
                        cursor: "pointer",
                        padding: "10px 10px 3px 10px",
                        margin: "5px",
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
                    </span>
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
              <p style={{ color: "red", fontSize: "13px", marginTop: "-13px" }}>
                {errors.documentation}
              </p>
            ) : null}
            <hr
              style={{
                marginLeft: "15px",
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
                  pathname: `/service`,
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

export default CreateService;
