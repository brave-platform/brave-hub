const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;

// Allow JSON data from the website
app.use(express.json());

// Serve all files inside the public folder
app.use(express.static(path.join(__dirname, "..", "public")));

// Temporary storage for BRAVE businesses
// This will later be replaced with a real database.
let businesses = [];

// Save a seller/service provider
app.post("/api/business", (req, res) => {
    const business = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };

    businesses.push(business);

    console.log("New BRAVE business:", business.businessName);

    res.json({
        success: true,
        message: "Business profile saved successfully!",
        business: business
    });
});

// Get all sellers/service providers
app.get("/api/businesses", (req, res) => {
    res.json(businesses);
});

// Test route
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "BRAVE backend is working!"
    });
});

// Start BRAVE server
app.listen(PORT, () => {
    console.log(`BRAVE server running on port ${PORT}`);
});