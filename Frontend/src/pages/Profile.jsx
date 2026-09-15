import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [profile, setProfile] = useState(null);
const [deleting, setDeleting] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editing, setEditing] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [location, setLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);


   const fetchProfile = async () => {
    try {
        setLoading(true);

        const response = await api.get("/users/me");

        const userData = response.data.user;

        setProfile(userData);

        setName(userData.name || "");
        setPhone(userData.phone || "");

        if (userData.location) {
            setLocation(userData.location);
        }

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to load profile"
        );
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchProfile();
    }, []);

    /* ========================================= */
    /* GET CURRENT LOCATION */
    /* ========================================= */

 const getCurrentLocation = () => {
    if (!navigator.geolocation) {
        toast.error(
            "Geolocation is not supported by your browser."
        );
        return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const newLocation = {
                type: "Point",
                coordinates: [
                    longitude,
                    latitude
                ]
            };

            setLocation(newLocation);
            setGettingLocation(false);

            toast.success(
                "Current location detected. Click Save Changes to update your profile."
            );
        },
        () => {
            setGettingLocation(false);

            toast.error(
                "Unable to access your location. Please allow location permission."
            );
        }
    );
};

    /* ========================================= */
    /* SAVE PROFILE */
    /* ========================================= */

  const handleSave = async () => {
    if (!name.trim()) {
        toast.error("Name is required.");
        return;
    }

    if (!phone.trim()) {
        toast.error("Phone number is required.");
        return;
    }

    try {
        setSaving(true);

        const response = await api.put(
            "/users/me",
            {
                name: name.trim(),
                phone: phone.trim(),
                location
            }
        );

        const updatedUser = response.data.user;

        setProfile(updatedUser);

        setName(updatedUser.name || "");
        setPhone(updatedUser.phone || "");

        if (updatedUser.location) {
            setLocation(updatedUser.location);
        }

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setEditing(false);

        toast.success(
            response.data.message ||
            "Profile updated successfully."
        );

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to update profile"
        );
    } finally {
        setSaving(false);
    }
};

    /* ========================================= */
    /* CANCEL EDIT */
    /* ========================================= */

   const handleCancel = () => {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
    setLocation(profile?.location || null);

    setEditing(false);
};

    /* ========================================= */
    /* LOGOUT */
    /* ========================================= */

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

  const handleDeleteAccount = async () => {
    try {
        setDeleting(true);

        await api.delete("/users/me");

        toast.success("Your account has been deleted successfully.");

        setShowDeleteModal(false);

        setTimeout(() => {
            logout();
            navigate("/login");
        }, 1000);

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Failed to delete account"
        );
    } finally {
        setDeleting(false);
    }
};

    /* ========================================= */
    /* LOADING */
    /* ========================================= */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center">

                <div className="rounded-2xl border border-gray-200 bg-white px-8 py-7 text-center shadow-sm">

                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"></div>

                    <p className="font-medium text-gray-600">
                        Loading your profile...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7ff]">

            {/* ========================================= */}
            {/* HERO */}
            {/* ========================================= */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1c2440] to-[#312e81] text-white shadow-xl">

                <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-500/20"></div>

                <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-indigo-500/20"></div>

                <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

                    <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">

                        {/* Profile identity */}

                        <div className="flex items-center gap-5">

                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-xl ring-4 ring-white/10">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                                    BorrowHub Profile
                                </p>

                                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                                    {profile?.name}
                                </h1>

                                <p className="mt-1 text-sm text-violet-100">
                                    {profile?.email}
                                </p>

                            </div>

                        </div>

                       

                    </div>

                </div>

            </div>

            {/* ========================================= */}
            {/* CONTENT */}
            {/* ========================================= */}

            <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

                {/* ========================================= */}
                {/* MAIN CONTENT GRID */}
                {/* ========================================= */}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* ========================================= */}
                    {/* LEFT CONTENT */}
                    {/* ========================================= */}

                    <div className="lg:col-span-2">

                        {/* ========================================= */}
                        {/* ACCOUNT SUMMARY */}
                        {/* ========================================= */}

                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

                            {/* Account */}

                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Account
                                        </p>

                                        <p className="mt-2 text-xl font-bold text-gray-900">
                                            Active
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            BorrowHub member
                                        </p>

                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">

                                        <span className="h-3 w-3 rounded-full bg-green-500"></span>

                                    </div>

                                </div>

                            </div>


                            {/* Email */}

                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div className="min-w-0">

                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                            Email
                                        </p>

                                        <p className="mt-2 truncate text-base font-bold text-gray-900">
                                            {profile?.email}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Account email
                                        </p>

                                    </div>

                                    <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-indigo-600"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <rect
                                                x="3"
                                                y="5"
                                                width="18"
                                                height="14"
                                                rx="2"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m4 7 8 6 8-6"
                                            />
                                        </svg>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ========================================= */}
                        {/* PERSONAL INFORMATION */}
                        {/* ========================================= */}

                        <section>

                            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

                                {/* Header */}

                              <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

    <div>
        <h2 className="text-xl font-bold text-gray-900">
            Personal Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
            Manage the information associated with your BorrowHub account.
        </p>
    </div>

    {!editing && (
        <button
            onClick={() => {
                setEditing(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.213 3.75 21l.787-3.75L16.862 4.487Z"
                />
            </svg>

            Edit Profile
        </button>
    )}

</div>

                                {/* Form */}

                                <div className="p-6">

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                        {/* Name */}

                                        <div>

                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Full Name
                                            </label>

                                            {editing ? (
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) =>
                                                        setName(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your name"
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                                />
                                            ) : (
                                                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
                                                    {profile?.name ||
                                                        "Not provided"}
                                                </div>
                                            )}

                                        </div>


                                        {/* Email */}

                                        <div>

                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Email Address
                                            </label>

                                            <div className="rounded-xl border border-gray-100 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500">
                                                {profile?.email}
                                            </div>

                                            <p className="mt-1.5 text-xs text-gray-400">
                                                Email cannot be changed here.
                                            </p>

                                        </div>


                                        {/* Phone */}

                                        <div>

                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Phone Number
                                            </label>

                                            {editing ? (
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) =>
                                                        setPhone(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your phone number"
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                                />
                                            ) : (
                                                <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800">
                                                    {profile?.phone ||
                                                        "Not provided"}
                                                </div>
                                            )}

                                        </div>


                                        {/* Location */}

                                        <div>

                                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                                Location
                                            </label>

                                            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">

                                                <span
                                                    className={`h-2.5 w-2.5 rounded-full ${
                                                        location?.coordinates?.length ===
                                                        2
                                                            ? "bg-green-500"
                                                            : "bg-gray-300"
                                                    }`}
                                                ></span>

                                                <span className="text-sm font-medium text-gray-700">

                                                    {location?.coordinates?.length ===
                                                    2
                                                        ? "Location saved"
                                                        : "Location not set"}

                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    {/* ========================================= */}
                                    {/* LOCATION UPDATE */}
                                    {/* ========================================= */}

                                    {editing && (
                                        <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">

                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                <div>

                                                    <h3 className="font-semibold text-gray-900">
                                                        Update your location
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Use your current location to find and share items nearby.
                                                    </p>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        getCurrentLocation
                                                    }
                                                    disabled={
                                                        gettingLocation
                                                    }
                                                    className="shrink-0 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {gettingLocation
                                                        ? "Detecting..."
                                                        : "Use Current Location"}
                                                </button>

                                            </div>

                                            {location?.coordinates?.length ===
                                                2 && (
                                                <div className="mt-4 rounded-xl border border-violet-100 bg-white px-4 py-3 text-xs text-gray-500">

                                                    <span className="font-semibold text-gray-700">
                                                        Location detected
                                                    </span>

                                                    <span className="ml-2">
                                                        Ready to save
                                                    </span>

                                                </div>
                                            )}

                                        </div>
                                    )}


                                    {/* ========================================= */}
                                    {/* ACTION BUTTONS */}
                                    {/* ========================================= */}

                                    {editing && (
                                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                            <button
                                                type="button"
                                                onClick={
                                                    handleCancel
                                                }
                                                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>

                                        </div>
                                    )}

                                </div>

                            </div>

                        </section>

                    </div>


                    {/* ========================================= */}
                    {/* RIGHT ACCOUNT SIDEBAR */}
                    {/* ========================================= */}

                    <aside className="lg:col-span-1">

                        {/* Account Navigation */}

                        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Account
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage your BorrowHub account.
                                </p>

                            </div>

                            <div className="p-4">

                                {/* Back to Home */}

                                <button
                                    onClick={() =>
                                        navigate("/")
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                                >

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"
                                            />
                                        </svg>

                                    </span>

                                    Back to Home

                                </button>


                                {/* My Items */}

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/my-items"
                                        )
                                    }
                                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                                >

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 1 6.5 18H20"
                                            />
                                        </svg>

                                    </span>

                                    My Items

                                </button>


                                {/* Borrow & Lend */}

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/my-borrowed-items"
                                        )
                                    }
                                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                                >

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 4.5h12A1.5 1.5 0 0 1 19.5 6v12A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5ZM8 8h8M8 12h5"
                                            />
                                        </svg>

                                    </span>

                                    Borrow & Lend

                                </button>


                                {/* Transactions */}

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/transactions"
                                        )
                                    }
                                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                                >

                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M7 3.75h10A2.25 2.25 0 0 1 19.25 6v12A2.25 2.25 0 0 1 17 20.25H7A2.25 2.25 0 0 1 4.75 18V6A2.25 2.25 0 0 1 7 3.75ZM8 8h8M8 12h5"
                                            />
                                        </svg>

                                    </span>

                                    Transactions

                                </button>


                                {/* ========================================= */}
                                {/* LOGOUT */}
                                {/* ========================================= */}

                                <div className="mt-6 border-t border-gray-100 pt-5">

                                    <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Account Actions
                                    </p>

                                    <button
                                        onClick={
                                            handleLogout
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 12h8.25m0 0-3-3m3 3-3 3"
                                            />
                                        </svg>

                                        Logout

                                    </button>
                                            <div className="mt-4 border-t border-gray-300 pt-4">

    <button
        onClick={() => setShowDeleteModal(true)}
        disabled={deleting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7h12M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-7 0 .75 12.5A1.5 1.5 0 0 0 10.25 21h3.5a1.5 1.5 0 0 0 1.5-1.5L16 7M10 11v6M14 11v6"
            />
        </svg>

        {deleting ? "Deleting Account..." : "Delete Account"}
    </button>

</div>

                                </div>
                        

                            </div>

                        </div>

                    </aside>

                </div>

            </main>

           <ConfirmModal
    open={showDeleteModal}
    title="Delete your account?"
    message="Are you sure you want to permanently delete your BorrowHub account? This action cannot be undone."
    confirmText="Delete Account"
    onConfirm={handleDeleteAccount}
    onCancel={() => setShowDeleteModal(false)}
    loading={deleting}
/>

        </div>
    );
};

export default Profile;