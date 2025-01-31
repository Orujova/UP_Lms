import { useEffect } from "react";
import { useRouter } from "next/router";

const UseAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // LocalStorage'de jwtToken kontrolü yap
    const token = localStorage.getItem("jwtToken");

    // Eğer token yoksa /admin/login'e yönlendir
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);
};

export default UseAuthRedirect;
