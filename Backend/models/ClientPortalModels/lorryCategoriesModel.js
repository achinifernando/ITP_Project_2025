const mongoose = require("mongoose");

const schema = mongoose.Schema;
const lorryCategorySchema = new schema({
//id(primary key) will be automtically created when inserting data
    

    category:{
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
const lorryCategory =mongoose.model("lorrycategories" ,lorryCategorySchema);

module.exports = lorryCategory;