require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   SERVE PUBLIC FOLDER
===================================================== */

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* =====================================================
   DATABASE FOLDER
===================================================== */

const backendFolder =
    path.join(__dirname, "backend");

if (!fs.existsSync(backendFolder)) {
    fs.mkdirSync(backendFolder, {
        recursive: true
    });
}


/* =====================================================
   DATABASE FILES
===================================================== */

const registrationFile =
    path.join(
        backendFolder,
        "registration.json"
    );

const productsFile =
    path.join(
        backendFolder,
        "products.json"
    );

const servicesFile =
    path.join(
        backendFolder,
        "services.json"
    );

const businessesFile =
    path.join(
        backendFolder,
        "businesses.json"
    );


/* =====================================================
   CREATE FILES IF THEY DON'T EXIST
===================================================== */

function createFileIfMissing(file) {

    if (!fs.existsSync(file)) {

        fs.writeFileSync(
            file,
            "[]",
            "utf8"
        );

    }

}

createFileIfMissing(registrationFile);
createFileIfMissing(productsFile);
createFileIfMissing(servicesFile);
createFileIfMissing(businessesFile);


/* =====================================================
   DATABASE HELPERS
===================================================== */

function readData(file) {

    try {

        const data =
            fs.readFileSync(
                file,
                "utf8"
            );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Database read error:",
            error
        );

        return [];

    }

}


function writeData(file, data) {

    fs.writeFileSync(
        file,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );

}


/* =====================================================
   EMAIL SETUP
===================================================== */

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_APP_PASSWORD

        }

    });


/* =====================================================
   PASSWORD RESET TOKENS
===================================================== */

const resetTokens =
    new Map();


/* =====================================================
   HOME PAGE
===================================================== */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "home.html"
        )
    );

});


/* =====================================================
   REGISTER
===================================================== */

app.post("/register", async (req, res) => {

    try {

        const {
            fullname,
            email,
            country,
            password
        } = req.body;


        if (
            !fullname ||
            !email ||
            !country ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Please fill in all fields."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters."

            });

        }


        const users =
            readData(
                registrationFile
            );


        const existingUser =
            users.find(
                user =>
                    user.email.toLowerCase() ===
                    email.trim().toLowerCase()
            );


        if (existingUser) {

            return res.status(400).json({

                message:
                    "An account with this email already exists."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const newUser = {

            id:
                "user_" +
                Date.now(),

            fullname:
                fullname.trim(),

            email:
                email.trim(),

            country:
                country.trim(),

            password:
                hashedPassword,

            createdAt:
                new Date().toISOString()

        };


        users.push(newUser);


        writeData(
            registrationFile,
            users
        );


        const {
            password: removedPassword,
            ...safeUser
        } = newUser;


        return res.status(201).json({

            message:
                "Account created successfully.",

            user:
                safeUser

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error during registration."

        });

    }

});


/* =====================================================
   USER LOGIN
===================================================== */

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Please enter your email and password."

            });

        }


        const users =
            readData(
                registrationFile
            );


        const user =
            users.find(
                item =>
                    item.email.toLowerCase() ===
                    email.trim().toLowerCase()
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


        const {
            password: removedPassword,
            ...safeUser
        } = user;


        return res.json({

            message:
                "Login successful.",

            user:
                safeUser

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error during login."

        });

    }

});


/* =====================================================
   ADMIN LOGIN
===================================================== */

app.post("/admin-login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Please enter admin email and password."

            });

        }


        const adminEmail =
            process.env.ADMIN_EMAIL;

        const adminPassword =
            process.env.ADMIN_PASSWORD;


        if (
            !adminEmail ||
            !adminPassword
        ) {

            console.error(
                "ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env"
            );

            return res.status(500).json({

                message:
                    "Admin login is not configured on the server."

            });

        }


        const emailMatches =
            email.trim().toLowerCase() ===
            adminEmail.trim().toLowerCase();


        if (!emailMatches) {

            return res.status(401).json({

                message:
                    "Invalid admin email or password."

            });

        }


        /*
          The admin password is kept in .env.
          It is never sent to the browser.
        */

        const passwordMatches =
            password === adminPassword;


        if (!passwordMatches) {

            return res.status(401).json({

                message:
                    "Invalid admin email or password."

            });

        }


        return res.json({

            message:
                "Admin login successful.",

            admin: {

                email:
                    adminEmail,

                role:
                    "admin"

            }

        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        return res.status(500).json({

            message:
                "Server error during admin login."

        });

    }

});


/* =====================================================
   FORGOT EMAIL
===================================================== */

app.post("/forgot-email", async (req, res) => {

    try {

        const {
            fullName,
            country
        } = req.body;


        if (
            !fullName ||
            !country
        ) {

            return res.status(400).json({

                message:
                    "Please enter your full name and country."

            });

        }


        const users =
            readData(
                registrationFile
            );


        const user =
            users.find(item =>

                item.fullname
                    .trim()
                    .toLowerCase() ===
                fullName
                    .trim()
                    .toLowerCase()

                &&

                item.country
                    .trim()
                    .toLowerCase() ===
                country
                    .trim()
                    .toLowerCase()

            );


        /*
          Generic response prevents revealing
          whether an account exists.
        */

        if (!user) {

            return res.json({

                message:
                    "If your details match a BRAVE account, a recovery email has been sent."

            });

        }


        await transporter.sendMail({

            from:
                process.env.EMAIL_USER,

            to:
                user.email,

            subject:
                "BRAVE Account Email Recovery",

            text:
                `Hello ${user.fullname},

Your BRAVE account email is:

${user.email}

If you did not request this recovery, you can ignore this email.

BRAVE Team`

        });


        return res.json({

            message:
                "If your details match a BRAVE account, a recovery email has been sent."

        });


    } catch (error) {

        console.error(
            "Forgot email error:",
            error
        );

        return res.status(500).json({

            message:
                "Unable to process email recovery right now."

        });

    }

});


/* =====================================================
   FORGOT PASSWORD
===================================================== */

app.post("/forgot-password", async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                message:
                    "Please enter your email."

            });

        }


        const users =
            readData(
                registrationFile
            );


        const user =
            users.find(
                item =>
                    item.email.toLowerCase() ===
                    email.trim().toLowerCase()
            );


        /*
          Keep response generic.
        */

        if (!user) {

            return res.json({

                message:
                    "If that email belongs to a BRAVE account, a password reset email has been sent."

            });

        }


        const token =
            crypto
                .randomBytes(32)
                .toString("hex");


        const expiresAt =
            Date.now() +
            15 * 60 * 1000;


        resetTokens.set(
            token,
            {

                email:
                    user.email,

                expiresAt

            }
        );


        const resetLink =
            `${req.protocol}://${req.get("host")}/reset-password.html?token=${token}`;


        await transporter.sendMail({

            from:
                process.env.EMAIL_USER,

            to:
                user.email,

            subject:
                "BRAVE Password Reset",

            text:
                `Hello ${user.fullname},

We received a request to reset your BRAVE password.

Open this link to create a new password:

${resetLink}

This link will expire in 15 minutes.

If you did not request this reset, you can ignore this email.

BRAVE Team`

        });


        return res.json({

            message:
                "If that email belongs to a BRAVE account, a password reset email has been sent."

        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({

            message:
                "Unable to send password reset email."

        });

    }

});


/* =====================================================
   RESET PASSWORD
===================================================== */

app.post("/reset-password", async (req, res) => {

    try {

        const {
            token,
            password
        } = req.body;


        if (
            !token ||
            !password
        ) {

            return res.status(400).json({

                message:
                    "Invalid reset request."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters."

            });

        }


        const resetData =
            resetTokens.get(token);


        if (!resetData) {

            return res.status(400).json({

                message:
                    "This reset link is invalid or has expired."

            });

        }


        if (
            Date.now() >
            resetData.expiresAt
        ) {

            resetTokens.delete(token);

            return res.status(400).json({

                message:
                    "This reset link has expired."

            });

        }


        const users =
            readData(
                registrationFile
            );


        const userIndex =
            users.findIndex(
                user =>
                    user.email.toLowerCase() ===
                    resetData.email.toLowerCase()
            );


        if (userIndex === -1) {

            resetTokens.delete(token);

            return res.status(400).json({

                message:
                    "Account could not be found."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        users[userIndex].password =
            hashedPassword;


        writeData(
            registrationFile,
            users
        );


        resetTokens.delete(token);


        return res.json({

            message:
                "Password reset successful."

        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({

            message:
                "Unable to reset password."

        });

    }

});


/* =====================================================
   PRODUCTS
===================================================== */

app.post("/products", (req, res) => {

    try {

        const products =
            readData(
                productsFile
            );


        const product = {

            id:
                "product_" +
                Date.now(),

            ...req.body,

            createdAt:
                new Date().toISOString()

        };


        products.push(product);


        writeData(
            productsFile,
            products
        );


        res.status(201).json({

            message:
                "Product added successfully.",

            product

        });


    } catch (error) {

        console.error(
            "Product error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to add product."

        });

    }

});


app.get("/products", (req, res) => {

    res.json(
        readData(
            productsFile
        )
    );

});


app.get("/products/search", (req, res) => {

    const query =
        (req.query.q || "")
            .trim()
            .toLowerCase();


    const products =
        readData(
            productsFile
        );


    if (!query) {

        return res.json(products);

    }


    const results =
        products.filter(product =>

            JSON.stringify(product)
                .toLowerCase()
                .includes(query)

        );


    res.json(results);

});


/* =====================================================
   SERVICES
===================================================== */

app.post("/services", (req, res) => {

    try {

        const services =
            readData(
                servicesFile
            );


        const service = {

            id:
                "service_" +
                Date.now(),

            ...req.body,

            createdAt:
                new Date().toISOString()

        };


        services.push(service);


        writeData(
            servicesFile,
            services
        );


        res.status(201).json({

            message:
                "Service added successfully.",

            service

        });


    } catch (error) {

        console.error(
            "Service error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to add service."

        });

    }

});


app.get("/services", (req, res) => {

    res.json(
        readData(
            servicesFile
        )
    );

});


app.get("/services/search", (req, res) => {

    const query =
        (req.query.q || "")
            .trim()
            .toLowerCase();


    const services =
        readData(
            servicesFile
        );


    if (!query) {

        return res.json(services);

    }


    const results =
        services.filter(service =>

            JSON.stringify(service)
                .toLowerCase()
                .includes(query)

        );


    res.json(results);

});


/* =====================================================
   BUSINESSES
===================================================== */

app.post("/businesses", (req, res) => {

    try {

        const businesses =
            readData(
                businessesFile
            );


        const business = {

            id:
                "business_" +
                Date.now(),

            ...req.body,

            createdAt:
                new Date().toISOString()

        };


        businesses.push(business);


        writeData(
            businessesFile,
            businesses
        );


        res.status(201).json({

            message:
                "Business added successfully.",

            business

        });


    } catch (error) {

        console.error(
            "Business error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to add business."

        });

    }

});


app.get("/businesses", (req, res) => {

    res.json(
        readData(
            businessesFile
        )
    );

});


app.get("/businesses/search", (req, res) => {

    const query =
        (req.query.q || "")
            .trim()
            .toLowerCase();


    const businesses =
        readData(
            businessesFile
        );


    if (!query) {

        return res.json(businesses);

    }


    const results =
        businesses.filter(business =>

            JSON.stringify(business)
                .toLowerCase()
                .includes(query)

        );


    res.json(results);

});


/* =====================================================
   ADMIN DASHBOARD DATA
===================================================== */

app.get("/api/dashboard", (req, res) => {

    try {

        const users =
            readData(
                registrationFile
            );

        const products =
            readData(
                productsFile
            );

        const services =
            readData(
                servicesFile
            );

        const businesses =
            readData(
                businessesFile
            );


        const recentUsers =
            [...users]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt) -
                        new Date(a.createdAt)
                )
                .slice(0, 10)
                .map(user => {

                    const {
                        password,
                        ...safeUser
                    } = user;

                    return safeUser;

                });


        res.json({

            totalUsers:
                users.length,

            totalProducts:
                products.length,

            totalServices:
                services.length,

            totalBusinesses:
                businesses.length,

            recentUsers

        });


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load dashboard."

        });

    }

});


/* =====================================================
   SERVER STATUS
===================================================== */

app.get("/api/status", (req, res) => {

    res.json({

        status:
            "online",

        message:
            "BRAVE backend is working.",

        time:
            new Date().toISOString()

    });

});


/* =====================================================
   START SERVER
===================================================== */

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