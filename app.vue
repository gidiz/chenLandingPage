<template>
  <div>
    <div class="hero">
      <img src="/assets/logo.png" class="logo" />
    </div>
    <div class="content">
      <h1>ד"ר חן פרדו</h1>
      <p class="subtitle">
        קליניקה לאסתטיקה רפואית – בוטוקס, חומצה היאלורונית, הזעת יתר ועוד
      </p>
      <form action="https://formsubmit.co/drchenpardo@gmail.com" method="POST">
        <input type="text" name="name" placeholder="שם מלא" required />
        <input
          type="tel"
          name="phone"
          placeholder="טלפון ליצירת קשר"
          required
        />
        <textarea
          name="message"
          placeholder="מה ברצונך לברר?"
          required
        ></textarea>
        <input type="hidden" name="_captcha" value="false" />
        <button type="submit">שלחו לי פרטים</button>
      </form>
      <a class="whatsapp-link" href="https://wa.me/972545412405" target="_blank"
        >📲 לחצו כאן ליצירת קשר בוואטסאפ</a
      >
    </div>
  </div>
</template>

<style scoped>
/* הכנס כאן את הסגנון מ־index.css */
</style>
