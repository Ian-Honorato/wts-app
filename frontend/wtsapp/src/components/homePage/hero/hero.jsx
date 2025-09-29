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
        <a
          className={styles.ctaButton}
          href="https://wa.me/5514991469270?text=Ol%C3%A1,%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio!"
          target="_blank"
          rel="noopener noreferrer"
        >
          Entre em contato agora!
        </a>
      </div>
    </section>
  );
};

export default Hero;
