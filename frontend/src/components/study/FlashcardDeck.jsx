import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Layers,
} from 'lucide-react';
import Button from '../common/Button.jsx';

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

  useEffect(() => {
    setDeck(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (deck.length === 0) return;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
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
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Generating AI Flashcards...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed animate-pulse">
          Crafting question-and-answer study pairs from key document concepts. (10-20 seconds)
        </p>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Interactive Flashcards
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Test your recall and master technical concepts from <span className="font-semibold text-slate-700 dark:text-slate-300">"{documentTitle}"</span> with 3D flip study cards.
        </p>

        {/* Card Count Selector */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Card Count:</span>
          {[5, 10, 15].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onCountChange(opt)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                count === opt
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {opt} Cards
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Sparkles}
          disabled={disabled}
          onClick={() => onGenerate(count)}
        >
          Generate Flashcards
        </Button>
      </div>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Deck Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            Card {currentIndex + 1} of {deck.length}
          </span>
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Shuffle deck order"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Count picker for regeneration */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
            {[5, 10, 15].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onCountChange(opt)}
                className={`px-2 py-0.5 rounded-md ${
                  count === opt
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => onGenerate(count)}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="relative h-80 sm:h-96 w-full cursor-pointer select-none [perspective:1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-3xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front: Question */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-4 h-4" />
                <span>Question</span>
              </span>
              <span>Click or Space to flip</span>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reveal Answer</span>
            </div>
          </div>

          {/* Back: Answer */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-50/90 dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Answer</span>
              </span>
              <span className="text-slate-400">Click to flip back</span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-48">
              <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip back to Question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          size="md"
          icon={ChevronLeft}
          disabled={currentIndex === 0}
          onClick={handlePrev}
        >
          Previous
        </Button>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Use ← and → arrow keys to navigate
        </span>

        <Button
          variant="primary"
          size="md"
          disabled={currentIndex === deck.length - 1}
          onClick={handleNext}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
