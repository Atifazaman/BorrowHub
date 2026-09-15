import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

const BorrowRequests = () => {
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [activeSection, setActiveSection] = useState("received");

    const [receivedFilter, setReceivedFilter] = useState("pending");
    const [sentFilter, setSentFilter] = useState("pending");

    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const [selectedRequests, setSelectedRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const [receivedResponse, sentResponse] =
                await Promise.all([
                    api.get("/borrow-requests/my-requests"),
                    api.get("/borrow-requests/my-sent-requests")
                ]);

            setReceivedRequests(
                receivedResponse.data.requests || []
            );

            setSentRequests(
                sentResponse.data.requests || []
            );
        } catch (error) {
           toast.error(
    error.response?.data?.message ||
    "Unable to fetch borrow requests"
);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId) => {
        try {
            setProcessingId(requestId);

            const response = await api.put(`/borrow-requests/${requestId}/accept`);

             toast.success(response.data.message);

            setSelectedRequests((prev) =>
                prev.filter((id) => id !== requestId)
            );

            await fetchRequests();
        } catch (error) {
            toast.error(
            error.response?.data?.message ||
            "Unable to accept request"
        );
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId) => {
        try {
            setProcessingId(requestId);

            const response = await api.put(`/borrow-requests/${requestId}/reject`);

            toast.success(response.data.message);

            setSelectedRequests((prev) =>
                prev.filter((id) => id !== requestId)
            );

            await fetchRequests();
        } catch (error) {
               toast.error(
            error.response?.data?.message ||
            "Unable to reject request"
        );
        } finally {
            setProcessingId(null);
        }
    };

    const toggleSelectRequest = (requestId) => {
        setSelectedRequests((prev) => {
            if (prev.includes(requestId)) {
                return prev.filter((id) => id !== requestId);
            }

            return [...prev, requestId];
        });
    };

   const handleDeleteSelected = async () => {
    if (selectedRequests.length === 0) {
        return;
    }

    try {
        setProcessingId("delete-selected");

        await Promise.all(
            selectedRequests.map((requestId) =>
                api.delete(`/borrow-requests/${requestId}`)
            )
        );

        setSelectedRequests([]);
        setShowDeleteModal(false);

        toast.success(
            "Selected requests deleted successfully."
        );

        await fetchRequests();
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to delete selected requests"
        );
    } finally {
        setProcessingId(null);
    }
};

    const filterRequests = (requests, filter) => {
        if (filter === "all") {
            return requests;
        }

        return requests.filter(
            (request) => request.status === filter
        );
    };

    const filteredReceivedRequests = filterRequests(
        receivedRequests,
        receivedFilter
    );

    const filteredSentRequests = filterRequests(
        sentRequests,
        sentFilter
    );

    const pendingReceivedCount = receivedRequests.filter(
        (request) => request.status === "pending"
    ).length;

    const pendingSentCount = sentRequests.filter(
        (request) => request.status === "pending"
    ).length;

    const acceptedCount =
        receivedRequests.filter(
            (request) => request.status === "accepted"
        ).length +
        sentRequests.filter(
            (request) => request.status === "accepted"
        ).length;


    const totalRequests =
        receivedRequests.length + sentRequests.length;

    const getStatusStyle = (status) => {
        if (status === "accepted") {
            return "bg-green-50 text-green-700 border-green-200";
        }

        if (status === "rejected") {
            return "bg-red-50 text-red-600 border-red-200";
        }

        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    };

    const getStatusDot = (status) => {
        if (status === "accepted") {
            return "bg-green-500";
        }

        if (status === "rejected") {
            return "bg-red-500";
        }

        return "bg-yellow-500";
    };

    const getFilterCount = (requests, filter) => {
        if (filter === "all") {
            return requests.length;
        }

        return requests.filter(
            (request) => request.status === filter
        ).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center">

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-7 text-center">

                    <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600 font-medium">
                        Loading borrow requests...
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

                <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-violet-500/20"></div>

                <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/20"></div>

                <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-12">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                        {/* Hero text */}

                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5">

                                <span className="h-2 w-2 rounded-full bg-violet-300"></span>

                                <span className="text-xs font-medium text-violet-100">
                                    BORROWHUB
                                </span>

                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-4">
                                Borrow Requests
                            </h1>

                            <p className="mt-3 text-sm sm:text-base text-violet-100 max-w-xl leading-6">
                                Manage requests for your items and keep
                                track of the items you want to borrow.
                            </p>

                        </div>

                        {/* Stats */}

                        <div className="grid grid-cols-3 gap-3 sm:gap-4">

                            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 min-w-[95px]">

                                <p className="text-xs uppercase tracking-wide text-violet-200">
                                    Total
                                </p>

                                <p className="text-2xl sm:text-3xl font-bold mt-1">
                                    {totalRequests}
                                </p>

                                <p className="text-xs text-violet-200 mt-1">
                                    Requests
                                </p>

                            </div>

                            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 min-w-[95px]">

                                <p className="text-xs uppercase tracking-wide text-yellow-200">
                                    Pending
                                </p>

                                <p className="text-2xl sm:text-3xl font-bold mt-1">
                                    {pendingReceivedCount +
                                        pendingSentCount}
                                </p>

                                <p className="text-xs text-yellow-200 mt-1">
                                    Waiting
                                </p>

                            </div>

                            <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 min-w-[95px]">

                                <p className="text-xs uppercase tracking-wide text-green-200">
                                    Accepted
                                </p>

                                <p className="text-2xl sm:text-3xl font-bold mt-1">
                                    {acceptedCount}
                                </p>

                                <p className="text-xs text-green-200 mt-1">
                                    Approved
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ========================================= */}
            {/* MAIN */}
            {/* ========================================= */}

            <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8">

                {/* ========================================= */}
                {/* MAIN TABS */}
                {/* ========================================= */}

                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">

                    <div className="grid grid-cols-2 gap-1">

                        <button
                            onClick={() => {
                                setActiveSection("received");
                                setSelectedRequests([]);
                            }}
                            className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                                activeSection === "received"
                                    ? "bg-violet-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >

                            Requests for My Items

                            {pendingReceivedCount > 0 && (
                                <span
                                    className={`ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-xs ${
                                        activeSection === "received"
                                            ? "bg-white text-violet-600"
                                            : "bg-violet-100 text-violet-700"
                                    }`}
                                >
                                    {pendingReceivedCount}
                                </span>
                            )}

                        </button>

                        <button
                            onClick={() => {
                                setActiveSection("sent");
                                setSelectedRequests([]);
                            }}
                            className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${
                                activeSection === "sent"
                                    ? "bg-violet-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >

                            Requests I Sent

                            {pendingSentCount > 0 && (
                                <span
                                    className={`ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-xs ${
                                        activeSection === "sent"
                                            ? "bg-white text-violet-600"
                                            : "bg-violet-100 text-violet-700"
                                    }`}
                                >
                                    {pendingSentCount}
                                </span>
                            )}

                        </button>

                    </div>

                </div>

                {/* ========================================= */}
                {/* RECEIVED REQUESTS */}
                {/* ========================================= */}

                {activeSection === "received" && (
                    <section>

                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-900">
                                    Requests for My Items
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    People who want to borrow your items.
                                </p>

                            </div>

                            <div className="flex flex-wrap items-center gap-3">

                                {selectedRequests.length > 0 && (
                                    <button
                                         onClick={() => setShowDeleteModal(true)}
                                        disabled={
                                            processingId ===
                                            "delete-selected"
                                        }
                                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processingId ===
                                        "delete-selected"
                                            ? "Deleting..."
                                            : `Delete Selected (${selectedRequests.length})`}
                                    </button>
                                )}

                                <div className="relative">

                                    <select
                                        value={receivedFilter}
                                        onChange={(e) => {
                                            setReceivedFilter(
                                                e.target.value
                                            );
                                            setSelectedRequests([]);
                                        }}
                                        className="appearance-none w-full sm:w-48 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-700 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                    >
                                        <option value="pending">
                                            Pending (
                                            {getFilterCount(
                                                receivedRequests,
                                                "pending"
                                            )}
                                            )
                                        </option>

                                        <option value="accepted">
                                            Accepted (
                                            {getFilterCount(
                                                receivedRequests,
                                                "accepted"
                                            )}
                                            )
                                        </option>

                                        <option value="rejected">
                                            Rejected (
                                            {getFilterCount(
                                                receivedRequests,
                                                "rejected"
                                            )}
                                            )
                                        </option>

                                        <option value="all">
                                            All ({receivedRequests.length})
                                        </option>
                                    </select>

                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                        ▼
                                    </span>

                                </div>

                            </div>

                        </div>

                        {filteredReceivedRequests.length === 0 ? (

                            <EmptyState
                                text={`No ${
                                    receivedFilter === "all"
                                        ? ""
                                        : receivedFilter
                                } requests`}
                            />

                        ) : (

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {filteredReceivedRequests.map(
                                    (request) => (
                                        <RequestCard
                                            key={request._id}
                                            request={request}
                                            type="received"
                                            selectedRequests={
                                                selectedRequests
                                            }
                                            toggleSelectRequest={
                                                toggleSelectRequest
                                            }
                                            handleAccept={
                                                handleAccept
                                            }
                                            handleReject={
                                                handleReject
                                            }
                                            processingId={
                                                processingId
                                            }
                                            getStatusStyle={
                                                getStatusStyle
                                            }
                                            getStatusDot={
                                                getStatusDot
                                            }
                                        />
                                    )
                                )}

                            </div>

                        )}

                    </section>
                )}

                {/* ========================================= */}
                {/* SENT REQUESTS */}
                {/* ========================================= */}

                {activeSection === "sent" && (
                    <section>

                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-900">
                                    Requests I Sent
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Track the items you requested to borrow.
                                </p>

                            </div>

                            <div className="flex flex-wrap items-center gap-3">

                                {selectedRequests.length > 0 && (
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={
                                            processingId ===
                                            "delete-selected"
                                        }
                                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processingId ===
                                        "delete-selected"
                                            ? "Deleting..."
                                            : `Delete Selected (${selectedRequests.length})`}
                                    </button>
                                )}

                                <div className="relative">

                                    <select
                                        value={sentFilter}
                                        onChange={(e) => {
                                            setSentFilter(
                                                e.target.value
                                            );
                                            setSelectedRequests([]);
                                        }}
                                        className="appearance-none w-full sm:w-48 cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-700 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                    >
                                        <option value="pending">
                                            Pending (
                                            {getFilterCount(
                                                sentRequests,
                                                "pending"
                                            )}
                                            )
                                        </option>

                                        <option value="accepted">
                                            Accepted (
                                            {getFilterCount(
                                                sentRequests,
                                                "accepted"
                                            )}
                                            )
                                        </option>

                                        <option value="rejected">
                                            Rejected (
                                            {getFilterCount(
                                                sentRequests,
                                                "rejected"
                                            )}
                                            )
                                        </option>

                                        <option value="all">
                                            All ({sentRequests.length})
                                        </option>
                                    </select>

                                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                        ▼
                                    </span>

                                </div>

                            </div>

                        </div>

                        {filteredSentRequests.length === 0 ? (

                            <EmptyState
                                text={`No ${
                                    sentFilter === "all"
                                        ? ""
                                        : sentFilter
                                } requests`}
                            />

                        ) : (

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                {filteredSentRequests.map(
                                    (request) => (
                                        <RequestCard
                                            key={request._id}
                                            request={request}
                                            type="sent"
                                            selectedRequests={
                                                selectedRequests
                                            }
                                            toggleSelectRequest={
                                                toggleSelectRequest
                                            }
                                            processingId={
                                                processingId
                                            }
                                            getStatusStyle={
                                                getStatusStyle
                                            }
                                            getStatusDot={
                                                getStatusDot
                                            }
                                        />
                                    )
                                )}

                            </div>

                        )}

                    </section>
                )}

            </main>

       <ConfirmModal
    open={showDeleteModal}
    title="Delete selected requests?"
    message="Are you sure you want to permanently delete the selected borrow requests? This action cannot be undone."
    confirmText="Delete Requests"
    onConfirm={handleDeleteSelected}
    onCancel={() => setShowDeleteModal(false)}
    loading={processingId === "delete-selected"}
/>

        </div>
    );
};


/* ================================================= */
/* EMPTY STATE */
/* ================================================= */

const EmptyState = ({ text }) => {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100">

                <div className="relative h-8 w-8 rounded-full border-2 border-violet-400">

                    <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500"></span>

                </div>

            </div>

            <h3 className="text-xl font-bold text-gray-900">
                {text}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                There are no requests matching this status.
            </p>

        </div>
    );
};


/* ================================================= */
/* REQUEST CARD */
/* ================================================= */

const RequestCard = ({
    request,
    type,
    selectedRequests,
    toggleSelectRequest,
    handleAccept,
    handleReject,
    processingId,
    getStatusStyle,
    getStatusDot
}) => {

    const isSelected = selectedRequests.includes(
        request._id
    );

    const isReceived = type === "received";

    return (
        <div
            className={`group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isSelected
                    ? "border-violet-400 ring-2 ring-violet-100"
                    : "border-gray-200"
            }`}
        >

            {/* Top accent */}

            <div
                className={`h-1.5 ${
                    request.status === "accepted"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : request.status === "rejected"
                        ? "bg-gradient-to-r from-red-400 to-rose-500"
                        : "bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500"
                }`}
            ></div>

            <div className="p-5">

                {/* Header */}

                <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-3">

                            {/* Checkbox */}

                            <button
                                type="button"
                                onClick={() =>
                                    toggleSelectRequest(
                                        request._id
                                    )
                                }
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                                    isSelected
                                        ? "border-violet-600 bg-violet-600"
                                        : "border-violet-300 bg-white hover:border-violet-500 hover:bg-violet-50"
                                }`}
                            >
                                {isSelected && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-white"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m5 12 4 4L19 6"
                                        />
                                    </svg>
                                )}
                            </button>

                            <div className="min-w-0">

                                <h3 className="truncate text-lg font-bold text-gray-900">
                                    {request.item?.title}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {request.item?.category}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Status */}

                    <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                            request.status
                        )}`}
                    >

                        <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                request.status
                            )}`}
                        ></span>

                        {request.status}

                    </span>

                </div>

                {/* Price */}

                <div className="mt-5 rounded-2xl bg-gray-50 p-4">

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Rental Price
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                        ₹{request.item?.price}

                        <span className="text-sm font-normal text-gray-500">
                            {" "} / {request.item?.priceUnit}
                        </span>
                    </p>

                </div>

                {/* Person */}

                <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">

                    <span className="text-sm text-gray-500">
                        {isReceived ? "Borrower" : "Owner"}
                    </span>

                    <span className="max-w-[55%] truncate text-sm font-semibold text-gray-800">
                        {isReceived
                            ? request.borrower?.name
                            : request.owner?.name}
                    </span>

                </div>

                {/* RECEIVED ACTIONS */}

                {isReceived &&
                    request.status === "pending" && (

                        <div className="mt-5 grid grid-cols-2 gap-3">

                            <button
                                onClick={() =>
                                    handleAccept(
                                        request._id
                                    )
                                }
                                disabled={
                                    processingId ===
                                    request._id
                                }
                                className="rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processingId ===
                                request._id
                                    ? "Processing..."
                                    : "Accept"}
                            </button>

                            <button
                                onClick={() =>
                                    handleReject(
                                        request._id
                                    )
                                }
                                disabled={
                                    processingId ===
                                    request._id
                                }
                                className="rounded-xl border border-red-200 bg-white py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Reject
                            </button>

                        </div>
                    )}

                {/* RECEIVED ACCEPTED */}

                {isReceived &&
                    request.status === "accepted" && (

                        <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">

                            <div className="flex items-center gap-2">

                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                                    ✓
                                </span>

                                <p className="text-sm font-semibold text-green-700">
                                    This request has been accepted.
                                </p>

                            </div>

                        </div>
                    )}

                {/* RECEIVED REJECTED */}

                {isReceived &&
                    request.status === "rejected" && (

                        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                            <p className="text-sm font-semibold text-red-600">
                                This request was rejected.
                            </p>

                        </div>
                    )}

                {/* SENT PENDING */}

                {!isReceived &&
                    request.status === "pending" && (

                        <div className="mt-5 rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3">

                            <div className="flex items-center gap-2">

                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>

                                <p className="text-sm font-semibold text-yellow-700">
                                    Waiting for the owner to respond.
                                </p>

                            </div>

                        </div>
                    )}

                {/* SENT ACCEPTED */}

                {!isReceived &&
                    request.status === "accepted" && (

                        <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">

                            <div className="flex items-center gap-2">

                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                                    ✓
                                </span>

                                <p className="text-sm font-semibold text-green-700">
                                    Your request has been accepted.
                                </p>

                            </div>

                        </div>
                    )}

                {/* SENT REJECTED */}

                {!isReceived &&
                    request.status === "rejected" && (

                        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                            <p className="text-sm font-semibold text-red-600">
                                This request was rejected.
                            </p>

                        </div>
                    )}

            </div>

        </div>
    );
};

export default BorrowRequests;