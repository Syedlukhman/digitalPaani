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
]

const users = [
    { name: 'Syed Lukman', id: '1001', type: 'reader', isSuperUser: true },
    { name: 'Syed Usman', id: '1002', type: 'author', isSuperUser: false }
]

app.get('/getToken', (req, res) => {
    const { userId, userName } = req.body;
    const [user] = users.filter(a => { if (a.id === userId) return a; });
    if (!user) {
        return res.status(404).send(`No user with name: ${userName} was found`)
    }
    const token = jwt.sign({ ...user }, "authenticateDP");
    res.send({ ...user, token })
});

app.get('/books', decodeJwt, (req, res) => {
    res.status(200).send(books)
});

app.get('/getBooksByAuthor/:author', decodeJwt, (req, res) => {
    const { author } = req.params;
    const booksByAuthor = books.filter(b => b.author === author);
    if (!booksByAuthor?.length) {
        return res.status(404).send(`Books by author "${author}" not found`)
    }
    res.send(booksByAuthor)
});

app.get('/getBooksByYear/:year', decodeJwt, (req, res) => {
    const { year } = req.params;
    const booksByYear = books.filter(b => b.year === parseInt(year));
    if (!booksByYear?.length) {
        return res.status(404).send(`No Books were published in year ${year}!`)
    }
    res.send(booksByYear)
});

app.get('/getBookById/:id', decodeJwt, (req, res) => {
    const { id } = req.params;
    const [bookById] = books.filter(b => b.id === id);
    if (!bookById) {
        return res.status(404).send(`Book with id "${id}" not found`)
    }
    res.send(bookById)
});

app.get('/getBookByTitle/:title', decodeJwt, (req, res) => {
    const { title } = req.params;
    const [bookByTitle] = books.filter(b => b.title === title);
    if (!bookByTitle) {
        return res.status(404).send(`Books with title "${title}" not found`)
    }
    res.send(bookByTitle)
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
    res.status(200).send("Book add successfully!!")
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
console.log("hello")
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
    res.send(book);
});

app.delete('/deleteBook/:id', decodeJwt, (req, res) => {
    const bookId = req.params.id;
    const book = books.find((b) => b.id == bookId);
    const { userId, isSuperUser } = req.user;

    //Check if author is same as user or is a super user.
    if (!(isSuperUser || book.authorId == userId)) {
        return res.status(400).send(`Authorization failed to delete book ${book.title}!!`)
    };
    const bookIndex = books.indexOf(book);
    books.splice(bookIndex, 1);
    res.send(`Book deleted successfully!!`);
});

app.delete('/deleteBooksByAuthor/:authorId', decodeJwt, (req, res) => {
    const authorId = req.params.authorId;
    for (let i = books.length - 1; i >= 0; i--) {
        if (books[i].authorId === authorId) {
            books.splice(i, 1);
        }
    }
    res.send(`Book(s) are deleted successfully!!`);
});

app.listen(9000, () => {
    console.log("Server has started")
});