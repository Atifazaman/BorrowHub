import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

const Transactions = () => {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedTransactionId, setSelectedTransactionId] = useState(null);
const [deleting, setDeleting] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = currentUser?._id || currentUser?.id;

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                "/transactions/my-transactions"
            );

            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // ---------------- STATUS ----------------

    const statusConfig = {
        payment_pending: {
            label: "Payment Pending",
            className: "bg-orange-50 text-orange-700 border-orange-200",
            dot: "bg-orange-500"
        },

        paid: {
            label: "Paid",
            className: "bg-blue-50 text-blue-700 border-blue-200",
            dot: "bg-blue-500"
        },

        pickup_scheduled: {
            label: "Pickup Scheduled",
            className: "bg-indigo-50 text-indigo-700 border-indigo-200",
            dot: "bg-indigo-500"
        },

        handed_over: {
            label: "Handed Over",
            className: "bg-purple-50 text-purple-700 border-purple-200",
            dot: "bg-purple-500"
        },

        borrowed: {
            label: "Borrowed",
            className: "bg-violet-50 text-violet-700 border-violet-200",
            dot: "bg-violet-500"
        },

        returned: {
            label: "Returned",
            className: "bg-cyan-50 text-cyan-700 border-cyan-200",
            dot: "bg-cyan-500"
        },

        completed: {
            label: "Completed",
            className: "bg-green-50 text-green-700 border-green-200",
            dot: "bg-green-500"
        }
    };

    const getStatusConfig = (status) => {
        return (
            statusConfig[status] || {
                label: status,
                className: "bg-gray-50 text-gray-700 border-gray-200",
                dot: "bg-gray-500"
            }
        );
    };

    // ---------------- FILTER ----------------

    const isActive = (status) => {
        return [
            "payment_pending",
            "paid",
            "pickup_scheduled",
            "handed_over",
            "borrowed"
        ].includes(status);
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            if (filter === "active") {
                return isActive(transaction.status);
            }

            if (filter === "completed") {
                return transaction.status === "completed";
            }

            return true;
        });
    }, [transactions, filter]);

    // ---------------- ROLE ----------------

    const getRole = (transaction) => {
        const borrowerId =
            typeof transaction.borrower === "object"
                ? transaction.borrower?._id
                : transaction.borrower;

        return borrowerId?.toString() === currentUserId?.toString()
            ? "Borrower"
            : "Owner";
    };

    const getOtherPerson = (transaction) => {
        const role = getRole(transaction);

        if (role === "Borrower") {
            return transaction.owner?.name || "Owner";
        }

        return transaction.borrower?.name || "Borrower";
    };

    // ---------------- DATE ----------------

    const formatDate = (date) => {
        if (!date) {
            return "Not scheduled";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (date) => {
        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // ---------------- PAYMENT ----------------

    const getPaymentMethod = (method) => {
        if (method === "cash") {
            return "Cash on Pickup";
        }

        if (method === "razorpay") {
            return "Razorpay";
        }

        return "Not Selected";
    };

    // ---------------- DELETE ----------------

 const handleDeleteClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowDeleteModal(true);
};

const handleDelete = async () => {
    if (!selectedTransactionId) {
        return;
    }

    try {
        setDeleting(true);

        await api.delete(
            `/transactions/${selectedTransactionId}`
        );

        setTransactions((prev) =>
            prev.filter(
                (transaction) =>
                    transaction._id !== selectedTransactionId
            )
        );

        toast.success("Transaction deleted successfully");

        setShowDeleteModal(false);
        setSelectedTransactionId(null);

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Failed to delete transaction"
        );
    } finally {
        setDeleting(false);
    }
};
    // ---------------- COUNTS ----------------

    const totalTransactions = transactions.length;

    const activeTransactions = transactions.filter((transaction) =>
        isActive(transaction.status)
    ).length;

    const completedTransactions = transactions.filter(
        (transaction) => transaction.status === "completed"
    ).length;

    // ---------------- LOADING ----------------

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center px-4">
                <div className="rounded-2xl bg-white px-8 py-7 shadow-sm border border-gray-100 text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600"></div>

                    <p className="text-sm font-medium text-gray-600">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7ff] px-4 py-7 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">

                {/* ================= HEADER ================= */}

                <div className="mb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                                BorrowHub Activity
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Transactions
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                                Manage your borrowing, lending, payments,
                                pickups and completed transactions in one place.
                            </p>
                        </div>

                        <button
                            onClick={fetchTransactions}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            <span className="text-base">↻</span>
                            Refresh
                        </button>

                    </div>
                </div>

                {/* ================= SUMMARY CARDS ================= */}

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {/* Total */}

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Total Transactions
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {totalTransactions}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                                📋
                            </div>

                        </div>
                    </div>

                    {/* Active */}

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {activeTransactions}
                                </p>
                            </div>

                        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
    <span className="absolute h-5 w-5 rounded-full border-2 border-red-300"></span>
    <span className="absolute h-3.5 w-3.5 rounded-full border-2 border-red-400"></span>
    <span className="h-2 w-2 rounded-full bg-red-500"></span>
</div>

                        </div>
                    </div>

                    {/* Completed */}

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Completed
                                </p>

                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {completedTransactions}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                                ✓
                            </div>

                        </div>
                    </div>

                </div>

                {/* ================= FILTER BAR ================= */}

                <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">

                    <div className="flex flex-wrap gap-2">

                        <button
                            onClick={() => setFilter("all")}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                filter === "all"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            All
                            <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                    filter === "all"
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                {totalTransactions}
                            </span>
                        </button>

                        <button
                            onClick={() => setFilter("active")}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                filter === "active"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            Active
                            <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                    filter === "active"
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                {activeTransactions}
                            </span>
                        </button>

                        <button
                            onClick={() => setFilter("completed")}
                            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                filter === "completed"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            Completed
                            <span
                                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                    filter === "completed"
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                {completedTransactions}
                            </span>
                        </button>

                    </div>

                </div>

                {/* ================= EMPTY STATE ================= */}

                {filteredTransactions.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                            📋
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            No transactions found
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Your transaction activity will appear here once
                            you start borrowing or lending items.
                        </p>

                    </div>
                ) : (

                    /* ================= TRANSACTION LIST ================= */

                    <div className="space-y-5">

                        {filteredTransactions.map((transaction) => {

                            const role = getRole(transaction);
                            const otherPerson = getOtherPerson(transaction);
                            const status = getStatusConfig(transaction.status);

                            return (
                                <div
                                    key={transaction._id}
                                    className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >

                                    {/* Top colored line */}

                                    <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400"></div>

                                    <div className="p-5 sm:p-6">

                                        {/* ================= TOP ================= */}

                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                            <div className="flex gap-4">

                                                {/* Item icon */}

                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 text-2xl">
                                                    📦
                                                </div>

                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                                        {transaction.item?.title || "Item"}
                                                    </h2>

                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">

                                                        <span>
                                                            {transaction.item?.category || "Category"}
                                                        </span>

                                                        <span className="text-gray-300">
                                                            •
                                                        </span>

                                                        <span>
                                                            Transaction
                                                        </span>

                                                    </div>

                                                    <p className="mt-2 text-xs text-gray-400">
                                                        Created {formatDateTime(transaction.createdAt)}
                                                    </p>
                                                </div>

                                            </div>

                                            {/* Status */}

                                            <span
                                                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${status.className}`}
                                            >
                                                <span
                                                    className={`h-2 w-2 rounded-full ${status.dot}`}
                                                ></span>

                                                {status.label}
                                            </span>

                                        </div>

                                        {/* ================= INFORMATION GRID ================= */}

                                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                            {/* Role */}

                                            <div className="rounded-2xl bg-gray-50 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Your Role
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {role === "Borrower"
                                                            ? "🤝"
                                                            : "🏠"}
                                                    </span>

                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {role}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Other person */}

                                            <div className="rounded-2xl bg-gray-50 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    {role === "Borrower"
                                                        ? "Owner"
                                                        : "Borrower"}
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                                                        {otherPerson
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "U"}
                                                    </div>

                                                    <p className="truncate text-sm font-semibold text-gray-800">
                                                        {otherPerson}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price */}

                                            <div className="rounded-2xl bg-gray-50 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Rental Price
                                                </p>

                                                <p className="mt-2 text-sm font-bold text-gray-800">
                                                    ₹{transaction.item?.price || 0}

                                                    {transaction.item?.priceUnit && (
                                                        <span className="ml-1 font-medium text-gray-400">
                                                            / {transaction.item.priceUnit}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Payment */}

                                            <div className="rounded-2xl bg-gray-50 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    Payment
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-base">
                                                        {transaction.paymentMethod === "cash"
                                                            ? "💵"
                                                            : transaction.paymentMethod === "razorpay"
                                                                ? "💳"
                                                                : "—"}
                                                    </span>

                                                    <p className="truncate text-sm font-semibold text-gray-800">
                                                        {getPaymentMethod(
                                                            transaction.paymentMethod
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                        </div>

                                        {/* ================= DATES ================= */}

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                                                    📅
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">
                                                        Pickup Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        {formatDate(
                                                            transaction.pickupDate
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
                                                    ↩
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-gray-400">
                                                        Return Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-gray-800">
                                                        {formatDate(
                                                            transaction.returnDate
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                        </div>

                                        {/* ================= FOOTER ================= */}

                                        <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                            <div>
                                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                                    Transaction ID
                                                </p>

                                                <p className="mt-1 max-w-[280px] truncate font-mono text-xs text-gray-500">
                                                    {transaction._id}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3">

                                                {/* View */}

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/transactions/${transaction._id}`
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 active:scale-[0.98]"
                                                >
                                                    View Details
                                                    <span>→</span>
                                                </button>

                                                {/* Delete completed */}

                                                {transaction.status === "completed" && (
                                                    <button
                                                       onClick={() => handleDeleteClick(transaction._id)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                )}

                                            </div>

                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
            <ConfirmModal
    open={showDeleteModal}
    title="Delete this transaction?"
    message="Are you sure you want to permanently delete this completed transaction? This action cannot be undone."
    confirmText="Delete Transaction"
    onConfirm={handleDelete}
    onCancel={() => {
        if (!deleting) {
            setShowDeleteModal(false);
            setSelectedTransactionId(null);
        }
    }}
    loading={deleting}
/>
        </div>
    );
};

export default Transactions;