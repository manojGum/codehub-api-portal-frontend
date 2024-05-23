import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logo from "./../../Assets/images/intLogo_1.svg";
import { FaCode } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiPackage } from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { BiSolidDockLeft } from "react-icons/bi";
import { FaHouseChimneyUser } from "react-icons/fa6";
import axios from "axios";

const SidebarComponent = ({ loader }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const user_email = JSON.parse(localStorage.getItem("user"));
  let userData = JSON.parse(localStorage.getItem("user"));
  const handleNavigate = (N) => {
    loader(true);
    navigate(`/module/${N}`);
    localStorage.setItem("sideBarCss", N + 1);
  };

  useEffect(() => {
    const userId = userData?.id;

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then((res) => {
        setIsAdmin(res.data.isAdmin);
        localStorage.setItem("admin", res.data.isAdmin)
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <div className="sidebarContainer">
        <div className="logoImage">
          <img src={logo} className="intImageLogo" alt="Int" onClick={()=>{ localStorage.setItem("sideBarCss", 1); navigate("/dashboard")}}/>
          <div className="codehub" onClick={()=> navigate("/dashboard")}> CODEHUB</div>
        </div>
        <div
          onClick={() => {
            loader(true);
            navigate("/dashboard");
            localStorage.setItem("sideBarCss", 1);
          }}
          className={
            localStorage.getItem("sideBarCss") === "1"
              ? "selectIcon"
              : "dasboard"
          }
        >
          <span>
            <LuLayoutDashboard size={22} />
          </span>
          Dashboard
          <span className="side_arrow_icon">
            <IoIosArrowForward />
          </span>
        </div>
        <div
          onClick={() => handleNavigate(1)}
          className={
            localStorage.getItem("sideBarCss") === "2"
              ? "selectIcon"
              : "Services"
          }
        >
          <span>
            <MdMiscellaneousServices size={25} />
          </span>
          Services
          <span className="side_arrow_icon">
            <IoIosArrowForward />
          </span>
        </div>

        <div
          onClick={() => handleNavigate(2)}
          className={
            localStorage.getItem("sideBarCss") === "3"
              ? "selectIcon"
              : "Snippets"
          }
        >
          <span>
            <FaCode size={23} />
          </span>
          Snippets
          <span className="side_arrow_icon">
            <IoIosArrowForward />
          </span>
        </div>
        <div
          onClick={() => handleNavigate(3)}
          className={
            localStorage.getItem("sideBarCss") === "4" ? "selectIcon" : "PoCs"
          }
        >
          <span>
            {/* <GoProjectSymlink size={22}  /> */}
            <BiSolidDockLeft size={25} />
          </span>
          PoCs
          <span className="side_arrow_icon">
            <IoIosArrowForward />
          </span>
        </div>
        <div
          onClick={() => handleNavigate(4)}
          className={
            localStorage.getItem("sideBarCss") === "5"
              ? "selectIcon"
              : "Packages"
          }
        >
          <span>
            <FiPackage size={25} />
          </span>
          Packages
          <span className="side_arrow_icon">
            <IoIosArrowForward />
          </span>
        </div>
{ isAdmin &&
        <div
          onClick={() => {
            localStorage.setItem("sideBarCss", "6");
            navigate("/rejected")
          }}
          className={
            localStorage.getItem("sideBarCss") === "6"
              ? "selectIcon"
              : "Packages"
          }
        >
          <span>
            <FiPackage size={25} />
          </span>
          Rejected
          <span className="side_arrow_icon">
            <IoIosArrowForward />
          </span>
        </div>
}
      </div>
    </>
  );
};

export default SidebarComponent;
