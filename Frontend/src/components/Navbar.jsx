import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRound } from "lucide-react";

const Navbar = () => {

    const location = useLocation();

    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
        setMobileMenuOpen(false);
    };

const isActive = (path) => location.pathname === path;

    return (
        <nav className="w-full bg-gradient-to-br from-[#111827] via-[#1c2440] to-[#312e81]  text-white shadow-lg">

            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Main Navbar */}

                <div className="h-16 flex items-center justify-between">

                    {/* Logo */}

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg">
                            B
                        </div>

                        <h1 className="text-xl font-bold tracking-tight">
                            Borrow{" "}
                            <span className="text-violet-400">
                                Hub
                            </span>
                        </h1>
                    </Link>


                    {/* Desktop Navigation */}

                    <div className="hidden lg:flex items-center gap-7">

                       <Link
    to="/"
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive("/")
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
>
    Home
</Link>

                       <Link
    to="/add-item"
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive("/add-item")
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
>
    Add Item
</Link>

                       <Link
    to="/my-items"
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive("/my-items")
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
>
    My Items
</Link>

                        <Link
    to="/borrow-requests"
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive("/borrow-requests")
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
>
    Requests
</Link>

                      <Link
    to="/my-borrowed-items"
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive("/my-borrowed-items")
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
>
    Borrow & Lend
</Link>
<Link
    to="/transactions"
    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive("/transactions")
            ? "bg-white/10 text-white"
            : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
>
    Transactions
</Link>

                    </div>


                    {/* Desktop User */}

                  <div className="hidden lg:flex items-center gap-4">

    {/* Profile */}
 <Link
    to="/profile"
    className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/10"
>
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md transition group-hover:scale-105">
        <UserRound
            size={19}
            strokeWidth={2}
            className="text-indigo-100"
        />
    </div>

    <span className="text-sm font-medium text-gray-300 transition group-hover:text-white">
        {user?.name || "Profile"}
    </span>
</Link>

    {/* Logout */}
    <button
        onClick={handleLogout}
        className="
            rounded-lg
            bg-gradient-to-br from-violet-500 to-indigo-500
            px-4 py-2
            text-sm font-semibold text-white
            shadow-[0_3px_0_#3730a3]
            transition-all duration-200
            hover:-translate-y-0.5
            hover:from-violet-400
            hover:to-indigo-400
            active:translate-y-0
            active:shadow-none
        "
    >
        Logout
    </button>

</div>


                    {/* Mobile Menu Button */}

             <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="
        lg:hidden
        flex h-11 w-11 items-center justify-center
        rounded-xl
        bg-gradient-to-br from-violet-500 to-indigo-500
        text-white
        shadow-[0_5px_0_#3730a3,0_8px_15px_rgba(0,0,0,0.3)]
        transition-all duration-200
        hover:from-violet-400
        hover:to-indigo-400
        hover:-translate-y-0.5
        hover:shadow-[0_6px_0_#3730a3,0_10px_18px_rgba(0,0,0,0.35)]
        active:translate-y-1
        active:shadow-[0_2px_0_#3730a3,0_4px_8px_rgba(0,0,0,0.25)]
    "
>
    <span className="text-xl font-bold text-indigo-100">
        {mobileMenuOpen ? "×" : "☰"}
    </span>
</button>

                </div>


                {/* Mobile Navigation */}

                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-white/10 py-4">

                        <div className="flex flex-col gap-1">

                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                Home
                            </Link>

                            <Link
                                to="/add-item"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                Add Item
                            </Link>

                            <Link
                                to="/my-items"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                My Items
                            </Link>

                            <Link
                                to="/borrow-requests"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                Requests
                            </Link>

                            <Link
                                to="/my-borrowed-items"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                Borrowed
                            </Link>

                            <Link
                                to="/transactions"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                Transactions
                            </Link>

                            <Link
                                to="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition"
                            >
                                {user?.name || "Profile"}
                            </Link>


                            {/* Logout */}

                            <button
                                onClick={handleLogout}
                                className="mt-2 rounded-lg bg-violet-600 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-violet-700 transition"
                            >
                                Logout
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </nav>
    );
};

export default Navbar;