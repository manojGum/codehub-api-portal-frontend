import React, { useState } from "react";
import Tippy from "@tippyjs/react";
import "./Services.css";
import { TabPane, Row} from "reactstrap";
import Crausal from "../Crausal/Crausal";
import Modals from "../Modal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import parse from "html-react-parser";

export default function Services({ service, props }) {
  const type = service.attributes.type;
  const endpoints = service.attributes.endpoints.data;
  const tags = service.attributes.tags;
  const kbArticles = service.attributes.kbArticles;
  const targetBusinessDomains = service.attributes.targetBusinessDomains;
  const contributors = service.attributes.contributors;
  const screenshots = service.attributes.screenshots.data;
  const documentation = service?.attributes?.documentation?.data?.attributes;
  const techStack = service?.attributes?.techStack;
  const [showModal, setShowModal] = useState(false);
  const [bitbucketdata, setBitbucketdata] = useState(false);
  const navigate = useNavigate();
  const closeModal = () => {
    setShowModal(false);
  };
  const user = JSON.parse(localStorage.getItem("user"));

    const fetchData = async () => {
      try {
       const fetchdata = await axios.get(`${process.env.REACT_APP_BACK_END_API_URL}/bitbucket-reqeust-histories?filters[userId]=${user.id}&filters[serviceId]=${service.id}`);
        setBitbucketdata(fetchdata?.data?.data[0])
      } catch (error) {
        console.log("bitbucketdata",error)
      }
    };

    useEffect(()=>{
      fetchData(); 
    },[])

  const  addBitbucketReqeustHistory = async (service) => {
    try {
     await axios.post(
        `${process.env.REACT_APP_BACK_END_API_URL}/bitbucket-reqeust-histories`,
        {
          data: {
              userId:user.id,
              serviceId:service.id,
              status:"requested"
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchData();
      // window.location.reload()
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <TabPane style={{ paddingTop: "20px" }} tabId="1">
      <Row
        style={{
          display: "grid",
          gridTemplateColumns: "70% 25%",
          gap: "10px",
        }}
      >
        <div style={{ padding: "0 5rem 0 0", color: "#383838" }}>
          <div className="mt-2">
            {service?.attributes?.type === "service" &&
              service?.attributes?.description ? (
              <div
                className="fs-6 fw-400 text-black-75 text-wrap w-75"
              >{ parse(service.attributes.description)}</div>
            ) : null}{" "}
            {service.attributes.type === "service" ? (
              <table className="table-hover mb-2 mt-2 w-75 table">
                <thead className="thead">
                  <tr className="tr">
                    <th className="{styles.children_header} th children_header">
                      Endpoints
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint) => (
                    <tr key={endpoint.id}>
                      <td>
                        <div
                          key={endpoint.id}
                          className="nav-link"
                          onClick={() =>{
                            localStorage.setItem("eflag",1)
                            localStorage.setItem("endpointServicesSlug", JSON.stringify(endpoint))
                            props.loader(true);
                            navigate(`/endpoint-details/${endpoint.id}`)
                          }}
                        >
                          <code className="code" id="nameLink">
                            {" "}
                            {endpoint.attributes.name}
                          </code>
                        </div>
                      </td>
                      <td><div dangerouslySetInnerHTML={{__html:endpoint?.attributes?.shortDescription }}></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
				<div>				
              <div style={{  padding: "10px" }} className="fs-6 fw-400 text-black-75 text-wrap w-75"
              dangerouslySetInnerHTML={{ __html:service.attributes.description}}
            ></div>       
			</div>     
            )}
            
            
            <hr className="extrenal_hr" />
            {service.attributes.repoLinks ? (
              <div>
                <span
                  className="text-decoration-none text-dark-50 pe-none"
                  id="contributors"
                >
                  Repository
                </span>
              { !bitbucketdata ? <div className=""  onClick={() => {addBitbucketReqeustHistory(service)}}>
                  <span
                    className="m-1 text-dark" 
                    title="repo link"
                    style={{
                      cursor:"pointer",
                      textDecoration:"none",
                      color:"blue",
                      fontSize:"0.9rem"
                    }}
                  >
                 Get Repository Access
                  </span>
                </div>:<div className="" >
                  {
                    bitbucketdata?.attributes?.status==="request_given" ? <a
                    href={service.attributes.repoLinks }
                      className="m-1 text-dark"
                      title="repo link"
                      style={{
                        textDecoration:"none",
                        color:"blue",
                        fontSize:"1rem"
                      }}
                    >
                    {service.attributes.repoLinks }
                    </a>: <span
                    className="m-1 text-dark"
                    title="repo link"
                    style={{
                      textDecoration:"none",
                      color:"blue",
                      fontSize:"0.9rem"
                    }}
                  >
                  {!bitbucketdata ?  "Get Repository Access":"Request Send ..."}
                  </span>
                  }
                </div>}
              </div>
            ) : null}
            {type === "poc" ? null : kbArticles.length !== 0 ?  (
              <>
                <hr className="extrenal_hr" />
                <div className="mb-5">
                  <div
                    className="text-decoration-none text-dark-50 pe-none"
                    id="kb_article"
                  >
                    KB's article/posts
                  </div>
                  <ul className="list-group kb_articles">
                    {kbArticles.map((kbArticle) => (
                      <li key={kbArticle.id} className="list-group-item">
                        <a
                          href={kbArticle.url}
                          className="text-dark"
                          title={kbArticle.url}
                          id="nameLink"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {kbArticle.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
            {documentation?.url !== undefined || null ? (
              <>
                <hr className="extrenal_hr" />
                <div className="mb-5">
                  <div>
                    <div
                      className="text-decoration-none text-dark-50 pe-none"
                      id="kb_article"
                    >
                      documentation
                    </div>
                    <div className="{styles.shotImg}">
                      <ul className="list-group kb_articles">
                        <li className="list-group-item">
                          <a
                            href={
                              process.env.REACT_APP_API_URL + documentation?.url
                            }
                            className="text-dark"
                            title={
                              process.env.REACT_APP_API_URL + documentation?.url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {process.env.REACT_APP_API_URL + documentation?.url}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {screenshots.length !== 0 ? (
              <>
                <hr className="extrenal_hr" />
                <div className="mb-5">
                  <div>
                    <div
                      className="text-decoration-none text-dark-50 pe-none"
                      id="kb_article"
                    >
                      ScreenShots
                    </div>
                    <div
                      onClick={() => setShowModal(!showModal)}
                      className="shotDiv"
                    >
                      {screenshots.map((item) => {
                        return (
                          <img alt=""
                            className="shotImg"
                            src={`${process.env.REACT_APP_API_URL +
                              item.attributes.url
                              }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            <Modals
              headerName="Screenshots"
              showModal={showModal}
              closeModal={closeModal}
              width={"50%"}
            >
              <div
                className="rounded"
                style={{
                  maxWidth: "1200px",
                  width: "100%",
                  maxHeight: "800px",
                  height: "400px",
                }}
              >
                <Crausal data={screenshots} />
              </div>
            </Modals>
          </div>
        </div>
        <div>
          <div className="mt-2">
            <div>
              <span className=" text-decoration-none pe-none" id="kb_article">
                Author
              </span>
              <div className="d-flex align-items-start flex-row flex-wrap ">
                <div className="mt-2 text-decoration-none badge text-bg-info">
                  <Tippy
                    interactive={true}
                    delay={100}
                    content={
                      <span
                        style={{
                          background: "#1b394b",
                          color: "white",
                          borderRadius: "10px",
                          padding: "10px 10px 10px 10px",
                        }}
                      >
                        <span>{service.attributes.authorEmail}</span>
                      </span>
                    }
                  >
                    <span
                     
                      className="mt-1 text-decoration-none  text-capitalize text-white"
                      title={service.attributes.authorName}
                    >
                      {service.attributes.authorName}
                    </span>
                  </Tippy>
                </div>
              </div>
            </div>
            <hr className="extrenal_hr" />
            <div>
              <p className="" id="kb_article">
                Target Buisness Domains
                <div className="">
                  <div className="d-flex align-items-start flex-row flex-wrap ">
                    {targetBusinessDomains.map((targetBusinessDomain, i) => (
                      <a
                        key={targetBusinessDomain.id}
                        href={targetBusinessDomain.domains}
                        className={
                          i % 2 === 0 && i % 3 === 0
                            ? "mt-1 text-decoration-none badge text-bg-success"
                            : i % 2 === 0
                              ? "m-1 text-decoration-none badge text-bg-dark"
                              : i % 3 === 0
                                ? "m-1 text-decoration-none badge text-bg-danger"
                                : "m-1 text-decoration-none badge text-bg-primary"
                        }
                        title={targetBusinessDomain.domains}
                      >
                        {targetBusinessDomain.domains}
                      </a>
                    ))}
                  </div>
                </div>
              </p>
            </div>
            <hr className="extrenal_hr" />
            <div>
              <span
                className="text-decoration-none  pe-none d-flex align-items-start flex-row kb_article"
                id="contributors"
              >
                Contributors
                <span className="contributores_span" style={{ boxSizing:"border-box"}}>
                  {contributors.length}
                </span>
              </span>
              <div className="d-flex align-items-start flex-row flex-wrap">
                {contributors.map((contributor, i) => (
                  <div
                    className={
                      i % 2 === 0 && i % 3 === 0
                        ? "mt-2 text-decoration-none badge text-bg-dark text-white"
                        : i % 2 === 0
                          ? "mt-2 text-decoration-none badge text-bg-success"
                          : i % 3 === 0
                            ? "mt-2 text-decoration-none badge text-bg-primary"
                            : "mt-2 text-decoration-none badge text-bg-danger"
                    }
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
                            padding: "10px 10px 10px 10px",
                          }}
                        >
                          <span style={{cursor:"pointer"}}>{contributor.email}</span>
                        </span>
                      }
                    >
                      <span style={{cursor:"pointer"}}
                        className="text-decoration-none text-capitalize text-white"
                        key={contributor.id}
                        title={contributor.name}
                      >
                        {contributor.name}
                      </span>
                    </Tippy>
                  </div>
                ))}
              </div>
            </div>
            <hr className="extrenal_hr" />
            {type === "service" && (
              <div>
                <span
                  className="m-1 text-decoration-none pe-none d-flex align-items-start flex-row"
                  style={{
                    margin: "10px",
                    textDecoration: "none",
                    padding: "none",
                    display: "flex",
                    alignItems: "start",
                    flexDirection: "row",
                  }}
                  id="contributors"
                >
                  Tags
                </span>
                <div
                  className="d-flex align-items-start flex-row flex-wrap"
                  style={{
                    display: "flex",
                    alignItems: "start",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="cmu_tags">
                    <ul
                      className="list-group list-group-horizontal"
                      style={{
                        listStyleType: "none",
                      }}
                    >
                      {tags.map((tag) => (
                        <li key={tag.id} className="list-group-item">
                          <span style={{cursor:"pointer"}}
                            className="text-decoration-none"
                            role="button"
                            title={tag.name}
                            aria-label={tag.name}
                            rel="tag"
                          >
                            {tag.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {console.log(type, techStack, "vijitiajfd;ladsjf;lasdf;asdjf;aksdfasdjf;asdf;")}
            {(type === "poc" || type === "package" || type === "snippet" || type === "service") && techStack && (
              
              <div>
                
                <span 
                  className="m-1 text-decoration-none pe-none d-flex align-items-start flex-row"
                  style={{
                    margin: "10px",
                    textDecoration: "none",
                    padding: "none",
                    display: "flex",
                    alignItems: "start",
                    flexDirection: "row",
                    cursor:"pointer"
                  }}
                  id="contributors"
                >
                  Tech Stacks
                </span>
                <div
                  className="d-flex align-items-start flex-row flex-wrap"
                  style={{
                    display: "flex",
                    alignItems: "start",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="cmu_tags">
                    <ul
                      className="list-group list-group-horizontal"
                      style={{
                        listStyleType: "none",
                      }}
                    >
                      <li className="list-group-item">
                        <span className="text-decoration-none">{techStack}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Row>
    </TabPane>
  );
}
