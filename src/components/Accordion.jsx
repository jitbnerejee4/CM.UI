import React, { useState } from 'react';
import AllCases from './AllCases';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full border border-gray-200 rounded-md mb-2 overflow-hidden">
      <button
        className="w-full bg-[#135B79] px-4 py-3 text-left font-medium text-white flex justify-between items-center hover:bg-[#0e4559] transition-colors"
        onClick={toggleAccordion}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="accordion-content w-full">
          {children}
        </div>
      )}
    </div>
  );
};

const AccordionWithAllCases = () => {
  return (
    <div className="w-full mx-auto p-4">
      <Accordion title="All Cases">
        <AllCases />
      </Accordion>
    </div>
  );
};

export default AccordionWithAllCases;