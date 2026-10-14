import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Award,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import CountUp from '../common/CountUp.jsx';

const LOADING_MESSAGES = [
  'Formulating challenging multiple choice questions...',
  'Extracting options and answer distractors...',
  'Writing verified technical explanations...',
  'Almost ready...',
];

export default function QuizPanel({
  questions = [],
  loading = false,
  count = 5,
  onCountChange,
  onGenerate,
  disabled = false,
  documentTitle = 'this document',
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setReviewMode(false);
    setUserHistory([]);
  }, [questions]);

  // Loading message rotator
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectOption = (index) => {
    if (selectedOption !== null || reviewMode) return;
    setSelectedOption(index);

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correct_index;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserHistory((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        selected: index,
        correct: currentQ.correct_index,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(reviewMode ? userHistory[currentIndex + 1]?.selected : null);
    } else {
      setIsFinished(true);
      setReviewMode(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setReviewMode(false);
    setUserHistory([]);
  };

  const handleStartReview = () => {
    setIsFinished(false);
    setReviewMode(true);
    setCurrentIndex(0);
    setSelectedOption(userHistory[0]?.selected ?? null);
  };

  if (loading) {
    return (
      <Card variant="lilac" className="py-20 text-center max-w-xl mx-auto shadow-card">
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-white dark:bg-ink text-lilac-600 dark:text-lilac-400 flex items-center justify-center shadow-md"
          >
            <Award className="w-8 h-8" />
          </motion.div>

          <h3 className="text-xl font-extrabold text-ink dark:text-white">
            Generating Practice Quiz
          </h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium h-6"
            >
              {LOADING_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>

          <div className="w-48 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-lilac-600 rounded-full shimmer w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card variant="white" className="py-16 text-center max-w-xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300 mx-auto flex items-center justify-center shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-ink dark:text-white">
            Knowledge Check Quiz
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Generate multiple-choice practice questions with instant verification and explanations
            from <strong className="text-ink dark:text-white font-bold">"{documentTitle}"</strong>.
          </p>
        </div>

        {/* Count Selector */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Questions:</span>
          {[5, 10].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onCountChange(opt)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                count === opt
                  ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-black/10'
              }`}
            >
              {opt} Questions
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            disabled={disabled}
            onClick={() => onGenerate(count)}
          >
            Generate Quiz
          </Button>
        </div>
      </Card>
    );
  }

  // Result screen with animated SVG circular score ring
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;
    const isTopScore = percentage >= 80;

    // SVG Circular calculations (radius 54, circumference 2 * PI * 54 = ~339.29)
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg mx-auto bg-white dark:bg-ink-soft rounded-card border border-black/8 dark:border-white/10 p-8 sm:p-10 text-center shadow-card relative overflow-hidden"
      >
        {/* Lightweight CSS confetti effect if score >= 80% */}
        {isTopScore && (
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <span className="absolute top-4 left-1/4 w-2 h-2 rounded-full bg-accent-orange animate-ping" />
            <span className="absolute top-8 right-1/4 w-2.5 h-2.5 rounded-full bg-lilac-500 animate-ping [animation-delay:0.3s]" />
            <span className="absolute top-12 left-1/3 w-2 h-2 rounded-full bg-emerald-400 animate-ping [animation-delay:0.6s]" />
          </div>
        )}

        {/* SVG Circular Score Ring */}
        <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-black/5 dark:text-white/10 fill-none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className={`fill-none ${
                passed ? 'text-emerald-500' : 'text-accent-orange'
              }`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-ink dark:text-white">
              <CountUp end={percentage} suffix="%" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {score}/{questions.length} Correct
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-ink dark:text-white mb-2">
          {isTopScore
            ? 'Outstanding Performance!'
            : passed
            ? 'Great Job, You Passed!'
            : 'Keep Practicing!'}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
          {passed
            ? 'You have a solid retention of the technical principles covered in this document.'
            : 'Review the executive summary notes and try the quiz again to reinforce your recall.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            hideArrow
            icon={RotateCcw}
            onClick={handleRestart}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleStartReview}
            className="w-full sm:w-auto"
          >
            Review Answers
          </Button>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentIndex];
  const answered = selectedOption !== null;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Top Header Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-ink-soft border border-black/8 dark:border-white/10 rounded-full px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-ink dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full font-mono">
            Question {currentIndex + 1} of {questions.length}
          </span>
          {!reviewMode && (
            <span className="text-xs font-semibold text-lilac-600 dark:text-lilac-400">
              Score: {score}
            </span>
          )}
          {reviewMode && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
              Review Mode
            </span>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          hideArrow
          icon={RotateCcw}
          onClick={() => onGenerate(count)}
          className="!text-[11px] !py-1 !px-3 !h-8"
        >
          Regenerate
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-lilac-500 to-accent-orange rounded-full"
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-ink-soft border border-black/8 dark:border-white/10 rounded-card p-6 sm:p-8 shadow-card">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-ink dark:text-white leading-snug mb-6">
          {currentQ.question}
        </h3>

        {/* Options Stack */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correct_index;

            let optionStyle =
              'border-black/10 dark:border-white/10 hover:border-lilac-400 dark:hover:border-lilac-600 bg-white dark:bg-ink text-ink dark:text-white';

            if (answered) {
              if (isCorrect) {
                optionStyle =
                  'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'border-rose-500 bg-rose-50/80 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20';
              } else {
                optionStyle = 'opacity-35 border-black/5 dark:border-white/5 text-slate-400';
              }
            }

            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <motion.button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(idx)}
                animate={
                  answered && isSelected && !isCorrect
                    ? { x: [-6, 6, -4, 4, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all ${optionStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      answered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : answered && isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </div>

                {answered && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : null}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation Callout Box */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mb-6"
            >
              <div className="p-4 rounded-2xl bg-lilac-50/90 dark:bg-lilac-950/40 border border-lilac-200/80 dark:border-lilac-800/60">
                <h4 className="text-xs font-bold text-lilac-800 dark:text-lilac-200 mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explanation:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next Question Pill */}
        {answered && (
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
