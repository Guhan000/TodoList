const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
const _ = require("lodash");

const app = express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// let items = ["Buy food","Cook food","eat food"];
// let workItems = [];

// connection
mongoose.connect("mongodb+srv://guhan:guhan007@cluster0.svllg.mongodb.net/todolistDB", {useNewUrlParser: true});

// Schema
const itemsSchema = {
    name: String
};

// model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name : "Welcome to your Todolist!"
})
const item2 = new Item({
    name: "Hit the + button to add a new item"
})
const item3 = new Item({
    name: "<-- Hit the to delete an item"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req,res) {
    // let day = date();
    // var day = currentDay;
    // if(currentDay === 6 || currentDay === 0){
        // day=currentDay;
        // res.render("list.ejs", {listOfDays: day});
    // }else{
    Item.find({},function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully saved the defaultItems to DB.")
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today",newListItems: foundItems});
        }        
    });

    
    // }
})

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundItems){
        if(!err){
            if(!foundItems){
                const list = new List({
                    name: customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{listTitle: foundItems.name, newListItems: foundItems.items})
            }
        }
    });

    
})


app.post("/", (request,response) => {
    const itemName = request.body.newItem;
    const listName = request.body.list;

    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        item.save();
        response.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundItems){
            foundItems.items.push(item);
            foundItems.save();
            response.redirect("/"+listName);
        });
    }
    
    
})

app.post("/delete", (req,res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if(!err){
                console.log("Successfully deleted checked item.")
                res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundItems){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
    
})

app.get("/work", function(req,res){
    res.render("list", {listTitle: "Work List",newListItems: workItems})
})



app.get("/about", function(req,res){
    res.render("about");
})

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port);

app.listen(port, function(){
    console.log("Server started running at port 3000");
})


