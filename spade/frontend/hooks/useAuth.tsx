import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  // setCookie, 
  // getCookie, 
  // hasCookie, 
  deleteCookie
} from "cookies-next";
import { useRouter } from "next/router";
import { UserStore } from "../store/User";

export default function useAuth() {
  const router = useRouter();
  const { login: loginUser } = useContext(UserStore);

  // const login = async ({
  //   phoneNumber,
  //   password,
  // }: {
  //   phoneNumber: string;
  //   password: string;
  // }) => {
  //   await axios({
  //     method: "POST",
  //     // url: `/api/users/login`,
  //     url: `/api/users/login/`,
  //     // headers: {
  //     //     "x-access-token": getCookie('token') || '',
  //     // },
  //     data: {
  //       phoneNumber,
  //       password,
  //     },
  //   })
  //     .then((res) => {
  //       toast.success("Logged in!");
  //       loginUser({
  //         token: res.data.token,
  //       });

  //       router.reload(); // reloading to hide login modal. do we need context here?
  //     })
  //     .catch((err) => {
  //       if (typeof err.response?.data === "string") {
  //         toast.error(err.response.data);
  //         return;
  //       } else if (err.response?.data?.errors) {
  //         const e = err.response.data.errors[0];
  //         if (
  //           (e.msg as string).toLowerCase() === "invalid value" &&
  //           e.param === "password"
  //         ) {
  //           return;
  //         }
  //       }
  //       toast.error(err.message);
  //     });
  // };
  
const login = async ({
  phoneNumber,
  password,
}: {
  phoneNumber: string;
  password: string;
}) => {
  console.log("Logging in with:", { phoneNumber, password });

  await axios({
    method: "POST",
    url: `/api/users/login/`,
    data: {
      phoneNumber,
      password,
    },
  })
    .then((res) => {
      const token = res.data.token;
      toast.success("Logged in!");

      // ✅ Save token to localStorage
      localStorage.setItem("token", token);

      // ✅ Set token in axios for future requests
      axios.defaults.headers.common["x-access-token"] = token;

      // ✅ Optional: Set in context if you use it
      loginUser({
        token,
      });

      router.reload(); // Reload page to update login state
    })
    .catch((err) => {
      console.log("Login error response:", err?.response?.data);

      if (typeof err.response?.data === "string") {
        toast.error(err.response.data);
        return;
      }

      if (err.response?.data?.errors) {
        const e = err.response.data.errors[0];
        console.error("Validation error:", e);
        toast.error(`${e.param}: ${e.msg}`);
        return;
      }

      toast.error(err.message || "Something went wrong");
    });
};

  const signup = async (data: {
    password: string;
    confirmPassword: string;
   // otp: string;
    phoneNumber: string;
  }) => {
    try {
      await axios({
        method: "POST",
        url: `/api/users/signup/`,
        data,
      })
        .then((res) => {
          toast.success("Account created successfully. You can login now");
        })
        .catch((err) => {
          if (typeof err.response.data === "string") {
            toast.error(err.response.data);
            // setError(err.response.data);
            return;
          } else if (err.response?.data?.errors) {
            const e = err.response.data.errors[0];
            if ((e.msg as string).toLowerCase() === "invalid value" && e.param === "password") {
              toast.error("Your password is not strong");
              // setError("Your password is not strong");
              return;
            }
          }
          toast.error(err.message);
          // setError(err.message);

        });
    } catch (error) {
      console.log(error);

    }
  };

  const logout = () => {
    // setUser(null);
    localStorage.removeItem("user");
    deleteCookie("token");
    toast.success("Logged out!");
    
    router.reload();
  };

  // NOTE: all handled in the User context
  // const isLoggedIn = () => {
  //   return !!user;
  // };

  // const getUser = () => {
  //   return user;
  // };

  // const getRole = () => {
  //   return user?.role;
  // };

  const getOtp = (mobile: string) => {
    return new Promise((resolve, reject) => {
      axios({
        method: "GET",
        url: `/api/users/otp?phoneNumber=${mobile}`,
      })
        .then((res) => {
          // console.log(res.data.otp);
          return resolve({
            otpLife: res.data.timePending,
          });
        })
        .catch((e) => {
          if (e?.response?.data?.timePending) {
            return resolve({
              otpLife: e.response.data.timePending,
            });
          } else {
            toast.error(e.message);
            // return reject(e.message);
          }
        });
    });
  };

  const changePassword = async (data: {
    password: string;
    confirmPassword: string;
    //otp: string;
    phoneNumber: string;
  }) => {
    try {
      await axios({
        method: "POST",
        // url: `/api/users/signup`,
        url: `/api/users/forgotPassword/`,
        data,
      })
        .then((res) => {
          toast.success("Password reset sucessful. Please login");
        })
        .catch((err) => {
          if (typeof err.response.data === "string") {
            toast.error(err.response.data);
            // setError(err.response.data);
            return;
          } else if (err.response?.data?.errors) {
            const e = err.response.data.errors[0];
            if (
              (e.msg as string).toLowerCase() === "invalid value" &&
              e.param === "password"
            ) {
              toast.error("Your password is not strong");
              // setError("Your password is not strong");
              return;
            }
          }
          toast.error(err.message);
          // setError(err.message);
        });
    } catch (error) { }
  };

  return {
    login,
    signup,
    logout,
   // getOtp,
    changePassword,
  };
}
