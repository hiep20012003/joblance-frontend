import {HTMLProps} from "react";
import {usePagination} from "@/lib/hooks/usePagination";
import {ChevronRight, ChevronLeft} from 'lucide-react';

interface PaginationProps extends HTMLProps<HTMLUListElement> {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    siblingCount?: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({currentPage, totalCount, pageSize, siblingCount, onPageChange}: PaginationProps) {

    const paginationRange = usePagination({
        currentPage,
        totalCount,
        pageSize,
        siblingCount
    })

    if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
        return null;
    }

    const lastPage = paginationRange ? paginationRange[paginationRange.length - 1] : currentPage;

    const onNext = () => {
        onPageChange(currentPage + 1);
    };

    const onPrevious = () => {
        onPageChange(currentPage - 1);
    };

    return (
        <ul className={'pagination-container flex flex-row justify-center items-center gap-2'}>
            <button
                className={`
                    btn btn-soft pagination-item 
                    flex items-center justify-center text-gray-600 
                    p-0 rounded-full w-8 h-8 transition-colors
                `}
                disabled={currentPage === 1}
                onClick={currentPage === 1 ? undefined : onPrevious}
            >
                <ChevronLeft size={20}/>
            </button>
            {
                paginationRange && (
                    paginationRange.map((item, i) => {
                        if (item === '...') {
                            return (
                                <li
                                    className={'pagination-item flex items-center justify-center text-gray-600 min-w-8 h-8 px-2'}
                                    key={i}
                                >
                                    &#8230;
                                </li>
                            );
                        }

                        return (
                            <li
                                className={`pagination-item flex items-center justify-center btn btn-soft rounded-full min-w-8 h-8 px-3 transition-colors cursor-pointer ${
                                    currentPage === item
                                        ? 'bg-primary-500 text-white border-primary-500'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                key={i}
                                onClick={() => onPageChange(Number(item))}
                            >
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {item}
                                </span>
                            </li>
                        );
                    })
                )
            }

            <button
                className={`
                    btn btn-soft pagination-item 
                    flex items-center justify-center text-gray-600 
                    p-0 rounded-full w-8 h-8 transition-colors
                `}
                disabled={currentPage === lastPage}
                onClick={currentPage === lastPage ? undefined : onNext}
            >
                <ChevronRight size={20}/>
            </button>
        </ul>
    )
}