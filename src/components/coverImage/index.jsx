import Image from 'next/image';

//style
import './coverImage.scss';

export default function CoverImage({ src, alt, onImageUpload }) {
    return (
        <div className='coverImage'>
            {/* Conditional rendering to support both imported assets and base64 or URL images */}
            {typeof src === 'string' && (src.startsWith('data:image') || src.startsWith('http')) ? (
                <img src={src} alt={alt} className='uploadedImage' />
            ) : (
                <Image src={src} alt={alt} />
            )}

            {/* Overlay upload button */}
            <div className='uploadOverlay'>
                <label htmlFor='imageUpload' className='uploadButton'>
                    Upload Image
                </label>
                <input
                    id='imageUpload'
                    type='file'
                    accept='image/*'
                    onChange={onImageUpload}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
}