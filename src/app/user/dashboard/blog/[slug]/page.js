'use client';

import Card, { MostReadCard, BlogResponse } from '@/components/card';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Page({ params }) {
  //Comments load state
  const [comments, setComments] = useState(false);

  return (
    <main className="py-10">
      <div className="">
        <Image
          src={'/blog.png'}
          width="1000"
          height="1000"
          alt=""
          className="w-full h-[400px]"
        />
      </div>

      <div className="flex justify-between gap-10">
        <div className="max-w-[65%]">
          <h1 className="text-34 text-[#3A3E3D] font-[500] py-10">
            Relationship tips couples therapists are giving all the time
          </h1>
          <div className="flex items-center text-[#3A3E3D] gap-3 font-[500]">
            <span className="text-22">Aydan Najafova</span>
            <span>
              <svg
                width="20"
                height="2"
                viewBox="0 0 20 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y="0.5" width="20" height="1" fill="#3A3E3D" />
              </svg>
            </span>
            <span className="flex items-center gap-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z"
                  stroke="#3A3E3D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.9998 11.9999L9.6665 13.5555M11.9998 8.11102V11.9999"
                  stroke="#3A3E3D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              7 minute read
            </span>
            <span>
              <svg
                width="20"
                height="2"
                viewBox="0 0 20 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y="0.5" width="20" height="1" fill="#3A3E3D" />
              </svg>
            </span>
            <span className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.4 12H0V3.6H2.4V12ZM7.2 12H4.8V0H7.2V6V12ZM12 12H9.6V7.2H12V12Z"
                  fill="#3A3E3D"
                />
              </svg>
              2 gün əvvəl
            </span>
          </div>

          <div className="separator w-full h-[2px] my-3 bg-[#BCBEC0]"></div>

          <div className="flex justify-between items-start svg-24">
            <div className="flex justify-start items-center gap-10">
              <span className="flex items-end gap-2 text-16 font-medium">
                <span>100</span>
                <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 11L11 2C11.7956 2 12.5587 2.31607 13.1213 2.87868C13.6839 3.44129 14 4.20435 14 5V9H19.66C19.9499 8.99672 20.2371 9.0565 20.5016 9.17522C20.7661 9.29393 21.0016 9.46873 21.1919 9.68751C21.3821 9.90629 21.5225 10.1638 21.6033 10.4423C21.6842 10.7207 21.7035 11.0134 21.66 11.3L20.28 20.3C20.2077 20.7769 19.9654 21.2116 19.5979 21.524C19.2304 21.8364 18.7623 22.0055 18.28 22H7M7 11V22M7 11H4C3.46957 11 2.96086 11.2107 2.58579 11.5858C2.21071 11.9609 2 12.4696 2 13V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H7"
                      stroke="#003465"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>

              <span
                onClick={() => {
                  setComments(!comments);
                }}
                className="flex items-center gap-2 text-16 font-medium"
              >
                <span>67</span>
                <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z"
                      stroke="#003465"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </div>

            <div className="flex justify-end items-start gap-5">
              <span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.75 7.75H15.25C14.9848 7.75 14.7304 7.64464 14.5429 7.45711C14.3554 7.26957 14.25 7.01522 14.25 6.75V2.25M19.75 7.75V20.75C19.75 21.0152 19.6446 21.2696 19.4571 21.4571C19.2696 21.6446 19.0152 21.75 18.75 21.75H5.25C4.98478 21.75 4.73043 21.6446 4.54289 21.4571C4.35536 21.2696 4.25 21.0152 4.25 20.75V3.25C4.25 2.98478 4.35536 2.73043 4.54289 2.54289C4.73043 2.35536 4.98478 2.25 5.25 2.25H14.25M19.75 7.75L14.25 2.25"
                    stroke="#003465"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.2157 12.2675H14.9697V16.75M14.9697 14.5085H16.4352M6.78517 16.7415V12.2585H8.29367C8.69269 12.2584 9.07541 12.4167 9.35766 12.6988C9.6399 12.9809 9.79854 13.3635 9.79867 13.7625C9.7988 14.1615 9.64042 14.5442 9.35836 14.8265C9.07631 15.1087 8.69369 15.2674 8.29467 15.2675H6.78467M10.8772 16.75V12.25H11.6402C12.2369 12.25 12.8092 12.4871 13.2312 12.909C13.6531 13.331 13.8902 13.9033 13.8902 14.5C13.8902 15.0967 13.6531 15.669 13.2312 16.091C12.8092 16.5129 12.2369 16.75 11.6402 16.75H10.8772Z"
                    stroke="#003465"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.7998 6.60001C22.7998 8.03218 22.2309 9.40569 21.2182 10.4184C20.2055 11.4311 18.832 12 17.3998 12C15.9676 12 14.5941 11.4311 13.5814 10.4184C12.5687 9.40569 11.9998 8.03218 11.9998 6.60001C11.9998 5.16784 12.5687 3.79433 13.5814 2.78164C14.5941 1.76894 15.9676 1.20001 17.3998 1.20001C18.832 1.20001 20.2055 1.76894 21.2182 2.78164C22.2309 3.79433 22.7998 5.16784 22.7998 6.60001ZM17.9998 4.20001C17.9998 4.04088 17.9366 3.88827 17.8241 3.77575C17.7115 3.66323 17.5589 3.60001 17.3998 3.60001C17.2407 3.60001 17.0881 3.66323 16.9755 3.77575C16.863 3.88827 16.7998 4.04088 16.7998 4.20001V6.00001H14.9998C14.8407 6.00001 14.6881 6.06323 14.5755 6.17575C14.463 6.28827 14.3998 6.44088 14.3998 6.60001C14.3998 6.75914 14.463 6.91175 14.5755 7.02428C14.6881 7.1368 14.8407 7.20001 14.9998 7.20001H16.7998V9.00001C16.7998 9.15914 16.863 9.31175 16.9755 9.42428C17.0881 9.5368 17.2407 9.60001 17.3998 9.60001C17.5589 9.60001 17.7115 9.5368 17.8241 9.42428C17.9366 9.31175 17.9998 9.15914 17.9998 9.00001V7.20001H19.7998C19.9589 7.20001 20.1115 7.1368 20.2241 7.02428C20.3366 6.91175 20.3998 6.75914 20.3998 6.60001C20.3998 6.44088 20.3366 6.28827 20.2241 6.17575C20.1115 6.06323 19.9589 6.00001 19.7998 6.00001H17.9998V4.20001ZM17.9998 19.8216V13.1736C18.4058 13.1369 18.8075 13.0626 19.1998 12.9516V21C19.1997 21.1106 19.169 21.2191 19.1112 21.3134C19.0533 21.4076 18.9705 21.4841 18.8719 21.5343C18.7733 21.5844 18.6628 21.6064 18.5525 21.5976C18.4422 21.5889 18.3365 21.5499 18.247 21.4848L11.9998 16.9416L5.7526 21.4848C5.66313 21.5499 5.55741 21.5889 5.44713 21.5976C5.33685 21.6064 5.22631 21.5844 5.12771 21.5343C5.02912 21.4841 4.94631 21.4076 4.88844 21.3134C4.83058 21.2191 4.7999 21.1106 4.7998 21V5.40001C4.7998 4.60436 5.11588 3.8413 5.67848 3.27869C6.24109 2.71608 7.00416 2.40001 7.7998 2.40001H12.3082C12.0026 2.77017 11.7382 3.17255 11.5198 3.60001H7.7998C7.32242 3.60001 6.86458 3.78965 6.52701 4.12722C6.18945 4.46479 5.9998 4.92262 5.9998 5.40001V19.8216L11.647 15.7152C11.7495 15.6407 11.873 15.6005 11.9998 15.6005C12.1266 15.6005 12.2501 15.6407 12.3526 15.7152L17.9998 19.8216Z"
                    fill="#003465"
                  />
                </svg>
              </span>
              <span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.9635 3.26764C22.06 2.92025 21.9621 2.54782 21.7071 2.29289C21.4522 2.03795 21.0798 1.93998 20.7324 2.03648L2.73239 7.03647C2.36334 7.13899 2.08526 7.4433 2.01635 7.82007C1.94744 8.19685 2.09979 8.57989 2.40867 8.80639L8.96866 13.6171L8.29282 14.2929C7.90229 14.6834 7.90229 15.3166 8.29282 15.7071C8.68334 16.0976 9.31651 16.0976 9.70703 15.7071L10.3829 15.0313L15.1936 21.5914C15.4201 21.9002 15.8032 22.0526 16.1799 21.9837C16.5567 21.9148 16.861 21.6367 16.9635 21.2676L21.9635 3.26764ZM15.588 18.7471L11.8138 13.6005L19.0191 6.39518L15.588 18.7471ZM10.3996 12.1862L17.6048 4.98096L5.25293 8.41205L10.3996 12.1862Z"
                    fill="#003465"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Rendered content */}
          <div className="py-10 font-medium">
            Structured gripped tape invisible moulded cups for sauppor firm hold
            strong powermesh front liner sport detail. Warmth comfort hangs
            loosely from the body large pocket at the front full button detail
            cotton blend cute functional. Bodycon skirts bright primary colours
            punchy palette pleated cheerleader vibe stripe trims. Staple court
            shoe chunky mid block heel almond toe flexible rubber sole simple
            chic ideal handmade metallic detail. Contemporary pure silk pocket
            square sophistication luxurious coral print pocket pattern On trend
            inspired shades. Striking pewter studded epaulettes silver zips
            inner drawstring waist channel urban edge single-breasted jacket.
            Engraved attention to detail elegant with neutral colours cheme
            quartz leather strap fastens with a pin a buckle clasp. Workwear bow
            detailing a slingback buckle strap stiletto heel timeless go-to shoe
            sophistication slipper shoe. Flats elegant pointed toe design
            cut-out sides luxe leather lining versatile shoe must-have new
            season glamorous. Structured gripped tape invisible moulded cups for
            sauppor firm hold strong powermesh front liner sport detail. Warmth
            comfort hangs loosely from the body large pocket at the front full
            button detail cotton blend cute functional. Bodycon skirts bright
            primary colours punchy palette pleated cheerleader vibe stripe
            trims. Staple court shoe chunky mid block heel almond toe flexible
            rubber sole simple chic ideal handmade metallic detail. Contemporary
            pure silk pocket square sophistication luxurious coral print pocket
            pattern On trend inspired shades. Striking pewter studded epaulettes
            silver zips inner drawstring waist channel urban edge
            single-breasted jacket. Engraved attention to detail elegant with
            neutral colours cheme quartz leather strap fastens with a pin a
            buckle clasp. Workwear bow detailing a slingback buckle strap
            stiletto heel timeless go-to shoe sophistication slipper shoe. Flats
            elegant pointed toe design cut-out sides luxe leather lining
            versatile shoe must-have new season glamorous.
          </div>
        </div>

        {/* Most read */}
        <div className="max-w-[35%] w-fully mt-[300px]">
          <div>
            <h1 className="text-mainBlue2 text-24 font-semibold mb-10">
              Ən çox oxunanlar
            </h1>
            <div className="flex flex-col gap-5">
              <MostReadCard />
              <MostReadCard />
              <MostReadCard />
              <MostReadCard />
            </div>
          </div>
        </div>
      </div>

      {/* Releated */}
      <div>
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
      </div>

      {/* Comments */}
      <div className="fixed top-0 right-0 bg-white w-fully h-fully max-w-[380px] z-[9999] shadow-xl">
        <div className="py-10 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-mainBlue font-bold uppercase">
              Responses <span>(53)</span>
            </h1>
            <span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
                  fill="black"
                />
              </svg>
            </span>
          </div>

          <input
            type="text"
            placeholder="Fikirləriniz?"
            className="text-14 font-medium roundes-sm p-3 border-2 shadow-xl my-5"
          />

          <div>
            <BlogResponse />
          </div>
        </div>
      </div>
    </main>
  );
}

export const MostRead = () => {
  return (
    <div>
      <div></div>
    </div>
  );
};
