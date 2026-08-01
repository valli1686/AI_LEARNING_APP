import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <svg
        className="animate-spin h-6 w-6 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        ></circle>

        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4zm2 5.291A7.962 7.962 0 014 12H0c0 3.866 2.149 7.228 5.291 9.291z"
        ></path>
      </svg>
    </div>
  );
};

export default Spinner;