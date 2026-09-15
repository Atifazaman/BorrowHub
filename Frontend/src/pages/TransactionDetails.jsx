import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function TransactionDetails() {
    const { transactionId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [schedulingPickup, setSchedulingPickup] = useState(false);

    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectingPayment, setSelectingPayment] = useState(false);
    

    useEffect(() => {
        fetchTransaction();
    }, [transactionId]);

   const fetchTransaction = async () => {
    try {
        const response = await api.get("/transactions/my-transactions");

        const foundTransaction = response.data.transactions.find(
            (item) => item._id === transactionId
        );

        if (!foundTransaction) {
            toast.error("Transaction not found");
            return;
        }

        setTransaction(foundTransaction);

        if (foundTransaction.pickupDate) {
            const date = new Date(foundTransaction.pickupDate);

            setPickupDate(date.toISOString().split("T")[0]);
            setPickupTime(
                date.toTimeString().slice(0, 5)
            );
        }
    } catch (error) {
        console.log(error);

        toast.error("Unable to load transaction");
    } finally {
        setLoading(false);
    }
};
    // ================= PAYMENT METHOD =================

    const handlePaymentMethod = async (paymentMethod) => {
    try {
        setSelectingPayment(true);

        await api.put(
            `/transactions/${transactionId}/payment-method`,
            {
                paymentMethod
            }
        );

        await fetchTransaction();

        toast.success("Payment method selected successfully");

    } catch (error) {
        console.log(error);

        toast.error(
            error.response?.data?.message ||
            "Unable to select payment method"
        );
    } finally {
        setSelectingPayment(false);
    }
};

    // ================= SCHEDULE PICKUP =================

    const handleSchedulePickup = async () => {
    if (!pickupDate || !pickupTime) {
        toast.error("Please select pickup date and time");
        return;
    }

    try {
        setSchedulingPickup(true);

        const pickupDateTime = `${pickupDate}T${pickupTime}`;

        await api.put(
            `/transactions/${transactionId}/status`,
            {
                status: "pickup_scheduled",
                pickupDate: pickupDateTime
            }
        );

        await fetchTransaction();

        toast.success("Pickup scheduled successfully");

    } catch (error) {
        console.log(error);

        toast.error(
            error.response?.data?.message ||
            "Unable to schedule pickup"
        );
    } finally {
        setSchedulingPickup(false);
    }
};

    // ================= UPDATE STATUS =================

    const handleUpdateStatus = async (status) => {
    try {
        await api.put(
            `/transactions/${transactionId}/status`,
            {
                status
            }
        );

        await fetchTransaction();

        toast.success("Transaction status updated successfully");

    } catch (error) {
        console.log(error);

        toast.error(
            error.response?.data?.message ||
            "Unable to update transaction"
        );
    }
};
   const handleConfirmReceived = async () => {
    try {
        await api.put(`/transactions/${transaction._id}/status`, {
            status: "borrowed"
        });

        await fetchTransaction();

        toast.success("Item received successfully");

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Failed to confirm item received"
        );
    }
};
const handleReturnItem = async () => {
    try {
        await api.put(`/transactions/${transaction._id}/status`, {
            status: "returned",
            returnDate: new Date()
        });

        await fetchTransaction();

        toast.success("Item returned successfully");

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Failed to return item"
        );
    }
};

const handleCompleteTransaction = async () => {
    try {
        await api.put(`/transactions/${transaction._id}/status`, {
            status: "completed"
        });

        await fetchTransaction();

        toast.success("Transaction completed successfully");

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Failed to complete transaction"
        );
    }
};

    // ================= LOADING =================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center">
                <p className="text-gray-600">
                    Loading transaction...
                </p>
            </div>
        );
    }

    // ================= NOT FOUND =================

   if (!transaction) {
    return (
        <div className="min-h-screen bg-[#f5f7ff] p-6">

            <button
                onClick={() => navigate(-1)}
                className="text-indigo-600 font-medium"
            >
                ← Back
            </button>

            <div className="max-w-xl mx-auto mt-10 bg-white rounded-3xl p-8 shadow-sm text-center">

                <p className="text-gray-500">
                    Transaction not found.
                </p>

            </div>

        </div>
    );
}

    // ================= USER CHECK =================

    const currentUserId = user?._id || user?.id;

    const borrowerId =
        typeof transaction.borrower === "object"
            ? transaction.borrower?._id
            : transaction.borrower;

    const isBorrower =
        borrowerId?.toString() ===
        currentUserId?.toString();

    const isPaymentPending =
        transaction.status === "payment_pending";

    // ================= UI =================

    return (
        <div className="min-h-screen bg-[#f5f7ff] px-4 py-8">

            <div className="max-w-4xl mx-auto">

                {/* BACK */}

                <button
                    onClick={() => navigate(-1)}
                    className="text-indigo-600 font-medium mb-6"
                >
                    ← Back
                </button>

                {/* HEADER */}

                <div className="mb-6">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Transaction Details
                    </h1>

                    <p className="text-gray-500 mt-1">
                        View your borrowing transaction
                    </p>

                </div>

                <div className="bg-white rounded-3xl shadow-sm p-6">

                    {/* ================= ITEM ================= */}

                    <div className="border-b pb-6">

                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Item
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            {transaction.item?.title || "Item"}
                        </h2>

                        <p className="text-gray-500 mt-1">
                            {transaction.item?.category || ""}
                        </p>

                    </div>

                    {/* ================= TRANSACTION INFORMATION ================= */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">

                        {/* PRICE */}

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs text-gray-500 uppercase">
                                Price
                            </p>

                            <p className="text-lg font-bold text-gray-900 mt-1">
                                ₹{transaction.item?.price || 0} /{" "}
                                {transaction.item?.priceUnit || ""}
                            </p>

                        </div>

                        {/* STATUS */}

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs text-gray-500 uppercase">
                                Status
                            </p>

                            <p className="text-lg font-bold text-indigo-600 mt-1">
                                {transaction.status
                                    .replaceAll("_", " ")
                                    .replace(/\b\w/g, (letter) =>
                                        letter.toUpperCase()
                                    )}
                            </p>

                        </div>

                        {/* OWNER */}

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs text-gray-500 uppercase">
                                Owner
                            </p>

                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                {transaction.owner?.name || "Owner"}
                            </p>

                            {transaction.owner?.phone && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {transaction.owner.phone}
                                </p>
                            )}

                        </div>

                        {/* BORROWER */}

                        <div className="bg-gray-50 rounded-2xl p-4">

                            <p className="text-xs text-gray-500 uppercase">
                                Borrower
                            </p>

                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                {transaction.borrower?.name || "Borrower"}
                            </p>

                            {transaction.borrower?.phone && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {transaction.borrower.phone}
                                </p>
                            )}

                        </div>

                    </div>

                    {/* ================= PAYMENT ================= */}

                    {isBorrower && isPaymentPending && (

                        <div className="border-t pt-6">

                            <h3 className="text-xl font-bold text-gray-900">
                                Choose Payment Method
                            </h3>

                            <p className="text-sm text-gray-500 mt-1 mb-5">
                                Select how you want to pay for this item.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* CASH */}

                                <button
                                    onClick={() =>
                                        handlePaymentMethod("cash")
                                    }
                                    disabled={selectingPayment}
                                    className="border-2 border-gray-200 rounded-2xl p-5 text-left hover:border-indigo-500 hover:bg-indigo-50 transition disabled:opacity-50"
                                >

                                    <div className="text-3xl">
                                        💵
                                    </div>

                                    <h4 className="font-bold text-gray-900 mt-3">
                                        Cash on Pickup
                                    </h4>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Pay the owner when you pick up the
                                        item.
                                    </p>

                                </button>

                                {/* RAZORPAY */}

                                <button
                                    onClick={() =>
                                        handlePaymentMethod("razorpay")
                                    }
                                    disabled={selectingPayment}
                                    className="border-2 border-gray-200 rounded-2xl p-5 text-left hover:border-indigo-500 hover:bg-indigo-50 transition disabled:opacity-50"
                                >

                                    <div className="text-3xl">
                                        💳
                                    </div>

                                    <h4 className="font-bold text-gray-900 mt-3">
                                        Razorpay
                                    </h4>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Pay securely online using Razorpay.
                                    </p>

                                </button>

                            </div>

                        </div>

                    )}

                    {/* ================= SELECTED PAYMENT ================= */}

                    {transaction.paymentMethod && (

                        <div className="border-t pt-6 mt-6">

                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Payment Method
                            </p>

                            <p className="text-lg font-bold text-gray-900 mt-2">

                                {transaction.paymentMethod === "cash"
                                    ? "💵 Cash on Pickup"
                                    : "💳 Razorpay"}

                            </p>

                        </div>

                    )}

                   

                    {/* ================================================= */}
                    {/* PICKUP LOCATION + SCHEDULE */}
                    {/* ================================================= */}

                    {isBorrower &&
                        transaction.paymentMethod === "cash" &&
                        transaction.status === "payment_pending" &&
                        transaction.item?.location?.coordinates && (

                            <div className="border-t mt-6 pt-6">

                                <h3 className="text-xl font-bold text-gray-900">
                                    Pickup Location
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Your payment method has been selected.
                                    Choose a date and time to schedule your
                                    pickup.
                                </p>

                                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-5">

                                    {/* LOCATION */}

                                    <div className="flex items-start gap-3">

                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
                                            📍
                                        </div>

                                        <div className="flex-1">

                                            <p className="font-semibold text-gray-900">
                                                Owner's Pickup Location
                                            </p>

                                            <p className="text-sm text-gray-600 mt-1">
                                                Location is available for
                                                pickup.
                                            </p>

                                            <button
                                                onClick={() => {

                                                    const [
                                                        longitude,
                                                        latitude
                                                    ] =
                                                        transaction.item.location.coordinates;

                                                    window.open(
                                                        `https://www.google.com/maps?q=${latitude},${longitude}`,
                                                        "_blank"
                                                    );

                                                }}
                                                className="mt-4 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                                            >
                                                📍 View on Map
                                            </button>

                                        </div>

                                    </div>

                                    {/* SCHEDULE */}

                                    <div className="mt-6 border-t border-indigo-100 pt-5">

                                        <h4 className="font-bold text-gray-900">
                                            Schedule Pickup
                                        </h4>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Select the date and time when you
                                            want to pick up the item.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                                            {/* DATE */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pickup Date
                                                </label>

                                                <input
                                                    type="date"
                                                    value={pickupDate}
                                                    onChange={(e) =>
                                                        setPickupDate(
                                                            e.target.value
                                                        )
                                                    }
                                                    min={
                                                        new Date()
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />

                                            </div>

                                            {/* TIME */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pickup Time
                                                </label>

                                                <input
                                                    type="time"
                                                    value={pickupTime}
                                                    onChange={(e) =>
                                                        setPickupTime(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />

                                            </div>

                                        </div>

                                        <button
                                            onClick={handleSchedulePickup}
                                            disabled={schedulingPickup}
                                            className="mt-4 bg-violet-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-violet-700 transition disabled:opacity-50"
                                        >
                                            {schedulingPickup
                                                ? "Scheduling..."
                                                : "Schedule Pickup"}
                                        </button>

                                    </div>

                                </div>

                            </div>

                        )}

                    {/* ================= SCHEDULED PICKUP ================= */}

                    {transaction.pickupDate && (

                        <div className="border-t mt-6 pt-6">

                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Scheduled Pickup
                            </p>

                            <p className="font-semibold text-gray-900 mt-2">

                                {new Date(
                                    transaction.pickupDate
                                ).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                })}

                            </p>

                        </div>

                    )}

                    {/* ================= CASH PAYMENT CONFIRMATION ================= */}

                    {transaction.paymentMethod === "cash" &&
                        transaction.status === "pickup_scheduled" &&
                        !isBorrower && (

                            <div className="border-t mt-6 pt-6">

                                <h3 className="text-xl font-bold text-gray-900">
                                    Confirm Cash Payment
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Confirm that you have received the cash
                                    payment from the borrower.
                                </p>

                                <button
                                    onClick={() =>
                                        handleUpdateStatus("paid")
                                    }
                                    className="mt-4 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                                >
                                    ✓ Confirm Cash Received
                                </button>

                            </div>

                        )}

                    {/* ================= HAND OVER ITEM ================= */}

                    {transaction.status === "paid" &&
                        !isBorrower && (

                            <div className="border-t mt-6 pt-6">

                                <h3 className="text-xl font-bold text-gray-900">
                                    Hand Over Item
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Confirm when you have handed over the item
                                    to the borrower.
                                </p>

                                <button
                                    onClick={() =>
                                        handleUpdateStatus("handed_over")
                                    }
                                    className="mt-4 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                                >
                                    ✓ Mark Item as Handed Over
                                </button>

                            </div>

                        )}

                        {isBorrower && transaction.status === "handed_over" && (
    <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-5">
        <h3 className="text-lg font-semibold text-gray-800">
            Confirm Item Received
        </h3>

        <p className="mt-2 text-sm text-gray-600">
            The owner has handed over the item. Confirm once you have received it.
        </p>

        <button
            onClick={handleConfirmReceived}
            className="mt-4 rounded-lg bg-purple-600 px-5 py-2.5 font-medium text-white hover:bg-purple-700"
        >
            Confirm Item Received
        </button>
    </div>
)}

{isBorrower && transaction.status === "borrowed" && (
    <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
        <h3 className="text-lg font-semibold text-gray-800">
            Return Item
        </h3>

        <p className="mt-2 text-sm text-gray-600">
            Return the item to the owner and confirm the return.
        </p>

        <button
            onClick={handleReturnItem}
            className="mt-4 rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white hover:bg-orange-700"
        >
            Mark as Returned
        </button>
    </div>
)}

{!isBorrower && transaction.status === "returned" && (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
        <h3 className="text-lg font-semibold text-gray-800">
            Confirm Return
        </h3>

        <p className="mt-2 text-sm text-gray-600">
            Confirm that you have received the item back from the borrower.
        </p>

        <button
            onClick={handleCompleteTransaction}
            className="mt-4 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
        >
            Confirm Return
        </button>
    </div>
)}

                    {/* ================= TRANSACTION ID ================= */}

                    <div className="border-t mt-6 pt-6">

                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Transaction ID
                        </p>

                        <p className="text-sm text-gray-700 mt-2 break-all">
                            {transaction._id}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default TransactionDetails;