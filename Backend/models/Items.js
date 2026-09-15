const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Electronics",
                "Kitchen",
                "Tools",
                "Books",
                "Sports",
                "Other"
            ]
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        priceUnit: {
            type: String,
            required: true,
            enum: ["hour", "day", "month", "year"]
        },
        images: {
    type: [String],
    required: true,
    validate: {
        validator: function (images) {
            return images.length >= 1 && images.length <= 4;
        },
        message: "Item must have between 1 and 4 images"
    }
},

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },

            coordinates: {
                type: [Number],
                required: true
            }
        },

        status: {
            type: String,
            enum: ["available", "borrowed"],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

itemSchema.index({ location: "2dsphere" });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;