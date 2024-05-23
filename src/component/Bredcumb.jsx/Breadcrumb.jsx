import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const Breadcrumb = ({ breadName }) => {
  const [arr, setArr] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/sign-in/*" || location.pathname === "/" || breadName === undefined) {
      return
    }
    if (breadName === "Dashboard") {
      console.log("nitesh")
      let array = [];
      setArr(array);
    }
    if (breadName === "Packages") {
      let array = [...arr];
      console.log("Packages", array)
      array.pop();
      setArr(array);
    }
    let obj = {
      pathName: location.pathname,
      name: breadName
    }
    setArr([...arr, obj]);
  }, [breadName])
  useEffect(() => {
    console.log(arr, location)
  }, [arr])

  const handleNavigate = () => {

  }
  return (
    <div >
      {location.pathname !== "/dashboard" &&
        <div style={{ marginTop: "14px", display: "flex", cursor: "pointer" }}>{
          arr.map((item, index) => {
            return (
              <div key={index} onClick={() => navigate(`${item.pathName}`)}>
                {item.name}
              </div>
            )
          })
        }
        </div>
      }
    </div>
  )
}

export default Breadcrumb