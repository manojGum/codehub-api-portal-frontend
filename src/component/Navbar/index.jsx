/* navbar component for authorized pages
 */
import React, { useState, useEffect } from "react";
import "./Navbar.css";
import img1 from "../../Assets/images/user1.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiPackage } from "react-icons/fi";
import { BsFillPlusCircleFill } from "react-icons/bs";
import {AiOutlineAppstoreAdd} from "react-icons/ai"
import { MdMiscellaneousServices } from "react-icons/md";
import {LiaBitbucket} from "react-icons/lia"
import { BiSolidDockLeft } from "react-icons/bi";
import { HiPower } from "react-icons/hi2";
import { FaCode } from "react-icons/fa";
import Tippy from "@tippyjs/react";

function AdminNavbar({ show, setShow, loader, setShowPlus, showPlus }) {
  let userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [picture, setpicture] = useState("");
  const pictures = localStorage.getItem("picture");
  const navigate = useNavigate();

  useEffect(() => {
    setpicture(pictures);
  }, [pictures]);

  useEffect(() => {
    setpicture(pictures);

    axios
      .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
      .then((res) => {
        setIsAdmin(res.data.isAdmin);
        setpicture(pictures);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  let loggedUser = {};
  loggedUser = JSON.parse(localStorage.getItem("user"));

  function showDropdown(e, id) {
    if (show === true) {
      setShow(false);
      return;
    }
    setShow(true);
    setShowPlus(false);
    e.stopPropagation();
  }

  const showPlusDropdown = (e) => {
    if (showPlus === true) {
      setShowPlus(false);
      return;
    }
    setShowPlus(true);
    setShow(false);
    e.stopPropagation();
  };

  const capitalizeFirst = (str) => {
    const arr = str.charAt(0).toUpperCase() + str.slice(1);
    return arr.split(".").join(" ");
  };

  const handleDeleteToken = () => {
    localStorage.clear();
    navigate("/");
  };

  const serachFunction = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSubmit = () => {
    loader(true);
    navigate(`/search/${searchValue}`);
  };

  const handleNaviagte = (path) => {
    loader(true)
    localStorage.setItem("sideBarCss", 0);
    navigate(`${path}`);
  };

  return (
    <>
      <div>
        <div>
          <div className="header">
            <div className="rightNav">
              <div className="container2" onClick={showPlusDropdown}>
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
                      <span>Add New</span>
                    </span>
                  }
                >
                  <div className="svg active" >
                    {" "}
                    {/* <BsFillPlusCircleFill size={30} /> */}
                    <AiOutlineAppstoreAdd size={29} color="white" />
                  </div>
                </Tippy>
              </div>
              <div className="searchbar">
                <form className="nosubmit" onSubmit={handleSubmit}>
                  <div className="mainserchDiv">
                    <input
                      style={{
                        border: "1px solid #C4C4C4",
                        backgroundColor: "#FFF",
                        borderRadius: "90px",
                      }}
                      className="nosubmit"
                      type="searchValue"
                      placeholder="Search..."
                      onChange={(e) => serachFunction(e)}
                    />
                    <button type="submit" className="submitButton">
                      {" "}
                    </button>
                  </div>
                </form>
              </div>

              <div>
                {picture ? (
                  <img
                    src={picture}
                    className="profileImage"
                    alt="logged user"
                  />
                ) : (
                  <img src={img1} className="profileImage" alt="profile" />
                )}
              </div>
              <div className="arrowbtn" onClick={showDropdown}>
                <img
                  src={require("../../Assets/images/vector.jpg")}
                  alt="vector"
                  className="arrowbtn"
                />
              </div>
            </div>
          </div>
          {show ? (
            <ul className="NavModal">
              <li
                style={{
                  textAlign: "center",
                  margin: "-19px 0px -8px 0px",
                }}
              >
                <h4
                  style={{
                    color: "var(--primary, #1B3DA2)",
                    leadingTrim: "both",
                    textEdge: "cap",
                    fontSize: "0.875rem",
                    fontWeight: "300",
                    lineHeight: "1.125rem",
                    letterSpacing: "0.00875rem",
                    textTransform: "capitalize",
                    textAlign: "start",
                    padding: "7px 0px 7px 15px",
                    borderRadius: "0.625rem",
                    background: "var(--bg, #EDF2FA)",
                  }}
                >
                  Hi,&nbsp;
                  {`${
                    loggedUser?.username
                      ? capitalizeFirst(loggedUser?.username)
                      : "User"
                  }`}
                  <br />
                  <p
                    style={{
                      color: "var(--primary, #919EAF)",
                      leadingTrim: "both",
                      textEdge: "cap",
                      fontSize: "0.6875rem",
                      fontWeight: "400",
                      lineHeight: "1.125rem",
                      textTransform: "capitalize",
                      textAlign: "start",
                      letterSpacing: "0.01375rem",
                    }}
                  >
                    {isAdmin ? "Admin" : "User"}
                  </p>
                </h4>
              </li>
              {isAdmin && <li    style={{
                  padding: "0px 0px 10px 10px",
                  alignItems: "center",
                  alignSelf: "stretch",
                  lineHeight: "1.2",
                }} onClick={() => handleNaviagte("/bitbucket-repository-access")}>
                <LiaBitbucket
                  style={{
                    width: "20px",
                    height: "20px",
                    verticalAlign: "top",
                  }}
                />
                <span>Repository Access</span>
              </li>}
              <li
                onClick={handleDeleteToken}
                style={{
                  padding: "0px 0px 10px 10px",
                  alignItems: "center",
                  alignSelf: "stretch",
                  lineHeight: "1.2",
                }}
              >
                <HiPower
                  style={{
                    width: "20px",
                    height: "20px",
                    verticalAlign: "top",
                  }}
                />
                <span>Sign Out</span>
              </li>
            </ul>
          ) : null}
          <div>
            {showPlus ? (
              <div className="modal-container">
                <div className="parent-container">
                  <div
                    className="div"
                    onClick={() => handleNaviagte("/service")}
                  >
                    <div
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <MdMiscellaneousServices stroke="#313131" size={25} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <strong style={{ marginRight: "2px" }}>+ </strong>

                      <span> Services</span>
                    </div>
                  </div>

                  <div
                    className="div"
                    onClick={() => handleNaviagte("/snippet")}
                  >
                    <div
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <FaCode size={25} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <strong style={{ marginRight: "2px" }}> + </strong>

                      <span>Snippets</span>
                    </div>
                  </div>
                  <div className="div" onClick={() => handleNaviagte("/poc")}>
                    <div
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <BiSolidDockLeft stroke="#313131" size={25} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <strong style={{ marginRight: "2px" }}> + </strong>

                      <span>PoCs</span>
                    </div>
                  </div>
                  <div
                    className="div"
                    onClick={() => handleNaviagte("/package")}
                  >
                    <div
                      style={{ alignItems: "center", justifyContent: "center" }}
                    >
                      <FiPackage stroke="#313131" size={25} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <strong style={{ marginRight: "2px" }}> + </strong>

                      <span>Packages</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {isAdmin ? (
            <div
              href={{
                pathname: "/docs/users",
              }}
            >
              <button style={{ backgroundColor: "#174ea0" }}>users</button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default AdminNavbar;
