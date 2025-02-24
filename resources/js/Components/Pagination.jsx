import React from 'react';
import { Link } from "@inertiajs/react";

const Pagination = ({ currentPage, lastPage, filters }) => {
  console.log(filters);
  // Function to generate the query string with filters
  const generateLink = (pageNumber) => {
    const url = new URL(window.location.href); // Get the current URL
    url.searchParams.set('page', pageNumber); // Set the page number in the query string

    // Append any other filters to the query string
    if(filters){
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          url.searchParams.set(key, filters[key]);
        }
      });
    }
   

    return url.toString(); // Return the updated URL
  };

  return (
    <div className="pagination">
      {/* Previous Page Link */}
      {currentPage <= 1 ? (
        <button className="btn btn-outline-secondary" disabled>
          Previous
        </button>
      ) : (
        <Link className="btn btn-outline-secondary" href={generateLink(currentPage - 1)} as="button">
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
            {showPage ? (
              <Link
                href={generateLink(pageNumber)}
                className={`btn btn-outline-secondary mx-1 ${currentPage === pageNumber ? 'active' : ''}`}
                as="button"
              >
                {pageNumber}
              </Link>
            ) : (
              (pageNumber === 4 || pageNumber === lastPage - 3) && (
                <span className="btn btn-outline-secondary mx-1">...</span>
              )
            )}
          </React.Fragment>
        );
      })}

      {/* Next Page Link */}
      {currentPage === lastPage ? (
        <button className="btn btn-outline-secondary" disabled>
          Next
        </button>
      ) : (
        <Link className="btn btn-outline-secondary" href={generateLink(currentPage + 1)} as="button">
          Next
        </Link>
      )}
    </div>
  );
};

export default Pagination;
