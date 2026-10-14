import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import Button from '../common/Button.jsx';
import IconButton from '../common/IconButton.jsx';
import Card from '../common/Card.jsx';

const LOADING_MESSAGES = [
  'Extracting key question-answer pairs...',
  'Formatting active recall prompts...',
  'Organizing memory retention deck...',
  'Almost ready...',
];

export default function FlashcardDeck({
  flashcards = [],
  loading = false,
  count = 10,
  onCountChange,
  onGenerate,
  disabled = false,
  documentTitle = 'this document',
}) {
  const [deck, setDeck] = useState(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    setDeck(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  // Loading message rotator
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (deck.length === 0) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < deck.length - 1) {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, currentIndex]);

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
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
            <Layers className="w-8 h-8" />
          </motion.div>

          <h3 className="text-xl font-extrabold text-ink dark:text-white">
            Generating 3D Flashcards
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

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card variant="white" className="py-16 text-center max-w-xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300 mx-auto flex items-center justify-center shadow-sm">
          <Layers className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-ink dark:text-white">
            Interactive 3D Study Flashcards
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Test active recall of definitions, theorems, and concepts from{' '}
            <strong className="text-ink dark:text-white font-bold">"{documentTitle}"</strong>.
          </p>
        </div>

        {/* Count Selector Pill Toggles */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Deck Size:</span>
          {[5, 10, 15].map((opt) => (
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
              {opt} Cards
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
            Generate Flashcards
          </Button>
        </div>
      </Card>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Deck Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-ink-soft border border-black/8 dark:border-white/10 rounded-full px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-ink dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full font-mono">
            {currentIndex + 1} / {deck.length}
          </span>

          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white transition-colors"
            title="Shuffle deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Deck count toggle */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full text-[11px] font-bold">
            {[5, 10, 15].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onCountChange(opt)}
                className={`px-2.5 py-0.5 rounded-full transition-colors ${
                  count === opt
                    ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-2xs'
                    : 'text-slate-500 hover:text-ink'
                }`}
              >
                {opt}
              </button>
            ))}
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
      </div>

      {/* Progress Bar with Thin Accent */}
      <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-lilac-500 to-accent-orange rounded-full"
        />
      </div>

      {/* Real 3D Flip Card Container */}
      <div
        className="relative h-80 sm:h-96 w-full cursor-pointer select-none [perspective:1200px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full [transform-style:preserve-3d] rounded-card"
        >
          {/* Front Side: Lilac Gradient Card (Question) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-lilac-100 via-white to-lilac-200/70 dark:from-ink-soft dark:to-lilac-950/40 border-2 border-lilac-300 dark:border-white/10 rounded-card p-6 sm:p-8 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5 text-lilac-700 dark:text-lilac-300">
                <HelpCircle className="w-4 h-4" />
                <span>Question</span>
              </span>
              <span>Tap or Space to flip</span>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-ink dark:text-white leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to reveal answer</span>
            </div>
          </div>

          {/* Back Side: Ink Dark Card (Answer) */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-ink dark:bg-[#121217] text-white border-2 border-lilac-500/50 dark:border-white/20 rounded-card p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Answer</span>
              </span>
              <span className="text-slate-400">Tap to flip back</span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-52">
              <p className="text-base sm:text-lg font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-lilac-300 font-semibold">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip to question</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        <IconButton
          icon={ChevronLeft}
          variant="white"
          size="md"
          aria-label="Previous flashcard"
          disabled={currentIndex === 0}
          onClick={handlePrev}
        />

        <span className="text-xs text-slate-400 hidden sm:inline font-medium">
          Use ← and → arrow keys to flip cards
        </span>

        <IconButton
          icon={ChevronRight}
          variant="orange"
          size="md"
          aria-label="Next flashcard"
          disabled={currentIndex === deck.length - 1}
          onClick={handleNext}
        />
      </div>
    </div>
  );
}
