//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin_cerveux:test123@cluster0.n6qzt.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
  name: "Study"
});

const item2 = new Item({
  name: "Exercise"
});

const item3 = new Item({
  name: "Read a book"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema);








app.get("/", function (req, res) {
  Item.find({}, function (err, docs) {
    if (docs.length === 0) {
      Item.insertMany([item1, item2, item3], function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("todo ok");
        }
      })

      res.redirect("/")
  

     




      
    }else{
    res.render("list", {
      listTitle: "Today",
      newListItems: docs
    });

    }

  });





});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  var postItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    postItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(postItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  

});



app.post("/delete", function(req, res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function (err) {

      if(err){
        console.log("hubo un error");
      }
      
    })
    res.redirect("/");

  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }

    })
  }

 
} )






app.get("/:direccion", function(req, res){
  const param = _.capitalize(req.params.direccion);

List.findOne({name: param}, function(err, results){
  if(!results){
    const list = new List({
  name: param,
  items: defaultItems
});

list.save();
res.redirect("/" + param);
  }else{
    res.render("list", {listTitle: results.name, newListItems: results.items} )
  }
})















  
})






app.get("/about", function (req, res) {
  res.render("about");
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}






app.listen(port, function () {
  console.log("Server started on port 3000");
});



// Export the Express API
module.exports = app;