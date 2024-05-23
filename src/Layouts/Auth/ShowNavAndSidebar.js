import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const ShowNavAndSidebar = ({ children }) => {
    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    useEffect(() => {   
        if ( location.pathname === "/" || location.pathname === `/sign-in/*`) {
            setShowNavbar(false);
        }else if(token === null) {
            setShowNavbar(false);
            navigate("/");
        } else if( token !== null && (location.pathname !== "/" || location.pathname !== `/sign-in/*`)) {
            setShowNavbar(true)
        } 
    }, [location]);
    return (
        <div>
            {showNavbar && children}
        </div>
    )
}

export default ShowNavAndSidebar