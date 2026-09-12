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

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   SERVE PUBLIC FOLDER
===================================================== */

app.use(
    express.static(
        path.join(__dirname, "public"),
        {
            index: false
        }
    )
);


/* =====================================================
   DATABASE FOLDER
===================================================== */

const backendFolder =
    path.join(
        __dirname,
        "backend"
    );

if (!fs.existsSync(backendFolder)) {

    fs.mkdirSync(
        backendFolder,
        {
            recursive: true
        }
    );

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

const profilesFile =
    path.join(
        backendFolder,
        "profiles.json"
    );

const timelinesFile =
    path.join(
        backendFolder,
        "timelines.json"
    );

const reportsFile =
    path.join(
        backendFolder,
        "reports.json"
    );

const messagesFile =
    path.join(
        backendFolder,
        "messages.json"
    );

const moderationFile =
    path.join(
        backendFolder,
        "moderation.json"
    );

const auditFile =
    path.join(
        backendFolder,
        "admin-audit.json"
    );

const notificationsFile =
    path.join(
        backendFolder,
        "notifications.json"
    );

const aiConversationsFile =
    path.join(
        backendFolder,
        "ai-conversations.json"
    );


/* =====================================================
   CREATE FILE IF MISSING
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


[
    registrationFile,
    productsFile,
    servicesFile,
    businessesFile,
    profilesFile,
    timelinesFile,
    reportsFile,
    messagesFile,
    moderationFile,
    auditFile,
    notificationsFile,
    aiConversationsFile
].forEach(createFileIfMissing);


/* =====================================================
   DATABASE HELPERS
===================================================== */

function readData(file) {

    try {

        if (!fs.existsSync(file)) {

            createFileIfMissing(file);

        }

        const data =
            fs.readFileSync(
                file,
                "utf8"
            );

        const parsed =
            JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

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


function createId(prefix) {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        crypto
            .randomBytes(4)
            .toString("hex")
    );

}


function safeUser(user) {

    if (!user) {

        return null;

    }

    const {
        password,
        ...cleanUser
    } = user;

    return cleanUser;

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
   ADMIN SESSIONS
===================================================== */

const adminSessions =
    new Map();

const ADMIN_SESSION_DURATION =
    8 * 60 * 60 * 1000;


function createAdminSession(email) {

    const token =
        crypto
            .randomBytes(48)
            .toString("hex");

    adminSessions.set(
        token,
        {

            email,

            role:
                "admin",

            createdAt:
                Date.now(),

            expiresAt:
                Date.now() +
                ADMIN_SESSION_DURATION

        }
    );

    return token;

}


function getAdminSession(req) {

    const token =
        req.headers[
            "x-admin-token"
        ];

    if (!token) {

        return null;

    }

    const session =
        adminSessions.get(token);

    if (!session) {

        return null;

    }

    if (
        Date.now() >
        session.expiresAt
    ) {

        adminSessions.delete(token);

        return null;

    }

    return session;

}


function requireAdmin(
    req,
    res,
    next
) {

    const session =
        getAdminSession(req);

    if (!session) {

        return res
            .status(401)
            .json({

                message:
                    "Administrator authentication required.",

                code:
                    "ADMIN_AUTH_REQUIRED"

            });

    }

    req.admin =
        session;

    next();

}


/* =====================================================
   ADMIN AUDIT LOG
===================================================== */

function addAuditLog({

    adminEmail,

    action,

    targetType,

    targetId,

    reason = "",

    details = {}

}) {

    const logs =
        readData(
            auditFile
        );

    logs.push({

        id:
            createId("audit"),

        adminEmail:
            adminEmail ||
            "unknown",

        action,

        targetType:
            targetType ||
            "",

        targetId:
            targetId ||
            "",

        reason,

        details,

        createdAt:
            new Date().toISOString()

    });

    writeData(
        auditFile,
        logs
    );

}


/* =====================================================
   HOME PAGE
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "home.html"
            )
        );

    }
);


/* =====================================================
   REGISTER
===================================================== */

app.post(
    "/register",
    async (req, res) => {

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

                return res
                    .status(400)
                    .json({

                        message:
                            "Please fill in all fields."

                    });

            }


            if (
                password.length < 6
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Password must be at least 6 characters."

                    });

            }


            const users =
                readData(
                    registrationFile
                );


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingUser =
                users.find(
                    user =>
                        user.email
                            .trim()
                            .toLowerCase() ===
                        normalizedEmail
                );


            if (existingUser) {

                return res
                    .status(400)
                    .json({

                        message:
                            "An account with this email already exists."

                    });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            const now =
                new Date().toISOString();


            const newUser = {

                id:
                    createId("user"),

                fullname:
                    fullname.trim(),

                email:
                    email.trim(),

                country:
                    country.trim(),

                password:
                    hashedPassword,

                accountStatus:
                    "active",

                verificationStatus:
                    "unverified",

                createdAt:
                    now

            };


            users.push(
                newUser
            );


            writeData(
                registrationFile,
                users
            );


            const profiles =
                readData(
                    profilesFile
                );


            profiles.push({

                id:
                    createId("profile"),

                userId:
                    newUser.id,

                fullname:
                    newUser.fullname,

                email:
                    newUser.email,

                country:
                    newUser.country,

                verificationStatus:
                    "unverified",

                accountStatus:
                    "active",

                bio:
                    "",

                profileImage:
                    "",

                createdAt:
                    now,

                updatedAt:
                    now

            });


            writeData(
                profilesFile,
                profiles
            );


            return res
                .status(201)
                .json({

                    message:
                        "Account created successfully.",

                    user:
                        safeUser(
                            newUser
                        )

                });


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            return res
                .status(500)
                .json({

                    message:
                        "Server error during registration."

                });

        }

    }
);


/* =====================================================
   USER LOGIN
===================================================== */

app.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

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
                        item.email
                            .trim()
                            .toLowerCase() ===
                        email
                            .trim()
                            .toLowerCase()
                );


            if (!user) {

                return res
                    .status(401)
                    .json({

                        message:
                            "Invalid email or password."

                    });

            }


            if (
                user.accountStatus ===
                "suspended"
            ) {

                return res
                    .status(403)
                    .json({

                        message:
                            "This BRAVE account is currently suspended."

                    });

            }


            if (
                user.accountStatus ===
                "restricted"
            ) {

                return res
                    .status(403)
                    .json({

                        message:
                            "This BRAVE account is currently restricted."

                    });

            }


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return res
                    .status(401)
                    .json({

                        message:
                            "Invalid email or password."

                    });

            }


            return res.json({

                message:
                    "Login successful.",

                user:
                    safeUser(
                        user
                    )

            });


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            return res
                .status(500)
                .json({

                    message:
                        "Server error during login."

                });

        }

    }
);


/* =====================================================
   ADMIN LOGIN
===================================================== */

app.post(
    "/admin-login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

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

                return res
                    .status(500)
                    .json({

                        message:
                            "Admin login is not configured on the server."

                    });

            }


            const emailMatches =
                email
                    .trim()
                    .toLowerCase() ===
                adminEmail
                    .trim()
                    .toLowerCase();


            if (!emailMatches) {

                return res
                    .status(401)
                    .json({

                        message:
                            "Invalid admin email or password."

                    });

            }


            const passwordMatches =
                password ===
                adminPassword;


            if (!passwordMatches) {

                return res
                    .status(401)
                    .json({

                        message:
                            "Invalid admin email or password."

                    });

            }


            const adminToken =
                createAdminSession(
                    adminEmail
                );


            addAuditLog({

                adminEmail,

                action:
                    "ADMIN_LOGIN",

                targetType:
                    "admin",

                targetId:
                    adminEmail,

                reason:
                    "Successful administrator login."

            });


            return res.json({

                message:
                    "Admin login successful.",

                token:
                    adminToken,

                expiresIn:
                    ADMIN_SESSION_DURATION,

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

            return res
                .status(500)
                .json({

                    message:
                        "Server error during admin login."

                });

        }

    }
);


/* =====================================================
   ADMIN LOGOUT
===================================================== */

app.post(
    "/admin-logout",
    requireAdmin,
    (req, res) => {

        const token =
            req.headers[
                "x-admin-token"
            ];


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "ADMIN_LOGOUT",

            targetType:
                "admin",

            targetId:
                req.admin.email

        });


        adminSessions.delete(
            token
        );


        res.json({

            message:
                "Administrator logged out successfully."

        });

    }
);


/* =====================================================
   ADMIN SESSION CHECK
===================================================== */

app.get(
    "/api/admin/session",
    requireAdmin,
    (req, res) => {

        res.json({

            authenticated:
                true,

            admin: {

                email:
                    req.admin.email,

                role:
                    req.admin.role

            },

            expiresAt:
                req.admin.expiresAt

        });

    }
);


/* =====================================================
   FORGOT EMAIL
===================================================== */

app.post(
    "/forgot-email",
    async (req, res) => {

        try {

            const {
                fullName,
                country
            } = req.body;


            if (
                !fullName ||
                !country
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Please enter your full name and country."

                    });

            }


            const users =
                readData(
                    registrationFile
                );


            const user =
                users.find(
                    item =>

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

            return res
                .status(500)
                .json({

                    message:
                        "Unable to process email recovery right now."

                });

        }

    }
);


/* =====================================================
   FORGOT PASSWORD
===================================================== */

app.post(
    "/forgot-password",
    async (req, res) => {

        try {

            const {
                email
            } = req.body;


            if (!email) {

                return res
                    .status(400)
                    .json({

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
                        item.email
                            .trim()
                            .toLowerCase() ===
                        email
                            .trim()
                            .toLowerCase()
                );


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

            return res
                .status(500)
                .json({

                    message:
                        "Unable to send password reset email."

                });

        }

    }
);


/* =====================================================
   RESET PASSWORD
===================================================== */

app.post(
    "/reset-password",
    async (req, res) => {

        try {

            const {
                token,
                password
            } = req.body;


            if (
                !token ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Invalid reset request."

                    });

            }


            if (
                password.length < 6
            ) {

                return res
                    .status(400)
                    .json({

                        message:
                            "Password must be at least 6 characters."

                    });

            }


            const resetData =
                resetTokens.get(
                    token
                );


            if (!resetData) {

                return res
                    .status(400)
                    .json({

                        message:
                            "This reset link is invalid or has expired."

                    });

            }


            if (
                Date.now() >
                resetData.expiresAt
            ) {

                resetTokens.delete(
                    token
                );

                return res
                    .status(400)
                    .json({

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
                        user.email
                            .toLowerCase() ===
                        resetData.email
                            .toLowerCase()
                );


            if (
                userIndex === -1
            ) {

                resetTokens.delete(
                    token
                );

                return res
                    .status(400)
                    .json({

                        message:
                            "Account could not be found."

                    });

            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            users[
                userIndex
            ].password =
                hashedPassword;


            writeData(
                registrationFile,
                users
            );


            resetTokens.delete(
                token
            );


            return res.json({

                message:
                    "Password reset successful."

            });


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            return res
                .status(500)
                .json({

                    message:
                        "Unable to reset password."

                });

        }

    }
);


/* =====================================================
   PRODUCTS
===================================================== */

app.post(
    "/products",
    (req, res) => {

        try {

            const products =
                readData(
                    productsFile
                );


            const product = {

                id:
                    createId("product"),

                ...req.body,

                status:
                    req.body.status ||
                    "active",

                moderationStatus:
                    req.body.moderationStatus ||
                    "pending",

                createdAt:
                    new Date().toISOString()

            };


            products.push(
                product
            );


            writeData(
                productsFile,
                products
            );


            res
                .status(201)
                .json({

                    message:
                        "Product added successfully.",

                    product

                });


        } catch (error) {

            console.error(
                "Product error:",
                error
            );

            res
                .status(500)
                .json({

                    message:
                        "Unable to add product."

                });

        }

    }
);


app.get(
    "/products",
    (req, res) => {

        res.json(
            readData(
                productsFile
            )
        );

    }
);


app.get(
    "/products/search",
    (req, res) => {

        const query =
            (req.query.q || "")
                .trim()
                .toLowerCase();


        const products =
            readData(
                productsFile
            );


        if (!query) {

            return res.json(
                products
            );

        }


        const results =
            products.filter(
                product =>
                    JSON.stringify(
                        product
                    )
                        .toLowerCase()
                        .includes(query)
            );


        res.json(
            results
        );

    }
);


/* =====================================================
   SERVICES
===================================================== */

app.post(
    "/services",
    (req, res) => {

        try {

            const services =
                readData(
                    servicesFile
                );


            const service = {

                id:
                    createId("service"),

                ...req.body,

                status:
                    req.body.status ||
                    "active",

                moderationStatus:
                    req.body.moderationStatus ||
                    "pending",

                createdAt:
                    new Date().toISOString()

            };


            services.push(
                service
            );


            writeData(
                servicesFile,
                services
            );


            res
                .status(201)
                .json({

                    message:
                        "Service added successfully.",

                    service

                });


        } catch (error) {

            console.error(
                "Service error:",
                error
            );

            res
                .status(500)
                .json({

                    message:
                        "Unable to add service."

                });

        }

    }
);


app.get(
    "/services",
    (req, res) => {

        res.json(
            readData(
                servicesFile
            )
        );

    }
);


app.get(
    "/services/search",
    (req, res) => {

        const query =
            (req.query.q || "")
                .trim()
                .toLowerCase();


        const services =
            readData(
                servicesFile
            );


        if (!query) {

            return res.json(
                services
            );

        }


        const results =
            services.filter(
                service =>
                    JSON.stringify(
                        service
                    )
                        .toLowerCase()
                        .includes(query)
            );


        res.json(
            results
        );

    }
);


/* =====================================================
   BUSINESSES
===================================================== */

app.post(
    "/businesses",
    (req, res) => {

        try {

            const businesses =
                readData(
                    businessesFile
                );


            const business = {

                id:
                    createId("business"),

                ...req.body,

                status:
                    req.body.status ||
                    "active",

                createdAt:
                    new Date().toISOString()

            };


            businesses.push(
                business
            );


            writeData(
                businessesFile,
                businesses
            );


            res
                .status(201)
                .json({

                    message:
                        "Business added successfully.",

                    business

                });


        } catch (error) {

            console.error(
                "Business error:",
                error
            );

            res
                .status(500)
                .json({

                    message:
                        "Unable to add business."

                });

        }

    }
);


app.get(
    "/businesses",
    (req, res) => {

        res.json(
            readData(
                businessesFile
            )
        );

    }
);


app.get(
    "/businesses/search",
    (req, res) => {

        const query =
            (req.query.q || "")
                .trim()
                .toLowerCase();


        const businesses =
            readData(
                businessesFile
            );


        if (!query) {

            return res.json(
                businesses
            );

        }


        const results =
            businesses.filter(
                business =>
                    JSON.stringify(
                        business
                    )
                        .toLowerCase()
                        .includes(query)
            );


        res.json(
            results
        );

    }
);


/* =====================================================
   PUBLIC USER PROFILE
===================================================== */

app.get(
    "/api/users/:userId/profile",
    (req, res) => {

        const users =
            readData(
                registrationFile
            );


        const user =
            users.find(
                item =>
                    item.id ===
                    req.params.userId
            );


        if (!user) {

            return res
                .status(404)
                .json({

                    message:
                        "User not found."

                });

        }


        const profiles =
            readData(
                profilesFile
            );


        const profile =
            profiles.find(
                item =>
                    item.userId ===
                    user.id
            );


        res.json({

            user:
                safeUser(
                    user
                ),

            profile:
                profile ||
                null

        });

    }
);


/* =====================================================
   ADMIN USERS
===================================================== */

app.get(
    "/api/admin/users",
    requireAdmin,
    (req, res) => {

        const query =
            (req.query.q || "")
                .trim()
                .toLowerCase();


        const users =
            readData(
                registrationFile
            );

        const profiles =
            readData(
                profilesFile
            );


        let results =
            users.map(
                user => {

                    const profile =
                        profiles.find(
                            item =>
                                item.userId ===
                                user.id
                        );


                    return {

                        ...safeUser(
                            user
                        ),

                        profile:
                            profile ||
                            null

                    };

                }
            );


        if (query) {

            results =
                results.filter(
                    user =>
                        JSON.stringify(
                            user
                        )
                            .toLowerCase()
                            .includes(query)
                );

        }


        res.json({

            total:
                results.length,

            users:
                results

        });

    }
);


/* =====================================================
   ADMIN USER PROFILE
===================================================== */

app.get(
    "/api/admin/users/:userId",
    requireAdmin,
    (req, res) => {

        const users =
            readData(
                registrationFile
            );


        const user =
            users.find(
                item =>
                    item.id ===
                    req.params.userId
            );


        if (!user) {

            return res
                .status(404)
                .json({

                    message:
                        "User not found."

                });

        }


        const profiles =
            readData(
                profilesFile
            );

        const timelines =
            readData(
                timelinesFile
            );

        const products =
            readData(
                productsFile
            );

        const services =
            readData(
                servicesFile
            );

        const reports =
            readData(
                reportsFile
            );


        const profile =
            profiles.find(
                item =>
                    item.userId ===
                    user.id
            );


        const userTimeline =
            timelines.filter(
                item =>
                    item.userId ===
                    user.id
            );


        const userProducts =
            products.filter(
                item =>
                    item.userId ===
                    user.id ||
                    item.sellerId ===
                    user.id
            );


        const userServices =
            services.filter(
                item =>
                    item.userId ===
                    user.id ||
                    item.providerId ===
                    user.id
            );


        const userReports =
            reports.filter(
                item =>
                    item.reporterId ===
                    user.id ||
                    item.targetUserId ===
                    user.id
            );


        res.json({

            user:
                safeUser(
                    user
                ),

            profile:
                profile ||
                null,

            timeline:
                userTimeline,

            products:
                userProducts,

            services:
                userServices,

            reports:
                userReports

        });

    }
);


/* =====================================================
   ADMIN CHANGE USER STATUS
===================================================== */

app.patch(
    "/api/admin/users/:userId/status",
    requireAdmin,
    (req, res) => {

        const {
            status,
            reason
        } = req.body;


        const allowedStatuses = [

            "active",
            "restricted",
            "suspended"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid account status."

                });

        }


        const users =
            readData(
                registrationFile
            );


        const index =
            users.findIndex(
                user =>
                    user.id ===
                    req.params.userId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "User not found."

                });

        }


        users[index].accountStatus =
            status;

        users[index].statusUpdatedAt =
            new Date().toISOString();


        writeData(
            registrationFile,
            users
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "USER_STATUS_CHANGED",

            targetType:
                "user",

            targetId:
                req.params.userId,

            reason:
                reason ||
                "Administrator changed account status.",

            details: {

                newStatus:
                    status

            }

        });


        res.json({

            message:
                "User account status updated.",

            user:
                safeUser(
                    users[index]
                )

        });

    }
);


/* =====================================================
   ADMIN USER VERIFICATION
===================================================== */

app.patch(
    "/api/admin/users/:userId/verification",
    requireAdmin,
    (req, res) => {

        const {
            status,
            reason
        } = req.body;


        const allowedStatuses = [

            "unverified",
            "pending",
            "verified",
            "rejected"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid verification status."

                });

        }


        const users =
            readData(
                registrationFile
            );


        const index =
            users.findIndex(
                user =>
                    user.id ===
                    req.params.userId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "User not found."

                });

        }


        users[index].verificationStatus =
            status;

        users[index].verificationUpdatedAt =
            new Date().toISOString();


        writeData(
            registrationFile,
            users
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "USER_VERIFICATION_CHANGED",

            targetType:
                "user",

            targetId:
                req.params.userId,

            reason:
                reason ||
                "Administrator changed verification status.",

            details: {

                newStatus:
                    status

            }

        });


        res.json({

            message:
                "User verification status updated.",

            user:
                safeUser(
                    users[index]
                )

        });

    }
);


/* =====================================================
   TIMELINE POST
===================================================== */

app.post(
    "/api/timeline",
    (req, res) => {

        const {

            userId,
            type,
            title,
            content,
            image,
            video,
            productId,
            serviceId

        } = req.body;


        if (
            !userId ||
            !content
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "User ID and content are required."

                });

        }


        const timelines =
            readData(
                timelinesFile
            );


        const post = {

            id:
                createId("timeline"),

            userId,

            type:
                type ||
                "post",

            title:
                title ||
                "",

            content,

            image:
                image ||
                "",

            video:
                video ||
                "",

            productId:
                productId ||
                "",

            serviceId:
                serviceId ||
                "",

            status:
                "active",

            moderationStatus:
                "pending",

            reportCount:
                0,

            createdAt:
                new Date().toISOString()

        };


        timelines.push(
            post
        );


        writeData(
            timelinesFile,
            timelines
        );


        res
            .status(201)
            .json({

                message:
                    "Timeline post created.",

                post

            });

    }
);


/* =====================================================
   GET TIMELINE
===================================================== */

app.get(
    "/api/timeline/:userId",
    (req, res) => {

        const timelines =
            readData(
                timelinesFile
            );


        const posts =
            timelines
                .filter(
                    post =>
                        post.userId ===
                        req.params.userId &&
                        post.status !==
                        "removed"
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                );


        res.json(
            posts
        );

    }
);


/* =====================================================
   ADMIN TIMELINE
===================================================== */

app.get(
    "/api/admin/timeline",
    requireAdmin,
    (req, res) => {

        const timelines =
            readData(
                timelinesFile
            );


        const posts =
            [...timelines]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                );


        res.json({

            total:
                posts.length,

            posts

        });

    }
);


/* =====================================================
   ADMIN MODERATE TIMELINE
===================================================== */

app.patch(
    "/api/admin/timeline/:postId",
    requireAdmin,
    (req, res) => {

        const {
            status,
            moderationStatus,
            reason
        } = req.body;


        const allowedStatus = [

            "active",
            "hidden",
            "removed"

        ];


        const allowedModeration = [

            "pending",
            "approved",
            "flagged",
            "rejected"

        ];


        if (
            status &&
            !allowedStatus.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid timeline status."

                });

        }


        if (
            moderationStatus &&
            !allowedModeration.includes(
                moderationStatus
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid moderation status."

                });

        }


        const timelines =
            readData(
                timelinesFile
            );


        const index =
            timelines.findIndex(
                post =>
                    post.id ===
                    req.params.postId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "Timeline post not found."

                });

        }


        if (status) {

            timelines[index].status =
                status;

        }


        if (moderationStatus) {

            timelines[index].moderationStatus =
                moderationStatus;

        }


        timelines[index].moderatedAt =
            new Date().toISOString();

        timelines[index].moderatedBy =
            req.admin.email;


        writeData(
            timelinesFile,
            timelines
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "TIMELINE_MODERATION",

            targetType:
                "timeline",

            targetId:
                req.params.postId,

            reason:
                reason ||
                "Administrator moderated timeline post.",

            details: {

                status:
                    timelines[index].status,

                moderationStatus:
                    timelines[index]
                        .moderationStatus

            }

        });


        res.json({

            message:
                "Timeline post moderated successfully.",

            post:
                timelines[index]

        });

    }
);


/* =====================================================
   ADMIN PRODUCTS
===================================================== */

app.get(
    "/api/admin/products",
    requireAdmin,
    (req, res) => {

        const query =
            (req.query.q || "")
                .trim()
                .toLowerCase();


        let products =
            readData(
                productsFile
            );


        if (query) {

            products =
                products.filter(
                    product =>
                        JSON.stringify(
                            product
                        )
                            .toLowerCase()
                            .includes(query)
                );

        }


        products =
            [...products]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                );


        res.json({

            total:
                products.length,

            products

        });

    }
);


/* =====================================================
   ADMIN PRODUCT MODERATION
===================================================== */

app.patch(
    "/api/admin/products/:productId",
    requireAdmin,
    (req, res) => {

        const {
            status,
            moderationStatus,
            reason
        } = req.body;


        const allowedStatus = [

            "active",
            "hidden",
            "removed"

        ];


        const allowedModeration = [

            "pending",
            "approved",
            "flagged",
            "rejected"

        ];


        if (
            status &&
            !allowedStatus.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid product status."

                });

        }


        if (
            moderationStatus &&
            !allowedModeration.includes(
                moderationStatus
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid product moderation status."

                });

        }


        const products =
            readData(
                productsFile
            );


        const index =
            products.findIndex(
                product =>
                    product.id ===
                    req.params.productId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "Product not found."

                });

        }


        if (status) {

            products[index].status =
                status;

        }


        if (moderationStatus) {

            products[index].moderationStatus =
                moderationStatus;

        }


        products[index].moderatedAt =
            new Date().toISOString();

        products[index].moderatedBy =
            req.admin.email;


        writeData(
            productsFile,
            products
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "PRODUCT_MODERATION",

            targetType:
                "product",

            targetId:
                req.params.productId,

            reason:
                reason ||
                "Administrator moderated product."

        });


        res.json({

            message:
                "Product moderated successfully.",

            product:
                products[index]

        });

    }
);


/* =====================================================
   ADMIN SERVICES
===================================================== */

app.get(
    "/api/admin/services",
    requireAdmin,
    (req, res) => {

        const query =
            (req.query.q || "")
                .trim()
                .toLowerCase();


        let services =
            readData(
                servicesFile
            );


        if (query) {

            services =
                services.filter(
                    service =>
                        JSON.stringify(
                            service
                        )
                            .toLowerCase()
                            .includes(query)
                );

        }


        services =
            [...services]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                );


        res.json({

            total:
                services.length,

            services

        });

    }
);


/* =====================================================
   ADMIN SERVICE MODERATION
===================================================== */

app.patch(
    "/api/admin/services/:serviceId",
    requireAdmin,
    (req, res) => {

        const {
            status,
            moderationStatus,
            reason
        } = req.body;


        const allowedStatus = [

            "active",
            "hidden",
            "removed"

        ];


        const allowedModeration = [

            "pending",
            "approved",
            "flagged",
            "rejected"

        ];


        if (
            status &&
            !allowedStatus.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid service status."

                });

        }


        if (
            moderationStatus &&
            !allowedModeration.includes(
                moderationStatus
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid service moderation status."

                });

        }


        const services =
            readData(
                servicesFile
            );


        const index =
            services.findIndex(
                service =>
                    service.id ===
                    req.params.serviceId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "Service not found."

                });

        }


        if (status) {

            services[index].status =
                status;

        }


        if (moderationStatus) {

            services[index].moderationStatus =
                moderationStatus;

        }


        services[index].moderatedAt =
            new Date().toISOString();

        services[index].moderatedBy =
            req.admin.email;


        writeData(
            servicesFile,
            services
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "SERVICE_MODERATION",

            targetType:
                "service",

            targetId:
                req.params.serviceId,

            reason:
                reason ||
                "Administrator moderated service."

        });


        res.json({

            message:
                "Service moderated successfully.",

            service:
                services[index]

        });

    }
);


/* =====================================================
   USER REPORTS
===================================================== */

app.post(
    "/api/reports",
    (req, res) => {

        const {
            reporterId,
            targetUserId,
            targetType,
            targetId,
            category,
            description
        } = req.body;


        if (
            !reporterId ||
            !category ||
            !description
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Reporter, category and description are required."

                });

        }


        const reports =
            readData(
                reportsFile
            );


        const report = {

            id:
                createId("report"),

            reporterId,

            targetUserId:
                targetUserId ||
                "",

            targetType:
                targetType ||
                "",

            targetId:
                targetId ||
                "",

            category,

            description,

            status:
                "open",

            priority:
                "normal",

            assignedTo:
                "",

            adminNotes:
                "",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        reports.push(
            report
        );


        writeData(
            reportsFile,
            reports
        );


        res
            .status(201)
            .json({

                message:
                    "Report submitted successfully.",

                reportId:
                    report.id

            });

    }
);


/* =====================================================
   ADMIN REPORTS
===================================================== */

app.get(
    "/api/admin/reports",
    requireAdmin,
    (req, res) => {

        const reports =
            readData(
                reportsFile
            );


        res.json({

            total:
                reports.length,

            open:
                reports.filter(
                    item =>
                        item.status ===
                        "open"
                ).length,

            reports:
                [...reports]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt || 0
                            ) -
                            new Date(
                                a.createdAt || 0
                            )
                    )

        });

    }
);


/* =====================================================
   ADMIN UPDATE REPORT
===================================================== */

app.patch(
    "/api/admin/reports/:reportId",
    requireAdmin,
    (req, res) => {

        const {
            status,
            priority,
            adminNotes,
            assignedTo
        } = req.body;


        const allowedStatuses = [

            "open",
            "investigating",
            "resolved",
            "dismissed"

        ];


        const allowedPriority = [

            "low",
            "normal",
            "high",
            "critical"

        ];


        if (
            status &&
            !allowedStatuses.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid report status."

                });

        }


        if (
            priority &&
            !allowedPriority.includes(
                priority
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid report priority."

                });

        }


        const reports =
            readData(
                reportsFile
            );


        const index =
            reports.findIndex(
                report =>
                    report.id ===
                    req.params.reportId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "Report not found."

                });

        }


        if (status) {

            reports[index].status =
                status;

        }


        if (priority) {

            reports[index].priority =
                priority;

        }


        if (
            typeof adminNotes ===
            "string"
        ) {

            reports[index].adminNotes =
                adminNotes;

        }


        if (
            typeof assignedTo ===
            "string"
        ) {

            reports[index].assignedTo =
                assignedTo;

        }


        reports[index].updatedAt =
            new Date().toISOString();


        writeData(
            reportsFile,
            reports
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "REPORT_UPDATED",

            targetType:
                "report",

            targetId:
                req.params.reportId,

            reason:
                "Administrator updated a trust and safety report."

        });


        res.json({

            message:
                "Report updated.",

            report:
                reports[index]

        });

    }
);


/* =====================================================
   BRAVE SUPPORT MESSAGES
===================================================== */

app.post(
    "/api/messages",
    (req, res) => {

        const {
            userId,
            subject,
            message,
            category
        } = req.body;


        if (
            !userId ||
            !message
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "User ID and message are required."

                });

        }


        const messages =
            readData(
                messagesFile
            );


        const newMessage = {

            id:
                createId("message"),

            userId,

            subject:
                subject ||
                "BRAVE Support",

            category:
                category ||
                "support",

            message,

            status:
                "unread",

            adminReply:
                "",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        messages.push(
            newMessage
        );


        writeData(
            messagesFile,
            messages
        );


        res
            .status(201)
            .json({

                message:
                    "Message sent to BRAVE support.",

                data:
                    newMessage

            });

    }
);


/* =====================================================
   ADMIN SUPPORT MESSAGES
===================================================== */

app.get(
    "/api/admin/messages",
    requireAdmin,
    (req, res) => {

        const messages =
            readData(
                messagesFile
            );


        res.json({

            total:
                messages.length,

            unread:
                messages.filter(
                    item =>
                        item.status ===
                        "unread"
                ).length,

            messages:
                [...messages]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt || 0
                            ) -
                            new Date(
                                a.createdAt || 0
                            )
                    )

        });

    }
);


/* =====================================================
   ADMIN REPLY TO SUPPORT MESSAGE
===================================================== */

app.patch(
    "/api/admin/messages/:messageId",
    requireAdmin,
    (req, res) => {

        const {
            status,
            adminReply
        } = req.body;


        const allowedStatuses = [

            "unread",
            "read",
            "replied",
            "closed"

        ];


        if (
            status &&
            !allowedStatuses.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid message status."

                });

        }


        const messages =
            readData(
                messagesFile
            );


        const index =
            messages.findIndex(
                item =>
                    item.id ===
                    req.params.messageId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "Message not found."

                });

        }


        if (status) {

            messages[index].status =
                status;

        }


        if (
            typeof adminReply ===
            "string"
        ) {

            messages[index].adminReply =
                adminReply;

            messages[index].status =
                "replied";

        }


        messages[index].updatedAt =
            new Date().toISOString();


        writeData(
            messagesFile,
            messages
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "SUPPORT_MESSAGE_UPDATED",

            targetType:
                "message",

            targetId:
                req.params.messageId,

            reason:
                "Administrator handled a BRAVE support message."

        });


        res.json({

            message:
                "Support message updated.",

            data:
                messages[index]

        });

    }
);


/* =====================================================
   ADMIN MODERATION FLAG
===================================================== */

app.post(
    "/api/admin/moderation",
    requireAdmin,
    (req, res) => {

        const {
            targetType,
            targetId,
            userId,
            flagType,
            confidence,
            reason,
            source
        } = req.body;


        if (
            !targetType ||
            !targetId ||
            !flagType ||
            !reason
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Moderation information is incomplete."

                });

        }


        const moderation =
            readData(
                moderationFile
            );


        const item = {

            id:
                createId(
                    "moderation"
                ),

            targetType,

            targetId,

            userId:
                userId ||
                "",

            flagType,

            confidence:
                confidence ??
                null,

            reason,

            source:
                source ||
                "admin",

            status:
                "pending_review",

            reviewedBy:
                "",

            reviewerDecision:
                "",

            reviewerNotes:
                "",

            createdAt:
                new Date().toISOString(),

            reviewedAt:
                null

        };


        moderation.push(
            item
        );


        writeData(
            moderationFile,
            moderation
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "MODERATION_FLAG_CREATED",

            targetType,

            targetId,

            reason

        });


        res
            .status(201)
            .json({

                message:
                    "Moderation flag created.",

                moderation:
                    item

            });

    }
);


/* =====================================================
   ADMIN MODERATION QUEUE
===================================================== */

app.get(
    "/api/admin/moderation",
    requireAdmin,
    (req, res) => {

        const moderation =
            readData(
                moderationFile
            );


        res.json({

            total:
                moderation.length,

            pending:
                moderation.filter(
                    item =>
                        item.status ===
                        "pending_review"
                ).length,

            items:
                [...moderation]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt || 0
                            ) -
                            new Date(
                                a.createdAt || 0
                            )
                    )

        });

    }
);


/* =====================================================
   ADMIN REVIEW MODERATION FLAG
===================================================== */

app.patch(
    "/api/admin/moderation/:moderationId",
    requireAdmin,
    (req, res) => {

        const {
            decision,
            notes
        } = req.body;


        const allowedDecisions = [

            "approved",
            "content_removed",
            "user_warned",
            "user_restricted",
            "user_suspended",
            "dismissed"

        ];


        if (
            !allowedDecisions.includes(
                decision
            )
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid moderation decision."

                });

        }


        const moderation =
            readData(
                moderationFile
            );


        const index =
            moderation.findIndex(
                item =>
                    item.id ===
                    req.params.moderationId
            );


        if (index === -1) {

            return res
                .status(404)
                .json({

                    message:
                        "Moderation item not found."

                });

        }


        moderation[index].status =
            "reviewed";

        moderation[index].reviewedBy =
            req.admin.email;

        moderation[index].reviewerDecision =
            decision;

        moderation[index].reviewerNotes =
            notes ||
            "";

        moderation[index].reviewedAt =
            new Date().toISOString();


        writeData(
            moderationFile,
            moderation
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "MODERATION_DECISION",

            targetType:
                moderation[index]
                    .targetType,

            targetId:
                moderation[index]
                    .targetId,

            reason:
                notes ||
                "Administrator reviewed moderation flag.",

            details: {

                decision

            }

        });


        res.json({

            message:
                "Moderation decision recorded.",

            moderation:
                moderation[index]

        });

    }
);


/* =====================================================
   ADMIN AUDIT
===================================================== */

app.get(
    "/api/admin/audit",
    requireAdmin,
    (req, res) => {

        const logs =
            readData(
                auditFile
            );


        res.json({

            total:
                logs.length,

            logs:
                [...logs]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt || 0
                            ) -
                            new Date(
                                a.createdAt || 0
                            )
                    )

        });

    }
);


/* =====================================================
   ADMIN NOTIFICATIONS
===================================================== */

app.get(
    "/api/admin/notifications",
    requireAdmin,
    (req, res) => {

        const notifications =
            readData(
                notificationsFile
            );


        res.json({

            total:
                notifications.length,

            unread:
                notifications.filter(
                    item =>
                        item.read !== true
                ).length,

            notifications

        });

    }
);


/* =====================================================
   ADMIN ADVANCED DASHBOARD
===================================================== */

app.get(
    "/api/admin/dashboard",
    requireAdmin,
    (req, res) => {

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

            const timelines =
                readData(
                    timelinesFile
                );

            const reports =
                readData(
                    reportsFile
                );

            const messages =
                readData(
                    messagesFile
                );

            const moderation =
                readData(
                    moderationFile
                );


            const verifiedUsers =
                users.filter(
                    user =>
                        user.verificationStatus ===
                        "verified"
                ).length;


            const restrictedUsers =
                users.filter(
                    user =>
                        user.accountStatus ===
                        "restricted"
                ).length;


            const suspendedUsers =
                users.filter(
                    user =>
                        user.accountStatus ===
                        "suspended"
                ).length;


            const openReports =
                reports.filter(
                    report =>
                        report.status ===
                        "open" ||
                        report.status ===
                        "investigating"
                ).length;


            const unreadMessages =
                messages.filter(
                    message =>
                        message.status ===
                        "unread"
                ).length;


            const pendingModeration =
                moderation.filter(
                    item =>
                        item.status ===
                        "pending_review"
                ).length;


            const pendingProducts =
                products.filter(
                    product =>
                        product.moderationStatus ===
                        "pending"
                ).length;


            const pendingServices =
                services.filter(
                    service =>
                        service.moderationStatus ===
                        "pending"
                ).length;


            const recentUsers =
                [...users]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                    )
                    .slice(
                        0,
                        10
                    )
                    .map(
                        safeUser
                    );


            const recentProducts =
                [...products]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                    )
                    .slice(
                        0,
                        10
                    );


            const recentServices =
                [...services]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                    )
                    .slice(
                        0,
                        10
                    );


            const recentReports =
                [...reports]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                    )
                    .slice(
                        0,
                        10
                    );


            res.json({

                users:
                    users.length,

                products:
                    products.length,

                services:
                    services.length,

                businesses:
                    businesses.length,

                timelines:
                    timelines.length,

                verifiedUsers,

                restrictedUsers,

                suspendedUsers,

                openReports,

                unreadMessages,

                pendingModeration,

                pendingProducts,

                pendingServices,

                recentUsers,

                recentProducts,

                recentServices,

                recentReports

            });


        } catch (error) {

            console.error(
                "Advanced admin dashboard error:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Unable to load administrator dashboard."

                });

        }

    }
);


/* =====================================================
   ORIGINAL DASHBOARD
===================================================== */

app.get(
    "/api/dashboard",
    (req, res) => {

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
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                    )
                    .slice(
                        0,
                        10
                    )
                    .map(
                        safeUser
                    );


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


            res
                .status(500)
                .json({

                    message:
                        "Unable to load dashboard."

                });

        }

    }
);


/* =====================================================
   ADMIN OVERVIEW
===================================================== */

app.get(
    "/api/admin/overview",
    requireAdmin,
    (req, res) => {

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

            const reports =
                readData(
                    reportsFile
                );

            const messages =
                readData(
                    messagesFile
                );

            const moderation =
                readData(
                    moderationFile
                );

            const timelines =
                readData(
                    timelinesFile
                );


            res.json({

                users:
                    users.length,

                products:
                    products.length,

                services:
                    services.length,

                businesses:
                    businesses.length,

                timelines:
                    timelines.length,

                verifiedUsers:
                    users.filter(
                        user =>
                            user.verificationStatus ===
                            "verified"
                    ).length,

                restrictedUsers:
                    users.filter(
                        user =>
                            user.accountStatus ===
                            "restricted"
                    ).length,

                suspendedUsers:
                    users.filter(
                        user =>
                            user.accountStatus ===
                            "suspended"
                    ).length,

                pendingReports:
                    reports.filter(
                        report =>
                            report.status ===
                            "open" ||
                            report.status ===
                            "investigating"
                    ).length,

                unreadMessages:
                    messages.filter(
                        message =>
                            message.status ===
                            "unread"
                    ).length,

                pendingModeration:
                    moderation.filter(
                        item =>
                            item.status ===
                            "pending_review"
                    ).length,

                recentUsers:
                    [...users]
                        .sort(
                            (a, b) =>
                                new Date(
                                    b.createdAt || 0
                                ) -
                                new Date(
                                    a.createdAt || 0
                                )
                        )
                        .slice(
                            0,
                            10
                        )
                        .map(
                            safeUser
                        )

            });


        } catch (error) {

            console.error(
                "Admin overview error:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Unable to load admin overview."

                });

        }

    }
);


/* =====================================================
   ADMIN USER ACTION
===================================================== */

app.patch(
    "/api/admin/users/:userId/action",
    requireAdmin,
    (req, res) => {

        try {

            const {
                action,
                reason
            } = req.body;


            const users =
                readData(
                    registrationFile
                );


            const index =
                users.findIndex(
                    user =>
                        user.id ===
                        req.params.userId
                );


            if (index === -1) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found."

                    });

            }


            const user =
                users[index];


            if (
                action ===
                "verify"
            ) {

                user.verificationStatus =
                    "verified";

                user.verificationUpdatedAt =
                    new Date().toISOString();


                addAuditLog({

                    adminEmail:
                        req.admin.email,

                    action:
                        "USER_VERIFIED",

                    targetType:
                        "user",

                    targetId:
                        user.id,

                    reason:
                        reason ||
                        "Administrator verified user."

                });

            }


            else if (
                action ===
                "restrict"
            ) {

                user.accountStatus =
                    "restricted";

                user.statusUpdatedAt =
                    new Date().toISOString();


                addAuditLog({

                    adminEmail:
                        req.admin.email,

                    action:
                        "USER_RESTRICTED",

                    targetType:
                        "user",

                    targetId:
                        user.id,

                    reason:
                        reason ||
                        "Administrator restricted user."

                });

            }


            else if (
                action ===
                "suspend"
            ) {

                user.accountStatus =
                    "suspended";

                user.statusUpdatedAt =
                    new Date().toISOString();


                addAuditLog({

                    adminEmail:
                        req.admin.email,

                    action:
                        "USER_SUSPENDED",

                    targetType:
                        "user",

                    targetId:
                        user.id,

                    reason:
                        reason ||
                        "Administrator suspended user."

                });

            }


            else if (
                action ===
                "restore"
            ) {

                user.accountStatus =
                    "active";

                user.statusUpdatedAt =
                    new Date().toISOString();


                addAuditLog({

                    adminEmail:
                        req.admin.email,

                    action:
                        "USER_RESTORED",

                    targetType:
                        "user",

                    targetId:
                        user.id,

                    reason:
                        reason ||
                        "Administrator restored user."

                });

            }


            else {

                return res
                    .status(400)
                    .json({

                        message:
                            "Unknown user action."

                    });

            }


            writeData(
                registrationFile,
                users
            );


            const profiles =
                readData(
                    profilesFile
                );


            const profileIndex =
                profiles.findIndex(
                    profile =>
                        profile.userId ===
                        user.id
                );


            if (
                profileIndex !==
                -1
            ) {

                profiles[
                    profileIndex
                ].accountStatus =
                    user.accountStatus;

                profiles[
                    profileIndex
                ].verificationStatus =
                    user.verificationStatus;

                profiles[
                    profileIndex
                ].updatedAt =
                    new Date().toISOString();


                writeData(
                    profilesFile,
                    profiles
                );

            }


            res.json({

                message:
                    "User action completed successfully.",

                user:
                    safeUser(
                        user
                    )

            });


        } catch (error) {

            console.error(
                "Admin user action error:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Unable to complete user action."

                });

        }

    }
);


/* =====================================================
   ADMIN USER TIMELINE
===================================================== */

app.get(
    "/api/admin/users/:userId/timeline",
    requireAdmin,
    (req, res) => {

        try {

            const users =
                readData(
                    registrationFile
                );


            let user =
                users.find(
                    item =>
                        item.id ===
                        req.params.userId
                );


            if (!user) {

                const searchName =
                    decodeURIComponent(
                        req.params.userId
                    )
                        .replace(
                            /-/g,
                            " "
                        )
                        .trim()
                        .toLowerCase();


                user =
                    users.find(
                        item =>
                            item.fullname &&
                            item.fullname
                                .trim()
                                .toLowerCase() ===
                            searchName
                    );

            }


            if (!user) {

                return res
                    .status(404)
                    .json({

                        message:
                            "User not found."

                    });

            }


            const timelines =
                readData(
                    timelinesFile
                );

            const products =
                readData(
                    productsFile
                );

            const services =
                readData(
                    servicesFile
                );


            const timelinePosts =
                timelines.filter(
                    post =>
                        post.userId ===
                        user.id
                );


            const userProducts =
                products.filter(
                    product =>
                        product.userId ===
                        user.id ||
                        product.sellerId ===
                        user.id
                );


            const userServices =
                services.filter(
                    service =>
                        service.userId ===
                        user.id ||
                        service.providerId ===
                        user.id
                );


            const combined = [

                ...timelinePosts.map(
                    post => ({

                        ...post,

                        contentType:
                            "timeline"

                    })
                ),

                ...userProducts.map(
                    product => ({

                        ...product,

                        contentType:
                            "product"

                    })
                ),

                ...userServices.map(
                    service => ({

                        ...service,

                        contentType:
                            "service"

                    })
                )

            ]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                );


            res.json({

                user:
                    safeUser(
                        user
                    ),

                total:
                    combined.length,

                posts:
                    combined

            });


        } catch (error) {

            console.error(
                "Admin user timeline error:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Unable to load user timeline."

                });

        }

    }
);


/* =====================================================
   ADMIN CONTENT ACTION
===================================================== */

app.patch(
    "/api/admin/content/:contentId/action",
    requireAdmin,
    (req, res) => {

        try {

            const {
                action,
                reason
            } = req.body;


            let contentType =
                "";

            let file =
                null;

            let collection =
                [];

            let index =
                -1;


            const products =
                readData(
                    productsFile
                );


            index =
                products.findIndex(
                    item =>
                        item.id ===
                        req.params.contentId
                );


            if (
                index !==
                -1
            ) {

                contentType =
                    "product";

                file =
                    productsFile;

                collection =
                    products;

            }


            if (
                index ===
                -1
            ) {

                const services =
                    readData(
                        servicesFile
                    );


                const serviceIndex =
                    services.findIndex(
                        item =>
                            item.id ===
                            req.params.contentId
                    );


                if (
                    serviceIndex !==
                    -1
                ) {

                    contentType =
                        "service";

                    file =
                        servicesFile;

                    collection =
                        services;

                    index =
                        serviceIndex;

                }

            }


            if (
                index ===
                -1
            ) {

                const timelines =
                    readData(
                        timelinesFile
                    );


                const timelineIndex =
                    timelines.findIndex(
                        item =>
                            item.id ===
                            req.params.contentId
                    );


                if (
                    timelineIndex !==
                    -1
                ) {

                    contentType =
                        "timeline";

                    file =
                        timelinesFile;

                    collection =
                        timelines;

                    index =
                        timelineIndex;

                }

            }


            if (
                index ===
                -1
            ) {

                return res
                    .status(404)
                    .json({

                        message:
                            "Content not found."

                    });

            }


            if (
                action ===
                "approve"
            ) {

                collection[
                    index
                ].moderationStatus =
                    "approved";

                collection[
                    index
                ].status =
                    "active";

            }


            else if (
                action ===
                "hide"
            ) {

                collection[
                    index
                ].status =
                    "hidden";

            }


            else if (
                action ===
                "flag"
            ) {

                collection[
                    index
                ].moderationStatus =
                    "flagged";

            }


            else {

                return res
                    .status(400)
                    .json({

                        message:
                            "Unknown content action."

                    });

            }


            collection[
                index
            ].moderatedAt =
                new Date().toISOString();


            collection[
                index
            ].moderatedBy =
                req.admin.email;


            writeData(
                file,
                collection
            );


            addAuditLog({

                adminEmail:
                    req.admin.email,

                action:
                    "CONTENT_" +
                    action.toUpperCase(),

                targetType:
                    contentType,

                targetId:
                    req.params.contentId,

                reason:
                    reason ||
                    "Administrator moderated content."

            });


            res.json({

                message:
                    "Content action completed.",

                contentType,

                content:
                    collection[index]

            });


        } catch (error) {

            console.error(
                "Admin content action error:",
                error
            );


            res
                .status(500)
                .json({

                    message:
                        "Unable to moderate content."

                });

        }

    }
);


/* =====================================================
   ADMIN VERIFICATION QUEUE
===================================================== */

app.get(
    "/api/admin/verifications",
    requireAdmin,
    (req, res) => {

        const users =
            readData(
                registrationFile
            );


        const pending =
            users.filter(
                user =>
                    user.verificationStatus ===
                    "pending"
            );


        res.json({

            total:
                pending.length,

            verifications:
                pending.map(
                    safeUser
                )

        });

    }
);


/* =====================================================
   ADMIN VERIFICATION ACTION
===================================================== */

app.patch(
    "/api/admin/verifications/:userId/action",
    requireAdmin,
    (req, res) => {

        const {
            action,
            reason
        } = req.body;


        const users =
            readData(
                registrationFile
            );


        const index =
            users.findIndex(
                user =>
                    user.id ===
                    req.params.userId
            );


        if (
            index ===
            -1
        ) {

            return res
                .status(404)
                .json({

                    message:
                        "User not found."

                });

        }


        if (
            action ===
            "approve"
        ) {

            users[
                index
            ].verificationStatus =
                "verified";

        }

        else if (
            action ===
            "reject"
        ) {

            users[
                index
            ].verificationStatus =
                "rejected";

        }

        else {

            return res
                .status(400)
                .json({

                    message:
                        "Unknown verification action."

                });

        }


        users[
            index
        ].verificationUpdatedAt =
            new Date().toISOString();


        writeData(
            registrationFile,
            users
        );


        const profiles =
            readData(
                profilesFile
            );


        const profileIndex =
            profiles.findIndex(
                profile =>
                    profile.userId ===
                    users[index].id
            );


        if (
            profileIndex !==
            -1
        ) {

            profiles[
                profileIndex
            ].verificationStatus =
                users[
                    index
                ].verificationStatus;


            profiles[
                profileIndex
            ].updatedAt =
                new Date().toISOString();


            writeData(
                profilesFile,
                profiles
            );

        }


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "VERIFICATION_" +
                action.toUpperCase(),

            targetType:
                "user",

            targetId:
                users[index].id,

            reason:
                reason ||
                "Administrator processed verification."

        });


        res.json({

            message:
                "Verification action completed.",

            user:
                safeUser(
                    users[index]
                )

        });

    }
);


/* =====================================================
   ADMIN REPORT ACTION
===================================================== */

app.patch(
    "/api/admin/reports/:reportId/action",
    requireAdmin,
    (req, res) => {

        const {
            action,
            notes
        } = req.body;


        const reports =
            readData(
                reportsFile
            );


        const index =
            reports.findIndex(
                report =>
                    report.id ===
                    req.params.reportId
            );


        if (
            index ===
            -1
        ) {

            return res
                .status(404)
                .json({

                    message:
                        "Report not found."

                });

        }


        if (
            action ===
            "review"
        ) {

            reports[
                index
            ].status =
                "investigating";

        }

        else if (
            action ===
            "resolve"
        ) {

            reports[
                index
            ].status =
                "resolved";

        }

        else if (
            action ===
            "dismiss"
        ) {

            reports[
                index
            ].status =
                "dismissed";

        }

        else {

            return res
                .status(400)
                .json({

                    message:
                        "Unknown report action."

                });

        }


        if (
            typeof notes ===
            "string"
        ) {

            reports[
                index
            ].adminNotes =
                notes;

        }


        reports[
            index
        ].updatedAt =
            new Date().toISOString();


        writeData(
            reportsFile,
            reports
        );


        addAuditLog({

            adminEmail:
                req.admin.email,

            action:
                "REPORT_" +
                action.toUpperCase(),

            targetType:
                "report",

            targetId:
                req.params.reportId,

            reason:
                notes ||
                "Administrator processed report."

        });


        res.json({

            message:
                "Report action completed.",

            report:
                reports[index]

        });

    }
);


/* =====================================================
   ADMIN ACTIVITY
===================================================== */

app.get(
    "/api/admin/activity",
    requireAdmin,
    (req, res) => {

        const logs =
            readData(
                auditFile
            );


        const sorted =
            [...logs]
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt || 0
                        ) -
                        new Date(
                            a.createdAt || 0
                        )
                )
                .slice(
                    0,
                    200
                );


        res.json({

            total:
                sorted.length,

            activity:
                sorted

        });

    }
);


/* =====================================================
   ADMIN AI CONVERSATIONS
===================================================== */

app.get(
    "/api/admin/ai-conversations",
    requireAdmin,
    (req, res) => {

        const conversations =
            readData(
                aiConversationsFile
            );


        res.json({

            total:
                conversations.length,

            conversations:
                [...conversations]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.createdAt || 0
                            ) -
                            new Date(
                                a.createdAt || 0
                            )
                    )
                    .slice(
                        0,
                        200
                    )

        });

    }
);


/* =====================================================
   SERVER STATUS
===================================================== */

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            status:
                "online",

            message:
                "BRAVE backend is working.",

            time:
                new Date().toISOString()

        });

    }
);


/* =====================================================
   404 API HANDLER
===================================================== */

app.use(
    "/api",
    (req, res) => {

        res
            .status(404)
            .json({

                message:
                    "BRAVE API endpoint not found."

            });

    }
);


/* =====================================================
   SERVER ERROR HANDLER
===================================================== */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Unhandled server error:",
            error
        );


        res
            .status(500)
            .json({

                message:
                    "BRAVE server encountered an unexpected error."

            });

    }
);


/* =====================================================
   START SERVER
===================================================== */

const PORT =
    process.env.PORT ||
    3000;


app.listen(
    PORT,
    () => {

        console.log(
            `BRAVE backend is running on port ${PORT}`
        );

    }
);