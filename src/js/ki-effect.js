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

  