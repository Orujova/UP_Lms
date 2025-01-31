import Card from '@/components/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Page() {
  return (
    <main>
      {/*News Starts*/}
      <div className="mt-20">
        <div className="flex justify-between items-center py-40 sm:p-0">
          <h1 className="text-xxl sm:text-48 font-semibold sm:mb-14">
            Xəbərlər
          </h1>
          <Link href={'/blog'} className="flex justify-end items-center gap-3">
            <span>Hamısına bax</span>
            <svg
              width="9"
              height="16"
              viewBox="0 0 9 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.317301 1.27567C0.740369 0.852607 1.4263 0.852607 1.84937 1.27567L7.8077 7.23401C8.23077 7.65708 8.23077 8.343 7.8077 8.76607L1.84937 14.7244C1.4263 15.1475 0.740369 15.1475 0.317301 14.7244C-0.105767 14.3013 -0.105767 13.6154 0.317301 13.1923L5.5096 8.00004L0.317301 2.80774C-0.105767 2.38467 -0.105767 1.69874 0.317301 1.27567Z"
                fill="#13121B"
              />
            </svg>
          </Link>
        </div>

        <div className="sm:flex gap-perCard sm:flex-wrap w-full block">
          <Card />
          <Card />
          <Card />
        </div>
      </div>
      {/*News Ends*/}

      {/*News Starts*/}
      <div className="mt-20">
        <div className="flex justify-between items-center">
          <h1 className="text-48 font-semibold mb-14">Kurslar</h1>
          <Link href="/" className="flex justify-end items-center gap-3">
            <span>Hamısına bax</span>
            <svg
              width="9"
              height="16"
              viewBox="0 0 9 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.317301 1.27567C0.740369 0.852607 1.4263 0.852607 1.84937 1.27567L7.8077 7.23401C8.23077 7.65708 8.23077 8.343 7.8077 8.76607L1.84937 14.7244C1.4263 15.1475 0.740369 15.1475 0.317301 14.7244C-0.105767 14.3013 -0.105767 13.6154 0.317301 13.1923L5.5096 8.00004L0.317301 2.80774C-0.105767 2.38467 -0.105767 1.69874 0.317301 1.27567Z"
                fill="#13121B"
              />
            </svg>
          </Link>
        </div>

        <div className="flex gap-perCard flex-wrap">
          <Card />
          <Card />
          <Card />
        </div>
      </div>
      {/*News Ends*/}

      {/*News Starts*/}
      <div className="mt-20">
        <div className="flex justify-between items-center">
          <h1 className="text-48 font-semibold mb-14">Təlimlər</h1>
          <Link href="/" className="flex justify-end items-center gap-3">
            <span>Hamısına bax</span>
            <svg
              width="9"
              height="16"
              viewBox="0 0 9 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.317301 1.27567C0.740369 0.852607 1.4263 0.852607 1.84937 1.27567L7.8077 7.23401C8.23077 7.65708 8.23077 8.343 7.8077 8.76607L1.84937 14.7244C1.4263 15.1475 0.740369 15.1475 0.317301 14.7244C-0.105767 14.3013 -0.105767 13.6154 0.317301 13.1923L5.5096 8.00004L0.317301 2.80774C-0.105767 2.38467 -0.105767 1.69874 0.317301 1.27567Z"
                fill="#13121B"
              />
            </svg>
          </Link>
        </div>

        <div className="flex gap-perCard flex-wrap">
          <Card />
          <Card />
          <Card />
        </div>
      </div>
      {/*News Ends*/}
    </main>
  );
}
