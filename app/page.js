"use client";
import React, { useState, useEffect } from "react";
import Login from "./Components/Authentication/Login/page";
import Loader from "./Components/Loader/page";

const Page = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // keep loader for 2 seconds (you can adjust time)
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? <Loader /> : <Login />}
    </div>
  );
};

export default Page;
