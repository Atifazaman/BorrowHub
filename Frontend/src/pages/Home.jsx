import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [radius, setRadius] = useState(5000);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ================= GET LOCATION =================

    const getLocation = () => {
        if (!navigator.geolocation) {
            setMessage("Location is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const longitude = position.coords.longitude;
                const latitude = position.coords.latitude;

                setLocation({
                    longitude,
                    latitude
                });

                setMessage("");
            },
            () => {
                setMessage(
                    "Please allow location access to find nearby items"
                );
            }
        );
    };

    // ================= GET NEARBY ITEMS =================

    const getNearbyItems = async () => {
        if (!location) {
            setMessage("Please allow your location first");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await api.get("/items/nearby", {
                params: {
                    longitude: location.longitude,
                    latitude: location.latitude,
                    distance: radius,
                    search: search.trim()
                }
            });

            setItems(response.data.items || []);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to fetch nearby items"
            );
        } finally {
            setLoading(false);
        }
    };
const updateSuggestions = (value) => {
    setSearch(value);

    if (!value.trim()) {
        setSuggestions([]);
        return;
    }

    const searchText = value.toLowerCase();

    const matchedSuggestions = items
        .flatMap((item) => [
            item.title,
            item.category
        ])
        .filter(
            (value, index, array) =>
                value &&
                value.toLowerCase().includes(searchText) &&
                array.indexOf(value) === index
        )
        .slice(0, 6);

    setSuggestions(matchedSuggestions);
};

    useEffect(() => {
        getLocation();
    }, []);

    // ================= FETCH WHEN RADIUS CHANGES =================

    useEffect(() => {
        if (location) {
            getNearbyItems();
        }
    }, [location, radius]);

    // ================= SEARCH AUTOMATICALLY =================

useEffect(() => {
    if (!location) return;

    const timer = setTimeout(() => {
        getNearbyItems();
    }, 400);

    return () => clearTimeout(timer);
}, [search]);

    // ================= CLEAR SEARCH =================

    const clearSearch = () => {
        setSearch("");

        if (location) {
            setTimeout(() => {
                getNearbyItems();
            }, 0);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f5f7ff]">



            <section className="w-full px-4 pb-14 pt-6 sm:px-6 lg:px-8">

               

                <div className="relative w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111827] via-[#1c2440] to-[#312e81] px-6 py-10 text-white shadow-xl sm:px-10 md:px-14 md:py-14 lg:px-16">


<div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-500/20" />

<div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-500/20" />



                    {/* Hero Content */}

                    <div className="relative w-full">

                        {/* Badge */}

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-violet-200 backdrop-blur-sm">

                            <span className="h-2 w-2 rounded-full bg-violet-400" />

                            SHARE • BORROW • REUSE

                        </div>


                        {/* Heading */}

                        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">

                            Find what you need,

                            <span className="block text-violet-400">
                                right near you.
                            </span>

                        </h1>


                        {/* Description */}

                        <p className="mt-5 max-w-3xl text-base leading-7 text-gray-300 sm:text-lg">

                            Borrow everyday items from people around you
                            instead of buying things you may rarely use.
                            Save money, reduce waste, and share with your community.

                        </p>


                        {/* Feature Pills */}

                        <div className="mt-8 flex flex-wrap gap-3">

                            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-gray-200 backdrop-blur-sm">

                                <span>
                                    📍
                                </span>

                                Nearby items

                            </div>


                            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-gray-200 backdrop-blur-sm">

                                <span>
                                    🤝
                                </span>

                                Local community

                            </div>


                            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-gray-200 backdrop-blur-sm">

                                <span>
                                    ♻️
                                </span>

                                Reuse & save

                            </div>

                        </div>

                    </div>

                </div>

                <div className="relative z-10 -mt-7 w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-6">

                    <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_auto] lg:items-end">

                        {/* ================= SEARCH ================= */}

                        <div className="w-full">

                            <div className="mb-2 flex items-center gap-2">

                                <span className="text-lg">
                                    🔎
                                </span>

                                <label className="text-sm font-semibold text-gray-800">
                                    Search item
                                </label>

                            </div>


                            <div className="relative">

                                <input
                                    type="text"
                                    value={search}
                                   onChange={(e) => updateSuggestions(e.target.value)}
                                    placeholder="What are you looking for?"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-12 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                />


                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                )}

                                 {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => {
                        setSearch(suggestion);
                        setSuggestions([]);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    )}

                            </div>

                        </div>


                        {/* ================= RADIUS ================= */}

                        <div className="w-full">

                            <div className="mb-2 flex items-center gap-2">

                                <span className="text-lg">
                                    📍
                                </span>

                                <label className="text-sm font-semibold text-gray-800">
                                    Search radius
                                </label>

                            </div>


                            <select
                                value={radius}
                                onChange={(e) =>
                                    setRadius(Number(e.target.value))
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-medium text-gray-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                            >

                                <option value={1000}>
                                    Within 1 km
                                </option>

                                <option value={5000}>
                                    Within 5 km
                                </option>

                                <option value={10000}>
                                    Within 10 km
                                </option>

                                <option value={20000}>
                                    Within 20 km
                                </option>

                            </select>

                        </div>


                        {/* ================= LOCATION ================= */}

                        <button
                            onClick={getLocation}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md lg:w-auto"
                        >

                            <span>
                                📍
                            </span>

                            Use My Location

                        </button>

                    </div>

                </div>

                {message && (
                    <div className="mt-6 flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">

                        <span>
                            ⚠️
                        </span>

                        {message}

                    </div>
                )}


                <div className="mt-12 w-full">

                    {/* ================= SECTION HEADER ================= */}

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                                Discover nearby
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                                Items Near You
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Available items from your local community
                            </p>

                        </div>


                        <div className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">

                            {items.length}

                            {items.length === 1
                                ? " item"
                                : " items"}

                        </div>

                    </div>

                    {search && !loading && (
                        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">

                            <span>
                                Search results for
                            </span>

                            <span className="rounded-lg bg-violet-100 px-3 py-1 font-semibold text-violet-700">

                                "{search}"

                            </span>

                        </div>
                    )}

                    {loading ? (

                        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">

                            <div className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-violet-600" />

                            <p className="font-medium text-gray-700">
                                Finding items near you...
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                                Checking your selected radius
                            </p>

                        </div>

                    ) : items.length === 0 ? (

                        <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">
                                📦
                            </div>


                            <h3 className="mt-5 text-xl font-bold text-gray-800">

                                {search
                                    ? "No matching items found"
                                    : "No items found"}

                            </h3>


                            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">

                                {search
                                    ? `We couldn't find "${search}" within your selected radius. Try another item or increase the search radius.`
                                    : "There are no available items within this radius. Try increasing your search radius to discover more."}

                            </p>


                            <div className="mt-6 flex flex-wrap justify-center gap-3">

                                {search && (
                                    <button
                                        onClick={clearSearch}
                                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Clear Search
                                    </button>
                                )}


                                <button
                                    onClick={() => setRadius(10000)}
                                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                                >
                                    Search within 10 km
                                </button>

                            </div>

                        </div>

                    ) : (

                    

<div className="grid w-full gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:px-10">

    {items.map((item) => (

        <div
            key={item._id}
            className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-violet-100 "
        >


            <div className="relative h-50 overflow-hidden bg-gradient-to-br from-violet-50 via-white to-indigo-50">

                {item.images && item.images.length > 0 ? (

                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-110"
                    />

                ) : (

                    <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 text-4xl">
                            📦
                        </div>
                    </div>

                )}

                {/* Image overlay */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                {/* Category */}

                <div className="absolute left-4 top-4">

                    <span className="inline-flex items-center rounded-full border border-violet-100 bg-white/95 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
                        {item.category}
                    </span>

                </div>

            </div>


            {/* ================= CARD CONTENT ================= */}

            <div className="p-5">

                {/* Title */}

                <h3 className="line-clamp-1 text-lg font-bold text-gray-900 transition-colors duration-200 group-hover:text-violet-700">
                    {item.title}
                </h3>


                {/* Description */}

                <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-500">
                    {item.description}
                </p>


                {/* Price */}

                <div className="mt-5 flex items-end justify-between">

                    <div>

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Rental price
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                            ₹{item.price}

                            <span className="ml-1 text-sm font-normal text-gray-400">
                                / {item.priceUnit}
                            </span>
                        </p>

                    </div>

                    {/* Availability */}

                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                        Available
                    </span>

                </div>


                {/* ================= OWNER ================= */}

                <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700 ring-4 ring-violet-50">

                        {item.owner?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}

                    </div>


                    <div className="min-w-0">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Listed by
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-800">
                            {item.owner?.name || "Unknown"}
                        </p>

                    </div>

                </div>


                {/* ================= VIEW BUTTON ================= */}

                <button 
    onClick={() => 
        navigate(`/items/${item._id}`) 
    } 
    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-violet-600 " 
> 
    <span>
        View Item
    </span>

    <span className="transition-transform duration-300 group-hover:translate-x-1">
        →
    </span>
</button>

            </div>

        </div>

    ))}

</div>

                    )}

                </div>

            </section>

        </div>
    );
};

export default Home;