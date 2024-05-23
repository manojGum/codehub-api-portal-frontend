import React, { useEffect} from 'react'
import {  useLocation, useNavigate } from 'react-router-dom';

const SignInAuth = ({children}) => {
    const location = useLocation();
     const navigate = useNavigate();
    // const [showNavbar, setShowNavbar] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if(token &&  (location.pathname === "/" || location.pathname === '/sign-in/*')){
            navigate("/dashboard")
        }
    }, [location]);

    // useEffect(() => {
    //   if (token && (location.pathname === "/" || location.pathname === '/sign-in/*')) {
    //     navigate("/dashboard");
    //   }
    // }, [token, location, navigate]);

  return (
    <div>{children}</div>
  )
}

export default SignInAuth