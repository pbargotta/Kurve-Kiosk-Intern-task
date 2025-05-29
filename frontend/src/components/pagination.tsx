import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const pageNumbers = [];

  // Logic to determine which page numbers to show
  const MAX_VISIBLE_PAGES = 3; // Max direct page numbers to show (e.g., 1 ... 4 5 6 ... 10)
  let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
  let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

  if (endPage === totalPages) {
    startPage = Math.max(1, totalPages - MAX_VISIBLE_PAGES + 1);
  }
  if (startPage === 1) {
    endPage = Math.min(totalPages, MAX_VISIBLE_PAGES);
  }


  // "First" page button
  if (startPage > 1) {
    pageNumbers.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        disabled={isLoading}
        className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        1
      </button>
    );
    if (startPage > 2) {
      pageNumbers.push(<span key="ellipsis-start" className="px-3 py-2 leading-tight text-gray-500">...</span>);
    }
  }

  // Page number buttons
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        disabled={isLoading || currentPage === i}
        className={`px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
          currentPage === i
            ? 'text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700 z-10 ring-1 ring-blue-500'
            : 'text-gray-500 bg-white'
        }`}
      >
        {i}
      </button>
    );
  }

  // "Last" page button
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbers.push(<span key="ellipsis-end" className="px-3 py-2 leading-tight text-gray-500">...</span>);
    }
    pageNumbers.push(
      <button
        key="last"
        onClick={() => onPageChange(totalPages)}
        disabled={isLoading}
        className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {totalPages}
      </button>
    );
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="inline-flex items-center -space-x-px rounded-md shadow-sm">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
          </button>
        </li>
        {pageNumbers.map((item, index) => (
          <li key={`page-item-${index}`}>{item}</li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;