import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Cookies from "universal-cookie";
import SignInAuth from "../../Layouts/SignInAuth/SignInAuth";
// import { ReactSession } from 'react-client-session';

const Signin = ({ loader }) => {
  const navigate = useNavigate();
  // const cookies = new Cookies();
  const url = window.location.href.split("?")[1];
  const access = url.split("access_token%5D=")[1];
  const access_token = access.split("&raw%5Bexpires")[0];

  async function fetchGoogleInfo(access_token) {
    try {
      const url = `${process.env.REACT_APP_GOOGLE_URL}/oauth2/v1/userinfo?alt=json&access_token=${access_token}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch Google user information");
      }
      const data = await response.json();
      localStorage.setItem("picture", data.picture);    
      
      return data;
    } catch (error) {
      console.error("Error fetching Google user information:", error);
      throw error;
    }
  }
  useEffect(() => {
    loader(true);
    fetch(
      `${process.env.REACT_APP_BACK_END_API_URL}/auth/google/callback?access_token=${access_token}`
    )
      .then((response) => response.json())
      .then((data) => {
        fetchGoogleInfo(access_token); // decode = jwt(data.jwt), // cookies.set("token", data.jwt, { //     expires: new Date(decode.exp * 1000) // })) )
        document.cookie = `token=${data.jwt}`
        localStorage.setItem("token", JSON.stringify(data.jwt));
        localStorage.setItem("user", JSON.stringify(data.user)); // localStorage.setItem("user", ReactSession.get("user"))
        localStorage.setItem("sideBarCss", 1)
        navigate("/dashboard");
      })
      .catch((err) => (console.log(err), navigate("/")));
  }, [access_token]);

  return (
    <>
      <SignInAuth> </SignInAuth>
    </>
  );
};

export default Signin;
