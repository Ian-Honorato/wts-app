import React from "react";

// 1. Importe os estilos e a imagem
import styles from "./hero.module.css";
import heroBackground from "../../../assets/heroImage.jpg"; // Ajuste o caminho se necessário

const Hero = () => {
  return (
    // 2. Aplicamos a imagem de fundo via 'style' inline.
    // Isso é necessário porque o CSS não consegue acessar a variável 'heroBackground'.
    <section
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
