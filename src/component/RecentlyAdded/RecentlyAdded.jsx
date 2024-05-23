import React from 'react';
import styles from './RecentlyAdded.module.css';

const RecentlyAdded = ({name, date}) => {
    return (
        <div className={styles.mainDiv}>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="35" viewBox="0 0 4 35" fill="none">
                    <path d="M2 2L2 33" stroke="#6B99F4" stroke-width="3" stroke-linecap="round" />
                </svg>
            </div>

            <div>
                <h1>{name}</h1>
                <p>{date}</p>
            </div>
        </div>
    )
}

export default RecentlyAdded