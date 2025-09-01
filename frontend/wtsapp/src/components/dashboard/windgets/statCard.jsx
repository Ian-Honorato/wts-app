import React from "react";
import styles from "./statCard.module.css";

const StatCard = ({ title, value, icon }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.iconWrapper}>
        <span>{icon}</span>
      </div>
      <div className={styles.textWrapper}>
        <h4 className={styles.value}>{value}</h4>
        <p className={styles.title}>{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
