import React from "react";

// 1. Importe os estilos e a imagem
import styles from "./hero.module.css";
import heroBackground from "../../../assets/heroImage.jpg";

const Hero = () => {
  return (
    <section
      id="hero"
      className={styles.hero}
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className={styles.overlay}></div>{" "}
      {/* Camada para escurecer o fundo */}
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Contabilidade Inteligente para o Sucesso do seu Negócio
        </h1>
        <p className={styles.subtitle}>
          Foque em crescer. Deixe a burocracia e os números com a gente.
        </p>
        <button className={styles.ctaButton}>Entre em contato agora!</button>
      </div>
    </section>
  );
};

export default Hero;
