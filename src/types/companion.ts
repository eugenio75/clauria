export interface Companion {
  id: "clauria" | "luce" | "marco" | "sofia" | "leo";
  name: string;
  tagline: string;
  taglineEn: string;
  emoji: string;
  color: string;
  bgGradient: string;
  personality: string;
  personalityEn: string;
  isPremium: boolean;
}

export const COMPANIONS: Companion[] = [
  {
    id: "clauria",
    name: "Clauria",
    tagline: "Ascolto profondo",
    taglineEn: "Deep listening",
    emoji: "✦",
    color: "hsl(215,55%,45%)",
    bgGradient: "from-blue-50 to-slate-50",
    personality: "Presenza saggia e calda. Ti ascolta senza giudicare.",
    personalityEn: "Wise and warm presence. Listens without judgment.",
    isPremium: false,
  },
  {
    id: "luce",
    name: "Luce",
    tagline: "Gioia e gratitudine",
    taglineEn: "Joy and gratitude",
    emoji: "☀",
    color: "hsl(43,80%,55%)",
    bgGradient: "from-amber-50 to-yellow-50",
    personality: "Energia solare. Celebra i tuoi progressi e trova il bello.",
    personalityEn: "Solar energy. Celebrates your progress and finds the beauty.",
    isPremium: false,
  },
  {
    id: "marco",
    name: "Marco",
    tagline: "Chiarezza e azione",
    taglineEn: "Clarity and action",
    emoji: "◆",
    color: "hsl(160,35%,42%)",
    bgGradient: "from-emerald-50 to-teal-50",
    personality: "Diretto e pratico. Ti aiuta a prendere decisioni.",
    personalityEn: "Direct and practical. Helps you make decisions.",
    isPremium: true,
  },
  {
    id: "sofia",
    name: "Sofia",
    tagline: "Pace interiore",
    taglineEn: "Inner peace",
    emoji: "◯",
    color: "hsl(265,35%,60%)",
    bgGradient: "from-purple-50 to-violet-50",
    personality: "Spiritualità e silenzio. Guide di meditazione e riflessione.",
    personalityEn: "Spirituality and silence. Meditation and reflection guides.",
    isPremium: true,
  },
  {
    id: "leo",
    name: "Leo",
    tagline: "Leggerezza e ironia",
    taglineEn: "Lightness and humor",
    emoji: "★",
    color: "hsl(15,70%,55%)",
    bgGradient: "from-orange-50 to-red-50",
    personality: "Umorismo sano e leggerezza. Quando hai bisogno di ridere.",
    personalityEn: "Healthy humor and lightness. When you need to laugh.",
    isPremium: true,
  },
];
