import React, { useState } from "react";
import Loader from "../../component/Loader";
import SidebarComponent from "../../component/Sidebar";
import AdminNavbar from "../../component/Navbar";

import "../../App.css";
const Admin = () => {
  const [loader, setLoader] = useState(false);
  return (
    <>
      <div className="App">
        <div className="subDiv1">
          <Loader loader={loader} />
          <SidebarComponent loader={setLoader} />
        </div>
        <div className="subDiv2">
          <div className="sbd2d1">
            <AdminNavbar />
          </div>
          <div className="sbd2d2"></div>
        </div>
      </div>
    </>
  );
};

export default Admin;
