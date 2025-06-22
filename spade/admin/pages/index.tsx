// import Head from "next/head";
// import { useEffect, useState } from "react";
// import { HiRefresh } from "react-icons/hi";
// import { toast } from "react-toastify";

// export interface Analytics {
//   users: number,
//   bets: number,
//   deposits: number,
//   withdrawals: number,
//   newUsers: number,
//   activeUsers: number,
//   newBets: number,
//   newDeposits: number,
//   newWithdrawals: number,
//   wonBets: number,
//   lostBets: number,
//   openBets: number,
//   voidBets: number,
//   sportsBets: number,
//   sportsFancyBets: number,
//   casinoBets: number,
// }

// export default function Dashboard() {
//   const [analytics, setAnalytics] = useState<Analytics | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [from, setFrom] = useState(7);

//   // call api to fetch analytics data
//   const fetchAnalytics = async () => {
//     setLoading(true);
//     const limit = 20;
//     const options = {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     };

//     const response = await fetch(`/api/team/dashboard?from=${from}`, options);

//     if (response.status === 200) {
//       const data = await response.json();
//       if (!response.ok) {
//         const error = (data && data.message) || response.status;
//         return Promise.reject(error);
//       }
//       setAnalytics(data);
//       setLoading(false);
//     } else {
//       toast.error(await response.text());
//     }
//   }

//   useEffect(() => {
//     fetchAnalytics();
//   }, [from]);

//   return (
//     <>
//       <Head>
//         <title>Bank Accounts | Spade365</title>
//         <meta name="description" content="Bank Accounts | Spade365" />
//       </Head>
//       <div className="flex flex-col justify-start items-center min-h-[800px] w-full container mx-auto overflow-hidden">
//         <div className="flex flex-col md:flex-row justify-between w-full items-center mb-8 md:mb-4">
//           <div className="flex flex-col md:flex-row justify-between w-full items-center mb-8 md:mb-4">
//             <h1 className="text-center md:text-left text-4xl lg:text-5xl my-6 w-1/2">
//               Dashboard
//               <button className="text-black bg-white p-1 text-2xl cursor-pointer rounded ml-4" title="Refresh Analytics" onClick={() => {
//                 fetchAnalytics()
//                 toast.success('Analytics refreshed successfully!')
//               }} >
//                 <HiRefresh />
//               </button>
//             </h1>
//             {/* Filter */}
//             <div className="flex flex-row justify-center md:justify-start items-center w-full md:w-1/2">
//               {/* search inpout with search icon */}
//               <div className="md:ml-auto">
//                 {/* select box with filter */}
//                 <select
//                   className="bg-gray text-white text-base font-semibold py-2 pl-4 pr-8 rounded bg-transparent"
//                   value={from}
//                   onChange={(e) => setFrom(parseInt(e.target.value))}
//                 >
//                   <option className="bg-slate-900 text-white" value={1}>Last 24 Hours</option>
//                   <option className="bg-slate-900 text-white" value={2}>Last 48 Hours</option>
//                   <option className="bg-slate-900 text-white" value={3}>Last 3 Days</option>
//                   <option className="bg-slate-900 text-white" value={7}>Last 7 Days</option>
//                   <option className="bg-slate-900 text-white" value={30}>Last 30 Days</option>
//                   <option className="bg-slate-900 text-white" value={90}>Last 3 Months</option>
//                   <option className="bg-slate-900 text-white" value={180}>Last 6 Months</option>
//                   <option className="bg-slate-900 text-white" value={365}>Last 12 Months</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* tabs with icon analytics data number */}
//         <div className="w-full">
//           <div className="mx-auto px-6 lg:px-8 py-8 bg-gradient-to-br from-green-600 to-purple-800 rounded-lg w-full">
//             <dl className="grid grid-cols-3 gap-16 text-center lg:grid-cols-6 justify-center items-center self-center justify-items-center w-full">
//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Total Users</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.users?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">New Users</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">+ {analytics?.newUsers?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Active Users</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.activeUsers?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Total Bets</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.bets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">New Bets</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">+ {analytics?.newBets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Bets Won</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.wonBets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Bets Lost</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.lostBets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Bets Open</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.openBets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Bets Void</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.voidBets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Sportsbook Bets</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.sportsBets?.toLocaleString()}</dd>
//               </div>
//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">SB Fancy Bets</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.sportsFancyBets?.toLocaleString()}</dd>
//               </div>
//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Live Casino Bets</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.casinoBets?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Total Deposits</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.deposits?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">New Deposits</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">+ {analytics?.newDeposits?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">Total Withdrawals</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">{analytics?.withdrawals?.toLocaleString()}</dd>
//               </div>

//               <div className="mx-auto flex flex-col gap-y-4">
//                 <dt className="text-base leading-7 text-gray-200">New Withdrawals</dt>
//                 <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">+ {analytics?.newWithdrawals?.toLocaleString()}</dd>
//               </div>
//             </dl>
//           </div>
//         </div>

//       </div>
//     </>
//   );
// }

import Head from "next/head";
import { useEffect, useState } from "react";
import { HiRefresh, HiLockClosed, HiUser } from "react-icons/hi";
import { toast } from "react-toastify";
import axios from "axios";

export interface Analytics {
  users: number;
  bets: number;
  deposits: number;
  withdrawals: number;
  newUsers: number;
  activeUsers: number;
  newBets: number;
  newDeposits: number;
  newWithdrawals: number;
  wonBets: number;
  lostBets: number;
  openBets: number;
  voidBets: number;
  sportsBets: number;
  sportsFancyBets: number;
  casinoBets: number;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(7);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "admin",
    password: "admin1234",
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchAnalytics();
    }
  }, []);

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  // // Handle admin login
  // const handleAdminLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const response = await fetch("/api/users/admin/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(loginForm)
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       localStorage.setItem("token", data.token);
  //       localStorage.setItem("user", JSON.stringify(data.user));
  //       setIsLoggedIn(true);
  //       fetchAnalytics();
  //       toast.success("Login successful!");
  //     } else {
  //       throw new Error(await response.text());
  //     }
  //   } catch (error) {
  //     toast.error(error.message || "Login failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Handle logout
  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("user");
  //   setIsLoggedIn(false);
  //   setAnalytics(null);
  //   toast.success("Logged out successfully");
  // };

  // // Fetch analytics data
  // const fetchAnalytics = async () => {
  //   setLoading(true);
  //   const options = {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${localStorage.getItem("token")}`
  //     },
  //   };

  //   try {
  //     const response = await fetch(`/api/team/dashboard?from=${from}`, options);

  //     if (response.status === 200) {
  //       const data = await response.json();
  //       if (!response.ok) {
  //         throw new Error(data.message || response.status);
  //       }
  //       setAnalytics(data);
  //     } else {
  //       throw new Error(await response.text());
  //     }
  //   } catch (error) {
  //     toast.error(error.message || "Failed to fetch analytics");
  //     if (error.message.includes("Unauthorized")) {
  //       handleLogout();
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/team/dashboard?from=${from}`, {
        headers: { "x-access-token": localStorage.getItem("token") },
      });
      setAnalytics(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch analytics");
      if (error.message.includes("Unauthorized")) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/users/admin/login", loginForm, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", response.data.token);
      axios.defaults.headers.common["x-access-token"] = response.data.token;

      setIsLoggedIn(true);
      fetchAnalytics();
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["x-access-token"];
    setIsLoggedIn(false);
    setAnalytics(null);
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchAnalytics();
    }
  }, [from, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleAdminLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiUser className="text-gray-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="w-full pl-10 px-3 py-2 border rounded-md"
                  value={loginForm.username}
                  onChange={handleLoginChange}
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full pl-10 px-3 py-2 border rounded-md"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Spade365</title>
        <meta name="description" content="Admin Dashboard | Spade365" />
      </Head>
      <div className="flex flex-col justify-start items-center min-h-[800px] w-full container mx-auto overflow-hidden">
        <div className="flex justify-between items-center w-full py-4 px-6 bg-gray-800 rounded-lg mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-1 px-4 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full items-center mb-8 md:mb-4">
          <div className="flex flex-col md:flex-row justify-between w-full items-center mb-8 md:mb-4">
            <h1 className="text-center md:text-left text-4xl lg:text-5xl my-6 w-1/2">
              Analytics
              <button
                className="text-black bg-white p-1 text-2xl cursor-pointer rounded ml-4"
                title="Refresh Analytics"
                onClick={() => {
                  fetchAnalytics();
                  toast.success("Analytics refreshed successfully!");
                }}
                disabled={loading}
              >
                <HiRefresh />
              </button>
            </h1>
            <div className="flex flex-row justify-center md:justify-start items-center w-full md:w-1/2">
              <div className="md:ml-auto">
                <select
                  className="bg-gray-800 text-white text-base font-semibold py-2 pl-4 pr-8 rounded"
                  value={from}
                  onChange={(e) => setFrom(parseInt(e.target.value))}
                  disabled={loading}
                >
                  <option value={1}>Last 24 Hours</option>
                  <option value={2}>Last 48 Hours</option>
                  <option value={3}>Last 3 Days</option>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 3 Months</option>
                  <option value={180}>Last 6 Months</option>
                  <option value={365}>Last 12 Months</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="mx-auto px-6 lg:px-8 py-8 bg-gradient-to-br from-green-600 to-purple-800 rounded-lg w-full">
            {loading && !analytics ? (
              <div className="text-center text-white py-8">
                Loading analytics...
              </div>
            ) : (
              <dl className="grid grid-cols-3 gap-16 text-center lg:grid-cols-6 justify-center items-center self-center justify-items-center w-full">
                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Total Users
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.users?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    New Users
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    + {analytics?.newUsers?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Active Users
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.activeUsers?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Total Bets
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.bets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    New Bets
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    + {analytics?.newBets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Bets Won
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.wonBets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Bets Lost
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.lostBets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Bets Open
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.openBets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Bets Void
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.voidBets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Sportsbook Bets
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.sportsBets?.toLocaleString() || 0}
                  </dd>
                </div>
                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    SB Fancy Bets
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.sportsFancyBets?.toLocaleString() || 0}
                  </dd>
                </div>
                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Live Casino Bets
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.casinoBets?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Total Deposits
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.deposits?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    New Deposits
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    + {analytics?.newDeposits?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    Total Withdrawals
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    {analytics?.withdrawals?.toLocaleString() || 0}
                  </dd>
                </div>

                <div className="mx-auto flex flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-200">
                    New Withdrawals
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                    + {analytics?.newWithdrawals?.toLocaleString() || 0}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
