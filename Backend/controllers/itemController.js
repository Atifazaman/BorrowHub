const Item = require("../models/Items");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const addItem = async (req, res) => {
    try {

        const {
            title,
            description,
            category,
            price,
            priceUnit,
            longitude,
            latitude
        } = req.body;

        // Check images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Please upload at least one image"
            });
        }

        if (req.files.length > 4) {
            return res.status(400).json({
                message: "You can upload maximum 4 images"
            });
        }

        // Check location
        if (longitude === undefined || latitude === undefined) {
            return res.status(400).json({
                message: "Location is required"
            });
        }

        const longitudeNumber = Number(longitude);
        const latitudeNumber = Number(latitude);

        if (
            !Number.isFinite(longitudeNumber) ||
            !Number.isFinite(latitudeNumber) ||
            longitudeNumber < -180 ||
            longitudeNumber > 180 ||
            latitudeNumber < -90 ||
            latitudeNumber > 90
        ) {
            return res.status(400).json({
                message: "Invalid location coordinates"
            });
        }

        // Upload images to Cloudinary
        const imageUrls = [];

        for (const file of req.files) {

            const result = await new Promise(
                (resolve, reject) => {

                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder: "borrowhub/items",
                                resource_type: "image"
                            },
                            (error, result) => {

                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                    uploadStream.end(file.buffer);
                }
            );

            imageUrls.push(result.secure_url);
        }

        // Create item
        const item = await Item.create({
            title,
            description,
            category,
            price: Number(price),
            priceUnit,

            images: imageUrls,

            owner: req.userId,

            location: {
                type: "Point",
                coordinates: [
                    longitudeNumber,
                    latitudeNumber
                ]
            }
        });

        res.status(201).json({
            message: "Item added successfully",
            item
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const getNearbyItems = async (req, res) => {
    try {
        const {
            longitude,
            latitude,
            distance,
            search
        } = req.query;

        const longitudeNumber = Number(longitude);
        const latitudeNumber = Number(latitude);
        const distanceNumber = Number(distance);

        if (
            !Number.isFinite(longitudeNumber) ||
            !Number.isFinite(latitudeNumber) ||
            !Number.isFinite(distanceNumber)
        ) {
            return res.status(400).json({
                message: "Invalid location or distance"
            });
        }

        const filter = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            longitudeNumber,
                            latitudeNumber
                        ]
                    },
                    $maxDistance: distanceNumber
                }
            },
            status: "available",
            owner: { $ne: req.userId }
        };

       if (search && search.trim() !== "") {
    const searchText = search.trim();

    filter.$or = [
        {
            title: {
                $regex: searchText,
                $options: "i"
            }
        },
        {
            category: {
                $regex: searchText,
                $options: "i"
            }
        },
        {
            description: {
                $regex: searchText,
                $options: "i"
            }
        }
    ];
}

        const items = await Item.find(filter)
            .populate("owner", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Nearby items fetched successfully",
            items
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const getMyItems = async (req, res) => {
    try {
        const items = await Item.find({
            owner: req.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "My items fetched successfully",
            items
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const {
            title,
            description,
            category,
            price,
            priceUnit,
            location
        } = req.body;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        // Check whether the logged-in user owns the item
        if (item.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You can update only your own item"
            });
        }

        // Update only fields that were provided
        if (title !== undefined) {
            item.title = title;
        }

        if (description !== undefined) {
            item.description = description;
        }

        if (category !== undefined) {
            item.category = category;
        }

        if (price !== undefined) {
            item.price = price;
        }

        if (priceUnit !== undefined) {
            item.priceUnit = priceUnit;
        }

        if (location !== undefined) {
            item.location = location;
        }

        await item.save();

        res.status(200).json({
            message: "Item updated successfully",
            item
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        // Check whether the logged-in user owns the item
        if (item.owner.toString() !== req.userId.toString()) {
            return res.status(403).json({
                message: "You can delete only your own item"
            });
        }

        // Don't allow deletion while item is borrowed
        if (item.status === "borrowed") {
            return res.status(400).json({
                message: "Borrowed item cannot be deleted"
            });
        }

        await Item.findByIdAndDelete(itemId);

        res.status(200).json({
            message: "Item deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// Get single item
const getItemById = async (req, res) => {
    try {

        const { itemId } = req.params;

        const item = await Item.findById(itemId)
            .populate("owner", "name");

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            item
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = {
    addItem,
    getNearbyItems,
    getMyItems,
    updateItem,
    deleteItem,
    getItemById
};