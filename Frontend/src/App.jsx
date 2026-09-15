import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AddItem from "./pages/AddItem";
import MyItems from "./pages/MyItems";
import BorrowRequests from "./pages/BorrowRequests";
import MyBorrowedItems from "./pages/MyBorrowedItems";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import ItemDetails from "./pages/ItemDetails";
import TransactionDetails from "./pages/TransactionDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="light"
    toastClassName="!rounded-2xl !bg-white !text-gray-800 !shadow-xl !border !border-violet-100"
    bodyClassName="!text-sm !font-medium"
    progressClassName="!bg-violet-600"
/>

            <Routes>
                {/* Public Routes */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* Protected Routes */}

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/add-item"
                    element={
                        <ProtectedRoute>
                            <AddItem />
                        </ProtectedRoute>
                    }
                />
               <Route
    path="/items/:itemId/edit"
    element={
        <ProtectedRoute>
            <AddItem />
        </ProtectedRoute>
    }
/>
                <Route
                    path="/my-items"
                    element={
                        <ProtectedRoute>
                            <MyItems />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/borrow-requests"
                    element={
                        <ProtectedRoute>
                            <BorrowRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-borrowed-items"
                    element={
                        <ProtectedRoute>
                            <MyBorrowedItems />
                        </ProtectedRoute>
                    }
                />

                <Route
    path="/transactions/:transactionId"
    element={
        <ProtectedRoute>
            <TransactionDetails />
        </ProtectedRoute>
    }
/>

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <Transactions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
    path="/items/:itemId"
    element={
        <ProtectedRoute>
            <ItemDetails />
        </ProtectedRoute>
    }
/>

            </Routes>
        </BrowserRouter>
    );
}

export default App;