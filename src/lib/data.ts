export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: string;
  explanation: string;
  fun_fact?: string;
  image_url: string | null;
}

export interface LearningModule {
  id: string;
  title: string;
  category?: "Fisheries & Marine" | "Sustainable Crops" | "Agri-Tech" | "Policy & Law";
  description: string;
  readTimeMinutes?: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  objectives: string[];
  contentSections: {
    heading: string;
    body: string;
    keyTakeaway?: string;
  }[];
  file_name: string;
  file_data: string | null;
}

export interface QuizHistoryRecord {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  date: string;
  user_id?: string;
}

// Curated comprehensive questions derived directly from the provided learning module:
// "Unit 1: INTRODUCTION TO FISH PHYSIOLOGY" (Samar State University College of Fisheries)
export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-physio-1",
    category: "Fisheries & Marine",
    difficulty: "Easy",
    question: "Which category of terrestrial locomotion describes fish like the ropefish or eel that produce motion entirely through body undulation?",
    choice_a: "Axial-based locomotion",
    choice_b: "Appendicular-based locomotion",
    choice_c: "Axial-appendicular locomotion",
    choice_d: "Labriform swimming",
    correct_answer: "A",
    explanation: "Axial-based locomotion produces motion entirely through body bending or undulation, seen in elongate ropefish and eels, as well as jumping in blennies and rivulus.",
    fun_fact: "Amphibious fishes rely on axial undulation when traversing damp mudbanks.",
    image_url: null,
  },
  {
    id: "q-physio-2",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "What are the two major mechanical forces experienced by fish in water versus on land during locomotion?",
    choice_a: "Viscosity and drag in water; gravity and friction on land",
    choice_b: "Gravity and friction in water; viscosity and drag on land",
    choice_c: "Atmospheric pressure and magnetism",
    choice_d: "Hydrostatic lift in both environments",
    correct_answer: "A",
    explanation: "In an aquatic environment, viscosity and drag are the dominant opposing forces, whereas on land, an animal must overcome gravity and surface friction.",
    fun_fact: "Water is approximately 800 times denser and 50 times more viscous than air.",
    image_url: null,
  },
  {
    id: "q-physio-3",
    category: "Fisheries & Marine",
    difficulty: "Easy",
    question: "The walking catfish (Clarias batrachus), which uses both fins and body movements to produce terrestrial thrust, is locally known in Samar, Philippines by what name?",
    choice_a: "Pantat",
    choice_b: "Bangus",
    choice_c: "Tilapia",
    choice_d: "Danggit",
    correct_answer: "A",
    explanation: "Clarias batrachus is an amphibious catfish exhibiting axial-appendicular locomotion, locally called 'Pantat' in Samar, Philippines.",
    fun_fact: "Walking catfish can breathe atmospheric air using a specialized suprabranchial arborescent organ above their gill cavity.",
    image_url: null,
  },
  {
    id: "q-physio-4",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "How does the barred mudskipper (Periophthalmus argentilineatus) locomote on land compared to swimming in water?",
    choice_a: "On land it keeps its body relatively straight and plants pectoral fins simultaneously ('crutching')",
    choice_b: "On land it only uses rapid tail oscillations with zero fin contact",
    choice_c: "It rolls in a circular ball down slopes",
    choice_d: "It slithers purely on its ventral belly without fin movement",
    correct_answer: "A",
    explanation: "Barred mudskippers swim by bending their body with reduced fin movement, but on land they keep their body straight and plant both pectoral fins together in a crutching motion.",
    fun_fact: "Mudskippers can spend up to 90% of their time out of water on mangrove mudflats.",
    image_url: null,
  },
  {
    id: "q-physio-5",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "What is the primary function of the counter-current gas exchange arrangement in fish gills?",
    choice_a: "Blood and water flow in opposite directions to maximize oxygen extraction from water into capillaries",
    choice_b: "Blood and water flow in the same direction to decrease heart rate",
    choice_c: "It prevents water from entering the digestive tract",
    choice_d: "It generates internal body heat for warm-blooded swimming",
    correct_answer: "A",
    explanation: "Counter-current blood and water flow ensures that blood with low oxygen continuously encounters water with higher oxygen across the entire gill lamellae, achieving up to 85% oxygen transfer efficiency.",
    fun_fact: "Gills are packed with hundreds of thousands of microscopic secondary lamellae, creating a surface area up to 10 times greater than the fish's total skin area.",
    image_url: null,
  },
  {
    id: "q-physio-6",
    category: "Fisheries & Marine",
    difficulty: "Easy",
    question: "Which protective structure covers and pumps water over the gills in modern bony fishes (teleosts)?",
    choice_a: "Operculum",
    choice_b: "Spiracle",
    choice_c: "Claspers",
    choice_d: "Lateral line",
    correct_answer: "A",
    explanation: "Bony fishes (Osteichthyes) possess a bony flap called the operculum that protects the delicate gill arches and actively pumps water across the filaments.",
    fun_fact: "Cartilaginous sharks lack an operculum and have separate open gill slits protected only by skin flaps.",
    image_url: null,
  },
  {
    id: "q-physio-7",
    category: "Fisheries & Marine",
    difficulty: "Hard",
    question: "What is the difference between a physostomous and a physoclistic swim bladder?",
    choice_a: "Physostomous retains a duct connecting to the digestive tract; physoclistic has lost this direct connection",
    choice_b: "Physostomous is only found in sharks; physoclistic is found in amphibians",
    choice_c: "Physostomous is filled with fluid; physoclistic is completely solid bone",
    choice_d: "Physostomous operates under vacuum",
    correct_answer: "A",
    explanation: "Primitive teleosts have a physostomous swim bladder connected by a pneumatic duct to the esophagus. Advanced teleosts are physoclistic, regulating buoyancy strictly via vascular gas glands (rete mirabile) and the oval organ.",
    fun_fact: "A physoclistic fish brought up rapidly from deep water may have its swim bladder expand uncontrollably due to rapid hydrostatic pressure drop.",
    image_url: null,
  },
  {
    id: "q-physio-8",
    category: "Fisheries & Marine",
    difficulty: "Hard",
    question: "In the teleost fish heart, in what sequence does deoxygenated blood flow through the four serial chambers?",
    choice_a: "Sinus venosus → Atrium → Ventricle → Bulbus arteriosus",
    choice_b: "Bulbus arteriosus → Ventricle → Atrium → Sinus venosus",
    choice_c: "Left ventricle → Right ventricle → Aorta",
    choice_d: "Atrium → Sinus venosus → Ventricle",
    correct_answer: "A",
    explanation: "Venous blood collects in the sinus venosus, moves into the atrium, is pumped forcefully by the muscular ventricle, and is dampened by the elastic bulbus arteriosus before entering the ventral aorta.",
    fun_fact: "The bulbus arteriosus expands during ventricular contraction and recoils, smoothing the pulsatile blood flow through the delicate gill capillaries.",
    image_url: null,
  },
  {
    id: "q-physio-9",
    category: "Fisheries & Marine",
    difficulty: "Hard",
    question: "Which circulatory feature is unique to fishes compared to higher terrestrial vertebrates?",
    choice_a: "Renal portal system routing venous blood from the tail/trunk through kidney capillaries",
    choice_b: "Double parallel pulmonary circulation",
    choice_c: "A four-chambered heart with two separate atria and two ventricles",
    choice_d: "Lack of red blood cells (erythrocytes)",
    correct_answer: "A",
    explanation: "Fishes possess a distinct renal portal system where venous blood draining from trunk muscles and the caudal vein passes through the kidneys before returning to the heart via the ducts of Cuvier.",
    fun_fact: "Fishes have both a hepatic portal system and a renal portal system.",
    image_url: null,
  },
  {
    id: "q-physio-10",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "Which swimming mode is characterized by high-speed cruising with narrow caudal peduncles and high-aspect-ratio lunate tails (such as in tuna)?",
    choice_a: "Thunniform locomotion",
    choice_b: "Anguilliform locomotion",
    choice_c: "Ostraciiform locomotion",
    choice_d: "Rajiform locomotion",
    correct_answer: "A",
    explanation: "Thunniform swimming confines lateral movement almost exclusively to the caudal peduncle and stiff crescent tail, producing maximum thrust with minimal drag.",
    fun_fact: "Tuna can cruise at speeds exceeding 70 km/h using thunniform locomotion.",
    image_url: null,
  },
  {
    id: "q-physio-11",
    category: "Fisheries & Marine",
    difficulty: "Easy",
    question: "What is the primary sensory function of the lateral line system in fishes?",
    choice_a: "Detecting water currents, vibrations, and pressure waves created by prey or predators",
    choice_b: "Regulating internal body temperature",
    choice_c: "Synthesizing vitamin D from sunlight",
    choice_d: "Producing digestive bile for stomach enzymes",
    correct_answer: "A",
    explanation: "The lateral line consists of fluid-filled sensory canals and neuromast hair cells that perceive micro-displacements and pressure fluctuations in the aquatic environment.",
    fun_fact: "Blind cavefish can navigate complex obstacles and catch fast-moving prey entirely using their lateral line system.",
    image_url: null,
  },
  {
    id: "q-physio-12",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "What biological phenomenon causes an increase in oxygen consumption (metabolic rate) in fishes immediately following feeding and digestion?",
    choice_a: "Specific Dynamic Action (SDA)",
    choice_b: "Torpor",
    choice_c: "Hypoxia",
    choice_d: "Counter-current stagnation",
    correct_answer: "A",
    explanation: "Specific Dynamic Action (SDA), or the heat increment of feeding, represents the energy expenditure and oxygen demand required to ingest, digest, absorb, and assimilate nutrients.",
    fun_fact: "In predatory fishes consuming large meals, SDA can triple oxygen consumption for several days.",
    image_url: null,
  },
  {
    id: "q-physio-13",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "How do freshwater fishes maintain osmotic balance when their body fluids are hyperosmotic to surrounding fresh water?",
    choice_a: "Active absorption of salts via specialized gill chloride cells and excreting copious dilute urine",
    choice_b: "Drinking copious amounts of ambient water and excreting concentrated salt pellets",
    choice_c: "Ceasing all renal urine production completely",
    choice_d: "Passively losing salt across waterproof dermal scales",
    correct_answer: "A",
    explanation: "Because freshwater fish are saltier than their environment, water passively floods in and salts are lost. To compensate, specialized chloride cells in the gills actively take up Na+ and Cl-, while the kidneys produce large volumes of dilute urine.",
    fun_fact: "Marine teleosts face the opposite challenge: they lose water and must constantly drink seawater while pumping salts out through their gills.",
    image_url: null,
  },
  {
    id: "q-physio-14",
    category: "Fisheries & Marine",
    difficulty: "Easy",
    question: "What is the primary physiological distinction between red muscle fibers and white muscle fibers in fishes?",
    choice_a: "Red muscle is highly vascularized for sustained aerobic cruising; white muscle is anaerobic for fast burst swimming",
    choice_b: "White muscle produces blood cells; red muscle stores dietary fat",
    choice_c: "Red muscle is found exclusively in cartilaginous sharks; white muscle is only in bony fishes",
    choice_d: "There is no functional distinction other than pigmentation",
    correct_answer: "A",
    explanation: "Red muscle contains abundant myoglobin and mitochondria for slow-twitch, aerobic, long-distance swimming. White muscle makes up the bulk of the fillet, functioning anaerobically for rapid burst sprints when capturing prey or escaping predators.",
    fun_fact: "Fast pelagic swimmers like tuna have thick lateral bands of deep red muscle with counter-current vascular heat exchangers.",
    image_url: null,
  },
  {
    id: "q-physio-15",
    category: "Fisheries & Marine",
    difficulty: "Medium",
    question: "Which type of scales with comb-like posterior margins (teeth) are typically found in higher spiny-rayed teleost fishes?",
    choice_a: "Ctenoid scales",
    choice_b: "Cycloid scales",
    choice_c: "Placoid scales",
    choice_d: "Ganoid scales",
    correct_answer: "A",
    explanation: "Ctenoid scales have microscopic comb-like serrations (ctenii) along their posterior margin, reducing hydrodynamic drag. Smooth circular scales are cycloid, while sharks possess placoid dermal denticles.",
    fun_fact: "Annual growth rings (circuli) on cycloid and ctenoid scales are used by fisheries biologists to determine the age of fish.",
    image_url: null,
  },
  {
    id: "q-physio-16",
    category: "Fisheries & Marine",
    difficulty: "Easy",
    question: "Which sensory receptor cells in the fish lateral line system are responsible for detecting water displacement and mechanical vibrations?",
    choice_a: "Neuromast hair cells",
    choice_b: "Rods and cones",
    choice_c: "Chloride cells",
    choice_d: "Taste buds",
    correct_answer: "A",
    explanation: "Neuromasts are the fundamental mechanoreceptive units of the lateral line, comprising kinocilia and stereocilia embedded within a gelatinous cupula that flexes when water moves.",
    fun_fact: "Neuromasts allow schooling fish to synchronize swimming movements with nearby schoolmates within milliseconds.",
    image_url: null,
  }
];

// Only learning modules that have actual content files
export const DEFAULT_LEARNING_MODULES: LearningModule[] = [
  {
    id: "94303889-3db7-4667-a2be-27ddba5c08a1",
    title: "Unit 1: INTRODUCTION TO FISH PHYSIOLOGY",
    category: "Fisheries & Marine",
    description: "Fundamental concepts of fish anatomy, physiological adaptations, respiration, swimming locomotion, and aquatic biological systems.",
    readTimeMinutes: 15,
    difficulty: "Beginner",
    objectives: [
      "Identify the external and internal anatomical systems of fishes",
      "Understand biomechanics of BCF (body-caudal) and MPF (median-paired) swimming",
      "Analyze adaptations in amphibious fishes including Samar's walking catfish (Pantat)",
      "Examine counter-current gill exchange, swim bladder buoyancy, and cardiovascular circulation"
    ],
    contentSections: [
      {
        heading: "1. Overview of Fish Physiology & Anatomical Systems",
        body: "Fish physiology covers the biological mechanisms that allow aquatic organisms to thrive, respire, regulate osmotic pressure, and navigate dynamic freshwater and marine environments. Understanding these adaptations is crucial for sustainable fisheries management and aquaculture stocking.",
        keyTakeaway: "Physiological health directly influences growth rates, stress resilience, and reproductive success in culture environments."
      },
      {
        heading: "2. Locomotion & Swimming Biomechanics",
        body: "Fish propel themselves through water using body-caudal fin (BCF) and median-paired fin (MPF) modes. In water, viscosity and drag are the primary forces, whereas amphibious species moving onto land must overcome gravity and surface friction through axial, appendicular, or combined propulsion.",
        keyTakeaway: "Locomotion efficiency determines foraging radius, predator avoidance, and dissolved oxygen consumption rates."
      },
      {
        heading: "3. Gas Exchange & Cardiovascular Circulation",
        body: "Fish exchange dissolved gases through fleshy gill filaments supported by gill arches and protected by the operculum. Counter-current blood flow ensures maximal oxygen transfer. Deoxygenated blood is pumped through a four-chamber serial heart (sinus venosus, atrium, ventricle, bulbus arteriosus) through single systemic circulation.",
        keyTakeaway: "The counter-current capillary arrangement maintains a gradient along the entire gill lamellae surface."
      }
    ],
    file_name: "physio-LP1 (1) (2).pdf",
    file_data: null
  }
];

// Helper functions for local state persistence
export const LOCAL_STORAGE_KEYS = {
  SCORES: "kaani_quiz_scores",
  QUESTIONS: "kaani_custom_questions",
  USER: "user",
  AUTH: "isAuthenticated",
  QUIZ_HISTORY: "kaani_personal_quiz_history"
};

export function getPersonalQuizHistory(): QuizHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePersonalQuizAttempt(attempt: Omit<QuizHistoryRecord, "id">): QuizHistoryRecord {
  const current = getPersonalQuizHistory();
  const record: QuizHistoryRecord = {
    ...attempt,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'attempt-' + Date.now(),
  };

  current.unshift(record);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(current.slice(0, 50)));
  } catch (err) {
    console.warn("Failed saving quiz attempt to localStorage", err);
  }

  return record;
}
