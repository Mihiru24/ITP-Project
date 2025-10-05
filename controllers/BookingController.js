const Booking = require("../models/BookingModel");


const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find(); // get all from MongoDB
    return res.status(200).json(bookings); // send array back to frontend
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

//data Insert
const addBookings = async (req, res, next) => {

    const {studentName,gmail,tutorName,module,date,startTime,endTime} = req.body;

    let bookings;

    try{
        bookings = new Booking({studentName,gmail,tutorName,module,date,startTime,endTime});
        await bookings.save();
    }catch (err) {
        console.log(err);
    }
    //if data is not inserted
    if(!bookings){
        return res.status(404).send({message:"Unable to add Bookings"});
    }

    //if Inserted
    return res.status(200).json({ bookings });

};

//Get by Id
const getById = async (req, res, next) => {

    const id = req.params.id;

    let booking;

    try{
        booking = await Booking.findById(id);
    }catch (err) {
        console.log(err);
    }
    //if data is not inserted
    if(!booking){
        return res.status(404).send({message:"Unable to add Bookings"});
    }
    //if Inserted
    return res.status(200).json({ booking });
};

//Update booking details
const updateBooking = async (req, res, next) => {
    const id = req.params.id; //display the details  ( a combination of insert and getbyid)
    const {studentName,gmail,tutorName,module,date,startTime,endTime} = req.body;

    let booking;

    try{
        booking = await Booking.findByIdAndUpdate(id,
            {studentName: studentName, gmail: gmail, tutorName: tutorName, module: module, date: date, startTime: startTime, endTime: endTime});
            booking = await booking.save();
    }catch (err) {
        console.log(err);
    }
    //if data is not inserted
    if(!booking){
        return res.status(404).send({message:"Unable to Update Booking"});
    }
    //if Inserted
    return res.status(200).json({ booking });
};

//Delete Booking Details
const deleteBooking = async (req, res, next) => {
    const id = req.params.id;

    let booking;

    try{
        booking = await Booking.findByIdAndDelete(id);
    }catch (err) {
        console.log(err);
    }
     //if data is not inserted
    if(!booking){
        return res.status(404).send({message:"Unable to Delete Booking"});
    }
    //if Inserted
    return res.status(200).json({ booking });
}

exports.getAllBookings = getAllBookings;
exports.addBookings = addBookings;
exports.getById = getById;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking