import React, { useState } from 'react';
import { Flashcard } from '../types';
import {
  Layers,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCw,
  Sparkles,
  BookOpen,
  Check,
  X,
} from 'lucide-react';

interface FlashcardsProps {
  cards: Flashcard[];
  onAddCard: (card: Omit<Flashcard, 'id' | 'createdAt'>) => void;
  onDeleteCard: (id: string) => void;
  onLoadSamples: () => void;
}

export default function Flashcards({
  cards,
  onAddCard,
  onDeleteCard,
  onLoadSamples,
}: FlashcardsProps) {
  // Navigation index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New Card Form state
  const [isCreating, setIsCreating] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Safe current index clamping
  const safeIndex = cards.length === 0 ? 0 : Math.min(currentIndex, cards.length - 1);
  const currentCard: Flashcard | undefined = cards[safeIndex];

  // Flip card
  const handleToggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Next card
  const handleNext = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < cards.length ? prev + 1 : 0));
  };

  // Previous card
  const handlePrevious = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : cards.length - 1));
  };

  // Delete card
  const handleDeleteCurrent = () => {
    if (!currentCard) return;
    const confirmDelete = window.confirm('Delete this flashcard?');
    if (!confirmDelete) return;

    onDeleteCard(currentCard.id);
    setIsFlipped(false);
    if (safeIndex >= cards.length - 1 && safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  // Save new card
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setFormError('Please enter a question or prompt');
      return;
    }
    if (!answer.trim()) {
      setFormError('Please enter the answer or explanation');
      return;
    }

    onAddCard({
      question: question.trim(),
      answer: answer.trim(),
    });

    setQuestion('');
    setAnswer('');
    setFormError(null);
    setIsCreating(false);
    // Jump to the newly added card (at the end)
    setCurrentIndex(cards.length);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B3631]">
            Flashcards Deck
          </h1>
          <p className="text-xs sm:text-sm text-[#2B3631]/70">
            Active retrieval practice: test yourself before revealing the answer.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating((prev) => !prev);
            setFormError(null);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] shrink-0 cursor-pointer"
        >
          {isCreating ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Create Card</span>
            </>
          )}
        </button>
      </div>

      {/* Inline Create Form Modal/Card */}
      {isCreating && (
        <div className="bg-white rounded-3xl border border-[#738970]/40 p-6 shadow-md animate-scale-up space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <h2 className="text-base font-bold text-[#2B3631] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#738970]" />
              <span>New Flashcard</span>
            </h2>
            <span className="text-xs text-[#2B3631]/60">Added to your local deck</span>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label htmlFor="card-question" className="block text-xs font-bold uppercase tracking-wider text-[#2B3631] mb-1.5">
                Question / Prompt <span className="text-red-600">*</span>
              </label>
              <textarea
                id="card-question"
                rows={2}
                placeholder="e.g. What is the powerhouse of the cell? or Define Big-O notation"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-[#E5DFD3] bg-[#FAF7F0]/40 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#738970]/30 resize-none"
              />
            </div>

            <div>
              <label htmlFor="card-answer" className="block text-xs font-bold uppercase tracking-wider text-[#2B3631] mb-1.5">
                Answer / Explanation <span className="text-red-600">*</span>
              </label>
              <textarea
                id="card-answer"
                rows={3}
                placeholder="e.g. Mitochondria produces cellular ATP through aerobic respiration."
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-[#E5DFD3] bg-[#FAF7F0]/40 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#738970]/30 resize-none"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-600 font-medium">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#2B3631]/70 hover:text-[#2B3631] hover:bg-[#FAF7F0] rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#738970] hover:bg-[#62785F] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Flashcard</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Flashcard Deck View */}
      {cards.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E5DFD3] p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-[#FAF7F0] rounded-2xl flex items-center justify-center mx-auto text-[#738970] border border-[#E5DFD3]">
            <Layers className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h2 className="text-lg font-bold text-[#2B3631]">No flashcards in your deck</h2>
            <p className="text-xs sm:text-sm text-[#2B3631]/70">
              Create flashcards with key questions and answers. Practice active retrieval to strengthen long-term memory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Card</span>
            </button>
            <button
              onClick={onLoadSamples}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#FAF7F0] hover:bg-[#EFECE5] text-[#2B3631] border border-[#E5DFD3] text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#738970]" />
              <span>Load 3 Sample Cards</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Single Card Display with 3D Flip */
        <div className="space-y-4">
          {/* Unboxed Metadata Header: Counter & Flip Hint */}
          <div className="flex items-center justify-between text-xs text-[#2B3631]/70 px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#2B3631]">
                Card {safeIndex + 1} of {cards.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isFlipped ? 'Answer Side' : 'Question Side'}</span>
            </div>

            <button
              onClick={handleDeleteCurrent}
              className="flex items-center gap-1 text-red-600/70 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="Delete this flashcard"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          {/* Interactive Card Container (3D Flip Effect) */}
          <div
            onClick={handleToggleFlip}
            className="perspective-1000 cursor-pointer min-h-[260px] sm:min-h-[280px] w-full"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleFlip();
              }
            }}
            aria-label={`Flashcard: ${isFlipped ? 'Answer' : 'Question'}. Press space or enter to flip.`}
          >
            <div
              className={`relative w-full min-h-[260px] sm:min-h-[280px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-xs border ${
                isFlipped
                  ? 'rotate-y-180 border-[#738970]/50 bg-[#F4F6F4]'
                  : 'border-[#E5DFD3] bg-white'
              }`}
            >
              {/* FRONT: QUESTION */}
              <div
                className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-between backface-hidden ${
                  isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#738970] bg-[#FAF7F0] px-2.5 py-1 rounded-lg border border-[#E5DFD3]">
                    Question
                  </span>
                  <span className="text-[11px] text-[#2B3631]/40 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Tap card to flip
                  </span>
                </div>

                <div className="py-4 my-auto">
                  <p className="text-lg sm:text-xl font-medium text-[#2B3631] leading-relaxed text-center sm:text-left">
                    {currentCard?.question}
                  </p>
                </div>

                <div className="text-center text-xs text-[#2B3631]/50 border-t border-[#E5DFD3] pt-3">
                  Click card or "Show Answer" below
                </div>
              </div>

              {/* BACK: ANSWER */}
              <div
                className={`absolute inset-0 p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 ${
                  !isFlipped ? 'pointer-events-none' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-white bg-[#738970] px-2.5 py-1 rounded-lg">
                    Answer
                  </span>
                  <span className="text-[11px] text-[#2B3631]/40 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Tap to hide
                  </span>
                </div>

                <div className="py-4 my-auto">
                  <p className="text-base sm:text-lg text-[#2B3631] leading-relaxed whitespace-pre-wrap text-center sm:text-left">
                    {currentCard?.answer}
                  </p>
                </div>

                <div className="text-center text-xs text-[#2B3631]/60 border-t border-[#738970]/20 pt-3">
                  Did you recall correctly?
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Controls (Show Answer, Previous, Next, Delete) */}
          <div className="space-y-3 pt-2">
            {/* Primary Action: Show/Hide Answer Button */}
            <button
              onClick={handleToggleFlip}
              className="w-full min-h-[48px] py-3 bg-[#738970] hover:bg-[#62785F] text-white text-sm font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isFlipped ? 'Hide Answer (Show Question)' : 'Show Answer'}</span>
            </button>

            {/* Directional Controls: Previous & Next */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrevious}
                className="min-h-[48px] py-3 bg-white hover:bg-[#FAF7F0] text-[#2B3631] border border-[#E5DFD3] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#738970]" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="min-h-[48px] py-3 bg-white hover:bg-[#FAF7F0] text-[#2B3631] border border-[#E5DFD3] text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-[#738970]" />
              </button>
            </div>
          </div>

          {/* Deck Progress Bar */}
          <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-[#E5DFD3] mt-2">
            <div
              className="bg-[#738970] h-full rounded-full transition-all duration-300"
              style={{ width: `${((safeIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
