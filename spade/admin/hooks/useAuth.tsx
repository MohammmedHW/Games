import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";
import { UserStore } from "../store/User";

export default function useAuth() {
  const router = useRouter();
  const { setToken, setUser } = useContext(UserStore);
  const { login: loginUser } = useContext(UserStore);

  const login = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001/api/users/admin/login"
          : "/api/users/admin/login";
      const token = localStorage.getItem("token");
      const response = await axios.post(
        apiUrl,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token || "",
          },
        }
      );

      toast.success("Logged in successfully!");

      // Set token in localStorage and axios defaults

      ////////////////////////////////make this change
      // localStorage.setItem("token", response.data.token);
      // axios.defaults.headers.common["x-access-token"] = response.data.token;
      //////////////////////
      loginUser({
        token: response.data.token,
      });

      router.push("/");
      console.log("Redirecting to dashboard...");
    } catch (error) {
      // Error handling remains the same
      console.log("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    deleteCookie("token");
    delete axios.defaults.headers.common["x-access-token"];

    setToken(undefined);
    setUser(undefined);
    toast.success("Logged out successfully!");
    ///added line
    // router.push("/login");
  };

  return { login, logout };
}
