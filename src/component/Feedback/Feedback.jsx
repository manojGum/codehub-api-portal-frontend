import React, { useState } from "react";
import img1 from "../../Assets/images/No records.png"
import {
  TabPane,
  Button,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";

import axios from "axios";
import { useQuery, gql } from "@apollo/client";
import Pagination from "react-js-pagination";
import { useParams } from "react-router";
import parse from "html-react-parser";
import "react-markdown-editor-lite/lib/index.css";
import feedbackstyle from "./Feedback.module.css";
import { invalidInputSwal, successInputSwal } from "../../swal";
import { Link } from "react-router-dom";
import Modals from "../Modal";
import Accordion from "./Accordion/Accordion";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BsFillPlusCircleFill } from "react-icons/bs";
import Tippy from "@tippyjs/react";

const QUERY = gql`
  query Feedbacks($page: Int, $pageSize: Int, $type: String, $slug: String) {
    feedbacks(
      filters: {
        type: { eq: $type }
        or: [
          { serviceMasters: { slug: { eq: $slug } } }
          { endpointMasters: { slug: { eq: $slug } } }
        ]
      }
      pagination: { page: $page, pageSize: $pageSize }
      sort: "id:desc"
    ) {
      data {
        id
        attributes {
          type
          question
          solution
          status
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

const FeedbackComponent = ({ slug, masterId }) => {
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [solution, setSolution] = useState("");
  const [page, setPage] = useState(1);
  const [typeError, setTypeError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [solutionError, setSolutionError] = useState("");

  const closeModal = () => {
    setShowModal(false);
  };

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

  let urlContains = window.location.pathname.split("/");

  urlContains = urlContains[urlContains.length - 1];

  const router = useParams();
  const code = router.query;
  const id = router.id;
  const pageSize = 6;

  const setPageNo = (e) => {
    setPage(e);
  };
  const { data, loading, error, refetch } = useQuery(QUERY, {
    variables: { page, pageSize, slug },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return null;
  }
  refetch({ page, slug, pageSize });

  const feedbacks = data.feedbacks.data;

  function handleEditorChange(text) {
    setSolutionError("");
    setSolution(text);
  }

  const toggle = () => {
    setShowModal(true);

  };

  var item1 = localStorage.getItem("token");
  var item = JSON.parse(item1);

  const handleSubmit = (event) => {
    event.preventDefault();
    const user = localStorage.getItem("user");
    const userData = JSON.parse(user);
    const userId = JSON.stringify(userData.id);
    let isError = false;

    if (feedbackType === "") {
      isError = true;
      setTypeError("Type Required");
    }
    if (question === "") {
      isError = true;
      setQuestionError("Question Required");
    }
    if (solution === "") {
      isError = true;
      setSolutionError("Solution Required");
    }
    if (isError) {
      return;
    }

    let postParmas;
    if (urlContains === "endpoint") {
      postParmas = {
        type: feedbackType,
        question: question,
        solution: solution,
        userId: userId,
        status: "Open",
        endpointMasters: masterId,
      };
    } else {
      postParmas = {
        type: feedbackType,
        question: question,
        solution: solution,
        userId: userId,
        status: "Open",
        serviceMasters: masterId,
      };
    }
    axios
      .post(
        `${process.env.REACT_APP_BACK_END_API_URL}/feedbacks`,
        { data: postParmas },
        {
          headers: {
            Authorization: "Bearer " + item,
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        successInputSwal("created successfully");
        setQuestion("");
        setFeedbackType("");
        setSolution("");
        setShowModal(false);
        refetch({ slug, page, pageSize });
      })
      .catch(function (error) {
        invalidInputSwal("Something went wrong");
      });
  };

  const handleTypeChange = (e) => {
    setTypeError("");
    setFeedbackType(e.target.value);
  };

  const handleQuestionChange = (e) => {
    setQuestionError("");
    setQuestion(e.target.value);
  };

  const OnFilterFeedback = (e) => {
    const type = e.target.value;
    if (type !== "All") {
      refetch({ page, slug, pageSize, type });
    }
  };

  const backButtonRouteSave = () => {
    localStorage.setItem("backButtonRouteLevel", urlContains);
    localStorage.setItem("backButtonId", id);
    localStorage.setItem("backButtonCode", code);
  };

  return (
    <>
      <TabPane tabId="3">
        <div className={feedbackstyle.addPan}>
          {feedbacks.length !== 0 ? (
            <select
              className={feedbackstyle.form_control}
              style={{ color: "black", backgroundColor: "transparent" }}
              onChange={OnFilterFeedback}
            >
              <option>All</option>
              <option>Feedback</option>
              <option>Error</option>
            </select>
          ) : null}
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
                <span>Add Service</span>
              </span>
            }
          >
            <div
              style={{ marginLeft: "20px" }}
              onClick={toggle}
            >
              <BsFillPlusCircleFill
                size={30}
                style={{
                  cursor: "pointer",
                  marginTop: "5px",
                  marginRight: "30px",
                }}
                id="slPlusIcon"
              />
            </div>
          </Tippy>
        </div>

        <div
          id="faq"
          className={feedbackstyle.faq_body}
          style={{ marginRight: "9px" }}
        >
          {feedbacks.length !== 0 ? (
            <div className={feedbackstyle.faq_list}>
              {feedbacks ?
                feedbacks.map((e, i) => {
                  return (
                    <div key={e.id}>
                      <Accordion
                        title={e.attributes.question}
                        content={parse(e.attributes.solution)}
                        attributestype={e.attributes.type}
                      >
                        <div className={feedbackstyle.text_primary}>
                          {/* Use the Link component to navigate */}
                          <Link
                            to={{
                              pathname: "/feedback",
                              search: `?id=${e.id}`,
                            }}
                            className={feedbackstyle.text_primary}
                            style={{
                              marginLeft: "15px",
                              color: "#2368ca",
                              textDecoration: "none",
                            }}
                            onClick={backButtonRouteSave}
                          >
                            <h4 className={`${feedbackstyle}`}>
                              View all comments
                            </h4>
                          </Link>
                        </div>
                      </Accordion>
                    </div>
                  );
                }) : null}
            </div>
          ) : (
            <>
              <div className="NoDataFoundDiv">
                <img src={img1} className="NoDataFoundImg" alt="" style={{ textAlign: "center" }} />
                <h1 className="NoDataFound" >No Data Found!</h1>
              </div>
            </>
          )}

          <div>
            <Modals
              headerName="Feedback"
              showModal={showModal}
              closeModal={closeModal}
              width="70%"
              marginTop="3%"
            >
              <ModalBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup
                    style={{
                      marginBottom: "20px",
                      width: "99%",
                      height: "1rem",
                    }}
                  >
                    <Input
                      placeholder="Select type"
                      name="type"
                      type="select"
                      className={typeError ? `${feedbackstyle.is_invalid}` : ""}
                      onChange={handleTypeChange}
                      style={{ padding: "10px" }}
                    >
                      <option value="">Select Type</option>
                      <option value="Error">Error</option>
                      <option value="Feedback">Feedback</option>
                    </Input>

                    {typeError && (
                      <FormFeedback
                        type="invalid"
                        style={{ color: "red", marginTop: "5px" }}
                      >
                        {typeError}
                      </FormFeedback>
                    )}
                  </FormGroup>
                  <FormGroup
                    style={{
                      marginBottom: "20px",
                      marginTop: "40px",
                    }}
                  >
                    <Label for="exampleEmail">Question</Label>
                    <Input
                      type="text"
                      name="question"
                      id="question"
                      placeholder="Type Questions"
                      style={{
                        width: "97%",
                        height: "1rem",
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "transparent",
                        color: "black",
                      }}
                      className={
                        questionError ? `${feedbackstyle.is_invalid}` : ""
                      }
                      onChange={handleQuestionChange}
                    />
                    {questionError && (
                      <FormFeedback
                        type="invalid"
                        style={{ color: "red", marginTop: "5px" }}
                      >
                        {questionError}
                      </FormFeedback>
                    )}
                  </FormGroup>
                  <FormGroup
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <Label for="examplePassword">Solution</Label>
                    {/* <Editor
                      ref={mdEditor}
                      //  onChange={(data) =>
                      //   handleEditorChange({
                      //             target: { name: "description", value: data.text },
                      //           })
                      //         }
                      onChange={handleEditorChange}
                      style={{ height: "260px" }}
                      className={solutionError ? "is-invalid" : ""}
                      renderHTML={(text) => <ReactMarkdown children={text} />}
                    /> */}
                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      formats={formats}
                      style={{
                        height: "300px",
                        width: "99%",
                        marginBottom: "60px",
                      }}
                      id="description"
                      name="description"
                      placeholder="Enter message here..."
                      onChange={handleEditorChange}
                    />
                    {solutionError && (
                      <FormFeedback
                        type="invalid"
                        style={{
                          color: "red",
                          fontSize: "14px",
                          marginTop: "-17px",
                        }}
                      >
                        {solutionError}
                      </FormFeedback>
                    )}
                  </FormGroup>

                  {/* <Button
          type="submit"
          id={feedbackstyle.bg_blue}
          className={`${feedbackstyle.bg_blue} ${feedbackstyle.btn}`}
          style={{
            width: "auto",
            height: "38px",
            fontSizeL: "15px",
          }}
        >
          Submit
        </Button> */}
                  <Button
                    type="submit"
                    className="bttn"
                    id="bg_blue"
                    style={{
                      height: "50px",
                      width: "120px",
                      margin: "10px 0px 10px 0px",
                      borderRadius: "90px",
                    }}
                  >
                    Submit
                  </Button>
                </Form>
              </ModalBody>
            </Modals>
          </div>
        </div>
      </TabPane>
      {feedbacks.length !== 0 ? (
        <Pagination
          activePage={page}
          itemsCountPerPage={pageSize}
          totalItemsCount={data.feedbacks.meta.pagination.total}
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
          innerClass="pagination justify-content-center"
        />
      ) : null}
    </>
  );
};

export default FeedbackComponent;
