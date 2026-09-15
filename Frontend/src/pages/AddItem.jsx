import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const AddItem = () => {
  const navigate = useNavigate();

  const { itemId } = useParams();

  const isEditMode = Boolean(itemId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    priceUnit: "day",
  });

  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);

  const [existingImages, setExistingImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(false);

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
          latitude,
        });

        setMessage("Location detected successfully");
      },
      () => {
        setMessage("Please allow location access to add an item");
      }
    );
  };

  // ================= GET ITEM FOR EDIT =================

  const getItem = async () => {
    try {
      setFetchingItem(true);
      setMessage("");

      const response = await api.get(`/items/${itemId}`);

      const item = response.data.item;

      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        priceUnit: item.priceUnit,
      });

      setExistingImages(item.images || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load item");
    } finally {
      setFetchingItem(false);
    }
  };

  // ================= RESET / LOAD =================

  useEffect(() => {
    if (isEditMode) {
      getItem();
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        priceUnit: "day",
      });

      setImages([]);
      setExistingImages([]);
      setMessage("");

      getLocation();
    }
  }, [itemId, isEditMode]);

  // ================= INPUT CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= IMAGE SELECTION =================

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);

    if (selectedImages.length === 0) {
      return;
    }

    const totalImages =
      existingImages.length + images.length + selectedImages.length;

    if (totalImages > 4) {
      setMessage("You can upload maximum 4 images");
      e.target.value = "";
      return;
    }

    setImages((previousImages) => [...previousImages, ...selectedImages]);

    setMessage("");

    e.target.value = "";
  };

  // ================= REMOVE NEW IMAGE =================

  const removeNewImage = (index) => {
    setImages((previousImages) =>
      previousImages.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // ================= REMOVE EXISTING IMAGE =================

  const removeExistingImage = (index) => {
    setExistingImages((previousImages) =>
      previousImages.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalImages = existingImages.length + images.length;

    if (totalImages < 1) {
      setMessage("Please upload at least one image");
      return;
    }

    if (totalImages > 4) {
      setMessage("You can upload maximum 4 images");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("priceUnit", formData.priceUnit);

      // Add location for new item
      if (!isEditMode) {
        if (!location) {
          setMessage("Please allow location access before adding the item");
          setLoading(false);
          return;
        }

        data.append("longitude", location.longitude);
        data.append("latitude", location.latitude);
      }

      // Add new images
      images.forEach((image) => {
        data.append("images", image);
      });

      let response;

      if (isEditMode) {
        response = await api.put(`/items/${itemId}`, data);
      } else {
        response = await api.post("/items/add", data);
      }

      setMessage(response.data.message);

      setTimeout(() => {
        if (isEditMode) {
          navigate(`/items/${itemId}`);
        } else {
          navigate("/my-items");
        }
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOADING =================

  if (fetchingItem) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"></div>

          <p className="text-sm font-medium text-gray-500">
            Loading item...
          </p>
        </div>
      </div>
    );
  }

  // ================= PAGE =================

  return (
    <div className="min-h-screen bg-[#f5f7ff]">
      <main className="w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-8">

        {/* BACK BUTTON */}

        <button
          onClick={() => {
            if (isEditMode) {
              navigate(`/items/${itemId}`);
            } else {
              navigate("/my-items");
            }
          }}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-500 transition hover:bg-white hover:text-gray-900"
        >
          <span className="text-lg">←</span>
          Back
        </button>

        {/* MAIN CONTAINER */}

        <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.08)]">

          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">

            {/* ================================================= */}
            {/* LEFT SIDE */}
            {/* ================================================= */}

            <div className="relative bg-gradient-to-br from-[#f5f3ff] via-[#f8f7ff] to-[#eef2ff] p-6 sm:p-8 lg:p-12">

              {/* Decorative circles */}

              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-200/30 blur-2xl"></div>

              <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-200/30 blur-2xl"></div>

              <div className="relative">

                {/* BRAND */}

                <div className="mb-8">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-bold tracking-wider text-violet-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-violet-500"></span>
                    BORROWHUB
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {isEditMode ? "Edit your item" : "Share something useful"}
                  </h1>

                  <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                    {isEditMode
                      ? "Update your item details, pricing and pictures."
                      : "List an item and help someone nearby get what they need."}
                  </p>
                </div>

                {/* IMAGE SECTION */}

                <div className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Item pictures
                      </h2>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Add clear pictures of your item
                      </p>
                    </div>

                    <div className="rounded-xl bg-violet-100 px-3 py-2">
                      <span className="text-sm font-bold text-violet-700">
                        {existingImages.length + images.length}/4
                      </span>
                    </div>

                  </div>

                  {/* UPLOAD BOX */}

                  {existingImages.length + images.length < 4 && (
                    <label className="group flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 transition duration-200 hover:border-violet-400 hover:bg-violet-50">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md">
                        📷
                      </div>

                      <p className="mt-3 text-sm font-bold text-gray-700">
                        Add item pictures
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        JPG, PNG or WEBP • Maximum 4
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* IMAGE PREVIEW */}

                  {(existingImages.length > 0 || images.length > 0) && (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">

                      {/* EXISTING IMAGES */}

                      {existingImages.map((image, index) => (
                        <div
                          key={image}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm"
                        >

                          <img
                            src={image}
                            alt={`Item ${index + 1}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"></div>

                          {index === 0 && (
                            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-gray-800 shadow-sm backdrop-blur">
                              Main Image
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg text-white shadow-lg transition hover:scale-105 hover:bg-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* NEW IMAGES */}

                      {images.map((image, index) => (
                        <div
                          key={`${image.name}-${index}`}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm"
                        >

                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Selected ${index + 1}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"></div>

                          {existingImages.length === 0 && index === 0 && (
                            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-gray-800 shadow-sm backdrop-blur">
                              Main Image
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg text-white shadow-lg transition hover:scale-105 hover:bg-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                    </div>
                  )}

                  {/* IMAGE TIP */}

                  <div className="mt-5 flex gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                      💡
                    </div>

                    <p className="text-xs leading-5 text-gray-600">
                      Add clear pictures from different angles so borrowers
                      can easily understand the item's condition.
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* RIGHT SIDE */}
            {/* ================================================= */}

            <div className="p-6 sm:p-8 lg:p-12">

              <div className="mx-auto max-w-xl">

                {/* HEADER */}

                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                    Item information
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Item Details
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Tell people about the item you're sharing.
                  </p>
                </div>


                {/* LOCATION */}

                {!isEditMode && (
                  <div
                    className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 ${
                      location
                        ? "border-green-100 bg-green-50"
                        : "border-orange-100 bg-orange-50"
                    }`}
                  >

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        location ? "bg-white" : "bg-white"
                      }`}
                    >
                      <span className="text-lg">
                        {location ? "✓" : "⌖"}
                      </span>
                    </div>

                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          location
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {location
                          ? "Location detected"
                          : "Location required"}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {location
                          ? "Your item will appear in nearby searches."
                          : "Allow location access to add this item."}
                      </p>
                    </div>

                  </div>
                )}

                {/* FORM */}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* TITLE */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Item Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: Cordless Drill"
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        Description
                      </label>

                      <span className="text-xs text-gray-400">
                        Be specific
                      </span>
                    </div>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the condition, features and anything the borrower should know..."
                      rows="6"
                      required
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  {/* CATEGORY */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Category
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Tools">Tools</option>
                      <option value="Books">Books</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* PRICE */}

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Price
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                          ₹
                        </span>

                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          required
                          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-9 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                        />

                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Price Unit
                      </label>

                      <select
                        name="priceUnit"
                        value={formData.priceUnit}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="hour">Per Hour</option>
                        <option value="day">Per Day</option>
                        <option value="month">Per Month</option>
                        <option value="year">Per Year</option>
                      </select>
                    </div>

                  </div>

                  {/* DIVIDER */}

                  <div className="border-t border-gray-100 pt-2"></div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          {isEditMode ? "Save Changes" : "Add Item"}
                          <span className="text-lg transition group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </span>

                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Your item will be visible to people searching nearby.
                  </p>

                </form>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AddItem;