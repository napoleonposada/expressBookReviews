const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
    if(!isValid(username)){
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    }else{
        return res.status(404).json({message:"User already exists."});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
/*
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});
*/

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await Promise.resolve(books); // Resolve with existing books data
    res.send(JSON.stringify(response, null, 4)); // Send response
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});
 

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    try{
        const isbn = req.params.isbn;
        const response = await Promise.resolve(books);
        res.send(JSON.stringify(books[isbn],null,4));
    }catch(error){
        console.error('Error fetching book '+isbn, error);
        res.status(500).send('Internal Server Error'); // Handle errors
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try{
        const author = req.params.author;
        let foundBook={};
        let foundBooks=[{}];
        let found = false;
        const response = await Promise.resolve(books);  // Waiting for the promise resolve
        for(let isbn=1;isbn<=Object.keys(books).length;isbn++){  // Search in Books for the specified author in params request
            if(books[isbn].author===author){
                found = true;                   // flag for a book found. At least, one.
                foundBook=books[isbn];
                foundBooks.push(foundBook);     // Add the found book to results list.
            }
        }
        if(found){
            res.send(JSON.stringify(foundBooks,null,4));
        }else{
            return res.status(404).json({message: "Book not found."});        
        }
    }catch(error){
        console.error('Error fetching books.', error);
        res.status(500).send('Internal Server Error'); // Handle errors
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try{
        const title = req.params.title;
        let foundBook={};
        let foundBooks=[{}];
        let found = false;
        const response = await Promise.resolve(books);          // Waiting for the promise resolve
        for(let isbn=1;isbn<=Object.keys(books).length;isbn++){ // Search in Books for the specified title in params request
            if(books[isbn].title===title){
                found = true;                                   // flag for a book found. At least, one.
                foundBook=books[isbn];
                foundBooks.push(foundBook);                     // Add the found book to results list.
            }
        }
        if(found){
            res.send(JSON.stringify(foundBooks,null,4));
        }else{
            return res.status(200).json({message: "Book not found."});        
        }
    }catch(error){
        console.error('Error fetching books.', error);
        res.status(500).send('Internal Server Error'); // Handle errors
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    let reviews = books[isbn].reviews;
    res.send(JSON.stringify(reviews));
});

module.exports.general = public_users;
