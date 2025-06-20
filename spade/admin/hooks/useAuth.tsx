// import { useContext } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { deleteCookie } from "cookies-next";
// import { useRouter } from "next/router";
// import { UserStore } from "../store/User";

// export default function useAuth() {
//   const router = useRouter();
//   const { login: loginUser } = useContext(UserStore);

//   const login = async ({
//     username,
//     password,
//   }: {
//     username: string;
//     password: string;
//   }) => {
//     await axios({
//       method: "POST",
//       url: `/api/team/login/`,
//       data: {
//         username,
//         password,
//       },
//     })
//       .then((res) => {
//         toast.success("Logged in!");
//         loginUser({
//           token: res.data.token,
//         });
//         router.replace("/");
//       })
//       .catch((err) => {
//         if (typeof err.response?.data === "string") {
//           toast.error(err.response.data);
//           return;
//         } else if (err.response?.data?.errors) {
//           const e = err.response.data.errors[0];
//           if (
//             (e.msg as string).toLowerCase() === "invalid value" &&
//             e.param === "password"
//           ) {
//             return;
//           }
//         }
//         toast.error(err.message);
//       });
//   };

//   const logout = () => {
//     // setUser(null);
//     localStorage.removeItem("user");
//     deleteCookie("token");
//     toast.success("Logged out!");
//     router.reload();
//   };

//   return {
//     login,
//     logout,
//   };
// }

// //////////////old one
// import { useContext } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { deleteCookie } from "cookies-next";
// import { useRouter } from "next/router";
// import { UserStore } from "../store/User";

// export default function useAuth() {
//   const router = useRouter();
//   const { login: loginUser } = useContext(UserStore);

//   const login = async ({
//     username,
//     password,
//   }: {
//     username: string;
//     password: string;
//   }) => {
//     try {
//       // Use absolute URL in development to avoid proxy issues
//       const apiUrl = process.env.NODE_ENV === 'development' 
//         ? 'http://localhost:3001/api/users/admin/login' 
//         : '/api/users/admin/login';

//       const response = await axios.post(apiUrl, {
//         username,
//         password,
//       }, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });

//       toast.success("Logged in successfully!");
//       loginUser({
//         token: response.data.token,
//         user: response.data.user // Make sure your backend returns user data
//       });
      
//       // Redirect to dashboard after login
//       router.push("/dashboard");
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           // Server responded with a status code that falls out of 2xx
//           const errorMessage = error.response.data?.message || 
//                               error.response.data?.error || 
//                               "Login failed. Please try again.";
//           toast.error(errorMessage);
//         } else if (error.request) {
//           // Request was made but no response received
//           toast.error("Server is not responding. Please check your connection.");
//         } else {
//           // Something happened in setting up the request
//           toast.error("An error occurred. Please try again.");
//         }
//       } else {
//         toast.error("An unexpected error occurred.");
//       }
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("user");
//     deleteCookie("token");
//     toast.success("Logged out successfully!");
//     router.push("/login"); // Redirect to login page after logout
//   };

//   return {
//     login,
//     logout,
//   };
// }

import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";
import { UserStore } from "../store/User";

export default function useAuth() {
  const router = useRouter();
  const { login: loginUser } = useContext(UserStore);

  const login = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      // Use absolute URL in development to avoid proxy issues
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001/api/users/admin/login"
          : "/api/users/admin/login";

      const response = await axios.post(
        apiUrl,
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
       //   console.log("token from backend:", response.data.token);

      toast.success("Logged in successfully!");

      // Only pass token — user will be fetched via fetchProfile()
      loginUser({
        token: response.data.token,
      });

      //  Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Login failed. Please try again.";
          toast.error(errorMessage);
        } else if (error.request) {
          toast.error("Server is not responding. Please check your connection.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("user"); 
    deleteCookie("token");
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  return { login, logout };
}
