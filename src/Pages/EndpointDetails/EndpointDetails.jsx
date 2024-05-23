import React, { useEffect, useState } from "react";
import { SingleEndPoint } from "../../component/SingleEndpoint/SingleEndpoint";
import FeedbackComponent from "../../component/Feedback/Feedback";
import Faq from "../../component/FaQ/Faq";
import Moment from "react-moment";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import styles from "../service/Service.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QUERY = gql`
  query Endpoints($slug: String, $id: ID) {
    endpoints(
      filters: { or: [{ slug: { eq: $slug } }, { id: { eq: $id } }] }
      sort: "id:desc"
      pagination: { start: 0, limit: 1 }
    ) {
      data {
        id
        attributes {
          name
          slug
          endpoint_master {
            data {
              id
            }
          }
          errorHandlingDetails
          businessRequirementsRules
          developmentRequirementsRules
          responseMessage {
            id
            statusCode
            responseModeType
            condition
            payload
          }
          rateLimitDetails
          authenticationDetails
          shortDescription
          description
          method
          publishedAt
          publishedAt
          version
          requests {
            name
            id
            description
            objects
            type
          }
          responses {
            name
            id
            description
            objects
            type
          }
          apiResponse
          apiRequests {
            id
            language
            requests
          }
          services {
            data {
              attributes {
                authorEmail
                status
              }
            }
          }
        }
      }
    }
  }
`;

const Endpoint = (props) => {
  const navigate = useNavigate();
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;
  let tabValue = localStorage.getItem("tabValueEndpoint");
  const [activeTab, setActiveTab] = useState(tabValue || "1");
  const [isAdmin, setIsAdmin] = useState(false);
  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
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
  const router = useParams();
  const id = router.id;

  setTimeout(() => {
    props.loader(false);
  }, 500);
  const { data, loading, error } = useQuery(QUERY, {
    variables: { id },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  if (loading) {
    props.loader(true);
    return null;
  }

  if (error) {
    return null;
  }

  const endpoint = data?.endpoints.data[0];

  const masterId =
    endpoint?.attributes.endpoint_master.data !== null
      ? endpoint?.attributes.endpoint_master.data.id
      : null;
  const endpointServicesSlug = JSON.parse(
    localStorage.getItem("endpointServicesSlug")
  );
  console.log("endpointServicesSlug", endpointServicesSlug);
  const ServicesSlugName = JSON.parse(localStorage.getItem("ServicesSlugName"));
  let url;
  let url1;
  if(localStorage.getItem("eflag") == 2){
    url = "/endpoint";
    url1 = "/service"
   }else{
    url = `/service/${ServicesSlugName?.slug}`
    url1 = "/module/1"
   }
 
  const endpointvalidationdata =
    endpoint?.attributes?.services?.data[0]?.attributes;
 
  if (endpoint) {
    if (
      isAdmin ||
      userData?.email === endpointvalidationdata?.authorEmail ||
      endpointvalidationdata?.status == true
    ) {
      return (
        <>
          <AuthenticatePages>
            <div className={styles.mainDiv}>
              <div style={{ paddingBottom: "15px", marginTop: "-40px" }}>
                <a className="breadcrum" onClick={() => navigate(url1)}>
                  Services
                </a>{" "}
                》
                <a
                  className="breadcrum"
                  onClick={() => {
                    props.loader(true);
                    navigate(url);
                  }}
                >
                  {localStorage.getItem("eflag") == 2 ? "Endpoints" : ServicesSlugName?.name}
                </a>{" "}
                》
                <a className="breadcrum">
                  {endpoint?.attributes?.name}
                </a>
              </div>
              <p className={styles.p}>{endpoint?.attributes?.name}</p>
              <div>
                <span className={styles.span}>
                  {endpoint?.attributes.version}
                </span>
                <span className={styles.span}>
                  &nbsp;• Published •&nbsp;
                  <Moment fromNow>{endpoint?.attributes.publishedAt}</Moment>
                </span>
              </div>

              <div className={styles.subDiv}>
                <div
                  className={
                    activeTab === "1" ? styles.activeTab : styles.inActiveTab
                  }
                  onClick={() => {
                    toggle("1");
                    localStorage.setItem("tabValue", 1);
                  }}
                >
                  <div id="nav_txt_decoration">Endpoint</div>
                </div>
                <div
                  className={
                    activeTab === "2" ? styles.activeTab : styles.inActiveTab
                  }
                  onClick={() => {
                    toggle("2");
                    localStorage.setItem("tabValue", 2);
                  }}
                >
                  <div id="nav_txt_decoration">FAQ's</div>
                </div>
                <div
                  className={
                    activeTab === "3" ? styles.activeTab : styles.inActiveTab
                  }
                  onClick={() => {
                    toggle("3");
                    localStorage.setItem("tabValue", 3);
                  }}
                >
                  <div id="nav_txt_decoration">Feedbacks</div>
                </div>
              </div>

              {activeTab === "1" && <SingleEndPoint endpoint={endpoint} />}

              {activeTab === "2" && <Faq slug={endpoint?.attributes?.slug} />}
              {activeTab === "3" && (
                <FeedbackComponent
                  slug={endpoint?.attributes?.slug}
                  masterId={masterId}
                />
              )}
            </div>
          </AuthenticatePages>
        </>
      );
    }else{
      return (
        <>
          <AuthenticatePages>
            <h2 style={{ padding: "40px" }}>
              {`No results found for ID: `}{" "}
              <span style={{ color: "red", fontSize: "25px" }}>Not published Yet</span>
            </h2>
          </AuthenticatePages>
        </>
      );
    }
  } else {
    return (
      <>
        <AuthenticatePages>
          <h2 style={{ padding: "40px" }}>
            {`No results found for ID: `}{" "}
            <span style={{ color: "red", fontSize: "25px" }}>{id}</span>
          </h2>
        </AuthenticatePages>
      </>
    );
  }
};

export default Endpoint;
