import React from 'react';
import { Button } from '../ui/Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
}) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();
    const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1;
    const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0);

    return (
        <nav className="flex items-center justify-between border-t border-[var(--color-neutral-200)] bg-white dark:bg-neutral-900 dark:border-neutral-700 px-4 py-3 sm:px-6" aria-label="Pagination">
            {totalItems && itemsPerPage && (
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">{startItem}</span> to{' '}
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{endItem}</span> of{' '}
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{totalItems}</span> results
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-1 justify-between sm:justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                >
                    Previous
                </Button>

                <div className="hidden sm:flex gap-1" role="list">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400"
                                    aria-hidden="true"
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                aria-label={`Go to page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Go to next page"
                >
                    Next
                </Button>
            </div>
        </nav>

    );
};
