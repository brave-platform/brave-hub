const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   SERVE PUBLIC FOLDER
========================================================= */

app.use(express.static(path.join(__dirname, "public")));


/* =========================================================
   BACKEND DATA FOLDER
========================================================= */

const backendFolder = path.join(__dirname, "backend");

if (!fs.existsSync(backendFolder)) {
    fs.mkdirSync(backendFolder, { recursive: true });
}


/* =========================================================
   DATABASE FILES
========================================================= */

const registrationFile =
    path.join(backendFolder, "registration.json");

const productsFile =
    path.join(backendFolder, "products.json");

const servicesFile =
    path.join(backendFolder, "services.json");

const businessesFile =
    path.join(backendFolder, "businesses.json");


/* =========================================================
   CREATE DATABASE FILES IF NEEDED
========================================================= */

function createFileIfMissing(filePath) {

    if (!fs.existsSync(filePath)) {

        fs.writeFileSync(
            filePath,
            "[]"
        );

    }

}

createFileIfMissing(registrationFile);
createFileIfMissing(productsFile);
createFileIfMissing(servicesFile);
createFileIfMissing(businessesFile);


/* =========================================================
   DATABASE HELPERS
========================================================= */

function readData(filePath) {

    try {

        return JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Database read error:",
            error
        );

        return [];

    }

}


function writeData(filePath, data) {

    fs.writeFileSync(

        filePath,

        JSON.stringify(
            data,
            null,
            2
        )

    );

}


/* =========================================================
   REGISTER
========================================================= */

app.post("/register", async (req, res) => {

    try {

        const registrations =
            readData(registrationFile);


        const fullname =
            String(req.body.fullname || "").trim();


        const email =
            String(req.body.email || "").trim();


        const country =
            String(req.body.country || "").trim();


        const password =
            String(req.body.password || "");


        if (
            !fullname ||
            !email ||
            !country ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please complete all fields."

            });

        }


        const existingUser =
            registrations.find(
                account =>
                    String(account.email)
                        .toLowerCase() ===
                    email.toLowerCase()
            );


        if (existingUser) {

            return res.status(409).json({

                message:
                    "An account with this email already exists."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user = {

            id:
                "user_" +
                Date.now(),

            fullname:
                fullname,

            email:
                email,

            country:
                country,

            password:
                hashedPassword

        };


        registrations.push(user);


        writeData(
            registrationFile,
            registrations
        );


        res.json({

            message:
                "Registration submitted successfully!",

            user: {

                id:
                    user.id,

                fullname:
                    user.fullname,

                email:
                    user.email,

                country:
                    user.country

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Registration failed."

        });

    }

});


/* =========================================================
   LOGIN
========================================================= */

app.post("/login", async (req, res) => {

    try {

        const registrations =
            readData(registrationFile);


        const email =
            String(req.body.email || "").trim();


        const password =
            String(req.body.password || "");


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please enter your email and password."

            });

        }


        const user =
            [...registrations]
                .reverse()
                .find(
                    account =>
                        String(account.email)
                            .toLowerCase() ===
                        email.toLowerCase()
                );


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password."

            });

        }


        res.json({

            message:
                "Login successful!",

            user: {

                id:
                    user.id || user.email,

                fullname:
                    user.fullname,

                email:
                    user.email,

                country:
                    user.country

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Login failed."

        });

    }

});


/* =========================================================
   DASHBOARD
========================================================= */

app.get("/", (req, res) => {

    res.sendFile(

        path.join(
            __dirname,
            "public",
            "dashboard.html"
        )

    );

});


/* =========================================================
   PRODUCTS
========================================================= */


/*
   ADD PRODUCT

   The dashboard will send:

   {
       name,
       description,
       category,
       sellerName,
       sellerEmail,
       sellerId
   }

*/

app.post("/api/products", (req, res) => {

    try {

        const products =
            readData(productsFile);


        const product = {

            id:
                "product_" +
                Date.now(),

            name:
                String(req.body.name || "").trim(),

            description:
                String(req.body.description || "").trim(),

            category:
                String(req.body.category || "").trim(),

            sellerName:
                String(
                    req.body.sellerName ||
                    req.body.accountName ||
                    "BRAVE Seller"
                ).trim(),

            sellerEmail:
                String(
                    req.body.sellerEmail || ""
                ).trim(),

            sellerId:
                String(
                    req.body.sellerId ||
                    req.body.sellerEmail ||
                    ""
                ).trim(),

            createdAt:
                new Date().toISOString()

        };


        if (!product.name) {

            return res.status(400).json({

                message:
                    "Product name is required."

            });

        }


        products.push(product);


        writeData(
            productsFile,
            products
        );


        res.json({

            success: true,

            message:
                "Product added successfully!",

            product:
                product

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Unable to add product."

        });

    }

});


/*
   GET ALL PRODUCTS
*/

app.get("/api/products", (req, res) => {

    const products =
        readData(productsFile);

    res.json(products);

});


/*
   SEARCH PRODUCTS
*/

app.get("/api/products/search", (req, res) => {

    const search =
        String(
            req.query.q || ""
        )
        .trim()
        .toLowerCase();


    const products =
        readData(productsFile);


    if (!search) {

        return res.json(products);

    }


    const results =
        products.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();

            const description =
                String(
                    product.description || ""
                ).toLowerCase();

            const category =
                String(
                    product.category || ""
                ).toLowerCase();

            const sellerName =
                String(
                    product.sellerName || ""
                ).toLowerCase();


            return (
                name.includes(search) ||
                description.includes(search) ||
                category.includes(search) ||
                sellerName.includes(search)
            );

        });


    res.json(results);

});


/* =========================================================
   SERVICES
========================================================= */


/*
   ADD SERVICE
*/

app.post("/api/services", (req, res) => {

    try {

        const services =
            readData(servicesFile);


        const service = {

            id:
                "service_" +
                Date.now(),

            name:
                String(
                    req.body.name || ""
                ).trim(),

            description:
                String(
                    req.body.description || ""
                ).trim(),

            category:
                String(
                    req.body.category || ""
                ).trim(),

            providerName:
                String(
                    req.body.providerName ||
                    req.body.accountName ||
                    "BRAVE Service Provider"
                ).trim(),

            providerEmail:
                String(
                    req.body.providerEmail || ""
                ).trim(),

            providerId:
                String(
                    req.body.providerId ||
                    req.body.providerEmail ||
                    ""
                ).trim(),

            createdAt:
                new Date().toISOString()

        };


        if (!service.name) {

            return res.status(400).json({

                message:
                    "Service name is required."

            });

        }


        services.push(service);


        writeData(
            servicesFile,
            services
        );


        res.json({

            success: true,

            message:
                "Service added successfully!",

            service:
                service

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Unable to add service."

        });

    }

});


/*
   GET ALL SERVICES
*/

app.get("/api/services", (req, res) => {

    const services =
        readData(servicesFile);

    res.json(services);

});


/*
   SEARCH SERVICES
*/

app.get("/api/services/search", (req, res) => {

    const search =
        String(
            req.query.q || ""
        )
        .trim()
        .toLowerCase();


    const services =
        readData(servicesFile);


    if (!search) {

        return res.json(services);

    }


    const results =
        services.filter(service => {

            const name =
                String(
                    service.name || ""
                ).toLowerCase();

            const description =
                String(
                    service.description || ""
                ).toLowerCase();

            const category =
                String(
                    service.category || ""
                ).toLowerCase();

            const providerName =
                String(
                    service.providerName || ""
                ).toLowerCase();


            return (
                name.includes(search) ||
                description.includes(search) ||
                category.includes(search) ||
                providerName.includes(search)
            );

        });


    res.json(results);

});


/* =========================================================
   BUSINESSES
========================================================= */


/*
   ADD BUSINESS
*/

app.post("/api/businesses", (req, res) => {

    try {

        const businesses =
            readData(businessesFile);


        const business = {

            id:
                "business_" +
                Date.now(),

            name:
                String(
                    req.body.name || ""
                ).trim(),

            description:
                String(
                    req.body.description || ""
                ).trim(),

            category:
                String(
                    req.body.category || ""
                ).trim(),

            ownerName:
                String(
                    req.body.ownerName ||
                    req.body.accountName ||
                    "BRAVE Business Owner"
                ).trim(),

            ownerEmail:
                String(
                    req.body.ownerEmail || ""
                ).trim(),

            ownerId:
                String(
                    req.body.ownerId ||
                    req.body.ownerEmail ||
                    ""
                ).trim(),

            phone:
                String(
                    req.body.phone || ""
                ).trim(),

            location:
                String(
                    req.body.location || ""
                ).trim(),

            createdAt:
                new Date().toISOString()

        };


        if (!business.name) {

            return res.status(400).json({

                message:
                    "Business name is required."

            });

        }


        businesses.push(business);


        writeData(
            businessesFile,
            businesses
        );


        res.json({

            success: true,

            message:
                "Business added successfully!",

            business:
                business

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Unable to add business."

        });

    }

});


/*
   GET ALL BUSINESSES
*/

app.get("/api/businesses", (req, res) => {

    const businesses =
        readData(businessesFile);

    res.json(businesses);

});


/*
   SEARCH BUSINESSES
*/

app.get("/api/businesses/search", (req, res) => {

    const search =
        String(
            req.query.q || ""
        )
        .trim()
        .toLowerCase();


    const businesses =
        readData(businessesFile);


    if (!search) {

        return res.json(businesses);

    }


    const results =
        businesses.filter(business => {

            const name =
                String(
                    business.name || ""
                ).toLowerCase();

            const description =
                String(
                    business.description || ""
                ).toLowerCase();

            const category =
                String(
                    business.category || ""
                ).toLowerCase();

            const ownerName =
                String(
                    business.ownerName || ""
                ).toLowerCase();

            const location =
                String(
                    business.location || ""
                ).toLowerCase();


            return (
                name.includes(search) ||
                description.includes(search) ||
                category.includes(search) ||
                ownerName.includes(search) ||
                location.includes(search)
            );

        });


    res.json(results);

});


/* =========================================================
   DASHBOARD SUMMARY
========================================================= */

app.get("/api/dashboard", (req, res) => {

    try {

        const products =
            readData(productsFile);

        const services =
            readData(servicesFile);

        const businesses =
            readData(businessesFile);

        const registrations =
            readData(registrationFile);


        res.json({

            success: true,

            statistics: {

                users:
                    registrations.length,

                products:
                    products.length,

                services:
                    services.length,

                businesses:
                    businesses.length

            },

            recentProducts:
                products.slice(-5).reverse(),

            recentServices:
                services.slice(-5).reverse(),

            recentBusinesses:
                businesses.slice(-5).reverse()

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Unable to load dashboard data."

        });

    }

});


/* =========================================================
   TEST ROUTE
========================================================= */

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        message:
            "BRAVE backend is working.",

        time:
            new Date().toISOString()

    });

});


/* =========================================================
   START SERVER
========================================================= */

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `BRAVE backend is running on port ${PORT}`
        );

    }
);        