import Link from 'next/link'

//style
import './addButton.scss'

export default function AddButton(props) {
    return (
        <Link href={props.link} className='addButton'>
            {props.text}
        </Link>
    )
}
