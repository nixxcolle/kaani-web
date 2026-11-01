import { getCurrentUser } from "@/lib/auth";
import { useText } from "@/lib/translate";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Trophy, 
  Sparkles, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Timer as TimerIcon, 
  Flame, 
  Lightbulb, 
  BookOpen, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Share2,
  Sprout,
  Fish,
  Scale,
  Cpu
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_QUIZ_QUESTIONS, QuizQuestion, savePersonalQuizAttempt } from "@/lib/data";
import { triggerConfetti, playQuizSound } from "@/lib/confetti";

type QuizMode = "practice" | "timed";

const CATEGORIES = [
  { id: "all", name: "All Module Questions", icon: Sparkles, color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "Fisheries & Marine", name: "Fisheries & Marine", icon: Fish, color: "bg-sky-100 text-sky-800 border-sky-200" },
];

const Quiz = () => {
  const autoStarted = useRef(false);
  const tx = useText();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Settings & Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [quizMode, setQuizMode] = useState<QuizMode>("practice");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Quiz State
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZ_QUESTIONS);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  
  // Results & Post-Quiz
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string; is_guest?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [showExitDialog, setShowExitDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize current user name & status
  useEffect(() => {
    let mounted = true;
    const refreshUser = async () => {
      const user = await getCurrentUser();
      if (mounted) { setCurrentUser(user); setPlayerName(user?.name || "Agri Explorer"); }
    };
    refreshUser();
    window.addEventListener("auth-change", refreshUser);
    return () => { mounted = false; window.removeEventListener("auth-change", refreshUser); };
  }, []);

  // Load module knowledge recall questions pool
  const loadQuestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("id, category, difficulty, question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, image_url")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        // Merge Supabase questions with our authoritative default module questions
        const existingIds = new Set(DEFAULT_QUIZ_QUESTIONS.map((q) => q.id));
        const merged = [
          ...DEFAULT_QUIZ_QUESTIONS,
          ...data.filter((q) => !existingIds.has(q.id) && q.question && q.question.length > 10)
        ];
        setAllQuestions(merged);
      } else {
        setAllQuestions(DEFAULT_QUIZ_QUESTIONS);
      }
    } catch {
      setAllQuestions(DEFAULT_QUIZ_QUESTIONS);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleTimeExpired = () => {
    if (soundEnabled) playQuizSound('incorrect');
    setSelectedAnswer("NONE");
    const currentQ = activeQuestions[currentIndex];
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: "NONE" }));
    setShowExplanation(true);
    setStreak(0);
    toast({
      title: "Time's Up!",
      description: "Let's review the correct answer and move on.",
      variant: "destructive"
    });
  };

  // Helper to dynamically shuffle choices (A, B, C, D) while preserving correct answer matching
  const shuffleQuestionWithChoices = (q: QuizQuestion): QuizQuestion => {
    const rawChoices = [
      { text: q.choice_a, originalKey: "A" },
      { text: q.choice_b, originalKey: "B" },
      { text: q.choice_c, originalKey: "C" },
      { text: q.choice_d, originalKey: "D" },
    ];

    // Fisher-Yates choice shuffle
    const shuffled = [...rawChoices];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const letters = ["A", "B", "C", "D"];
    let newCorrect = "A";
    shuffled.forEach((item, idx) => {
      if (item.originalKey === q.correct_answer) {
        newCorrect = letters[idx];
      }
    });

    return {
      ...q,
      choice_a: shuffled[0].text,
      choice_b: shuffled[1].text,
      choice_c: shuffled[2].text,
      choice_d: shuffled[3].text,
      correct_answer: newCorrect,
    };
  };

  const handleStartQuiz = () => {
    setLoading(true);
    let filtered = [...allQuestions];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    // If filter is too strict and returns empty, use all questions
    if (filtered.length === 0) {
      filtered = [...allQuestions];
    }

    // Randomize selection of questions from the module
    const shuffledOrder = [...filtered].sort(() => 0.5 - Math.random());
    const subset = shuffledOrder.slice(0, Math.min(10, shuffledOrder.length));

    // Shuffle answer choices for each question so each quiz attempt varies
    const randomizedQuestions = subset.map(shuffleQuestionWithChoices);

    setActiveQuestions(randomizedQuestions);
    setIsQuizActive(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setUserAnswers({});
    setStreak(0);
    setMaxStreak(0);
    setScore(0);
    setCorrectCount(0);
    setIsQuizCompleted(false);
    setTimeLeft(25);
    setTimerActive(quizMode === "timed");
    setLoading(false);

    if (soundEnabled) playQuizSound('click');
  };

  const handleAnswerSelect = (option: string) => {
    if (showExplanation) return;

    setSelectedAnswer(option);
    const currentQ = activeQuestions[currentIndex];
    const isCorrect = option === currentQ.correct_answer;

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: option
    }));

    if (isCorrect) {
      if (soundEnabled) playQuizSound('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
    } else {
      if (soundEnabled) playQuizSound('incorrect');
      setStreak(0);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQ = activeQuestions[nextIdx];
      setSelectedAnswer(userAnswers[nextQ.id] || null);
      setShowExplanation(!!userAnswers[nextQ.id]);
      setTimeLeft(25);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = activeQuestions[prevIdx];
      setSelectedAnswer(userAnswers[prevQ.id] || null);
      setShowExplanation(!!userAnswers[prevQ.id]);
    }
  };

  const handleFinishQuiz = async () => {
    let correct = 0;
    activeQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) {
        correct++;
      }
    });

    const finalPercent = Math.round((correct / activeQuestions.length) * 100);
    setCorrectCount(correct);
    setScore(finalPercent);
    setIsQuizCompleted(true);

    if (soundEnabled) playQuizSound('win');
    triggerConfetti();

    // Save personal attempt in local quiz history
    savePersonalQuizAttempt({
      score: finalPercent,
      total_questions: activeQuestions.length,
      correct_answers: correct,
      date: new Date().toISOString(),
      user_id: currentUser?.id,
    });

    // Record score for personal progress in Supabase if logged in
    const isGuest = !currentUser || !!currentUser.is_guest || (currentUser.id && currentUser.id.startsWith("guest-"));
    if (!isGuest && currentUser?.id) {
      const validUserName = playerName.trim() || currentUser.name || "Learner";
      try {
        const { error } = await supabase.from('quiz_scores').insert({
          user_id: currentUser.id,
          user_name: validUserName,
          score: finalPercent,
          total_questions: activeQuestions.length,
          correct_answers: correct,
        });
        if (error) console.warn("Score saved on this device only", error);
      } catch (e) {
        console.warn("Could not save score to remote quiz_scores:", e);
      }
    }
  };

  // Start quiz triggered by query param
  useEffect(() => {
    if (searchParams.get('start') !== 'true') autoStarted.current = false;
    if (searchParams.get('start') === 'true' && !isQuizActive && !autoStarted.current) {
      autoStarted.current = true;
      handleStartQuiz();
    }
  });

  // Handle Timed Mode Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQuizActive && timerActive && quizMode === "timed" && !showExplanation && !isQuizCompleted) {
      interval = setInterval(() => {
        if (timeLeft <= 1) {
          setTimeLeft(0);
          handleTimeExpired();
        } else {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  });

  // Keyboard shortcut listener for option selection
  useEffect(() => {
    if (!isQuizActive || isQuizCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showExitDialog || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Enter' && target.closest('button, a')) return;
      if (["1", "a", "A"].includes(e.key)) handleAnswerSelect("A");
      if (["2", "b", "B"].includes(e.key)) handleAnswerSelect("B");
      if (["3", "c", "C"].includes(e.key)) handleAnswerSelect("C");
      if (["4", "d", "D"].includes(e.key)) handleAnswerSelect("D");

      if (e.key === "Enter" && showExplanation) {
        if (currentIndex < activeQuestions.length - 1) {
          handleNextQuestion();
        } else {
          handleFinishQuiz();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });


  const currentQuestion = activeQuestions[currentIndex];
  const progressPercent = activeQuestions.length > 0 ? ((currentIndex + 1) / activeQuestions.length) * 100 : 0;
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  // Grade badge generator
  const performanceGrade = useMemo(() => {
    if (score >= 90) return { title: "Master Harvester", color: "text-emerald-700 bg-emerald-100 border-emerald-300", desc: "Outstanding! You demonstrate exceptional mastery of agriculture and fisheries." };
    if (score >= 75) return { title: "Agri Champion", color: "text-blue-700 bg-blue-100 border-blue-300", desc: "Great job! You have strong understanding of sustainable practices." };
    if (score >= 50) return { title: "Growing Apprentice", color: "text-amber-700 bg-amber-100 border-amber-300", desc: "Good effort! Review the learning modules to boost your practical skills." };
    return { title: "Nurturing Seed", color: "text-slate-700 bg-slate-100 border-slate-300", desc: "Every master starts as a beginner. Take our free modules and try again!" };
  }, [score]);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    const found = CATEGORIES.find(c => c.name.toLowerCase().includes(category.toLowerCase()));
    if (found) {
      const Icon = found.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Sparkles className="h-4 w-4" />;
  };

  // ==========================================
  // VIEW 1: LANDING & QUIZ CUSTOMIZER
  // ==========================================
  if (!isQuizActive) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-section">
          <Header />

          <main className="container px-4 py-8 md:py-12">
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* Hero Banner Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated bg-white border border-emerald-100 p-8 md:p-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                {/* Top Badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-kaani-primary text-xs md:text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>{tx("Interactive Agri-Fisheries Arena")}</span>
                  </div>

                  {/* Sound Toggle */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-white/80 text-xs font-semibold text-muted-foreground hover:text-kaani-primary transition-all"
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="h-4 w-4 text-emerald-600" />
                        <span>{tx("Sound Effects On")}</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-4 w-4 text-slate-400" />
                        <span>{tx("Sound Effects Off")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Headings */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                  <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-kaani-dark tracking-tight leading-tight">{tx("Learning Module ")}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">{tx("Knowledge Quiz")}</span>
                  </h1>
                  <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{tx("Test your understanding of the concepts covered in your learning module materials, earn experience points (XP), and reinforce your mastery!")}</p>
                </div>

                {/* Live Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                    <BookOpen className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                    <div className="text-xl md:text-2xl font-bold font-heading text-kaani-dark">{tx(allQuestions.length)}{tx("+")}</div>
                    <div className="text-xs text-muted-foreground font-medium">{tx("Curated Questions")}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
                    <Lightbulb className="h-5 w-5 text-sky-600 mx-auto mb-1.5" />
                    <div className="text-xl md:text-2xl font-bold font-heading text-kaani-dark">{tx("Instant")}</div>
                    <div className="text-xs text-muted-foreground font-medium">{tx("Clear Explanations")}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                    <Flame className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
                    <div className="text-xl md:text-2xl font-bold font-heading text-kaani-dark">{tx("Combos")}</div>
                    <div className="text-xs text-muted-foreground font-medium">{tx("Streak XP Multipliers")}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 text-center">
                    <CheckCircle2 className="h-5 w-5 text-teal-600 mx-auto mb-1.5" />
                    <div className="text-xl md:text-2xl font-bold font-heading text-kaani-dark">{tx("Recall Pool")}</div>
                    <div className="text-xs text-muted-foreground font-medium">{tx("Direct Module Facts")}</div>
                  </div>
                </div>

                {/* Quiz Customizer / Filters */}
                <div className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100 mb-10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-kaani-dark mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-kaani-primary" />{tx("Customize Your Knowledge Recall Session")}</h3>

                  {/* Category Filter */}
                  <div className="space-y-2 mb-5">
                    <label className="text-xs font-semibold text-muted-foreground">{tx("Select Category")}</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                              isSelected
                                ? "bg-kaani-primary text-white shadow-sm ring-2 ring-emerald-300"
                                : "bg-white text-muted-foreground hover:bg-emerald-100/60 hover:text-kaani-dark border border-emerald-100"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{tx(cat.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty & Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">{tx("Difficulty")}</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["all", "Easy", "Medium", "Hard"].map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                              selectedDifficulty === diff
                                ? "bg-kaani-primary text-white border-kaani-primary shadow-xs"
                                : "bg-white text-muted-foreground border-emerald-100 hover:bg-emerald-50"
                            }`}
                          >
                            {tx(diff === "all" ? "All Levels" : diff)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">{tx("Recall Mode")}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setQuizMode("practice")}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                            quizMode === "practice"
                              ? "bg-kaani-primary text-white border-kaani-primary shadow-xs"
                              : "bg-white text-muted-foreground border-emerald-100 hover:bg-emerald-50"
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{tx("Self-Paced Practice")}</span>
                        </button>
                        <button
                          onClick={() => setQuizMode("timed")}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                            quizMode === "timed"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-muted-foreground border-emerald-100 hover:bg-amber-50"
                          }`}
                        >
                          <TimerIcon className="h-3.5 w-3.5" />
                          <span>{tx("Quick Recall (25s)")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={handleStartQuiz}
                    disabled={loading}
                    className="bg-kaani-primary hover:bg-kaani-dark text-white font-bold text-base px-8 py-6 rounded-2xl shadow-elevated transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5 text-emerald-200 animate-spin-slow" />
                    <span>{tx("Start Knowledge Check")}</span>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/learning")}
                    className="border-emerald-200 text-kaani-dark hover:bg-emerald-50 font-bold text-base px-6 py-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <BookOpen className="h-5 w-5 text-emerald-700" />
                    <span>{tx("Review Learning Modules")}</span>
                  </Button>
                </div>
              </div>

              {/* Agriculture Trivia of the Day Card */}
              <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-bold text-sky-950 uppercase tracking-wider">{tx("Agricultural Trivia")}</h4>
                  <p className="text-sm text-sky-900 mt-1">{tx("Did you know? Mangrove forests in the Philippines can sequester up to 4 times more carbon per hectare than terrestrial tropical rainforests, while providing nursery grounds for over 70% of municipal fish species!")}</p>
                </div>
              </div>

            </div>
          </main>

          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE QUIZ ARENA
  // ==========================================
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/70 text-kaani-dark flex flex-col justify-between">
        <Header />

        <main className="container px-4 py-6 md:py-10 flex-1 flex flex-col justify-center">
          <div className="max-w-4xl mx-auto w-full">
            
            {/* Active Quiz Card */}
            <div className="bg-white rounded-3xl shadow-elevated border border-emerald-100 p-6 md:p-10 relative overflow-hidden">
              
              {/* Exit Modal Prompt */}
              {showExitDialog && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-elevated animate-in zoom-in-95 duration-200">
                    <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">{tx("Exit Active Quiz?")}</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-6">{tx("Your current score and active streak will be lost.")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => setShowExitDialog(false)}>{tx("Keep Playing")}</Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setShowExitDialog(false);
                          setIsQuizActive(false);
                        }}
                      >{tx("Exit Quiz")}</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Header Bar */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-kaani-primary font-heading">{tx("Question ")}{tx(currentIndex + 1)}{tx(" of ")}{tx(activeQuestions.length)}
                  </span>
                  
                  {currentQuestion && (
                    <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-xs border-emerald-200 bg-emerald-50 text-emerald-800">
                      {tx(getCategoryIcon(currentQuestion.category))}
                      <span>{tx(currentQuestion.category)}</span>
                    </Badge>
                  )}
                  
                  {currentQuestion && (
                    <Badge className="text-xs" variant={currentQuestion.difficulty === 'Hard' ? 'destructive' : currentQuestion.difficulty === 'Medium' ? 'secondary' : 'default'}>
                      {tx(currentQuestion.difficulty)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Streak Flame */}
                  {streak > 1 && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold animate-bounce">
                      <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                      <span>{tx(streak)}{tx("x Streak!")}</span>
                    </div>
                  )}

                  {/* Timer (if timed mode) */}
                  {quizMode === "timed" && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      timeLeft <= 5 ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse" : "bg-slate-100 text-slate-700"
                    }`}>
                      <TimerIcon className="h-3.5 w-3.5" />
                      <span>{tx(timeLeft)}{tx("s")}</span>
                    </div>
                  )}

                  {/* Sound Toggle */}
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-kaani-primary transition-colors"
                    title={tx(soundEnabled ? "Mute sounds" : "Enable sounds")}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>

                  {/* Close / Exit Button */}
                  <button
                    onClick={() => setShowExitDialog(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title={tx("Exit quiz")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mb-8">
                <Progress value={progressPercent} className="h-2.5 bg-emerald-100/70" />
              </div>

              {/* ============================================================ */}
              {/* QUIZ COMPLETION SUMMARY */}
              {/* ============================================================ */}
              {isQuizCompleted ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  
                  {/* Victory Banner */}
                  <div className="text-center space-y-4 py-4">
                    <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-emerald-100 to-amber-100 border border-emerald-200 shadow-inner">
                      <Trophy className="h-16 w-16 text-amber-500 animate-bounce" />
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-kaani-dark">{tx("Quiz Completed!")}</h2>

                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${performanceGrade.color}`}>
                      <Award className="h-4 w-4" />
                      <span>{tx(performanceGrade.title)}</span>
                    </div>

                    <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                      {tx(performanceGrade.desc)}
                    </p>
                  </div>

                  {/* Score Highlights Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                      <div className="text-3xl font-extrabold font-heading text-emerald-800">
                        {tx(Math.round(score))}{tx("%")}</div>
                      <div className="text-xs text-emerald-700 font-semibold mt-1">{tx("Recall Accuracy")}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                      <div className="text-3xl font-extrabold font-heading text-sky-800">
                        {tx(correctCount)}{tx("/")}{tx(activeQuestions.length)}
                      </div>
                      <div className="text-xs text-sky-700 font-semibold mt-1">{tx("Correct Answers")}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                      <div className="text-2xl font-extrabold font-heading text-teal-800 truncate">
                        {tx(score >= 80 ? "Mastered" : score >= 60 ? "Reviewing" : "Re-read")}
                      </div>
                      <div className="text-xs text-teal-700 font-semibold mt-1">{tx("Recall Status")}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                      <div className="text-3xl font-extrabold font-heading text-purple-800">
                        {tx(maxStreak)}{tx("x")}</div>
                      <div className="text-xs text-purple-700 font-semibold mt-1">{tx("Best Consecutive")}</div>
                    </div>
                  </div>

                  {/* Personal Recall Progress Notification */}
                  {currentUser?.is_guest ? (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{tx("Guest Review Session")}</h4>
                          <p className="text-xs text-slate-600">{tx("Sign in to save your recall progress and keep track of reviewed modules.")}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate("/auth?mode=login")}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shrink-0 shadow-xs"
                      >{tx("Sign In to Save History")}</Button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-emerald-950">{tx("Knowledge Progress Recorded")}</h4>
                            <Badge className="bg-emerald-600 text-white text-[10px]">{tx("Saved to Profile")}</Badge>
                          </div>
                          <p className="text-xs text-emerald-800">
                            {tx(playerName.trim() || currentUser?.name)}{tx(" • Score: ")}{tx(Math.round(score))}{tx("% • Reviewed ")}{tx(activeQuestions.length)}{tx(" questions from Unit 1: Fish Physiology")}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/learning")}
                        className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl font-bold shrink-0"
                      >{tx("Review Module File")}</Button>
                    </div>
                  )}

                  {/* Review Answers Toggle */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setShowReview(!showReview)}
                      className="w-full p-4 flex items-center justify-between text-left bg-white hover:bg-slate-50 font-bold text-sm text-slate-800"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-kaani-primary" />{tx("Review All ")}{tx(activeQuestions.length)}{tx(" Questions & Explanations")}</span>
                      {showReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showReview && (
                      <div className="p-4 bg-slate-50 space-y-4 border-t border-slate-200">
                        {activeQuestions.map((q, idx) => {
                          const userAns = userAnswers[q.id];
                          const wasCorrect = userAns === q.correct_answer;
                          return (
                            <div key={q.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-slate-500">{tx("#")}{tx(idx + 1)}</span>
                                <Badge variant={wasCorrect ? "default" : "destructive"} className="text-[10px]">
                                   {tx(wasCorrect ? "Correct" : "Incorrect")}
                                </Badge>
                              </div>
                              <p className="text-sm font-semibold text-slate-900">{tx(q.question)}</p>
                              
                              <div className="text-xs space-y-1 pt-1">
                                <p className={wasCorrect ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>{tx("Your Answer: ")}{tx(userAns ? `(${userAns}) ${q[`choice_${userAns.toLowerCase()}` as keyof QuizQuestion] || "Timed out"}` : "Unanswered")}
                                </p>
                                {!wasCorrect && (
                                  <p className="text-emerald-700 font-medium">{tx("Correct Answer: (")}{tx(q.correct_answer)}{tx(") ")}{tx(q[`choice_${q.correct_answer.toLowerCase()}` as keyof QuizQuestion])}
                                  </p>
                                )}
                              </div>

                              {q.explanation && (
                                <p className="text-xs text-muted-foreground bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                                  <strong>{tx("Concept Recall:")}</strong> {tx(q.explanation)}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      className="bg-kaani-primary hover:bg-kaani-dark text-white rounded-xl flex items-center justify-center gap-2 font-bold"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{tx("Try Another Recall Attempt")}</span>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsQuizActive(false)}
                      className="border-slate-300 rounded-xl font-bold"
                    >{tx("Select Different Topic")}</Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => navigate("/learning")}
                      className="bg-emerald-100 text-emerald-950 hover:bg-emerald-200 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <BookOpen className="h-4 w-4 text-emerald-700" />{tx("Back to Learning Modules")}</Button>
                  </div>

                </div>
              ) : (
                /* ============================================================ */
                /* ACTIVE QUESTION VIEW */
                /* ============================================================ */
                currentQuestion && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    
                    {/* Question Prompt */}
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 leading-snug">
                        {tx(currentQuestion.question)}
                      </h2>
                    </div>

                    {/* Multiple Choice Options Grid (Clean 2x2 or Stacked) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["A", "B", "C", "D"].map((letter) => {
                        const answerKey = `choice_${letter.toLowerCase()}` as keyof QuizQuestion;
                        const optionText = currentQuestion[answerKey] as string;
                        const isChosen = selectedAnswer === letter;
                        const isTheCorrectOne = currentQuestion.correct_answer === letter;

                        let cardStyle = "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 hover:shadow-md cursor-pointer";
                        let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

                        if (showExplanation) {
                          if (isTheCorrectOne) {
                            cardStyle = "border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-300";
                            badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                          } else if (isChosen && !isTheCorrectOne) {
                            cardStyle = "border-rose-400 bg-rose-50/90 shadow-xs ring-2 ring-rose-200";
                            badgeStyle = "bg-rose-500 text-white border-rose-500";
                          } else {
                            cardStyle = "border-slate-100 bg-slate-50/50 opacity-60";
                          }
                        } else if (isChosen) {
                          cardStyle = "border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400";
                          badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                        }

                        return (
                          <button
                            type="button"
                            aria-pressed={isChosen}
                            disabled={showExplanation}
                            key={letter}
                            onClick={() => handleAnswerSelect(letter)}
                            className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 select-none ${cardStyle}`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${badgeStyle}`}>
                              {tx(letter)}
                            </div>
                            <div className="flex-1 text-sm md:text-base font-medium text-slate-800 leading-relaxed pt-0.5">
                              {tx(optionText)}
                            </div>
                            {showExplanation && isTheCorrectOne && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {showExplanation && isChosen && !isTheCorrectOne && (
                              <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanatory Insight Card */}
                    {showExplanation && (
                      <div className={`p-5 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        isCorrect ? "bg-emerald-50/90 border-emerald-200" : "bg-sky-50/90 border-sky-200"
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-sm mb-2">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              <span className="text-emerald-900">{tx("Correct! Well done.")}</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-rose-500" />
                              <span className="text-slate-900">{tx("The correct answer is Option ")}{tx(currentQuestion.correct_answer)}{tx(".")}</span>
                            </>
                          )}
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed">
                          {tx(currentQuestion.explanation)}
                        </p>

                        {currentQuestion.fun_fact && (
                          <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-start gap-2 text-xs text-slate-600">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span><strong>{tx("Did you know?")}</strong> {tx(currentQuestion.fun_fact)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <Button
                        variant="outline"
                        onClick={handlePreviousQuestion}
                        disabled={currentIndex === 0}
                        className="rounded-xl flex items-center gap-1.5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>{tx("Previous")}</span>
                      </Button>

                      <div className="text-xs font-semibold text-muted-foreground hidden sm:block">{tx("Press 1, 2, 3, 4 or Enter on keyboard")}</div>

                      {isLastQuestion ? (
                        <Button
                          onClick={handleFinishQuiz}
                          disabled={!showExplanation}
                          className="bg-kaani-primary hover:bg-kaani-dark text-white rounded-xl flex items-center gap-2 font-bold px-6 shadow-md"
                        >
                          <span>{tx("Complete & See Score")}</span>
                          <Trophy className="h-4 w-4 text-amber-300" />
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextQuestion}
                          disabled={!showExplanation}
                          className="bg-kaani-primary hover:bg-kaani-dark text-white rounded-xl flex items-center gap-1.5 font-bold px-6 shadow-md"
                        >
                          <span>{tx("Next")}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                  </div>
                )
              )}

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Quiz;
