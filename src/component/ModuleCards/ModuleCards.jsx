import React, { useState, useEffect } from 'react'
import styles from './ModuleCards.module.css'
import axios from "axios";

const ModuleCards = ({ length, image, name, data, dataName }) => {
    const [isAdmin, setIsAdmin] = useState(false)
    let userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.id;

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACK_END_API_URL}/users/${userId}`)
            .then((res) => {
                setIsAdmin(res?.data?.isAdmin);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);
    return (


        <div className={isAdmin ? styles.isAdminmainDiv : styles.mainDiv}>
            <img src={image} alt='' />
            <div>
                <h1>{length ? length : 0}</h1>
                <p>{name}</p>
            </div>
        </div>


    )
}

export default ModuleCards