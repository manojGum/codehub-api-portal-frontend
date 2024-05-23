/*  
  Admin Page: Fetch admin list, register admin modal display, logic and  validation has been handled here
  */
import React, {useState } from "react";
import feebackStyle from "./FeedbackComment.module.css";
import axios from "axios";
import {
  Button,
  Form,
  FormFeedback,
  Input,
  Nav,
  TabContent,
} from "reactstrap";
import Modals from "../../component/Modal";
import { Link, useLocation} from "react-router-dom";
import Moment from "react-moment";
import { gql, useQuery } from "@apollo/client";
import parse from "html-react-parser";

import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
const QUERYfeedback = gql`
  query ($id: ID) {
    feedback(id: $id) {
      data {
        id
        attributes {
          userId {
            data {
              id
              attributes {
                username
              }
            }
          }
          question
          solution
          publishedAt
          status
          type
        }
      }
    }
  }
`;

const QUERY = gql`
  query FeedbackComment($id: ID, $pageSize: Int) {
    comments(
      filters: { feedback: { id: { eq: $id } } }
      pagination: { pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          userId {
            data {
              id
              attributes {
                username
              }
            }
          }
          comment
          publishedAt
          feedback {
            data {
              id
              attributes {
                question
                solution
                publishedAt
              }
            }
          }
          parentId {
            data {
              id
              attributes {
                comment
                publishedAt
                userId {
                  data {
                    id
                    attributes {
                      username
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const FeedbackComment = () => {
  const [open, setOpen] = useState(false);
  const [submitComment, setSubmitComments] = useState("");
  const [validationLine, setValitdationLine] = useState("");

  const [parentId, setParentId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  // const { id } = router.query;
  const pageSize = 100;

  const feedbackData = useQuery(QUERYfeedback, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { id },
  });

  const { data, loading, error, refetch } = useQuery(QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { id, pageSize },
  });
  if (loading || feedbackData.loading) {
    return;
    //  <Loading />;
  }

  if (error || feedbackData.error) {
    return null;
  }

  const toggle = (parentId) => {
    setOpen(!open);
    setParentId(parentId);
    setSubmitComments("");
    setValitdationLine("");
  };

  const handleCommentsChange = (e) => {
    setValitdationLine("");
    setSubmitComments(e.target.value);
  };
  let userData = JSON.parse(localStorage.getItem("user"));
  const token = JSON.parse(localStorage.getItem("token"));
  const userId = userData?.id;

  const onSubmitComment = (e) => {
    e.preventDefault();

    let isError = false;

    if (submitComment === "") {
      isError = true;
      setValitdationLine("Input field can not be empty");
    }

    if (isError) {
      return;
    }
    let postParmas;
    if (parentId === "") {
      postParmas = {
        userId: userId,
        feedback: id,
        comment: submitComment,
      };
    } else {
      postParmas = {
        userId: userId,
        feedback: id,
        comment: submitComment,
        parentId: parentId,
      };
    }
    axios
      .post(
        `${process.env.REACT_APP_BACK_END_API_URL}/comments`,
        { data: postParmas },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setOpen(!open);
        setShowModal(false);
        refetch({ id, pageSize });
      })
      .catch((error) => {});
  };

  const allComments = data.comments.data;

  const parentComments = allComments.filter(
    (e) => e?.attributes.parentId.data == null
  );
  const childComments = allComments.filter(
    (e) => e?.attributes.parentId.data !== null
  );

  let backButtonRouteLevel = localStorage.getItem("backButtonRouteLevel");
  let queryValue = localStorage.getItem("backButtonId");
  let myQueryObject = { id: queryValue };
  if (backButtonRouteLevel === "service") {
    queryValue = localStorage.getItem("backButtonCode");
    myQueryObject = { code: queryValue };
  }

  return (
    <>
      <AuthenticatePages>
        <div
          className={`${feebackStyle.header} ${feebackStyle.pt_4} ${feebackStyle.px_5}`}
        >
          <div className={feebackStyle.d_flex}>
            {/* "me-auto fs-2 fw-bold text-dark font_cern" */}
            <p
              className={`${feebackStyle.me_auto} ${feebackStyle.fs_2} ${feebackStyle.fw_bold} ${feebackStyle.text_dark} ${feebackStyle.font_cern}`}
            >
              {" "}
              {feedbackData.data.feedback.data?.attributes.question}
            </p>
            <div className={feebackStyle.addPan}>
              <Link
                to={{
                  pathname: `/service/${backButtonRouteLevel}`,
                  // search: `?id=${backButtonRouteLevel}`, // Use search for query parameters
                }}
                className={feebackStyle.text_primary}
              >
                <Button
                  className="bttn"
                  id="bg_blue"
                  style={{
                    height: "2rem",
                    width: "5rem",
                    marginLeft: "10px",
                  }}
                >
                  Back ⏎
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <span className={`f6 ${feebackStyle.m_1}`}>
              <span style={{ fontWeight: "bold" }}>
                {" "}
                {feedbackData.data.feedback.data?.attributes.userId.data?.attributes.username
                  .split(".")
                  .join(" ")}
              </span>{" "}
              •&nbsp;
              <span style={{ fontWeight: "bold", color: "#44a6f5" }}>
                {feedbackData.data.feedback.data?.attributes.type}
              </span>{" "}
              •&nbsp;{" "}
              <span
                style={
                  feedbackData.data.feedback.data?.attributes.status === "Open"
                    ? { fontWeight: "bold", color: "#f67659" }
                    : { fontWeight: "bold", color: "#06B96D" }
                }
              >
                {feedbackData.data.feedback.data?.attributes.status}
              </span>{" "}
              •&nbsp; Published •&nbsp;{" "}
              <Moment fromNow>
                {feedbackData.data.feedback.data?.attributes.publishedAt}
              </Moment>{" "}
            </span>
          </div>

          <TabContent>
            <div id="faq" className={`${feebackStyle.faq_body}`}>
              <div className="faq-list">
                <div>
                  <div>
                    <div
                      className="faq-content sidedesign "
                      style={{ padding: "5px" }}
                     
                    >
                      {parse(feedbackData.data.feedback.data?.attributes.solution)}
                      </div>
                    <Nav tabs className="mt-2 d-flex flex-wrap"></Nav>
                    <hr
                      style={{
                        marginBottom: "20px",
                        marginTop: "20px",
                        width: "100%",
                        marginLeft: "auto",
                        marginRight: "auto",
                        border: "1px solid #095484",
                        backgroundColor: "#b7d0e2",
                      }}
                    ></hr>

                    <div className="d-flex flex-wrap mt-3">
                      <Button
                        className="bttn"
                        id="bg_blue"
                        style={{
                          height: "2.5rem",
                          width: "auto",
                          marginLeft: "10px",
                          padding: "9px",
                        }}
                        onClick={() => setShowModal(!showModal)}
                      >
                        Add comment +
                      </Button>
                    </div>

                    <h3 className="m-2">
                      Comments : <span>{parentComments.length}</span>
                    </h3>

                    <ul>
                      {parentComments.map((e) => {
                        return (
                          <>
                            <li className="faq-content solution_detail_list">
                              <div>
                                <span className="f6 fw-bold text-dark ">
                                  {e?.attributes.userId.data?.attributes.username
                                    .split(".")
                                    .join(" ")}
                                  <span style={{ color: "#5a5959" }}>
                                    {" "}
                                    •&nbsp;{" "}
                                    <Moment fromNow>
                                      {e?.attributes.publishedAt}
                                    </Moment>
                                  </span>
                                  <span>
                                    <Button
                                      style={{
                                        color: "#5a5959",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        fontSize: "0.9em",
                                      }}
                                      className="text-capitalize"
                                      onClick={() => toggle(e.id)}
                                    >
                                      reply
                                    </Button>
                                  </span>
                                </span>
                              </div>
                              <div> {e?.attributes.comment}</div>

                              <ul>
                                {childComments.map((k) => {
                                  if (k?.attributes.parentId.data.id === e.id) {
                                    return (
                                      <>
                                        <li className="faq-content solution_detail_list">
                                          <div>
                                            <span className="f6 fw-bold text-dark ">
                                              {k?.attributes.userId.data?.attributes.username
                                                .split(".")
                                                .join(" ")}
                                              <span
                                                style={{ color: "#5a5959" }}
                                              >
                                                {" "}
                                                •&nbsp;{" "}
                                                <Moment fromNow>
                                                  {k?.attributes.publishedAt}
                                                </Moment>
                                              </span>
                                            </span>
                                          </div>
                                          <div>{k?.attributes.comment}</div>
                                        </li>
                                      </>
                                    );
                                  }
                                })}
                              </ul>
                            </li>
                            <hr />
                          </>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Modals
                  headerName="Add Comment"
                  showModal={showModal}
                  closeModal={closeModal}
                  width="40%"
                  marginTop="10%"
                >
                  <div style={{ marginTop: "26px" }}>
                    <Form onSubmit={onSubmitComment}>
                      <div>
                        <Input
                          type="textarea"
                          name="Comments"
                          id="Comments"
                          placeholder="Add a Comment..."
                          autoComplete="off"
                          className={validationLine ? "is-invalid" : ""}
                          onChange={handleCommentsChange}
                          style={{
                            backgroundColor: "transparent",
                            color: "black",
                          }}
                        />
                        {validationLine && (
                          <FormFeedback type="invalid" className="m-1">
                            {validationLine}
                          </FormFeedback>
                        )}
                      </div>
                      <Button
                        className="bttn"
                        id="bg_blue"
                        style={{
                          height: "2.5rem",
                          width: "6rem",
                          marginLeft: "10px",
                          marginTop: ".5rem",
                        }}
                        type="submit"
                      >
                        Submit
                      </Button>
                    </Form>
                  </div>
                </Modals>
                {/* <Modals
                isOpen={open}
                toggle={toggle}
                style={{ maxWidth: "1600px", width: "50%" }}
                centered={true}
              >
                <ModalHeader toggle={toggle}>
                  <h1>Add Comment</h1>
                </ModalHeader>
                <ModalBody>
                  <Form onSubmit={onSubmitComment}>
                    <FormGroup>
                      <Input
                        type="textarea"
                        name="Comments"
                        id="Comments"
                        placeholder="Add a Comment..."
                        autoComplete="off"
                        className={validationLine ? "is-invalid" : ""}
                        onChange={handleCommentsChange}
                        style={{
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                      />
                      {validationLine && (
                        <FormFeedback type="invalid" className="m-1">
                          {validationLine}
                        </FormFeedback>
                      )}
                    </FormGroup>

                    <Button
                      type="submit"
                      className="p-2 fs-6 text-capitalize rounded-2"
                      id="bg_blue"
                    >
                      Submit
                    </Button>
                  </Form>
                </ModalBody>
                <ModalFooter></ModalFooter>
              </Modals> */}
              </div>
            </div>
          </TabContent>
        </div>
      </AuthenticatePages>
    </>
  );
};

export default FeedbackComment;
