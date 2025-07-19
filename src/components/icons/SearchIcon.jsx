import React from 'react';

// We accept `className` as a prop so we can style it from the outside
const SearchIcon = ({ className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} // Note the camelCase for stroke-width
      stroke="currentColor" 
      className={className} // Use the passed-in className
    >
      <path 
        strokeLinecap="round" // camelCase
        strokeLinejoin="round" // camelCase
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
      />
    </svg>
  );
};

export default SearchIcon;