"use client";
import React from "react";
import HeroSection from "../HomePage/HeroSection/page";
import { useProject } from "@/app/Context/ProjectContext";
import MyCards from "../HomePage/MyCards/page";
import Reports from "../HomePage/Reports/page";
import Navbar from "../Navbar/page";
import Footer from "../Footer/page";

const Dashboard = () => {
  const { theme } = useProject();

  return (
    // <ProtectedRoute>
      <div
        className={`${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-100 text-gray-900"
        }`}
        
      >
        <Navbar />
        <HeroSection />
        <div className="p-4 mt-[-10]">
          <MyCards />
        </div>
        <div className="p-4 mt-[-10]">
          <Reports />
        </div>
        <Footer />
      </div>
    // </ProtectedRoute>
  );
};

export default Dashboard;
