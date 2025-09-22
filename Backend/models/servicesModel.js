const mongoose = require("mongoose");

const schema = mongoose.Schema;
const serviceSchema = new schema({
//id(primary key) will be automtically created when inserting data
    

    serviceType:{
        type : String,
        required: true,
    },
    description:{
        type : String
    },
    image:{
        type : String,
        required: true,
        
    }

});
                            //file name,function name
const services =mongoose.model("service" ,serviceSchema);

module.exports = services;