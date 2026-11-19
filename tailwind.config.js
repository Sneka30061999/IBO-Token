/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate:   { 300: "#dde2ea", 400: "#c3cad6", 500: "#a3adbd" },
        rose:    { 200: "#c8f7ea", 300: "#9deccc", 400: "#5dd9a8", 500: "#2EE5A8" },
        navy:    { 950: "#020504", 900: "#020504", 800: "#020504", 700: "#020504" },
        teal:    { deep: "#020504" },
        cyan:    { brand: "#2EE5A8" },
        magenta: "#2EE5A8",
        gold:    { brand: "#f5c451" },
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
        grotesk: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(46,229,168,0.45)",
        rose: "0 0 40px -8px rgba(232,63,201,0.4)",
      },
      keyframes: {
        /* existing */
        float: {
          "0%,100%": { transform: "translateY(0) rotateY(0deg)" },
          "50%":      { transform: "translateY(-14px) rotateY(12deg)" },
        },
        shimmer:    { "100%": { transform: "translateX(100%)" } },
        marquee:    { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cardReveal: {
          "0%":   { opacity: "0", transform: "translateY(32px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        borderGlow: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 20px -4px rgba(46,229,168,0.3)" },
          "50%":      { boxShadow: "0 0 40px -4px rgba(46,229,168,0.7), 0 0 60px -8px rgba(46,229,168,0.4)" },
        },
        pulseRing: {
          "0%":   { opacity: "0.6", transform: "scale(1)" },
          "70%":  { opacity: "0",   transform: "scale(1.6)" },
          "100%": { opacity: "0",   transform: "scale(1.6)" },
        },
        /* ── IBO coin slide ── */
        rise: {
          "0%":   { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        orbit: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        orbitSlow: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        coinIn: {
          "0%":   { opacity: "0", transform: "scale(0.6) translateY(30px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        /* Continuous Y-axis coin rotation */
        coinSpin: {
          "0%":   { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        /* Specular highlight that sweeps across during spin */
        coinShine: {
          "0%,100%": { opacity: "0.35", transform: "translateX(-10%)" },
          "25%":     { opacity: "0.6",  transform: "translateX(10%)"  },
          "50%":     { opacity: "0.1",  transform: "translateX(30%)"  },
          "75%":     { opacity: "0.0",  transform: "translateX(-20%)" },
        },
        flip: {
          "0%,39%":  { transform: "rotateY(0deg)" },
          "50%,89%": { transform: "rotateY(180deg)" },
          "100%":    { transform: "rotateY(0deg)" },
        },
        hover: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        ringOut: {
          "0%":   { opacity: "0.9", transform: "scale(1)" },
          "80%":  { opacity: "0",   transform: "scale(1.9)" },
          "100%": { opacity: "0",   transform: "scale(1.9)" },
        },
        shadowPulse: {
          "0%,100%": { opacity: "0.55", transform: "scaleX(1)" },
          "50%":     { opacity: "0.25", transform: "scaleX(0.65)" },
        },
        sparkUp: {
          "0%":   { opacity: "0", transform: "translateY(0) scale(0.5)" },
          "30%":  { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-28px) scale(1.3)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        float:        "float 6s ease-in-out infinite",
        fadeUp:       "fadeUp .6s ease-out both",
        marquee:      "marquee 32s linear infinite",
        cardReveal:   "cardReveal 0.6s cubic-bezier(0.16,1,0.3,1) both",
        borderGlow:   "borderGlow 3s ease infinite",
        pulseGlow:    "pulseGlow 2.5s ease-in-out infinite",
        pulseRing:    "pulseRing 2.4s cubic-bezier(0.215,0.61,0.355,1) infinite",
        /* coin slide */
        rise:         "rise 0.7s cubic-bezier(0.22,1,0.36,1) both",
        orbit:        "orbit 7s linear infinite",
        orbitSlow:    "orbitSlow 11s linear infinite",
        coinIn:       "coinIn 0.9s cubic-bezier(0.22,1,0.36,1) both",
        coinSpin:     "coinSpin 3.6s linear infinite",
        coinShine:    "coinShine 3.6s linear infinite",
        flip:         "flip 6s ease-in-out infinite",
        hover:        "hover 3.5s ease-in-out infinite",
        ringOut:      "ringOut 2.4s ease-out infinite",
        shadowPulse:  "shadowPulse 3.5s ease-in-out infinite",
        sparkUp:      "sparkUp 2.8s ease-in-out infinite",
        fadeIn:       "fadeIn 0.6s ease both",
      },
    },
  },
  plugins: [],
};
