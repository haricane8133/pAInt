// This program is to output an array format of the objects and colors used in the paint widget
// Take the console output of this and use it carefully
const obj = require("./objects_dict.json");

let s = "";

for(let key of Object.keys(obj)){
    s += "[" + "\"" + obj[key]["color"] + "\", \"" + obj[key]["name"] + "\"" + "],"
}
console.log(s);