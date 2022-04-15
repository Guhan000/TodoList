module.exports = getDate;

function getDate(){

let date = new Date();
    
let options = {weekday: 'long', day:'numeric', month: 'long'}
let currentDay = date.toLocaleDateString("en-US",options);

return currentDay;
}