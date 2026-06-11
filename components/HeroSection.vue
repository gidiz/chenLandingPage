<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1>ד"ר חן פרדו</h1>
      <p class="subtitle">
        קליניקה לאסתטיקה רפואית וטיפולים כנגד הזעת יתר בכל הגוף
      </p>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background-image: url("/assets/cover.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 6rem 1.5rem;
  position: relative;
  text-align: center;
  color: #fff;
  overflow: hidden;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.55),
    rgba(0, 0, 0, 0.55)
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-section h1,
.subtitle {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-section h1 {
  font-size: 2.7rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.subtitle {
  font-size: 1.3rem;
  font-weight: 300;
}
</style>
