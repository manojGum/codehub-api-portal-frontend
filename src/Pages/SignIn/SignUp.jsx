import React from "react";
import styles from "./SignUp.module.css";
import img1 from "../../Assets/images/int25p-removebg-preview.png"
import google from "../../Assets/images/flat-color-icons_google.png"
import img2 from "../../Assets/images/loginfontendimage.png"
import SignInAuth from "../../Layouts/SignInAuth/SignInAuth";
const SignUp = () => {
  return (
    <>
    <SignInAuth >
    <div className={styles.container}>
        <div>
          <div className={styles.subDiv}>
            <div className={styles.subDiv1}>
              <div className={styles.subDiv1_SubDiv1}>
                <div className={styles.logo}>
                  <img src={img1} className={styles.logoimage} alt="INT" />
                  <h3 className={styles.codehub}>CODEHUB</h3>
                </div>
                <div className={styles.signUp}>
                  <h3>Sign in</h3>
                  <label className={styles.lablestyle}>With your Official E-mail Account Sign</label>
                  <div>
                    <div>
                    <div className={styles.buttons_style} onClick={() => window.location.href = `${process.env.REACT_APP_BACK_END_API_URL}/connect/google`}>
                        <img
                          src={google}
                          alt="google"
                        />
                         Sign in with Google
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             
            </div>
            <div className={styles.subDiv2}> 
            <div className={styles.subDiv2_SubDiv1}>
              <img className={styles.img2} src={img2} alt="" />
            </div>
            </div>
          </div>
        </div>
      </div>
    </SignInAuth>
    </>
  );
};

export default SignUp;
