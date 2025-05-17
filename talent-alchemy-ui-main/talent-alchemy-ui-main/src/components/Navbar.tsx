
import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="container mx-auto flex items-center justify-between py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="font-bold text-xl">
            <span className="gradient-text">People</span>GPT
          </div>
        </NavLink>
        
        <nav className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/upload" 
            className={({ isActive }) => 
              isActive ? "text-recruiter-primary font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Upload Resumes
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => 
              isActive ? "text-recruiter-primary font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Search Talent
          </NavLink>
          <NavLink 
            to="/candidates" 
            className={({ isActive }) => 
              isActive ? "text-recruiter-primary font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Candidates
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              isActive ? "text-recruiter-primary font-medium" : "text-gray-600 hover:text-gray-900"
            }
          >
            Dashboard
          </NavLink>
        </nav>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Sign In</Button>
          <Button size="sm">Sign Up</Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
