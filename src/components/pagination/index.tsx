import Image from 'next/image';


//style
import './pagination.scss'

//image
import rightArrow from '@/images/rightArrow.svg'
import leftArrow from '@/images/leftArrow.svg'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <Image src={leftArrow} alt='Left arrow' />
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <Image src={rightArrow} alt='Right arrow' />
            </button>
        </div>
    );
}
