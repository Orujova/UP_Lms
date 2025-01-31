import Image from 'next/image'

//style
import './filterComponent.scss'

//image
import filter from '@/images/filter.svg'

export default function FilterComponent() {
    return (
        <div className='filterComponent'>
            <Image src={filter} alt={'filter'} />
            <p>
                Filter
            </p>
        </div>
    )
}