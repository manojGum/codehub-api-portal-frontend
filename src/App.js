import { useState } from "react";
import "./App.css";
import Module from "./Pages/Module";
import CreateService from "./Pages/Services/Add";
import ServiceListing from "./Pages/Services";
import EndpointListing from "./Pages/Endpoints";
import PackageLisiting from "./Pages/Packages";
import PocsListing from "./Pages/Pocs";
import Loader from "./component/Loader";
import AdminNavbar from "./component/Navbar";
import SidebarComponent from "./component/Sidebar";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Signin from "./Pages/SignIn/Signin";
import SignUp from "./Pages/SignIn/SignUp";
import ShowNavAndSidebar from "./Layouts/Auth/ShowNavAndSidebar";
import DashboardIndex from "./Pages/Dashboard";
import Search from "./Pages/Search/Search";
import Service from "./Pages/service/Service";
import EndpointForm from "./Pages/Endpoints/Add";
import FeedbackComment from "./Pages/Feedbacks/FeedbackComment";
import Endpoint from "./Pages/EndpointDetails/EndpointDetails";
import SnippetListing from "./Pages/Snippets";
import BitbucketRepository from "./Pages/BitbucketRepository";
import Rejected from "./Pages/Rejected";


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(false);
  const [show, setShow] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [breadName, setBreadName] = useState()

  

  const handleCloseNav = () => {
    if (show === true) {
      setShow(false);
    }
    if (showPlus === true) {
      setShowPlus(false);
    }
  };


  return (
    <div className="App" onClick={handleCloseNav}>
      <ShowNavAndSidebar>
        <div className="sidebar">
          <Loader loader={loader} />
          <SidebarComponent loader={setLoader} />
        </div>
      </ShowNavAndSidebar>

      <ShowNavAndSidebar>
        <div className="navbar">
          <AdminNavbar show={show} setShow={setShow} loader={setLoader} showPlus={showPlus} setShowPlus={setShowPlus} />
        </div>
      </ShowNavAndSidebar>
      <div className="content">
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/sign-in/*" element={<Signin loader={setLoader} />} />
          <Route
            path="/dashboard"
            element={<DashboardIndex loader={setLoader} setBreadName={setBreadName} />}
          />
          <Route path="/module/:id" element={<Module loader={setLoader} setBreadName={setBreadName} />} />
          <Route path="/service" element={<ServiceListing loader={setLoader}/>} />
          {/* <Route path="/service/add/" element={<CreateService />} /> */}
          <Route path="/serviceEdit/:id" element={<CreateService />} />
          <Route path="/endpoint" element={<EndpointListing loader={setLoader}/>} />
          <Route path="/endpoint/add" element={<EndpointForm loader={setLoader}/>} />
           
          <Route path="/endpoint/edit/:id" element={<EndpointForm loader={setLoader}/>} />
         
          <Route path="/poc" element={<PocsListing loader={setLoader}/>} />
          <Route path="/snippet" element={<SnippetListing loader={setLoader}/>} />
          <Route path="/package" element={<PackageLisiting loader={setLoader}/>} />
          <Route
            path="/search/:query"
            element={<Search loader={setLoader} />}
          />
          <Route path="/service/:code" element={<Service loader={setLoader}/>} />
          <Route path="/feedback" element={<FeedbackComment />} />
          <Route path="/endpoint-details/:id" element={<Endpoint loader={setLoader}/>} />
          <Route path="/bitbucket-repository-access" element={<BitbucketRepository loader={setLoader} />}/>
          <Route path="/rejected" element={<Rejected loader={setLoader}/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;