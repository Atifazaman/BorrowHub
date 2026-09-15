import { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import api from "../services/api"; 
 
const MyBorrowedItems = () => { 
    const navigate = useNavigate(); 
    const { user } = useAuth(); 
 
    const [transactions, setTransactions] = useState([]); 
    const [loading, setLoading] = useState(true); 
 
    const [activeMode, setActiveMode] = useState("borrowing"); 
    const [viewType, setViewType] = useState("active"); 
 
    const [deleteId, setDeleteId] = useState(null); 
    const [deleting, setDeleting] = useState(false); 
 
    useEffect(() => { 
        fetchTransactions(); 
    }, []); 
 
    const fetchTransactions = async () => { 
        try { 
            const response = await api.get( 
                "/transactions/my-transactions" 
            ); 
 
            setTransactions( 
                response.data.transactions || [] 
            ); 
        } catch (error) { 
            console.log(error); 
        } finally { 
            setLoading(false); 
        } 
    }; 
 
    const currentUserId = user?._id || user?.id; 
 
    // --------------------------------------- 
    // BORROWING TRANSACTIONS 
    // --------------------------------------- 
 
    const borrowedTransactions = transactions.filter( 
        (transaction) => 
            transaction.borrower?._id?.toString() === 
                currentUserId?.toString() || 
            transaction.borrower?.toString() === 
                currentUserId?.toString() 
    ); 
 
    // --------------------------------------- 
    // LENDING TRANSACTIONS 
    // --------------------------------------- 
 
    const lentTransactions = transactions.filter( 
        (transaction) => 
            transaction.owner?._id?.toString() === 
                currentUserId?.toString() || 
            transaction.owner?.toString() === 
                currentUserId?.toString() 
    ); 
 
    // --------------------------------------- 
    // ACTIVE / HISTORY 
    // --------------------------------------- 
 
 const activeStatuses = [ 
    "payment_pending", 
    "paid", 
    "pickup_scheduled", 
    "handed_over", 
    "borrowed" 
]; 
 
    const historyStatuses = [ 
        "returned", 
        "completed" 
    ]; 
 
    const activeBorrowing = borrowedTransactions.filter( 
        (transaction) => 
            activeStatuses.includes( 
                transaction.status 
            ) 
    ); 
 
    const borrowingHistory = borrowedTransactions.filter( 
        (transaction) => 
            historyStatuses.includes( 
                transaction.status 
            ) 
    ); 
 
    const currentlyLent = lentTransactions.filter( 
        (transaction) => 
            activeStatuses.includes( 
                transaction.status 
            ) 
    ); 
 
    const lendingHistory = lentTransactions.filter( 
        (transaction) => 
            historyStatuses.includes( 
                transaction.status 
            ) 
    ); 
 
    // --------------------------------------- 
    // CURRENT DATA 
    // --------------------------------------- 
 
    const currentTransactions = 
        activeMode === "borrowing" 
            ? viewType === "active" 
                ? activeBorrowing 
                : borrowingHistory 
            : viewType === "active" 
                ? currentlyLent 
                : lendingHistory; 
 
    // --------------------------------------- 
    // PAGE TITLES 
    // --------------------------------------- 
 
    const pageTitle = 
        activeMode === "borrowing" 
            ? viewType === "active" 
                ? "Active Borrowing" 
                : "Borrowing History" 
            : viewType === "active" 
                ? "Currently Lent" 
                : "Lending History"; 
 
    const pageDescription = 
        activeMode === "borrowing" 
            ? viewType === "active" 
                ? "Items you are currently borrowing from other users." 
                : "Items you previously borrowed and returned." 
            : viewType === "active" 
                ? "Your items that are currently with other borrowers." 
                : "Your items that were previously borrowed and returned."; 
 
    // --------------------------------------- 
    // STATUS FORMAT 
    // --------------------------------------- 
 
    const formatStatus = (status) => { 
        return status 
            ?.replaceAll("_", " ") 
            .replace(/\b\w/g, (letter) => 
                letter.toUpperCase() 
            ); 
    }; 
 
   const getStatusStyle = (status) => { 
    switch (status) { 
        case "payment_pending": 
            return "bg-yellow-50 text-yellow-700 border-yellow-100"; 
 
        case "paid": 
            return "bg-green-50 text-green-700 border-green-100"; 
 
        case "pickup_scheduled": 
            return "bg-purple-50 text-purple-700 border-purple-100"; 
 
        case "handed_over": 
            return "bg-indigo-50 text-indigo-700 border-indigo-100"; 
 
        case "borrowed": 
            return "bg-orange-50 text-orange-700 border-orange-100"; 
 
        case "returned": 
            return "bg-green-50 text-green-700 border-green-100"; 
 
        case "completed": 
            return "bg-emerald-50 text-emerald-700 border-emerald-100"; 
 
        default: 
            return "bg-gray-50 text-gray-700 border-gray-100"; 
    } 
}; 
 
    // --------------------------------------- 
    // DELETE TRANSACTION 
    // --------------------------------------- 
 
    const handleDelete = async () => { 
        if (!deleteId) { 
            return; 
        } 
 
        try { 
            setDeleting(true); 
 
            await api.delete( 
                `/transactions/${deleteId}` 
            ); 
 
            setTransactions((previous) => 
                previous.filter( 
                    (transaction) => 
                        transaction._id !== deleteId 
                ) 
            ); 
 
            setDeleteId(null); 
 
        } catch (error) { 
            console.log(error); 
 
            alert( 
                error.response?.data?.message || 
                "Unable to delete transaction" 
            ); 
        } finally { 
            setDeleting(false); 
        } 
    }; 
 
    // --------------------------------------- 
    // TRANSACTION CARD 
    // --------------------------------------- 
 
    const TransactionCard = ({ transaction }) => { 
        const item = transaction.item; 
 
        const isHistory = 
            viewType === "history"; 
 
        const person = 
            activeMode === "borrowing" 
                ? transaction.owner 
                : transaction.borrower; 
 
        return ( 
            <div className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"> 
 
                {/* Top accent */} 
                <div className="h-1.5 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500"></div> 
 
                <div className="p-5 sm:p-6"> 
 
                    {/* Header */} 
                    <div className="flex items-start justify-between gap-4"> 
 
                        <div className="flex items-start gap-3 min-w-0"> 
 
                            {/* Item Icon */} 
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center"> 
 
                                <span className="text-xl"> 
                                    📦 
                                </span> 
 
                            </div> 
 
                            <div className="min-w-0"> 
 
                                <h3 className="text-lg font-bold text-gray-900 truncate"> 
                                    {item?.title || "Item"} 
                                </h3> 
 
                                <p className="text-sm text-gray-500 mt-1"> 
                                    {item?.category || "Category"} 
                                </p> 
 
                            </div> 
 
                        </div> 
 
                        {/* Status */} 
                        <span 
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap ${getStatusStyle( 
                                transaction.status 
                            )}`} 
                        > 
                            {formatStatus( 
                                transaction.status 
                            )} 
                        </span> 
 
                    </div> 
 
                    {/* Divider */} 
                    <div className="border-t border-gray-100 my-5"></div> 
 
                    {/* Price + Transaction */} 
                    <div className="grid grid-cols-2 gap-4"> 
 
                        <div className="bg-gray-50 rounded-2xl p-4"> 
 
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide"> 
                                Price 
                            </p> 
 
                            <p className="text-lg font-bold text-gray-900 mt-1"> 
                                ₹{item?.price || 0} 
                            </p> 
 
                            <p className="text-xs text-gray-500"> 
                                per {item?.priceUnit || "day"} 
                            </p> 
 
                        </div> 
 
                        <div className="bg-gray-50 rounded-2xl p-4"> 
 
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide"> 
                                Transaction 
                            </p> 
 
                            <p className="text-sm font-semibold text-gray-800 mt-2"> 
                                #{transaction._id?.slice(-6)} 
                            </p> 
 
                        </div> 
 
                    </div> 
 
                    {/* Payment Method */} 
<div className="mt-4 bg-gray-50 rounded-2xl p-4"> 
 
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide"> 
        Payment Method 
    </p> 
 
   <p className="text-sm font-semibold text-gray-800 mt-2"> 
    {transaction.paymentMethod === "cash" 
        ? "💵 Cash on Pickup" 
        : transaction.paymentMethod === "razorpay" 
            ? "💳 Razorpay" 
            : "Not selected"} 
</p> 
 
</div> 
 
                    {/* Person */} 
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 p-4"> 
 
                        <div className="flex items-center gap-3"> 
 
                            <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold"> 
                                {person?.name 
                                    ?.charAt(0) 
                                    ?.toUpperCase() || "U"} 
                            </div> 
 
                            <div className="flex-1 min-w-0"> 
 
                                <p className="text-xs text-violet-600 font-semibold uppercase tracking-wide"> 
                                    {activeMode === "borrowing" 
                                        ? "Owner" 
                                        : "Borrower"} 
                                </p> 
 
                                <p className="font-semibold text-gray-800 truncate mt-0.5"> 
                                    {person?.name || 
                                        "Not available"} 
                                </p> 
 
                            </div> 
 
                            {person?.phone && ( 
                                <div className="text-sm text-gray-600"> 
                                    📞 
                                </div> 
                            )} 
 
                        </div> 
 
                        {person?.phone && ( 
                            <p className="text-sm text-gray-600 mt-3 pl-13"> 
                                {person.phone} 
                            </p> 
                        )} 
 
                    </div> 
{/* Pickup Date */} 
{transaction.paymentMethod && transaction.pickupDate && ( 
    <div className="mt-4 flex items-center gap-3"> 
 
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"> 
            📅 
        </div> 
 
        <div> 
 
            <p className="text-xs text-gray-500"> 
                Pickup Date 
            </p> 
 
            <p className="text-sm font-medium text-gray-800"> 
                {new Date( 
                    transaction.pickupDate 
                ).toLocaleDateString()} 
            </p> 
 
        </div> 
 
    </div> 
)} 
 
{/* Pickup Location */} 
{transaction.paymentMethod && 
    item?.location?.coordinates && ( 
        <div className="mt-4 flex items-center gap-3"> 
 
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"> 
                📍 
            </div> 
 
            <div className="flex-1"> 
 
                <p className="text-xs text-gray-500"> 
                    Pickup Location 
                </p> 
 
                <button 
                    onClick={() => 
                        navigate( 
                            `/transactions/${transaction._id}` 
                        ) 
                    } 
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700 mt-1" 
                > 
                    View Pickup Location → 
                </button> 
 
            </div> 
 
        </div> 
    )} 
     
    </div> 
 
                {/* Footer */} 
                <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100"> 
 
                    <div 
                        className={`grid ${ 
                            isHistory 
                                ? "grid-cols-2" 
                                : "grid-cols-1" 
                        } gap-3`} 
                    > 
 
                        <button 
                            onClick={() => 
                                navigate( 
                                    `/transactions/${transaction._id}` 
                                ) 
                            } 
                            className="py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition" 
                        > 
                            View Details 
                        </button> 
 
                        {isHistory && ( 
                            <button 
                                onClick={() => 
                                    setDeleteId( 
                                        transaction._id 
                                    ) 
                                } 
                                className="py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 active:scale-[0.98] transition" 
                            > 
                                Delete 
                            </button> 
                        )} 
 
                    </div> 
 
                </div> 
 
            </div> 
        ); 
    }; 
 
    // --------------------------------------- 
    // LOADING 
    // --------------------------------------- 
 
    if (loading) { 
        return ( 
            <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center"> 
 
                <div className="text-center"> 
 
                    <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto"></div> 
 
                    <p className="text-gray-600 mt-4 text-sm"> 
                        Loading your transactions... 
                    </p> 
 
                </div> 
 
            </div> 
        ); 
    } 
 
    // --------------------------------------- 
    // MAIN UI 
    // --------------------------------------- 
 
    return ( 
        <div className="min-h-screen bg-[#f5f7ff]"> 
 
            {/* Hero */}
<div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1c2440] to-[#312e81] px-10 py-6 text-white shadow-xl">

    {/* Background decoration */}
    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-500/20"></div>
    <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-500/20"></div>

    <div className="relative w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            {/* Hero content */}
            <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 mb-4">

                    <span className="h-2 w-2 rounded-full bg-green-300"></span>

                    <span className="text-xs sm:text-sm font-medium text-white">
                        BorrowHub Activity
                    </span>

                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                    Borrow & Lend
                </h1>

                <p className="mt-3 max-w-xl text-sm sm:text-base leading-6 text-violet-100">
                    Manage everything you borrow and lend from one place.
                    Track active items, completed transactions and your lending history.
                </p>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[300px]">

                {/* Borrowing */}
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-5 py-4">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-violet-200">
                                Borrowing
                            </p>

                            <p className="mt-1 text-2xl sm:text-3xl font-bold text-white">
                                {activeBorrowing.length}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">

                            <span className="text-lg text-white">
                                ↙
                            </span>

                        </div>

                    </div>

                    <p className="mt-2 text-xs text-violet-200">
                        Active items
                    </p>

                </div>

                {/* Lending */}
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-5 py-4">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">
                                Lending
                            </p>

                            <p className="mt-1 text-2xl sm:text-3xl font-bold text-white">
                                {currentlyLent.length}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">

                            <span className="text-lg text-white">
                                ↗
                            </span>

                        </div>

                    </div>

                    <p className="mt-2 text-xs text-indigo-200">
                        Currently lent
                    </p>

                </div>

            </div>

        </div>

    </div>

</div>
 
            {/* Main */} 
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8"> 
 
                {/* Main Switch */} 
                <div className="bg-white rounded-2xl border border-gray-200 p-1.5 shadow-sm max-w-md"> 
 
                    <div className="grid grid-cols-2 gap-1"> 
 
                        <button 
                            onClick={() => { 
                                setActiveMode( 
                                    "borrowing" 
                                ); 
                                setViewType("active"); 
                            }} 
                            className={`relative py-3 rounded-xl text-sm font-semibold transition-all ${ 
                                activeMode === 
                                "borrowing" 
                                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md" 
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50" 
                            }`} 
                        > 
                            <span className="mr-2"> 
                                ↙ 
                            </span> 
                            Borrowing 
                        </button> 
 
                        <button 
                            onClick={() => { 
                                setActiveMode( 
                                    "lending" 
                                ); 
                                setViewType("active"); 
                            }} 
                            className={`relative py-3 rounded-xl text-sm font-semibold transition-all ${ 
                                activeMode === 
                                "lending" 
                                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md" 
                                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50" 
                            }`} 
                        > 
                            <span className="mr-2"> 
                                ↗ 
                            </span> 
                            Lending 
                        </button> 
 
                    </div> 
 
                </div> 
 
                {/* Content Header */} 
                <div className="mt-8 mb-6"> 
 
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> 
 
                        <div> 
 
                            <h2 className="text-2xl font-bold text-gray-900"> 
                                {pageTitle} 
                            </h2> 
 
                            <p className="text-sm text-gray-500 mt-1"> 
                                {pageDescription} 
                            </p> 
 
                        </div> 
 
                        {/* Dropdown */} 
                        <div className="relative"> 
 
                            <select 
                                value={viewType} 
                                onChange={(event) => 
                                    setViewType( 
                                        event.target.value 
                                    ) 
                                } 
                                className="appearance-none w-full sm:w-44 bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer" 
                            > 
                                <option value="active"> 
                                    Active 
                                </option> 
 
                                <option value="history"> 
                                    History 
                                </option> 
                            </select> 
 
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"> 
                                ▼ 
                            </div> 
 
                        </div> 
 
                    </div> 
 
                </div> 
 
                {/* Result count */} 
                <div className="flex items-center gap-2 mb-5"> 
 
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span> 
 
                    <p className="text-sm text-gray-500"> 
                        {currentTransactions.length}{" "} 
                        {currentTransactions.length === 1 
                            ? "transaction" 
                            : "transactions"} 
                    </p> 
 
                </div> 
 
                {/* Cards */} 
                {currentTransactions.length === 0 ? ( 
                    <div className="bg-white border border-gray-200 rounded-3xl p-10 sm:p-14 text-center shadow-sm"> 
 
                        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center"> 
 
                            <span className="text-3xl"> 
                                {activeMode === 
                                "borrowing" 
                                    ? "📦" 
                                    : "🏠"} 
                            </span> 
 
                        </div> 
 
                        <h3 className="text-lg font-bold text-gray-900 mt-5"> 
                            No transactions found 
                        </h3> 
 
                        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto"> 
                            {activeMode === 
                            "borrowing" 
                                ? viewType === 
                                  "active" 
                                    ? "You are not currently borrowing any items." 
                                    : "You don't have any previous borrowing history." 
                                : viewType === 
                                  "active" 
                                    ? "None of your items are currently lent." 
                                    : "You don't have any previous lending history."} 
                        </p> 
 
                    </div> 
                ) : ( 
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
 
                        {currentTransactions.map( 
                            (transaction) => ( 
                                <TransactionCard 
                                    key={ 
                                        transaction._id 
                                    } 
                                    transaction={ 
                                        transaction 
                                    } 
                                /> 
                            ) 
                        )} 
 
                    </div> 
                )} 
 
            </div> 
 
            {/* -------------------------------- */} 
            {/* DELETE MODAL */} 
            {/* -------------------------------- */} 
 
            {deleteId && ( 
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4"> 
 
                    {/* Overlay */} 
                    <div 
                        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" 
                        onClick={() => 
                            !deleting && 
                            setDeleteId(null) 
                        } 
                    ></div> 
 
                    {/* Modal */} 
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7"> 
 
                        {/* Icon */} 
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center"> 
 
                            <span className="text-2xl"> 
                                🗑️ 
                            </span> 
 
                        </div> 
 
                        <h2 className="text-xl font-bold text-gray-900 mt-5"> 
                            Delete this transaction? 
                        </h2> 
 
                        <p className="text-sm text-gray-500 leading-6 mt-2"> 
                            This will remove the transaction from your 
                            history. The original item will not be deleted 
                            from BorrowHub. 
                        </p> 
 
                        <div className="grid grid-cols-2 gap-3 mt-7"> 
 
                            <button 
                                onClick={() => 
                                    setDeleteId(null) 
                                } 
                                disabled={deleting} 
                                className="py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50" 
                            > 
                                Cancel 
                            </button> 
 
                            <button 
                                onClick={handleDelete} 
                                disabled={deleting} 
                                className="py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50" 
                            > 
                                {deleting 
                                    ? "Deleting..." 
                                    : "Yes, Delete"} 
                            </button> 
 
                        </div> 
 
                    </div> 
 
                </div> 
            )} 
 
        </div> 
    ); 
}; 
 
export default MyBorrowedItems; 