// Book Constructor
class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

class UI {
    addBookToList(book) {
        const list = document.querySelector("#book-list");
        const row = document.createElement("tr");

        row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td class="delete">
        <span class="btn btn-danger">X</span>
      </td>
      <td class="edit">
        <span class="btn btn-warning">Edit</span>
      </td>
    `;

        list.appendChild(row);
    }

    clearFields() {
        document.querySelector("#title").value = "";
        document.querySelector("#author").value = "";
        document.querySelector("#isbn").value = "";
    }

    clearTasks() {
        document.querySelector("#book-list").innerHTML = "";
    }

    deleteBook(item) {
        item.parentElement.remove();
    }

    showAlert(message, type) {
        this.clearAlert();
        const div = document.createElement("div");
        div.className = `alert alert-${type}`;
        div.innerText = message;
        document.querySelector(".show-alert").appendChild(div);

        setTimeout(() => {
            this.clearAlert();
        }, 3000);
    }

    clearAlert() {
        const currentAlert = document.querySelector(".alert");
        if (currentAlert) {
            currentAlert.remove();
        }
    }
}

class Storage {
    getBooks() {
        let books;
        if (localStorage.getItem("books") === null) {
            books = [];
        } else {
            books = JSON.parse(localStorage.getItem("books"));
        }
        return books;
    }

    addbooks(book) {
        const books = this.getBooks();
        books.push(book);
        localStorage.setItem("books", JSON.stringify(books));
    }

    displayBook() {
        const books = this.getBooks();
        books.forEach(function (book) {
            const ui = new UI();
            ui.addBookToList(book);
        });
    }

    removeBook(isbn) {
        const books = this.getBooks();
        const updated = books.filter((book) => book.isbn !== isbn);
        localStorage.setItem("books", JSON.stringify(updated));
    }

    clearBook() {
        localStorage.removeItem("books");
    }

    updateBook(updatedBook, oldIsbn) {
        let books = this.getBooks();
        books = books.map((book) =>
            book.isbn === oldIsbn ? updatedBook : book
        );
        localStorage.setItem("books", JSON.stringify(books));
    }
}

const storage = new Storage();
document.addEventListener("DOMContentLoaded", () => storage.displayBook());

// Global edit mode flags
let isEditMode = false;
let currentEditingISBN = "";

// Form submit
document.querySelector("#book-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const isbn = document.querySelector("#isbn").value;

    const ui = new UI();
    const storage = new Storage();

    if (title === "" || author === "" || isbn === "") {
        ui.showAlert("Please fill all the fields", "danger");
        return;
    }

    if (isEditMode) {
        const updatedBook = new Book(title, author, isbn);
        storage.updateBook(updatedBook, currentEditingISBN);
        ui.clearTasks();
        storage.displayBook();
        ui.showAlert("Book Updated", "success");
        isEditMode = false;
        currentEditingISBN = "";
        ui.clearFields();
    } else {
        let bookExist = false;
        const books = document.querySelectorAll("#book-list tr");
        for (const bookRow of books) {
            const existingTitle = bookRow.querySelector("td:nth-child(1)").innerText;
            const existingIsbn = bookRow.querySelector("td:nth-child(3)").innerText;
            if (existingTitle === title || existingIsbn === isbn) {
                bookExist = true;
                break;
            }
        }

        if (bookExist) {
            ui.showAlert("Book with same title and isbn already exists", "danger");
        } else {
            const book = new Book(title, author, isbn);
            ui.addBookToList(book);
            storage.addbooks(book);
            ui.showAlert("Book Added", "success");
            ui.clearFields();
        }
    }
});

// Delete or Edit book
document.querySelector("#book-list").addEventListener("click", function (e) {
    const ui = new UI();
    const storage = new Storage();

    // Delete
    if (e.target.parentElement.classList.contains("delete")) {
        const isbn = e.target.parentElement.previousElementSibling.innerText;
        ui.deleteBook(e.target.parentElement);
        storage.removeBook(isbn);
        ui.showAlert("Book Deleted", "success");
    }

    // Edit
    if (e.target.parentElement.classList.contains("edit")) {
        const row = e.target.closest("tr");
        const title = row.querySelector("td:nth-child(1)").innerText;
        const author = row.querySelector("td:nth-child(2)").innerText;
        const isbn = row.querySelector("td:nth-child(3)").innerText;

        document.querySelector("#title").value = title;
        document.querySelector("#author").value = author;
        document.querySelector("#isbn").value = isbn;

        isEditMode = true;
        currentEditingISBN = isbn;

        // ui.showAlert("Edit Mode: Update the book and submit", "info");
    }
});

// Clear all
document.querySelector("#clear").addEventListener("click", function () {
    const ui = new UI();
    const storage = new Storage();
    ui.clearTasks();
    storage.clearBook();
    ui.showAlert("All books cleared", "success");
});
