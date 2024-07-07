const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
        return user.username === username;
    });
    if(userswithsamename.length>0){
        return true;
    }else{
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password);
    });
    if(validusers.length>0){
        return true;
    }else{
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message:"Error logging in."});
  }
  if(authenticatedUser(username,password)){
    let accessToken=jwt.sign({
        data: password
    },'access',{expiresIn: 60*60});
    req.session.authorization  = {
        accessToken, username
    }
    return res.status(200).send("User successfully logged in.");
  }else{
    return res.status(208).json({message:"Invalid login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const comment = req.body.comment;
    let reviews = books[isbn].reviews;
    let review ={};

    console.log(comment);
    console.log(reviews);
    console.log(reviews.length);

    if(comment){
        if(reviews.length>0){
            for(let i=1; i<=reviews.length; i++){
                console.log(i+" "+reviews[i]);
                if(reviews[i].reviewer===req.username){
                    reviews[i].reviewer=req.username;
                    reviews[i].comment=comment;
                }else{
                    review.reviewer=req.username;
                    review.comment=comment;
                    reviews.push(review);
                }
            }
        }else{
            review.reviewer=req.username;
            review.comment=comment;
            reviews.push(review);
        }
        res.send(JSON.stringify(reviews));
    }else{
        res.status(404).json({message:"Invalid or null comment."});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
