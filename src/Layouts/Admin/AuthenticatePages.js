import React, { useEffect} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const AuthenticatePages = ({children}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    let admin = JSON.parse(localStorage.getItem("admin"));

    useEffect(() => {
        if(token === null && location.pathname !== "/" && location.pathname !== '/sign-in/*'){
            navigate("/")
        }else if(token !== null && location.pathname === "/dashboard"){
          localStorage.setItem("sideBarCss", 1);
        }else if(admin === false && location.pathname === "/rejected"){
          navigate("/dashboard")
          localStorage.setItem("sideBarCss", 1);
        }
    }, [location]);
  return (
    <div>{children}</div>
  )
}

export default AuthenticatePages