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
      res.render("list", {listTitle: day, newListItems: foundItems});
    } 
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  const day = date.getDate();
  if (listName === day){
    item.save();
    res.redirect("/");
  }
  item.save();
  res.redirect("/");
});

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

app.get("/:pageName", function(req, res){
  const pageName = req.params.pageName;

  List.findOne({name: pageName}, function(err, foundList){
    if (!err){
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
        const day = date.getDate();
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log(`Server running at port ${PORT}`);
});
