"use client";
import { useState, useEffect } from "react";

export const useUser = () => {
  const [user, setUser] = useState(null);

  // Load user from localStorage when hook mounts
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const getMembCode = () => user?.MEMB_CODE || 0;
  const getAddress = () => user?.BTC_ADD || "";
  const getUserId = () => user?.USERNAME || "";

  // update user (for profile updates, etc.)
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // clear user (logout)
  const clearUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return {
    user,
    getMembCode,
    getAddress,
    getUserId,
    setUser: updateUser,
    clearUser,
  };
};
