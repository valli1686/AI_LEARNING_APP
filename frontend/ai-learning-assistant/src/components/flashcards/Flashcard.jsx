import React from "react";

const Flashcard = ({ question, answer, showAnswer, onFlip }) => {
  return (
    <div
      onClick={onFlip}
      className="bg-white rounded-xl border shadow-md p-10 min-h-[300px] flex items-center justify-center cursor-pointer"
    >
      <div className="text-center">
        <p className="text-gray-500 mb-3">
          Click card to flip
        </p>

        <h2 className="text-2xl font-semibold">
          {showAnswer ? answer : question}
        </h2>
      </div>
    </div>
  );
};

export default Flashcard;