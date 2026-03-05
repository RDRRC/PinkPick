import React from 'react';

// 接收店長傳來的：目前頁碼、最後一頁、以及「換頁時要呼叫的函式(對講機)」
export default function Pagination({ page, lastPage, onPageChange }) {
    return (
        <div className="mt-8 flex justify-center items-center gap-4">
            <button
                onClick={() => onPageChange(page - 1)} // 按下時，用對講機呼叫店長換到上一頁
                disabled={page === 1}
                className={`px-4 py-2 rounded border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
            >
                &larr; 上一頁
            </button>

            <span className="text-gray-700 font-medium">
                Page {page} of {lastPage}
            </span>

            <button
                onClick={() => onPageChange(page + 1)} // 按下時，用對講機呼叫店長換到下一頁
                disabled={page === lastPage}
                className={`px-4 py-2 rounded border ${page === lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
            >
                下一頁 &rarr;
            </button>
        </div>
    );
}