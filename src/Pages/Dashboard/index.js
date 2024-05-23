import React, { useState } from 'react'
import styles from './dashboard.module.css'
import ModuleCards from '../../component/ModuleCards/ModuleCards'
import { serviceType, serviceTypeServices, allData, author, underReviewer, RowData, published } from "./Services";
import { useQuery } from "@apollo/client";
import img1 from "../../Assets/images/Service.png";
import img2 from "../../Assets/images/Coding.png";
import img3 from "../../Assets/images/Content.png";
import img4 from "../../Assets/images/Delivery box.png";
import img5 from "../../Assets/images/login.png"
import img6 from "../../Assets/images/research.png"
import img7 from "../../Assets/images/sharing-content.png"
import Chart from '../../component/DonutChart/DonutChart';
import AuthenticatePages from '../../Layouts/Admin/AuthenticatePages';
import { useNavigate } from 'react-router';
import MostPopular from '../../component/MostPopular.jsx/MostPopular';
import { useEffect } from 'react';
import Author from '../../component/Author.jsx/Author';

import axios from "axios";
// import RecentlyAdded from '../../component/RecentlyAdded/RecentlyAdded';
// localStorage.setItem("sideBarCss", 1)
const DashboardIndex = ({ loader, setBreadName }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [leaderbordData, setLeaderbordData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false)
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

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
  let pageSize = 1;
  
  const setPageNo = (e) => {
    setPage(e);
  };
  setBreadName("Dashboard")

  let ServiceMastersResult;
  let ServicesResult;
  let PocResult;
  let PackageResult;
  let leaderboard;
  let addData;

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/leaderboard`)
      .then((res) => {
        setLeaderbordData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [leaderboard]);


  setTimeout(() => {
    loader(false)
  }, 500)

  ServiceMastersResult = useQuery(serviceType("serviceMasters", "service"), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  ServicesResult = useQuery(serviceTypeServices("services", "snippet"), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  PocResult = useQuery(serviceTypeServices("services", "poc"), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  PackageResult = useQuery(serviceTypeServices("services", "package"), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });



  addData = useQuery(allData(), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const reviewerData = useQuery(underReviewer(), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const revLen = reviewerData?.data?.services?.meta?.pagination?.total

  const rowData = useQuery(RowData(), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const roDa = rowData?.data?.services?.meta?.pagination?.total

  const Tpublished = useQuery(published(), {
    variables: { page, pageSize },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const tpused = Tpublished?.data?.services?.meta?.pagination?.total

  const { loading } = ServiceMastersResult;

  if (loading) {
    loader(true);
    return null;
  }

  const chLabel = ["Service", "Snippets", "PoCs", "Packages"]
  const chColor = ["rgba(250, 150, 185, 1)", "rgba(74, 207, 191, 1)", "rgba(132, 200, 166, 1)", "rgba(255, 201, 120, 1)"]
  const data = [(ServiceMastersResult ? ServiceMastersResult?.data?.serviceMasters?.meta?.pagination?.total : 0),
  (ServicesResult?.data ? ServicesResult?.data?.services?.meta?.pagination?.total : 0),
  (PocResult?.data ? PocResult?.data?.services?.meta?.pagination?.total : 0),
  (PackageResult?.data ? PackageResult?.data?.services?.meta?.pagination?.total : 0)]

  const recentlyAdded = addData?.data?.services?.data;
  const authors = addData?.data?.services?.data;

  const handleNavigate = (N) => {
    navigate(`/module/${N}`);
    localStorage.setItem("sideBarCss", N + 1)
  }
  return (
    <AuthenticatePages >
      <div className={styles.mainDiv}>
        <h1>Dashboard</h1>
        <div style={{ display: "flex", columnGap: "20px" }}>
          <div className={isAdmin ? styles.isAdminsubDiv1 : styles.subDiv1}>
            <div className={isAdmin ? styles.isAdminsbd1div1 : styles.sbd1div1}>
              <div className={isAdmin ? styles.isAdminsbd1d1d : styles.sbd1d1d} onClick={() => handleNavigate(1)}><ModuleCards name={"Services"} length={data[0]} image={img1}/></div>
              <div className={isAdmin ? styles.isAdminsbd1d1d : styles.sbd1d1d} onClick={() => handleNavigate(2)}><ModuleCards name={"Snippets"} length={data[1]} image={img2} /></div>
              <div className={isAdmin ? styles.isAdminsbd1d1d : styles.sbd1d1d} onClick={() => handleNavigate(3)}><ModuleCards name={"PoCs"} length={data[2]} image={img3}/></div>
              <div className={isAdmin ? styles.isAdminsbd1d1d : styles.sbd1d1d} onClick={() => handleNavigate(4)}><ModuleCards name={"Packages"} length={data[3]} image={img4} /></div>
             {isAdmin &&<>  
              <div className={styles.isAdminsbd1d1d} ><ModuleCards name={"Entries"} length={roDa} image={img5} /></div>
              <div className={styles.isAdminsbd1d1d} ><ModuleCards name={"Under Review"} length={revLen} image={img6} /></div>
              <div className={styles.isAdminsbd1d1d} ><ModuleCards name={"Published"} length={tpused} image={img7} /></div>
             </>
             }
            </div>
            <div className={isAdmin ? styles.isAdminsbd1div2 : styles.sbd1div2}>
              <div className={isAdmin ? styles.isAdminchartDiv : styles.chartDiv}>
                <p style={{marginTop:"10px", marginLeft:"10px"}}>Overall Data</p>
                <Chart chData={data} chLabel={chLabel} chColor={chColor} isAdmin={isAdmin}/>
              </div>
              <div className={isAdmin ? styles.isAdminmostPopular : styles.mostPopular}>
                <div className={styles.mostPopularsubdiv}>
                  <p>Recently Added</p>
                </div>
                <div className={styles.mostPopularDiv}>
                  <MostPopular allData={recentlyAdded} />

                </div>
              </div>
            </div>
          </div>
          <div className={styles.subDiv2}>
            <div className={styles.sbd2div1}>
              <div className={styles.sbd2div1d1}>
                <p>Leaderboard</p>
              </div>

              <div className={styles.sbd2div1d2}>

                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <Author allData={leaderbordData} />
                )}


              </div>

            </div>
            {/* <div className={styles.sbd2div2}>
              <p>Recently Added</p>
              <RecentlyAdded name={"Insurance Entity Module"} date={"15 July, 2023"}/>
              <RecentlyAdded name={"Notification Services"} date={"10 July, 2023"}/>
              <RecentlyAdded name={"PPT to PDF converter"} date={"PPT to PDF converter"}/>
              <RecentlyAdded name={"Notification Services"} date={"15 July, 2023"}/>
            </div> */}
          </div>
        </div>
      </div>
    </AuthenticatePages>
  )
}

export default DashboardIndex