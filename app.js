const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

const workItems = [];

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/")   
    } else {
      const day = date.getDate();
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
  });
});

app.get("/:pageName", function(req, res){
  const pageName = req.params.pageName;

  List.findOne({name: pageName}, function(err, foundList){
    if (!err){
      console.log(foundList);
      if (!foundList){
        //Path that create a new list 
        const list = new List ({
          name: pageName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + pageName);
      } else {
        //Path that show an existing list
        // const day = date.getDate();
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  }); 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
});

// With this line of code commented you can make changes on your title to display dates instead of just customs name but you will have to find a way to make the whole code compatible that am still trying how to, if you can fork the code and update it i will merge it....

// app.post("/", function(req, res){

//   const itemName = req.body.newItem;
//   const listName = req.body.list;

//   const item = new Item({
//     name: itemName
//   });

//   const day = date.getDate();
//   if (listName === day){
//     item.save();
//     res.redirect("/");
//   } else {
//     List.findOne({name: listName}, function(err, foundList){
//       foundList.items.push(item);
//       foundList.save();
//       res.redirect("/" + listName);
//     });
//   }
// });

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  console.log(checkedItemId);

  Item.findByIdAndRemove(checkedItemId, (err) => {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log(`Server running at port ${PORT}`);
});
