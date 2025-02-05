import React from 'react';
import { Link } from "@inertiajs/react";

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  
  return (
    <div className="pagination">
      {/* Previous Page Link */}
    
      {currentPage <= 1 ? (
        <button
            className="btn btn-outline-secondary"
            disabled
        >
            Previous
        </button>
        ) : (
        <Link
            className="btn btn-outline-secondary"
            href={`?page=${currentPage - 1}`}
        >
            Previous
        </Link>
        )}

      {/* Page Numbers Links */}
      {[...Array(lastPage)].map((_, index) => {
        const pageNumber = index + 1; // +1 because index starts at 0

        // Define the range for page numbers (show pages around the current page)
        const showPage =
          pageNumber <= 3 ||
          pageNumber > lastPage - 3 ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

        return (
          <React.Fragment key={pageNumber}>
            {/* Only show the page number or ellipsis if necessary */}
            {showPage ? (
              <Link
                href={`?page=${pageNumber}`}
                className={`btn btn-outline-secondary mx-1 ${
                  currentPage === pageNumber ? 'active' : ''
                }`}
               
              >
                {pageNumber}
              </Link>
            ) : (
              // Show ellipsis if we are skipping pages
              (pageNumber === 4 || pageNumber === lastPage - 3) && (
                <span className="btn btn-outline-secondary mx-1">...</span>
              )
            )}
          </React.Fragment>
        );
      })}

      {/* Next Page Link */}
      {currentPage === lastPage ? (
        <button
            className="btn btn-outline-secondary"
            disabled
        >
            Next
        </button>
        ) : (
        <Link
            className="btn btn-outline-secondary"
            href={`?page=${currentPage + 1}`}
        >
            Next
        </Link>
        )}
    </div>
  );
};

export default Pagination;
