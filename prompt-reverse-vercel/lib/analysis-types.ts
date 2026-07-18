export interface AnalysisResult {
  summary: string;
  camera: {
    movement: string;
    angle: string;
    framing: string;
    lens: string;
  };
  visual: {
    colorPalette: string;
    lighting: string;
    mood: string;
    atmosphere: string;
  };
  characters: Array<{
    description: string;
    clothing: string;
    action: string;
    expression: string;
  }>;
  scenes: {
    setting: string;
    environment: string;
    props: string;
  };
  aesthetics: {
    style: string;
    genre: string;
    references: string;
    tone: string;
  };
  sequence: Array<{
    shot: string;
    duration: string;
    action: string;
  }>;
  transitions: Array<{
    type: string;
    description: string;
  }>;
  simplePrompt: string;
  templatePrompt: string;
  fullPrompt: string;
}

export function emptyResult(rawText: string): AnalysisResult {
  return {
    summary: "",
    camera: { movement: "", angle: "", framing: "", lens: "" },
    visual: { colorPalette: "", lighting: "", mood: "", atmosphere: "" },
    characters: [],
    scenes: { setting: "", environment: "", props: "" },
    aesthetics: { style: "", genre: "", references: "", tone: "" },
    sequence: [],
    transitions: [],
    simplePrompt: "",
    templatePrompt: "",
    fullPrompt: rawText,
  };
}

export const SAMPLE_RESULT: AnalysisResult = {
  summary:
    "A lone figure in a weathered coat walks through a neon-drenched alley at night, rain-slicked pavement reflecting magenta and cyan signage. The camera tracks alongside at chest height, catching steam rising from a street vent as the subject pauses beneath a flickering sign. The mood is introspective neo-noir, every surface glistening with recent rain.",
  camera: {
    movement: "Slow lateral tracking shot moving left-to-right at walking pace, approximately 0.5 m/s, maintaining consistent distance from the subject.",
    angle: "Eye-level, slightly below the subject's chin to emphasize the neon-lit sky above.",
    framing: "Medium-wide shot, subject positioned left-of-frame with the alley depth stretching behind them.",
    lens: "35mm anamorphic — mild horizontal flare streaks from practical lights, natural perspective with gentle wide-angle character.",
  },
  visual: {
    colorPalette:
      "Deep magenta #C71585 and electric cyan #00BFFF dominate, with amber sodium-vapour accents #D4A24C. Skin tones rendered warm against the cool ambient. Shadows pushed to near-black with a subtle teal lift.",
    lighting:
      "Practical neon signage provides the key — magenta from the left, cyan backlight from the right. No fill, deep falloff. A single overhead street lamp adds a harsh top-down spill on wet pavement.",
    mood: "Tense and introspective — a moment of stillness within an oppressive, beautiful environment.",
    atmosphere: "Post-rain humidity, low-hanging steam from street vents, particulate haze catching the neon.",
  },
  characters: [
    {
      description:
        "Adult, late 30s, lean build, short dark hair slicked by rain, three-day stubble. Pale complexion with weathered skin.",
      clothing:
        "Long charcoal wool trench coat, damp, collar turned up. Dark fitted trousers, scuffed leather boots. No accessories except a thin silver chain visible at the neck.",
      action:
        "Walking at a measured pace, then stopping mid-stride to look up at a flickering sign. Hands buried in coat pockets. Weight shifts to the back foot.",
      expression: "Eyes narrow slightly, jaw set — searching, guarded. A flicker of recognition or unease.",
    },
  ],
  scenes: {
    setting: "Narrow urban alley at night, flanked by aging brick buildings with neon signage in an unidentifiable Asian script. A street vent emits steam mid-frame.",
    environment: "Late night, post-rain. Ambient temperature cool. Distant traffic hum. No other people visible.",
    props: "Overhead cables, a rusted fire escape, stacked crates against the right wall, a flickering sign reading in neon, pooled water reflecting the signage.",
  },
  aesthetics: {
    style: "Cinematic realism with anamorphic lens character and neo-noir colour grading.",
    genre: "Neo-noir thriller.",
    references:
      "Blade Runner 2049 colour science (Deakins), the rain-soaked alley texture of Wong Kar-wai's Fallen Angels, the lone-figure-in-the-city framing of Drive (2011).",
    tone: "Contemplative and ominous — beauty laced with threat.",
  },
  sequence: [
    { shot: "Shot 1 — Establishing track", duration: "4s", action: "Camera tracks laterally as the subject walks into frame from the left, neon reflections shimmering on wet ground." },
    { shot: "Shot 2 — Pause and look-up", duration: "3s", action: "Subject stops, looks up at the flickering sign. Steam drifts across frame. Camera holds." },
    { shot: "Shot 3 — Resume walking", duration: "3s", action: "Subject exhales visibly and resumes walking, disappearing into the alley depth as the camera slowly comes to rest." },
  ],
  transitions: [
    { type: "Match cut on motion", description: "Hard cut from the tracking shot to the pause, matched on the subject's stride — the stop feels abrupt, intentional." },
    { type: "Slow dissolve", description: "Cross dissolve from the pause to the final walking shot, lasting ~0.5s, maintaining the neon colour wash throughout." },
  ],
  simplePrompt:
    "Neon-noir alley walk — lone figure in a damp trench coat pauses beneath a flickering sign in a rain-slicked neon alley, lateral tracking shot at eye level, magenta and cyan practicals, anamorphic 35mm, tense and introspective.",
  templatePrompt:
    "Character walks through a rain-slicked neon-lit alley at night, pauses mid-stride beneath a flickering sign — lateral tracking shot at eye level, practical neon lighting, anamorphic lens flares, steam from street vents, moody and atmospheric.",
  fullPrompt:
    "A lone figure in a weathered charcoal trench coat walks through a narrow neon-drenched alley at night after rain. The camera tracks laterally at eye level, moving left-to-right at walking pace with a 35mm anamorphic lens, capturing magenta and cyan neon reflections shimmering on the wet pavement. Steam rises from a street vent as the subject pauses mid-stride beneath a flickering neon sign, looking up with a guarded, searching expression. The colour palette is deep magenta and electric cyan with amber accents, shadows pushed to near-black with a subtle teal lift. No fill light — practical neon provides the key. The mood is tense and introspective, neo-noir. After a brief pause, the subject exhales and resumes walking into the alley depth as the camera comes to a slow rest. Post-rain humidity, particulate haze catching the neon, distant traffic hum.",
};
