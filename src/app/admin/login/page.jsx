"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/features/authSlice";

import "./login.scss";
import logo from "@/images/logo.png";

export default function Page() {
  const [inputType, setInputType] = useState("password");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  async function submitCredential(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await dispatch(loginUser(formData)).unwrap();
      if (response.isSuccess) {
        localStorage.setItem("userId", response.userId);
        router.push("/admin/otp");

        toast.success("Login successful!");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="bg-login1 w-fully h-fully bg-no-repeat">
      <div className="w-full h-fully flex items-center justify-end box">
        <div className="w-40 ml-auto max-w-[420px]">
          <Image className="logo" src={logo} alt="logo" />
          <div className="flex flex-col items-start gap-10 w-full">
            <h1 className="text-34 font-semibold">Login</h1>
            <form
              onSubmit={submitCredential}
              className="flex flex-col items-start gap-6 w-full"
            >
              {/* Username */}
              <div className="flex flex-col items-start gap-3 w-full">
                <span className="text-14 font-medium">
                  Username <span className="text-mainRed">*</span>
                </span>
                <div className="flex justify-start items-center gap-2 w-full border-2 border-mainGray1 py-4 px-6 rounded-8">
                  <span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.00038 10.25C5.62282 10.25 3.50847 11.398 2.16237 13.1795C1.87265 13.5629 1.7278 13.7546 1.73253 14.0137C1.7362 14.2139 1.8619 14.4664 2.0194 14.59C2.22327 14.75 2.50578 14.75 3.0708 14.75H12.93C13.495 14.75 13.7775 14.75 13.9814 14.59C14.1389 14.4664 14.2646 14.2139 14.2682 14.0137C14.273 13.7546 14.1281 13.5629 13.8384 13.1795C12.4923 11.398 10.3779 10.25 8.00038 10.25Z"
                        stroke="#4B5565"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.00038 8C9.86434 8 11.3754 6.48896 11.3754 4.625C11.3754 2.76104 9.86434 1.25 8.00038 1.25C6.13642 1.25 4.62538 2.76104 4.62538 4.625C4.62538 6.48896 6.13642 8 8.00038 8Z"
                        stroke="#4B5565"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full outline-none"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col items-start gap-3 w-full">
                <span className="text-14 font-medium">
                  Password <span className="text-mainRed">*</span>
                </span>
                <div className="flex justify-start items-center gap-2 w-full border-2 border-mainGray1 py-4 px-6 rounded-8">
                  <input
                    type={inputType}
                    placeholder="Enter your password"
                    className="w-full outline-none"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <span
                    onClick={() =>
                      setInputType(
                        inputType === "password" ? "text" : "password"
                      )
                    }
                    className="cursor-pointer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.99965 12.0479C7.66183 12.0479 8.26662 11.9736 8.81821 11.8453L7.58834 10.5782C7.39724 10.5934 7.20335 10.6056 6.99965 10.6056C3.25404 10.6056 1.80297 7.83218 1.45158 7C1.71544 6.39339 2.0718 5.83418 2.50716 5.34357L1.52858 4.33543C0.452004 5.53755 0.0439133 6.74832 0.0362135 6.77212C-0.0120712 6.92022 -0.0120712 7.0805 0.0362135 7.2286C0.0509131 7.27619 1.65668 12.0479 6.99965 12.0479ZM6.99965 1.9521C5.71378 1.9521 4.65751 2.23766 3.77693 2.65952L1.19469 0L0.20491 1.01968L12.8046 14L13.7944 12.9803L11.4711 10.5869C13.3009 9.17997 13.954 7.25888 13.9638 7.2286C14.0121 7.0805 14.0121 6.92022 13.9638 6.77212C13.9484 6.72381 12.3426 1.9521 6.99965 1.9521ZM10.48 9.56578L8.88401 7.9216C9.017 7.64036 9.0996 7.331 9.0996 7C9.0996 5.81663 8.14832 4.83661 6.99965 4.83661C6.67836 4.83661 6.37806 4.92171 6.10577 5.05944L4.8402 3.75564C5.53495 3.51003 6.26516 3.38786 6.99965 3.39435C10.7453 3.39435 12.1963 6.16782 12.5477 7C12.3363 7.49902 11.7315 8.68888 10.48 9.56578Z"
                        fill="#484A4B"
                      />
                    </svg>
                  </span>
                </div>
                <div className="flex justify-between w-full">
                  {/* <span className="text-mainGray2 text-12 text-medium">
                    This is a hint text to help user
                  </span>{" "} */}
                  <Link
                    href="/admin/login/forget-password"
                    className="text-12 font-medium text-mainBlue"
                  >
                    Forget password?
                  </Link>
                </div>
                {error && (
                  <div className="w-full p-3 bg-[#FEF3F2] border border-[#FEE4E2] rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 6.458V10.8333M10 13.5417H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
                          stroke="#D92D20"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[#D92D20] text-sm font-medium">
                        {error}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  className="w-full bg-black text-white rounded-16 py-4 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
