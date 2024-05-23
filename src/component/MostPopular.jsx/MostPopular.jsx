import React from 'react'
import styles from "./MostPopular.module.css"
import { useNavigate} from "react-router-dom";
import parse from "html-react-parser";

const MostPopular = ({ allData }) => {
    const navigate = useNavigate();
    const addEllipsis = (str, limit) => {
        return str?.length > limit ? str.substring(0, limit) + "..." : str;
    };

    const setCss = (N) => {
        localStorage.setItem("sideBarCss", N + 1)
    }
    return (
        <>
            {allData?.map((data, i) => {
                return (
                    <>
                        {i < 3 ?
                            <div className={styles.mainDiv} key={data.id} onClick={() =>
                                navigate(
                                    `/service/${data?.attributes.slug}`,
                                    data?.attributes?.type === "service" ? setCss(1) : (data?.attributes?.type === "snippet" ? setCss(2) : (data?.attributes?.type === "poc" ? setCss(3) : (data?.attributes?.type === "package" ? setCss(4) : null)))
                                )
                            }>
                                <div className={styles.subDiv1}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="80" viewBox="0 0 4 35" fill="none">
                                        <path d="M2 2L2 33" stroke="#6B99F4" stroke-width="3" stroke-linecap="round" />
                                    </svg>
                                </div>
                                <div className={styles.subdiv2}>
                                    <p className={styles.subdiv2P}>{data?.attributes?.type}</p>
                                    <h1 className={styles.subdiv2h1}>{addEllipsis(data?.attributes?.name, 62)}</h1>
                                    <p className={styles.subdiv2p}>
                                        {data?.attributes?.description !== null && parse(addEllipsis(data?.attributes?.description, 42))}</p>
                                </div>
                            </div> : null
                        }
                    </>
                )
            })}
        </>

    )
}

export default MostPopular