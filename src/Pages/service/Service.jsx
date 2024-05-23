/*  
  Admin Page: Fetch admin list, register admin modal display, logic and  validation has been handled here
*/

import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Moment from "react-moment";
import { useParams } from "react-router";
import styles from './Service.module.css'
import Services from "../../component/Services/Services";
import Faq from "../../component/FaQ/Faq";
import FeedbackComponent from "../../component/Feedback/Feedback";
import VersionServices from "../../component/Versions/Versions";
import AuthenticatePages from "../../Layouts/Admin/AuthenticatePages";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QUERY = gql`
  query Service($slug: String, $id: ID) {
    services(
      filters: { or: [{ slug: { eq: $slug } }, { id: { eq: $id } }] }
      sort: "id:desc"
      pagination: { start: 0, limit: 1 }
    ) {
      data {
        id
        attributes {
          name
          description
          shortDescription  
          techStack  
          documentation{
            data{
              attributes{
                name
                url
                hash
                width
                previewUrl
                
              }
            }
          }
          screenshots{
            data{
              attributes{
                name
                url
                hash
                width
                previewUrl
                
              }
            }
          }
         
          slug
          service_master {
            data {
              id
            }
          }
          endpoints {
            data {
              id
              attributes {
                name
                slug
                shortDescription
              }
            }
          }
          publishedAt
          version
          authorName
          authorEmail
          reviewerEmail
          publishedAt
          version
          status
          repoLinks
          versionReleaseNotes
          gettingStartedGuide
          type
          kbArticles {
            url
          }
          tags {
            name
            id
          }
          kbArticles {
            url
            id
          }
          targetBusinessDomains {
            domains
            id
          }
          contributors {
            name
            email
            id
          }
        }
      }
    }
  }
`;

/**
 * @desc Handles admin array and registers admin
 * @returns Admin list and register admin modal
 * 
 */

// const usersearch = (userId)=>{
//   axios
//   .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
//   .then((res) => {
//     setIsAdmin(res?.data?.isAdmin);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// }


const Service = (props) => {
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  const navigate = useNavigate();
  const router = useParams();
  const code = router.code;
  const id = router.code;
  let slug = code;
  setTimeout(()=> {
    props.loader(false)
  }, 500)
  // let tabValue = localStorage.getItem("tabValue");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [getParams, setGetParams] = useState({
    id: "",
    code: "",
  });
  // fetch customer list on initial render and on query change
  useEffect(() => {
// user data fetch
axios
.get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
.then((res) => {
  setIsAdmin(res.data.isAdmin)
})
.catch((err) => {
  console.log(err);
});
//

    if (id) {
      setGetParams({ id: id, code: "" });
    }

    if (code) {
      setGetParams({ id: "", code: code });
    }
  }, [id, code]);

  const toggle = (tab) => {

    if (activeTab !== tab) setActiveTab(tab);
  };
  const { data, loading, error, refetch } = useQuery(QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { slug, id },
  });
  console.log("dataservic",data)

  if (loading) {
   props.loader(true);
   return null;
  }

  if (error) {
    return null;
  }

  let service = data?.services?.data;
  service = (service && service[0]);
  const type = service?.attributes?.type;
  let heading;
  let url_path;
  if(type == 'service'){
    heading = "Services";
    (   localStorage.getItem("eflag") == 2 ?  url_path = "/service" :  url_path = "/module/1" )
  }else if(type == 'snippet'){
    heading = "Snippets";
    (   localStorage.getItem("eflag") == 2 ?  url_path = "/snippet" :   url_path = "/module/2" )
  }else if(type == 'poc'){
    heading = "PoCs";
    (   localStorage.getItem("eflag") == 2 ?  url_path = "/poc" :   url_path = "/module/3" )
  }else {
    heading = "Packages";
    (   localStorage.getItem("eflag") == 2 ?  url_path = "/package" :  url_path = "/module/4" )
  }


  const masterId =
    service?.attributes?.service_master?.data !== null
      ? service?.attributes?.service_master?.data.id
      : null;
      localStorage.setItem("ServicesSlugName", JSON.stringify(service?.attributes))
       
  if (!service) {
    return (
      <>
        <AuthenticatePages>
          <h2 style={{ padding: "40px" }}>
            {`No results found for ID : `}
            <span style={{ color: "red", fontSize: "25px" }}>{id}</span>
          </h2>
        </AuthenticatePages>
      </>
    );
  } else {
    if(isAdmin || userData?.email=== service?.attributes?.authorEmail || service?.attributes?.status == true || userData?.email=== service?.attributes?.reviewerEmail ){
    return (
      <>
        <AuthenticatePages>
          <div className={styles.mainDiv}>

          <div style={{paddingBottom:'15px', marginTop:"-40px"}} >
          <a className="breadcrum"onClick={()=>navigate(url_path)}>{heading}</a> 》 
          <a  className="breadcrum" >{service?.attributes?.name}</a>
        </div>
            <p className={styles.p}>
              {service?.attributes?.name}
            </p>
            <div>
              <span className={styles.span}>
                {service?.attributes?.version}
              </span>
              <span className={styles.span}>
                &nbsp;• Published •&nbsp;
                <Moment fromNow>{service?.attributes?.publishedAt}</Moment>
              </span>
            </div>
            <div className={styles.subDiv}>
              <div className={activeTab === "1" ? styles.activeTab : styles.inActiveTab} onClick={() => {
                toggle("1");
                localStorage.setItem("tabValue", 1);
              }}>
                <div

                  id="nav_txt_decoration"
                >
                  {heading}
                </div>
              </div>
              {type === "service" &&

                <div className={activeTab === "2" ? styles.activeTab : styles.inActiveTab} onClick={() => {
                  toggle("2");
                  localStorage.setItem("tabValue", 2);
                }}>
                  <div

                    id="nav_txt_decoration"
                  >
                    FAQ's
                  </div>
                </div>
              }
              {type === "service" &&
                <div className={activeTab === "3" ? styles.activeTab : styles.inActiveTab} onClick={() => {
                  toggle("3");
                  localStorage.setItem("tabValue", 3);
                }}>
                  <div
                    id="nav_txt_decoration"
                  >
                    Feedbacks
                  </div>
                </div>
              }
              {type === "service" &&
                <div className={activeTab === "4" ? styles.activeTab : styles.inActiveTab} onClick={() => {
                  toggle("4");
                  localStorage.setItem("tabValue", 4);
                }}>
                  <div

                    id="nav_txt_decoration"
                  >
                    Versions
                  </div>
                </div>
              }
            </div>


            {
              activeTab === "1" && <Services service={service} props={props}/>
            }

            {
              activeTab === "2" && <Faq slug={service?.attributes?.slug} />
            }
            {
              activeTab === "3" && <FeedbackComponent
                slug={service?.attributes?.slug}
                masterId={masterId}
              />
            }
            {activeTab === "4" &&
              <VersionServices
                slug={service?.attributes?.slug}
              ></VersionServices>
            }
          </div>
        </AuthenticatePages>
      </>
    );
  }else{
    return  <AuthenticatePages>
    <h2 style={{ padding: "40px" }}>
      {`No results found for ID : `}
      <span style={{ color: "red", fontSize: "25px" }}>Not published Yet</span>
    </h2>
   </AuthenticatePages>
   }
  }
};

export default Service;