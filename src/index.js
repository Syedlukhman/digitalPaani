const express = require('express');
const jwt = require('jsonwebtoken');
const { decodeJwt } = require('./authentication');
const { addUserValidation, addBookValidation, updateBookValidation } = require('./validation');
const randomatic = require('randomatic');
const app = express();
app.use(express.json());

var books = [
    {
        title: "JavaScript",
        author: "Syed Usman",
        authorId: "1002",
        id: "1001",
        year: 2022
    },
    {
        title: "Python",
        author: "Syed Lukman",
        authorId: "1001",
        id: "1002",
        year: 2022
    }
];

const users = [
    { name: 'Syed Lukman', id: '1001', type: 'reader', isSuperUser: true },
    { name: 'Syed Usman', id: '1002', type: 'author', isSuperUser: false }
];

app.get('/getToken', (req, res) => {
    const { userId, userName } = req.body;
    const [user] = users.filter(a => { if (a.id === userId) return a; });
    if (!user) {
        return res.status(404).send(`No user with name: ${userName} was found`)
    }
    const token = jwt.sign({ ...user }, "authenticateDP");
    res.status(200).send({ ...user, token })
});

app.get('/books', decodeJwt, (req, res) => {
    const { author, year, id, title } = req.query;
    let filteredBooks = books;
    console.log("Jasvant");
    if (author) {
        filteredBooks = filteredBooks.filter(b => b.author === author);
    }
    if (year) {
        filteredBooks = filteredBooks.filter(b => b.year === parseInt(year));
    }
    if (id) {
        const bookById = filteredBooks.find(b => b.id === id);
        if (bookById) {
            return res.status(200).send(bookById);
        } else {
            return res.status(404).send(`Book with id "${id}" not found`);
        }
    }
    if (title) {
        const bookByTitle = filteredBooks.find(b => b.title === title);
        if (bookByTitle) {
            return res.status(200).send(bookByTitle);
        } else {
            return res.status(404).send(`Books with title "${title}" not found`);
        }
    }
    if (!filteredBooks.length) {
        return res.status(404).send('No books found');
    }
    res.status(200).send(filteredBooks)
});

app.post('/addBook', decodeJwt, addBookValidation, (req, res) => {
    const id = randomatic('a0', 4);
    const { authorId } = req.body;
    const [user] = users.filter(u => u.id == authorId)
    if (!user) return res.status(400).send("Only registered author's book can be added");
    const book = {
        id,
        ...req.body
    }
    books.push(book);
    res.status(200).send("Book add successfully!!");
});


app.put('/updateBook/:id', decodeJwt, updateBookValidation, (req, res) => {
    const bookId = req.params.id;
    const { userId, isSuperUser } = req.user;
    const book = books.find(b => b.id == bookId);
    if (!book) {
        return res.status(404).send(`Book not found`)
    }
    //Check if author is same as user or is a super user.
    if (!(isSuperUser || book.authorId == userId)) {
        return res.status(400).send(`Authorization failed to update book ${book.title}`)
    }
    books.map((b) => {
        if (b.id == bookId) {
            b.title = req.body.title ?? b.title;
            b.year = req.body.year ?? b.year
            if (req.body.author) {
                b.author = req.body.author;
                b.authorId = req.body.authorId;
            }
        }
    });
    res.status(200).send(book);
});

app.delete('/deleteBook', decodeJwt, (req, res) => {
    const { id, authorId } = req.query;
    const { userId, isSuperUser } = req.user;

    if (id) {
        const bookToDelete = books.find(b => b.id == id);
        if (!bookToDelete) {
            return res.status(404).send(`Book with id "${id}" not found`);
        }
        if (!(isSuperUser || bookToDelete.authorId == userId)) {
            return res.status(400).send(`Authorization failed to delete book ${bookToDelete.title}!!`);
        }
        const bookIndex = books.indexOf(bookToDelete);
        books.splice(bookIndex, 1);
        return res.status(200).send(`Book deleted successfully!!`);
    }

    if (authorId) {
        const deletedBooks = books.filter(b => b.authorId === authorId);
        if (deletedBooks.length === 0) {
            return res.status(404).send(`No books found with authorId "${authorId}"`);
        }
        if (!isSuperUser && deletedBooks.some(b => b.authorId != userId)) {
            return res.status(400).send(`Authorization failed to delete book(s) by authorId "${authorId}"!!`);
        }
        books = books.filter(b => b.authorId != authorId);
        return res.status(200).send(`Book(s) deleted successfully!!`);
    }
    return res.status(400).send('Invalid request');
});

app.post('/addUser', decodeJwt, addUserValidation, (req, res) => {
    const id = randomatic('a0', 4);
    const { isSuperUser } = req.body;
    const user = {
        id,
        ...req.body,
        isSuperUser: isSuperUser || false
    };
    users.push(user);
    res.status(200).send(users);
});

app.listen(9000, () => {
    console.log("http://localhost:9000/")
});