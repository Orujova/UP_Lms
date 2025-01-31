import Image from 'next/image'

//style
import './uploadFileComponent.scss'

//image
import upload from '@/images/uploadCloud.svg'

export default function UploadFileComponent(props) {
    return (
        <div className='uploadFileComponent'>
            <Image src={upload} alt='upload file' />
            <div className="text">
                <p>Select a file or drag and drop here</p>
                <p>xls or xlsx, file size no more than 10MB</p>
            </div>
            <div className='button'>
                <p>Select file</p>
                <input type="file" accept={props.accept} />
            </div>
        </div>
    )
}
