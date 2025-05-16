import { useEffect } from 'react';
import Link from 'next/link';

//style
import './successComponent.scss';

export default function SuccessComponent(props) {
    useEffect(() => {
        document.body.classList.add('no-scroll');

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="successComponent">
            <div>
                <div className="text">
                    <p className="response">Success</p>
                    <p>Changes saved successfully!</p>
                </div>

                <Link href={props.link}>{props.title}</Link>
            </div>
        </div>
    );
}
