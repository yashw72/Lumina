import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  Loader2,
  ArrowRight,
  Award,
} from 'lucide-react';
import Button from '../common/Button.jsx';

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
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setUserAnswers([]);
  }, [questions]);

  const handleSelectOption = (index) => {
    if (selectedOption !== null) return; // Prevent changing after selection
    setSelectedOption(index);

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correct_index;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionIndex: currentIndex,
        selectedOption: index,
        correctIndex: currentQ.correct_index,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
    setUserAnswers([]);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Generating AI Practice Quiz...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed animate-pulse">
          Synthesizing multiple-choice questions with verified explanations from your document.
          (10-20 seconds)
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Knowledge Check Quiz
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Test your comprehension of <span className="font-semibold text-slate-700 dark:text-slate-300">"{documentTitle}"</span> with instant feedback and in-depth explanations.
        </p>

        {/* Question Count Selector */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Questions:</span>
          {[5, 10].map((opt) => (
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
              {opt} Questions
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
          Generate Quiz
        </Button>
      </div>
    );
  }

  // Result screen when quiz is completed
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center shadow-xs animate-in zoom-in-95 duration-200">
        <div
          className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-5 ${
            passed
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Trophy className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Quiz Completed!
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {passed
            ? 'Outstanding performance! You have a solid grasp of these core concepts.'
            : 'Good effort! Review the document summary and try again to reinforce your understanding.'}
        </p>

        {/* Score Badge */}
        <div className="inline-flex items-baseline gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-8">
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {score}
          </span>
          <span className="text-base text-slate-400">/ {questions.length} Correct</span>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-2">
            ({percentage}%)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RotateCcw}
            onClick={handleRestartQuiz}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => onGenerate(count)}
            className="w-full sm:w-auto"
          >
            Generate New Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answered = selectedOption !== null;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Score: {score}
          </span>
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

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug mb-6">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correct_index;

            let optionStyle =
              'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

            if (answered) {
              if (isCorrect) {
                optionStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrect) {
                optionStyle =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20';
              } else {
                optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-500';
              }
            }

            const optionLetters = ['A', 'B', 'C', 'D'];

            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-sm font-medium transition-all ${optionStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      answered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : answered && isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {answered && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <span>Explanation:</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Footer Button */}
        {answered && (
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={handleNextQuestion}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
