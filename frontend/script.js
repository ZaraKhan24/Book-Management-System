
const API_URL = "/api/books";
const NAME_URL = "/api/name";

// HTML elements
const bookForm = document.getElementById("bookForm");
const bookTitle = document.getElementById("bookTitle");
const bookAuthor = document.getElementById("bookAuthor");
const bookCategory = document.getElementById("bookCategory");

const booksTable = document.getElementById("booksTable");
const totalBooks = document.getElementById("totalBooks");
const totalCategories = document.getElementById("totalCategories");
const totalAuthors = document.getElementById("totalAuthors");
const bookCount = document.getElementById("bookCount");

const formHeading = document.getElementById("formHeading");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");

const userName = document.getElementById("userName");
const nameResponse = document.getElementById("nameResponse");

let editingId = null;

// ===================================
// GET - Fetch all books
// ===================================

async function loadBooks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load books");
        }

        const books = await response.json();

        displayBooks(books);
        updateStatistics(books);

    } catch (error) {
        booksTable.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Unable to connect to server.
                </td>
            </tr>
        `;

        console.error(error);
    }
}

// ===================================
// Display books in table
// ===================================

function displayBooks(books) {

    if (books.length === 0) {
        booksTable.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No books available. Add your first book!
                </td>
            </tr>
        `;
        return;
    }

    booksTable.innerHTML = books.map(book => `
        <tr>
            <td class="book-title">${escapeHTML(book.title)}</td>
            <td>${escapeHTML(book.author)}</td>
            <td>
                <span class="category-badge">
                    ${escapeHTML(book.category)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" data-action="edit" data-id="${book.id}">
                        Edit
                    </button>

                    <button class="delete-btn" data-action="delete" data-id="${book.id}">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Escape user-provided text before inserting it into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ===================================
// Update dashboard statistics
// ===================================

function updateStatistics(books) {

    const categories = new Set(books.map(book => book.category));
    const authors = new Set(books.map(book => book.author));

    totalBooks.textContent = books.length;
    totalCategories.textContent = categories.size;
    totalAuthors.textContent = authors.size;

    bookCount.textContent =
        `${books.length} ${books.length === 1 ? "Book" : "Books"}`;
}

// ===================================
// POST - Add new book
// PUT - Update existing book
// ===================================

bookForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const bookData = {
        title: bookTitle.value.trim(),
        author: bookAuthor.value.trim(),
        category: bookCategory.value
    };

    if (!bookData.title || !bookData.author || !bookData.category) {
        alert("Please fill in all fields.");
        return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Operation failed");
        }

        alert(result.message);

        resetForm();
        loadBooks();

    } catch (error) {
        alert(error.message);
    }
});

// ===================================
// Edit button - Load book in form
// ===================================

async function editBook(id) {

    try {
        const response = await fetch(API_URL);
        const books = await response.json();

        const book = books.find(b => b.id === id);

        if (!book) {
            alert("Book not found.");
            return;
        }

        editingId = id;

        bookTitle.value = book.title;
        bookAuthor.value = book.author;
        bookCategory.value = book.category;

        formHeading.textContent = "Update Book";
        submitButton.textContent = "Save Changes";
        cancelEdit.classList.remove("hidden");

        document.getElementById("addSection").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        alert("Unable to edit book.");
    }
}

// ===================================
// DELETE - Remove book
// ===================================

async function deleteBook(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);

        loadBooks();

    } catch (error) {
        alert(error.message);
    }
}

// ===================================
// Table event delegation
// ===================================


booksTable.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        editBook(id);
    }

    if (action === "delete") {
        deleteBook(id);
    }
});


// ===================================
// Reset form
// ===================================

function resetForm() {

    bookForm.reset();
    editingId = null;

    formHeading.textContent = "Add a New Book";
    submitButton.textContent = "+ Add Book";

    cancelEdit.classList.add("hidden");
}

cancelEdit.addEventListener("click", resetForm);

// ===================================
// GET - Return your name
// ===================================

document.getElementById("getName").addEventListener("click", async () => {

    try {
        const response = await fetch(NAME_URL);
        const data = await response.json();

        nameResponse.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        nameResponse.textContent = "Unable to connect to server.";
    }
});

// ===================================
// POST - Send your name to server
// ===================================

document.getElementById("postName").addEventListener("click", async () => {

    const name = userName.value.trim();

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    try {
        const response = await fetch(NAME_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        nameResponse.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        nameResponse.textContent = error.message;
    }
});

// Load books when website opens
loadBooks();
