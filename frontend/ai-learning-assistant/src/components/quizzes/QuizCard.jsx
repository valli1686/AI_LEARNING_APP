import React from "react";

const QuizCard = ({ question, options }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">
        {question}
      </h2>

      {options.map((option, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 mb-2"
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default QuizCard;