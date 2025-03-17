const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const UserModel = require("./model/User");
const FeedbackModel = require("./model/Feedback");
const { verifyUser } = require("./middleware/auth");
const sendOtpEmail = require('./mailer');
const generateOtp = require('./otp');
const CostAnalysis = require("./model/CostAnalysis");
const CarbonPaybackPeriodAnalysis = require("./model/CarbonPaybackPeriodAnalysis");

//JM - Lagyan lang ng 'Model' yung EnergyUsageBySource
const EnergyUsageBySourceModel = require('./model/EnergyUsageBySource');

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("Failed to connect to MongoDb", err));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, gender } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = "user";
        let otp = null;
        let otpExpires = null;
        if (role === "user") {
            otp = generateOtp();
            otpExpires = Date.now() + 3600000;
            sendOtpEmail(email, otp);
        }
        const newUser = new UserModel({ 
            name, 
            email, 
            password: hashedPassword, 
            gender, // Add gender field
            role, 
            otp, 
            otpExpires 
        });
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully. Please check your email for the OTP if you are a user." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "No Records Found" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Password does not match!" });
        }

        // If user is NOT verified, redirect them to verify OTP
        if (user.role === "user" && user.isVerified === false) {
            return res.json({
                message: "Please verify your email with the OTP sent to you.",
                redirect: "/verify-otp",
                email: email, // Send email for use in frontend
            });
        }

        // Store user session after verification
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        return res.json({ message: "Success", role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
});


app.get('/user', (req, res) => {
    if (req.session.user) {
        res.json({
            user: req.session.user,
            id: req.session.user.id, // Ensure user ID is returned
            name: req.session.user.name,
            email: req.session.user.email,
            role: req.session.user.role,
        });
    } else {
        res.status(401).json("Not Authenticated");
    }
});

app.post("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json("Failed to logout");
            } else {
                res.status(200).json("Logged out successfully");
            }
        });
    } else {
        res.status(400).json({ error: "No session found" });
    }
});

// Feedback functionality
app.post("/feedback", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json("Not Authenticated");
        }

        const { rating, comment } = req.body;
        const feedback = new FeedbackModel({
            name: req.session.user.name,
            rating,
            comment
        });
        const savedFeedback = await feedback.save();
        res.status(201).json(savedFeedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/feedback", async (req, res) => {
    try {
        const feedbacks = await FeedbackModel.find();
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        user.isVerified = true;
        user.otp = null; // Clear the OTP
        user.otpExpires = null; // Clear the OTP expiration
        await user.save();
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/resend-otp", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate new OTP
        const newOtp = generateOtp();
        const otpExpires = Date.now() + 3600000; // Expires in 1 hour

        // Update user record with new OTP
        user.otp = newOtp;
        user.otpExpires = otpExpires;
        await user.save();

        // Resend OTP via email
        sendOtpEmail(email, newOtp);

        res.json({ message: "A new OTP has been sent to your email." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// New route for fetching all users (for admin)
app.get("/admin/users", async (req, res) => {
    try {
        if (req.session.user && req.session.user.role === "admin") {
            const users = await UserModel.find();
            res.status(200).json(users);
        } else {
            res.status(403).json("Access denied");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New route for fetching all feedback (for admin)
app.get("/admin/feedback", async (req, res) => {
    try {
        if (req.session.user && req.session.user.role === "admin") {
            const feedbacks = await FeedbackModel.find();
            res.status(200).json(feedbacks);
        } else {
            res.status(403).json("Access denied");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/admin/users/:userId', async (req, res) => {
    const { userId } = req.params;  // Get user ID from the URL params
    const { role } = req.body;      // Get the new role from the request body

    try {
        // Check if the user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's role
        user.role = role;

        // Save the updated user back to the database
        await user.save();

        // Return the updated user
        res.status(200).json({ message: "User role updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "There was an error updating the role" });
    }
});

/** ➤ Save Cost Analysis */
app.post("/api/cost-analysis", async (req, res) => {
    try {
        console.log("📩 Received Cost Analysis Request:", req.body);
        const { user_id, TotalProductCost, TotalInstallationCost, TotalMaintenanceCost } = req.body;

        if (!user_id || !TotalProductCost || !TotalInstallationCost || !TotalMaintenanceCost) {
            return res.status(400).json({ error: "❌ Missing required fields" });
        }

        const GrandTotal = TotalProductCost + TotalInstallationCost + TotalMaintenanceCost;
        const newCostAnalysis = new CostAnalysis({ user_id, TotalProductCost, TotalInstallationCost, TotalMaintenanceCost, GrandTotal });

        await newCostAnalysis.save();
        console.log("✅ Cost Analysis Saved:", newCostAnalysis);
        res.status(201).json({ message: "✅ Cost Analysis Saved", data: newCostAnalysis });

    } catch (error) {
        console.error("❌ Error saving cost analysis:", error);
        res.status(500).json({ error: error.message });
    }
});

/** ➤ Save Carbon Payback Period Analysis */
app.post("/api/carbon-analysis", async (req, res) => {
    try {
        console.log("📩 Received Carbon Payback Analysis Request:", req.body);
        const { user_id, CarbonPaybackPeriod, TotalCarbonEmission } = req.body;

        if (!user_id || !CarbonPaybackPeriod || !TotalCarbonEmission) {
            return res.status(400).json({ error: "❌ Missing required fields" });
        }

        const newCarbonAnalysis = new CarbonPaybackPeriodAnalysis({ user_id, CarbonPaybackPeriod, TotalCarbonEmission });

        await newCarbonAnalysis.save();
        console.log("✅ Carbon Payback Analysis Saved:", newCarbonAnalysis);
        res.status(201).json({ message: "✅ Carbon Payback Analysis Saved", data: newCarbonAnalysis });

    } catch (error) {
        console.error("❌ Error saving carbon analysis:", error);
        res.status(500).json({ error: error.message });
    }
});

/** ➤ Save Energy Usage By Source */
app.post("/api/energy-usage", async (req, res) => {
    try {
        console.log("📩 Received Energy Usage Request:", req.body);
        const { user_id, Type, Emissions } = req.body;

        if (!user_id || !Type || !Emissions) {
            return res.status(400).json({ error: "❌ Missing required fields" });
        }

        const newEnergyUsage = new EnergyUsageBySourceModel({ user_id, Type, Emissions });

        await newEnergyUsage.save();
        console.log("✅ Energy Usage Saved:", newEnergyUsage);
        res.status(201).json({ message: "✅ Energy Usage Saved", data: newEnergyUsage });

    } catch (error) {
        console.error("❌ Error saving energy usage:", error);
        res.status(500).json({ error: error.message });
    }
});

/** JM - Top Renewable sources */
app.get("/admin/renewable-energy", async (req, res) => {
    try {
        const energyData = await EnergyUsageBySourceModel.aggregate([
            {
                $group: {
                    _id: "$Type", // Group by the Type of energy source
                    totalUsed: { $sum: "$Emissions" } // Sum the emissions for each type
                }
            }
        ]);

        // Format the data for the frontend
        const formattedData = energyData.map(item => ({
            source: item._id, // The type of energy source
            totalUsed: item.totalUsed // The total emissions for that source
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/** JM - Cost Analysis */
app.get("/admin/cost-analysis", async (req, res) => {
    try {
        const costData = await CostAnalysis.find().populate('user_id', 'email'); // Populate email only
        res.status(200).json(costData);
    } catch (error) {
        console.error("Error fetching cost analysis data:", error);
        res.status(500).json({ error: error.message });
    }
});

/** JM - Carbon Payback */
app.get("/admin/carbon-payback", async (req, res) => {
    try {
        const carbonData = await CarbonPaybackPeriodAnalysis.find().populate('user_id', 'email'); // Populate email only
        res.status(200).json(carbonData);
    } catch (error) {
        console.error("Error fetching carbon payback data:", error);
        res.status(500).json({ error: error.message });
    }
});


