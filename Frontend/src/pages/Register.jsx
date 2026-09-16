import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post(
                "/users/signup",
                formData
            );

            toast.success(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f5f7ff]">

            <div className="min-h-screen w-full grid lg:grid-cols-2">

                {/* LEFT SECTION */}

                <div className="relative hidden lg:flex overflow-hidden bg-[#161e30] text-white">

                    {/* Decorative circles */}

                    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/20" />

                    <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-500/20" />

                    <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-16">

                        {/* Logo */}

                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xl shadow-lg">
                                B
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight">
                                Borrow <span className="text-violet-400">
                                    Hub
                                </span>
                            </h1>

                        </div>

                        {/* Main Content */}

                        <div className="max-w-xl">

                            <p className="text-violet-400 font-semibold mb-5">
                                YOUR COMMUNITY. YOUR CONNECTION.
                            </p>

                            <h2 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
                                Share more.
                                <br />
                                Buy less.
                                <br />
                                <span className="text-violet-400">
                                    Connect locally.
                                </span>
                            </h2>

                            <p className="mt-7 text-gray-400 text-lg leading-relaxed max-w-lg">
                                BorrowHub makes it easy to borrow,
                                lend and share everyday items with
                                people around you.
                            </p>

                        </div>

                        {/* Features */}

                        <div className="grid sm:grid-cols-3 gap-4 mb-20">

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

                                <div className="text-2xl mb-3">
                                    🤝
                                </div>

                                <p className="font-semibold">
                                    Connect
                                </p>

                                <p className="text-sm text-gray-400 mt-1">
                                    Meet people nearby.
                                </p>

                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

                                <div className="text-2xl mb-3">
                                    💰
                                </div>

                                <p className="font-semibold">
                                    Save
                                </p>

                                <p className="text-sm text-gray-400 mt-1">
                                    Borrow instead of buying.
                                </p>

                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

                                <div className="text-2xl mb-3">
                                    ♻️
                                </div>

                                <p className="font-semibold">
                                    Reuse
                                </p>

                                <p className="text-sm text-gray-400 mt-1">
                                    Give items another life.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT SECTION */}

                <div className="flex items-center justify-center w-full min-h-screen px-5 py-10 sm:px-10 lg:px-14 xl:px-20">

                    <div className="w-full max-w-xl">

                        {/* Mobile Logo */}

                        <div className="flex lg:hidden items-center gap-3 mb-10">

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                                B
                            </div>

                            <h1 className="text-xl font-bold text-gray-900">
                                Borrow<span className="text-violet-600">
                                    Hub
                                </span>
                            </h1>

                        </div>

                        {/* Heading */}

                        <div className="mb-8">

                            <p className="text-violet-600 font-semibold text-sm mb-2">
                                GET STARTED
                            </p>

                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Create your account
                            </h2>

                            <p className="text-gray-500 mt-3">
                                Join BorrowHub and start sharing
                                with your community.
                            </p>

                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Name */}

                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                />

                            </div>

                            {/* Email */}

                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                />

                            </div>

                            {/* Phone */}

                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                />

                            </div>

                            {/* Password */}

                            <div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a secure password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-14 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                                />

                            </div>

                            {/* Submit */}

                            <button
                                type="submit"
                                className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-base shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700 transition duration-200"
                            >
                                Create Account
                            </button>

                        </form>


                        {/* Login */}

                        <p className="text-center text-gray-500 mt-7">

                            Already have an account?{" "}

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-violet-600 font-semibold hover:text-violet-700"
                            >
                                Log in
                            </button>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;
