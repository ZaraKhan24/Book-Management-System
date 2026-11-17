const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const Book = require("./models/Book");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Helper function to format book data
const formatBook = (book) => ({
    id: book._id.toString(),
    title: book.title,
    author: book.author,
    category: book.category
});


// Helper function to format user data
const formatUser = (user) => ({
    id: user._id.toString(),
    name: user.name
});

// ===============================
// NAME APIs (Existing Frontend)
// ===============================

// GET - Retrieve name
app.get("/api/name", async (req, res) => {
    try {
        const user = await User.findOne();

        res.json({
            name: user ? user.name : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add/update name
app.post("/api/name", async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        let user = await User.findOne();

        if (user) {
            user.name = name.trim();
            await user.save();
        } else {
            user = await User.create({
                name: name.trim()
            });
        }

        res.status(201).json({
            message: "Name added successfully",
            name: user.name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT - Update name
app.put("/api/name", async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const user = await User.findOne();

        if (!user) {
            return res.status(404).json({
                message: "Name not found"
            });
        }

        user.name = name.trim();
        await user.save();

        res.json({
            message: "Name updated successfully",
            name: user.name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE - Delete name
app.delete("/api/name", async (req, res) => {
    try {
        const user = await User.findOneAndDelete();

        if (!user) {
            return res.status(404).json({
                message: "Name not found"
            });
        }

        res.json({
            message: "Name deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ===============================
// USER CRUD APIs
// ===============================

// GET - Retrieve all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();

        res.json(users.map(formatUser));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add a user
app.post("/api/users", async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const user = await User.create({
            name: name.trim()
        });

        res.status(201).json({
            message: "User added successfully",
            data: formatUser(user)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT - Update a user
app.put("/api/users/:id", async (req, res) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User updated successfully",
            data: formatUser(user)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Delete a user
app.delete("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ===============================
// BOOK CRUD APIs
// ===============================

// GET - Retrieve all books
app.get("/api/books", async (req, res) => {
    try {
        const books = await Book.find();

        res.json(books.map(formatBook));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add a new book
app.post("/api/books", async (req, res) => {
    try {
        const { title, author, category } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof category !== "string" || !category.trim()
        ) {
            return res.status(400).json({
                message: "Title, author and category are required"
            });
        }

        const book = await Book.create({
            title: title.trim(),
            author: author.trim(),
            category: category.trim()
        });

        res.status(201).json({
            message: "Book added successfully",
            data: formatBook(book)
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// PUT - Update an existing book

app.put("/api/books/:id", async (req, res) => {
    try {
        const { title, author, category } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            typeof category !== "string" || !category.trim()
        ) {
            return res.status(400).json({
                message: "Title, author and category are required"
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                author: author.trim(),
                category: category.trim()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book updated successfully",
            data: formatBook(book)
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// DELETE - Delete a book
app.delete("/api/books/:id", async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const books = await Book.find();

        res.json({
            message: "Book deleted successfully",
            data: books.map(formatBook)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ===============================
// CONNECT DATABASE AND START SERVER
// ===============================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Failed:", error.message);
    });
