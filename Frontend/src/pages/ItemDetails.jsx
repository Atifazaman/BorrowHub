import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);

  const { user } = useAuth();

  const getItem = async () => {
    try {
      const response = await api.get(`/items/${itemId}`);

      setItem(response.data.item);
      setSelectedImage(0);
    } catch (error) {
      console.log(error);

      setMessage(error.response?.data?.message || "Unable to load item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/items/${itemId}`);

      navigate("/my-items");
    } catch (error) {
      console.log(error);

      setMessage(error.response?.data?.message || "Unable to delete item");
    }
  };

  const checkBorrowRequest = async () => {
    try {
      const response = await api.get(`/borrow-requests/item/${itemId}`);

      setRequestStatus(response.data.status);
    } catch (error) {
      console.log(error);
    }
  };

 const handleBorrowRequest = async () => {
  try {
    setMessage("");

    await api.post("/borrow-requests", {
      itemId,
    });

    setRequestStatus("pending");
    setMessage("Borrow request sent successfully");

  } catch (error) {
    console.log(error);

    setMessage(
      error.response?.data?.message || "Unable to send borrow request",
    );
  }
};

useEffect(() => {
    (getItem(), checkBorrowRequest());
  }, [itemId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">{message || "Item not found"}</p>
      </div>
    );
  }

  const images = item.images || [];

const ownerId =
    typeof item.owner === "object"
        ? item.owner?._id
        : item.owner;

const currentUserId = user?._id || user?.id;

const isOwner =
    ownerId?.toString() === currentUserId?.toString();

  

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back
        </button>

        {/* Main Product Section */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[90px_1fr_420px] gap-6">
            {/* LEFT - THUMBNAILS */}

            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                                        flex-shrink-0
                                        w-20 h-20
                                        rounded-xl
                                        overflow-hidden
                                        border-2
                                        transition
                                        ${
                                          selectedImage === index
                                            ? "border-indigo-600"
                                            : "border-gray-200 hover:border-indigo-400"
                                        }
                                    `}
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* MIDDLE - LARGE IMAGE */}

            <div className="flex items-center justify-center bg-gray-50 rounded-2xl min-h-[450px]">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={item.title}
                  className="max-h-[550px] max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>

            {/* RIGHT - PRODUCT DETAILS */}

            <div className="flex flex-col">
              {/* Category */}

              <span className="text-sm font-medium text-indigo-600 mb-3">
                {item.category}
              </span>

              {/* Title */}

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.title}
              </h1>

              {/* Price */}

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{item.price}
                </span>

                <span className="text-gray-500 ml-2">/ {item.priceUnit}</span>
              </div>

              {/* Status */}

              <div className="mb-6">
                <span
                  className={`
                                        inline-flex
                                        px-3
                                        py-1
                                        rounded-full
                                        text-sm
                                        font-medium
                                        ${
                                          item.status === "available"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                        }
                                    `}
                >
                  {item.status === "available"
                    ? "Available"
                    : "Currently Borrowed"}
                </span>
              </div>

              {/* Description */}

              <div className="border-t border-gray-200 pt-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>

                <p className="text-gray-600 leading-7">{item.description}</p>
              </div>

              {/* Owner */}

              <div className="border-t border-gray-200 pt-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Item Owner
                </h2>

                <p className="text-gray-700">{item.owner?.name || "Unknown"}</p>
              </div>

              {/* Message */}

              {message && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {message}
                </div>
              )}

              {/* ACTIONS */}

              <div className="mt-auto">
                {isOwner ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/items/${itemId}/edit`)}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                    >
                      Edit Item
                    </button>

                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBorrowRequest}
                    disabled={
                      item.status !== "available" ||
                      requestStatus === "pending" ||
                      requestStatus === "accepted"
                    }
                    className={`
        w-full
        py-3
        rounded-xl
        font-semibold
        transition
        ${
          item.status === "available" &&
          requestStatus !== "pending" &&
          requestStatus !== "accepted"
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }
    `}
                  >
                    {requestStatus === "pending" || requestStatus === "accepted"
                      ? "Already Sent Request"
                      : item.status === "available"
                        ? "Request to Borrow"
                        : "Currently Unavailable"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
