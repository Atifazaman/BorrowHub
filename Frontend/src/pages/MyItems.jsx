import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import api from "../services/api";

const MyItems = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const getMyItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/items/my-items");

      setItems(response.data.items || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to fetch your items",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!selectedItem) {
      return;
    }

    try {
      setDeleting(true);

      const response = await api.delete(`/items/${selectedItem._id}`);

      toast.success(response.data.message || "Item deleted successfully");

      setItems((previousItems) =>
        previousItems.filter((item) => item._id !== selectedItem._id),
      );

      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete item");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    getMyItems();
  }, []);

  // ---------------------------------------
  // STATS
  // ---------------------------------------

  const totalItems = items.length;

  const availableItems = items.filter(
    (item) => item.status === "available",
  ).length;

  const borrowedItems = items.filter(
    (item) => item.status === "borrowed",
  ).length;

  // ---------------------------------------
  // LOADING
  // ---------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto"></div>

          <p className="text-gray-600 mt-4 text-sm">Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7ff]">
      {/* ================================= */}
      {/* HERO */}
      {/* ================================= */}

      <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1c2440] to-[#312e81] text-white shadow-xl">
        {/* Background decoration */}

        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-violet-500/20"></div>

        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/20"></div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Hero content */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-green-300"></span>

                <span className="text-xs font-medium text-white">
                  BorrowHub
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-4">
                My Items
              </h1>

              <p className="mt-3 text-sm sm:text-base text-violet-100 max-w-xl leading-6">
                Manage the items you have shared with your community and keep
                track of what is currently available or borrowed.
              </p>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Total */}

              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 min-w-[95px]">
                <p className="text-xs uppercase tracking-wide text-violet-200">
                  Total
                </p>

                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {totalItems}
                </p>

                <p className="text-xs text-violet-200 mt-1">Items</p>
              </div>

              {/* Available */}

              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 min-w-[95px]">
                <p className="text-xs uppercase tracking-wide text-green-200">
                  Available
                </p>

                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {availableItems}
                </p>

                <p className="text-xs text-green-200 mt-1">Ready</p>
              </div>

              {/* Borrowed */}

              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-4 min-w-[95px]">
                <p className="text-xs uppercase tracking-wide text-orange-200">
                  Borrowed
                </p>

                <p className="text-2xl sm:text-3xl font-bold mt-1">
                  {borrowedItems}
                </p>

                <p className="text-xs text-orange-200 mt-1">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* MAIN */}
      {/* ================================= */}

      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
        {/* Page header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Shared Items
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Items you've added to BorrowHub
            </p>
          </div>

          <button
            onClick={() => navigate("/add-item")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition"
          >
            <span className="text-lg leading-none">+</span>
            Add Item
          </button>
        </div>

        {/* ================================= */}
        {/* EMPTY STATE */}
        {/* ================================= */}

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 sm:p-16 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
              <span className="text-3xl">📦</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-6">
              You haven't added any items
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
              Share something useful with people in your community and start
              borrowing and lending.
            </p>

            <button
              onClick={() => navigate("/add-item")}
              className="mt-6 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          /* ================================= */
          /* ITEM CARDS */
          /* ================================= */

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isBorrowed = item.status === "borrowed";

              return (
                <div
                  key={item._id}
                  className="group bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Top accent */}

                  <div
                    className={`h-1.5 ${
                      isBorrowed
                        ? "bg-gradient-to-r from-orange-400 via-orange-500 to-red-400"
                        : "bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500"
                    }`}
                  ></div>

                  {/* IMAGE */}

                  <div className="relative h-56 bg-gray-50 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}

                    {/* STATUS */}

                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-sm ${
                          isBorrowed
                            ? "bg-orange-50/95 text-orange-700 border-orange-200"
                            : "bg-green-50/95 text-green-700 border-green-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isBorrowed ? "bg-orange-500" : "bg-green-500"
                          }`}
                        ></span>

                        {isBorrowed ? "Borrowed" : "Available"}
                      </span>
                    </div>

                    {/* CATEGORY */}

                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-violet-700 border border-white shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-5">
                    {/* TITLE */}

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {item.title}
                      </h3>
                    </div>

                    {/* DESCRIPTION */}

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-5">
                      {item.description}
                    </p>

                    {/* PRICE */}

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                          Rental Price
                        </p>

                        <p className="text-xl font-bold text-gray-900 mt-1">
                          ₹{item.price}
                          <span className="text-sm font-normal text-gray-500">
                            {" "}
                            / {item.priceUnit}
                          </span>
                        </p>
                      </div>

                      {/* Borrowed indicator */}

                      {isBorrowed && (
                        <div className="flex items-center gap-1.5 text-orange-600">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>

                          <span className="text-xs font-semibold">
                            Currently lent
                          </span>
                        </div>
                      )}
                    </div>

                    {/* DIVIDER */}

                    <div className="border-t border-gray-100 my-5"></div>

                    {/* ACTIONS */}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/items/${item._id}`)}
                        className="py-2.5 rounded-xl bg-[#161e30] hover:bg-[#252d49] text-white text-sm font-semibold active:scale-[0.98] transition"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDeleteModal(true);
                        }}
                        disabled={isBorrowed}
                        className="py-2.5 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 text-sm font-semibold active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>

                    {/* BORROWED MESSAGE */}

                    {isBorrowed && (
                      <div className="mt-3 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2.5">
                        <p className="text-xs text-orange-700 text-center font-medium">
                          This item is currently with a borrower
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete this item?"
        message={
          <>
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-700">
              {selectedItem?.title}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmText="Delete Item"
        onConfirm={deleteItem}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        loading={deleting}
      />
    </div>
  );
};

export default MyItems;
