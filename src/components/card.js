import Image from "next/image";
import Link from "next/link";

export default function Card() {
  return (
    <Link
      href="/user/dashboard/blog/test"
      className="w-7 sm:w-3 bg-mainGreen2 rounded-md overflow-hidden relative"
    >
      <Image
        src={"/featured.png"}
        priority
        width={"500"}
        height={"500"}
        alt={""}
      />
      <span className="absolute top-[10px] left-[10px] p-2 px-4 rounded-full bg-[#04735D] text-white text-sm">
        #economy
      </span>
      <div className="p-4 flex flex-col items-start gap-4">
        <h1 className="text-md font-semibold">İşçilər mükafatlandırırdı!</h1>
        <div className="card-ellipsis text-xs font-medium">
          Noyabr ayı üçün Bravo şirkətinin ən yaxşı çalışanları seçildi və 1-ci
          yer qazanan işçi 200 AZN, 2-ci yer qazanan 150 AZN mükafatın Noyabr
          ayı üçün Bravo şirkətinin ən yaxşı çalışanları seçildi və 1-ci yer
          qazanan işçi 200 AZN, 2-ci yer qazanan 150 AZN mükafatın
        </div>
        <div className="w-full flex justify-between items-center text-xs font-semibold text-[#003465]">
          <span>Jan 3, 2022</span>
          <span className="flex justify-end gap-2 items-center">
            <svg
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.38402 7.82362C2.15802 4.09555 5.39363 1.44663 9.03326 1.44663C12.6718 1.44663 15.9074 4.09555 16.6825 7.82362C16.7132 7.97156 16.8012 8.1012 16.9272 8.18403C17.0532 8.26686 17.2069 8.29609 17.3544 8.2653C17.5019 8.2345 17.6311 8.14621 17.7137 8.01982C17.7963 7.89344 17.8254 7.73934 17.7947 7.5914C16.9129 3.35108 13.2245 0.308289 9.03326 0.308289C4.84206 0.308289 1.15363 3.35108 0.271811 7.5914C0.241109 7.73934 0.270254 7.89344 0.352835 8.01982C0.435415 8.14621 0.564665 8.2345 0.712153 8.2653C0.859641 8.29609 1.01328 8.26686 1.13928 8.18403C1.26528 8.1012 1.35331 7.97156 1.38402 7.82362ZM9.02191 3.72331C10.0754 3.72331 11.0857 4.14308 11.8307 4.89026C12.5756 5.63744 12.9941 6.65084 12.9941 7.70751C12.9941 8.76419 12.5756 9.77758 11.8307 10.5248C11.0857 11.2719 10.0754 11.6917 9.02191 11.6917C7.96843 11.6917 6.9581 11.2719 6.21317 10.5248C5.46825 9.77758 5.04975 8.76419 5.04975 7.70751C5.04975 6.65084 5.46825 5.63744 6.21317 4.89026C6.9581 4.14308 7.96843 3.72331 9.02191 3.72331Z"
                fill="#003465"
              />
            </svg>
            <span>211</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// Most read blog

export const MostReadCard = () => {
  return (
    <div className="p-5 shadow-20 rounded-lg">
      <h1 className="text-16 font-medium text-mainGray card-ellipsis">
        10 Habits That Will Change Your Live for the Better If envy and jealousy
        are impacting your friendships
      </h1>
      <div className="flex justify-between items-center mt-4 text-14 text-mainBlue">
        <span>January 21, 2024</span>
        <span className="flex justify-start items-center">
          <span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z"
                stroke="#121416"
                strokeOpacity="0.81"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.9998 11.9999L9.6665 13.5555M11.9998 8.11104V11.9999"
                stroke="#121416"
                strokeOpacity="0.81"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>2 minute read</span>
        </span>
      </div>
    </div>
  );
};

//Comments
export const BlogResponse = () => {
  return (
    <div>
      <div>Comments</div>
    </div>
  );
};

export const WriteResponse = () => {
  return (
    <div>
      <div>Write </div>
    </div>
  );
};
