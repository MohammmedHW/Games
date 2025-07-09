import { useEffect, useState } from "react";
import {
  AiFillEdit,
  AiFillCloseCircle,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineSearch,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { IoIosPersonAdd } from "react-icons/io";
import { useContext } from "react";

import { User } from "./users";
import { toast } from "react-toastify";
import Head from "next/head";
import { convertReadableDate, convertActiveDate } from "../helpers/date";
import { HiRefresh } from "react-icons/hi";
import { UserStore } from "../store/User"; // Adjust path if needed

export default function Team() {
  const { user } = useContext(UserStore);
  const [team, setTeam] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [search, setSearch] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const emptyUser: User = {
    username: "",
    id: 0,
    name: "",
    email: "",
    phone: "",
    credit: 0,
    newPassword: "",
    role: "subadmin",
    is_verified: false,
    is_active: true, // Default to active
    is_banned: false,
    access: {
      dashboard: true,
      users: true,
      games: true,
      team: true,
      deposits: true,
      withdrawals: true,
      bankAccounts: true,
      transactions: true,
      settings: true,
      offers: true,
      reports: true,
    },
  };
  const [modalUser, setModalUser] = useState<User>(emptyUser);

  const makeRequest = async (url: string, method: string, body?: any) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      "x-access-token": token || "",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`/api${url}`, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || response.statusText || "Request failed"
        );
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message || "Operation failed");
      throw error;
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [page, search]);

  const handleAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setModalUser({
      ...modalUser,
      access: {
        ...modalUser.access,
        [name]: checked,
      },
    });
  };

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const limit = 20;
      const skip = page > 1 ? (page - 1) * 20 : 0;

      const data = await makeRequest(
        `/team?limit=${limit}&skip=${skip}&search=${search}`,
        "GET"
      );

      setTeam(data.users);
      setHasNextPage(data.users.length === limit);
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (user: User) => {
    try {
      if (!user.username || !user.newPassword) {
        throw new Error("Username and password cannot be empty!");
      }
      if (user.username.length < 5) {
        throw new Error("Username must be at least 5 characters");
      }
      if (user.access && !Object.values(user.access).some((val) => val)) {
        throw new Error("At least one access must be selected");
      }
      if (user.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const body = {
        username: user.username,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone,
        newPassword: user.newPassword,
        is_verified: user.is_verified,
        is_active: user.is_active,
        is_banned: user.is_banned,
        role: user.role,
        access: user.access,
      };

      const response = await makeRequest("/team/", "POST", body);

      setTeam([response.user, ...team]);
      setShowTeamModal(false);
      toast.success("Team member added successfully!");
    } catch (error) {
      console.error("Failed to add team member:", error);
    }
  };

  const updateTeam = async (user: User) => {
    try {
      if (!user.username) {
        throw new Error("Username cannot be empty!");
      }
      if (user.username.length < 5) {
        throw new Error("Username must be at least 5 characters");
      }
      if (user.newPassword && user.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const body = {
        username: user.username,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone,
        newPassword: user.newPassword || undefined,
        is_verified: user.is_verified,
        is_active: user.is_active,
        is_banned: user.is_banned,
        role: user.role,
        access: user.access,
      };

      const response = await makeRequest(`/team/${user.id}/`, "PUT", body);

      setTeam(team.map((u) => (u.id === user.id ? response.user : u)));
      setShowTeamModal(false);
      toast.success("Team member updated successfully!");
    } catch (error) {
      console.error("Failed to update team member:", error);
    }
  };

  const deleteTeam = async (id: number) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this admin? All data related to this admin will be deleted."
      );
      if (!confirm) return;

      await makeRequest(`/team/${id}/`, "DELETE");

      setTeam(team.filter((u) => u.id !== id));
      toast.success("Team member deleted successfully!");
    } catch (error) {
      console.error("Failed to delete team member:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (modalUser.id === 0) {
        await addTeam(modalUser);
      } else {
        await updateTeam(modalUser);
      }
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };
  const getDisplayRole = (role: string | undefined): string => {
    const roleMap: Record<string, string> = {
      admin: "Admin",
      subadmin: "User",
      agent: "Agent",
      user: "User",
    };
    return role ? roleMap[role] || role : "Unknown";
  };

  return (
    <>
      <Head>
        <title>Team | Spade365</title>
        <meta name="description" content="Team | Spade365" />
      </Head>
      <div className="flex flex-col justify-start items-center min-h-[800px] w-full mx-auto overflow-hidden">
        {user?.role !== "subadmin" && user?.role !== "agent" && (
          <div className="flex flex-col md:flex-row justify-between w-full items-center mb-8 md:mb-4">
            <h1 className="text-center md:text-left text-4xl lg:text-5xl my-6 w-1/2">
              Users/Agents
              <button
                className="bg-white text-black p-1 text-2xl cursor-pointer rounded ml-4"
                title="Refresh Admins"
                onClick={() => {
                  fetchTeam();
                  toast.success("Users/Agent refreshed successfully!");
                }}
              >
                <HiRefresh />
              </button>
            </h1>

            {/* Search and Add Admin Button */}
            <div className="flex flex-row justify-center md:justify-start items-center w-full md:w-1/2">
              <div className="md:ml-auto flex flex-row justify-start items-center w-full bg-gray rounded-md border max-w-xs">
                <button className="p-2 h-full rounded-md">
                  <AiOutlineSearch className="text-2xl" />
                </button>
                <input
                  type="search"
                  className="w-full p-2 focus:outline-none focus:ring-0 border-none bg-transparent"
                  placeholder="Search"
                  autoComplete="new-search"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>

              <button
                className="ml-4 p-2 bg-white text-black rounded-md flex flex-row justify-center items-center"
                title="Add User/Agent"
                onClick={() => {
                  setModalUser(emptyUser);
                  setShowTeamModal(true);
                }}
              >
                <IoIosPersonAdd className="text-2xl" />
                <span className="ml-1 hidden lg:inline-block">
                  Add User/Agent
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Admins Table */}
        <div className="overflow-x-scroll scrollbar-hide w-full">
          <table className="table-auto w-full text-left break-words">
            <thead className="bg-primary text-white">
              <tr>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  ID
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2">
                  Username
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2">
                  Phone
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  Name
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  Email
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  Role
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  Status
                </th>
                <th className="border border-white/20 px-4 py-2 text-center">
                  Last Active
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  Date Joined
                </th>
                <th className="border border-white/20 px-2 md:px-4 py-2 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {team
                .filter((user) => user.role !== "admin")
                .map((user) => {
                  if (!user) return null;

                  const statusClass = user.is_banned
                    ? "text-red-500"
                    : user.is_active
                    ? "text-green-500"
                    : "text-yellow-500";

                  const statusText = user.is_banned
                    ? "Banned"
                    : user.is_active
                    ? "Active"
                    : "Inactive";

                  return (
                    <tr
                      key={user.id}
                      className={`h-[120px] odd:bg-transparent even:bg-primary/10 ${statusClass}`}
                    >
                      <td className="border border-white/20 px-2 md:px-4 py-2 font-bold text-center">
                        {user.id}
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2">
                        {user.username}
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2">
                        {user.phone}
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2">
                        {user.name}
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2">
                        {user.email}
                      </td>
                      <td
                        className={`border border-white/20 px-2 md:px-4 py-2 text-center font-bold uppercase ${
                          user.role === "admin"
                            ? "text-green-400"
                            : "text-blue-400"
                        }`}
                      >
                        {getDisplayRole(user.role)}
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2">
                        <div className="grid grid-cols-1 gap-2 text-center justify-center items-center">
                          <span
                            className={`px-2 py-1 rounded-md ${
                              user.is_banned
                                ? "bg-red-500 text-white"
                                : user.is_active
                                ? "bg-green-500 text-white"
                                : "bg-yellow-500 text-white"
                            }`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2">
                        {user.lastActive &&
                          convertActiveDate(user.lastActive as string)}
                      </td>
                      <td className="border border-white/20 px-4 py-2">
                        {user.createdAt &&
                          convertReadableDate(user.createdAt as string)}
                      </td>
                      <td className="border border-white/20 px-2 md:px-4 py-2 max-w-[200px]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          <button
                            title="Edit"
                            onClick={() => {
                              setModalUser(user);
                              setShowTeamModal(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded flex justify-center items-center"
                          >
                            <AiFillEdit className="text-2xl" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => deleteTeam(user.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded flex justify-center items-center"
                          >
                            <AiFillCloseCircle className="text-2xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr>
                {loading && (
                  <td
                    colSpan={12}
                    className="border border-white/20 px-4 py-8 text-center"
                  >
                    <div className="flex flex-row justify-center items-center text-white">
                      <AiOutlineLoading3Quarters className="animate-spin text-3xl mr-2" />
                      Loading...
                    </div>
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        {(page > 1 || hasNextPage) && (
          <div className="flex flex-row justify-center items-center my-12">
            {page > 1 && (
              <button
                onClick={() => setPage(page - 1)}
                className="bg-primary hover:bg-neutral/80 text-white font-bold py-2 px-4 rounded-l flex items-center"
              >
                <AiOutlineArrowLeft className="mr-2" />
                Previous
              </button>
            )}
            {hasNextPage && (
              <button
                onClick={() => setPage(page + 1)}
                className="bg-primary hover:bg-neutral/80 text-white font-bold py-2 px-4 rounded-r border-l-2 border-white/20 flex items-center"
              >
                Next
                <AiOutlineArrowRight className="ml-2" />
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Admin Modal */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center ${
            showTeamModal ? "visible" : "invisible"
          }`}
        >
          <div className="bg-slate-900/95 w-[95vw] max-w-[1200px] rounded-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl mb-6">
                {modalUser.id === 0 ? "Add User" : "Edit User"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role Selection */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">Role*</label>
                    {/* <select
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      value={modalUser.role}
                      onChange={(e) =>
                        setModalUser({ ...modalUser, role: e.target.value })
                      }
                      required
                    > */}
                    {/* <option value="admin">Admin</option> */}
                    {/* <option value="subadmin">User</option>
                    </select>
                    <p className="text-white/60 text-sm mt-1">
                      {modalUser.role === "admin"
                        ? "Admins have full access to all features"
                        : "Users have limited access based on permissions"}
                    </p> */}
                    <select
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      value={modalUser.role}
                      onChange={(e) =>
                        setModalUser({ ...modalUser, role: e.target.value })
                      }
                      required
                    >
                      <option value="subadmin">User</option>
                      <option value="agent">Agent</option>
                    </select>
                    <p className="text-white/60 text-sm mt-1">
                      {modalUser.role === "agent"
                        ? "Agents can manage client-related operations"
                        : "Users have limited access based on permissions"}
                    </p>
                  </div>

                  {/* Username */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">
                      Username*
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      placeholder="Enter username (min 5 chars)"
                      value={modalUser.username}
                      onChange={(e) =>
                        setModalUser({
                          ...modalUser,
                          username: e.target.value.toLowerCase(),
                        })
                      }
                      required
                      minLength={5}
                    />
                  </div>

                  {/* Password */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">
                      {modalUser.id === 0 ? "Password*" : "New Password"}
                    </label>
                    <input
                      type="password"
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      placeholder="Enter password (min 8 chars)"
                      value={modalUser.newPassword}
                      onChange={(e) =>
                        setModalUser({
                          ...modalUser,
                          newPassword: e.target.value,
                        })
                      }
                      required={modalUser.id === 0}
                      minLength={8}
                    />
                  </div>

                  {/* Name */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      placeholder="Enter full name"
                      value={modalUser.name}
                      onChange={(e) =>
                        setModalUser({ ...modalUser, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      placeholder="Enter email"
                      value={modalUser.email}
                      onChange={(e) =>
                        setModalUser({ ...modalUser, email: e.target.value })
                      }
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      placeholder="Enter phone number"
                      value={modalUser.phone}
                      onChange={(e) =>
                        setModalUser({ ...modalUser, phone: e.target.value })
                      }
                    />
                  </div>

                  {/* Active Status */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">
                      Account Active*
                    </label>
                    <select
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      value={modalUser.is_active ? 1 : 0}
                      onChange={(e) =>
                        setModalUser({
                          ...modalUser,
                          is_active: e.target.value === "1",
                        })
                      }
                      required
                    >
                      <option value={1}>Yes</option>
                      <option value={0}>No</option>
                    </select>
                  </div>

                  {/* Banned Status */}
                  <div className="col-span-1">
                    <label className="block text-white/80 mb-2">
                      Account Banned*
                    </label>
                    <select
                      className="w-full bg-slate-800 text-white/80 rounded-md p-3"
                      value={modalUser.is_banned ? 1 : 0}
                      onChange={(e) =>
                        setModalUser({
                          ...modalUser,
                          is_banned: e.target.value === "1",
                        })
                      }
                      required
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-6">
                  <label className="block text-white/80 mb-3">
                    Permissions*
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(modalUser.access).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`perm-${key}`}
                          checked={value}
                          onChange={handleAccessChange}
                          name={key}
                          className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`perm-${key}`}
                          className="ml-2 text-white/80 capitalize"
                        >
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-md hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : modalUser.id === 0 ? (
                      "Add User/Agent"
                    ) : (
                      "Update User/Agent"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
