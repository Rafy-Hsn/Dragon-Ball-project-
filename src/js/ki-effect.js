// ki-effect.js — Ki energie achtergrond animatie
// Dit bestand tekent een animatie op een <canvas> element
// als achtergrond van de hele pagina.
// De animatie bestaat uit 3 lagen:
//   1. Grote zachte Ki aura gloed in de hoeken
//   2. Zwevende Ki deeltjes die opstijgen
//   3. Energie bliksem lijnen die willekeurig verschijnen

export const initKiEffect = () => {
  // Haal het canvas element op uit de HTML
  const canvas = document.getElementById('ki-canvas');
  if (!canvas) return; // Stop als het element niet gevonden wordt

  // De 2D teken context: hiermee tekenen we op het canvas
  const ctx = canvas.getContext('2d');

  // Canvas grootte aanpassen aan het browservenster
  // Dit zorgt dat de animatie altijd het volledige scherm vult

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize(); // Direct uitvoeren bij het laden

  // Event: herlaadte grootte als het venster groter/kleiner wordt
  window.addEventListener('resize', resize);

  // CONFIGURATIE — constanten voor de animatie
  const PARTICLE_COUNT = 60; // Aantal zwevende Ki deeltjes
  const BOLT_COUNT     = 4;  // Aantal bliksem lijnen tegelijk

  // Hulpfunctie: willekeurig getal tussen a en b
  // Techniek: arrow function
  const randomBetween = (a, b) => a + Math.random() * (b - a);

  // Ki kleuren — oranje/geel/wit palet passend bij Dragon Ball
  // De strings zijn gedeeltelijk: het alpha getal volgt later
  const KI_COLORS = [
    'rgba(249,115,22,',  // Diep oranje
    'rgba(251,191,36,',  // Geel
    'rgba(255,220,100,', // Licht geel
    'rgba(255,140,30,',  // Amber oranje
    'rgba(255,255,200,', // Bijna wit
  ];

  // Een nieuw Ki deeltje aanmaken met willekeurige eigenschappen
  const createParticle = () => ({
    x:         randomBetween(0, canvas.width),  // Startpositie horizontaal
    y:         randomBetween(0, canvas.height), // Startpositie verticaal
    r:         randomBetween(2, 7),             // Straal (grootte)
    vx:        randomBetween(-0.4, 0.4),        // Horizontale snelheid
    vy:        randomBetween(-0.8, -0.2),       // Verticale snelheid (negatief = omhoog)
    alpha:     randomBetween(0.1, 0.7),         // Doorzichtigheid
    dalpha:    randomBetween(-0.004, -0.001),   // Hoe snel het vervaagt
    color:     KI_COLORS[Math.floor(Math.random() * KI_COLORS.length)], // Willekeurige kleur
    pulse:     randomBetween(0, Math.PI * 2),   // Begin van de pulsatie
    pulseSpeed: randomBetween(0.02, 0.06),      // Snelheid van de pulsatie
});

  // Array van alle actieve deeltjes aanmaken
  let particles = Array.from({ length: PARTICLE_COUNT }, createParticle);

  // Een nieuwe bliksem lijn aanmaken
  const createBolt = () => ({
    x:       randomBetween(0, canvas.width),
    y:       randomBetween(0, canvas.height),
    len:     randomBetween(40, 120),         // Lengte van de lijn
    angle:   randomBetween(0, Math.PI * 2), // Richting (willekeurig)
    alpha:   randomBetween(0.05, 0.2),      // Maximale doorzichtigheid
    life:    0,                              // Huidige leeftijd in frames
    maxLife: randomBetween(40, 80),         // Hoe lang de lijn leeft
    color:   KI_COLORS[Math.floor(Math.random() * KI_COLORS.length)],
  }); 
}
 
// Array van alle actieve bliksem lijnen
  let bolts = Array.from({ length: BOLT_COUNT }, createBolt);

  // ANIMATIE LOOP — wordt 60x per seconde uitgevoerd
  const draw = () => {
    // Canvas volledig leegmaken voor het nieuwe frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // === LAAG 1: Zachte Ki aura gloed in de achtergrond ===
    // Hulpfunctie om een radiale gloed te tekenen
    const drawAura = (x, y, radius, color) => {
      // Maak een radiale kleurverloop van het midden naar buiten
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color + '0.06)'); // Iets zichtbaar in het midden
      grad.addColorStop(1, color + '0)');   // Volledig doorzichtig aan de rand
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Drie aura's op verschillende posities
    drawAura(canvas.width * 0.15, canvas.height * 0.5,  300, 'rgba(249,115,22,');
    drawAura(canvas.width * 0.85, canvas.height * 0.3,  250, 'rgba(251,191,36,');
    drawAura(canvas.width * 0.5,  canvas.height * 0.8,  200, 'rgba(255,140,30,');

    // === LAAG 2: Zwevende Ki deeltjes ===
    // Techniek: forEach iteratie over array
    particles.forEach((p, i) => {
      // Pulserende grootte berekenen met sinus functie
      p.pulse += p.pulseSpeed;
      const pr = p.r + Math.sin(p.pulse) * 1.5;

      // Gloed rondom het deeltje (groot, doorzichtig)
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 3);
      grad.addColorStop(0, p.color + p.alpha + ')');
      grad.addColorStop(1, p.color + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pr * 3, 0, Math.PI * 2);
      ctx.fill();

      // Kern van het deeltje (klein, meer opaque)
      ctx.fillStyle = p.color + Math.min(p.alpha * 2, 1) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
      ctx.fill();

      // Deeltje verplaatsen
      p.x     += p.vx;
      p.y     += p.vy;
      p.alpha += p.dalpha; // Langzaam vervaagen

      // Deeltje resetten als het vervaagd is of buiten het scherm
      if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
        particles[i]   = createParticle();
        particles[i].y = canvas.height + 10; // Laat het van onderaan beginnen
      }
    });

    // === LAAG 3: Energie bliksem lijnen ===
    bolts.forEach((b, i) => {
      b.life++; // Leeftijd verhogen per frame

      // Berekening van doorzichtigheid: fade in dan fade out
      const progress = b.life / b.maxLife;
      const a = progress < 0.3
        ? progress / 0.3              // Eerste 30%: fade in
        : 1 - (progress - 0.3) / 0.7; // Laatste 70%: fade out

      // Teken de bliksem lijn
      ctx.save(); // Huidige stijl bewaren
      ctx.strokeStyle = b.color + (b.alpha * a) + ')';
      ctx.lineWidth   = randomBetween(0.5, 1.5);
      ctx.shadowColor = b.color + '0.3)';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);

      // Gebroken lijn tekenen voor een bliksem effect
      // Elk segment wijkt iets af van de hoofdrichting
      let cx = b.x, cy = b.y;
      const segments = 5;
      for (let s = 0; s < segments; s++) {
        const nx = cx + Math.cos(b.angle + randomBetween(-0.5, 0.5)) * (b.len / segments);
        const ny = cy + Math.sin(b.angle + randomBetween(-0.5, 0.5)) * (b.len / segments);
        ctx.lineTo(nx, ny);
        cx = nx;
        cy = ny;
      }
      ctx.stroke();
      ctx.restore(); // Stijl herstellen

      // Bliksem resetten als zijn levensduur voorbij is
      if (b.life >= b.maxLife) {
        bolts[i] = createBolt();
      }
    });

    // Vraag de browser om de volgende animatie frame
    // Dit is een callback function die zichzelf herhaalt
    requestAnimationFrame(draw);
  };

  // Start de animatie loop
  draw();
