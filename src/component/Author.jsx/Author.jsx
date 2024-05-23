import React from 'react'
import styles from './Author.module.css'
import { useNavigate } from 'react-router-dom';
const Author = ({ allData }) => {
  const navigate = useNavigate();
  function transformString(inputString) {
    return inputString
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <>
      {allData.map((item, i) => (
        i < 20 ? (
          <div key={item?.id} className={styles.mainDiv} onClick={()=>{
            localStorage.setItem("authorEmail", item?.email);
            navigate(`/module/5`);
          } }>
            {/* <div className={styles.subDiv1}>  {
             i % 2 === 0 ? <img alt='' src={img1} /> : <img alt='' src={img2} />
            }
            </div> */}
            <div className={styles.subDiv2}>
              <h1>{transformString(item?.name)}&nbsp;&nbsp;({item?.service_count})</h1>
              <p>{item?.email}</p>
              <p></p>
            </div>
          </div>
        ) : null
      ))}

    </>
  )
}

export default Author