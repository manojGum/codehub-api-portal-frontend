import React from 'react'
import styles from './DonutChart.module.css'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);


const Chart = ({ chData, chLabel, chColor, isAdmin }) => {
  const data = {
    labels: chLabel,
    datasets: [{
      label: 'Total Data',
      data: chData,
      backgroundColor: chColor,
      borderColor: chColor,
     
    }],
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: 'rgb(255, 99, 132)'
        }
        },
        tooltip: {
          enabled: false
        }
      }
    }
  }

  const plugin = {
    plugins: {
      legend: {
        display: true,   
        position: "bottom",
        align: "start"
      }
    }
  }
  return (
    <div className={styles.mainDiv}>
      <div className={styles.chartContainer}>

      </div>
      <div className={isAdmin ? styles.isAdminchart : styles.chart}>
        <Doughnut
          data={data}
          options={plugin}
        >

        </Doughnut>
      </div>
    </div>
  )
}

export default Chart