import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const AuthenticateSignIn = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const [showNavbar, setShowNavbar] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token === null && (location.pathname === "/" || location.pathname === '/sign-in/*')) {
      navigate("/")
    }
  }, [location]);
  return (
    <div>{children}</div>
  )
}

export default AuthenticateSignIn