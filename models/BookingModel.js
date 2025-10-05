const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    studentName:{
        type:String, //dataType
        required:true, //validate
    },
    gmail:{
        type:String,
        required:true,
    },
    tutorName:{
        type:String,
        required:true,
    },
    module:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true,
    },
    startTime:{
        type:String,
        required:true,
    },
    endTime:{
        type:String,
        required:true,
    }
});

module.exports = mongoose.model(
    "BookingModel", //file name
    bookingSchema //function name
)