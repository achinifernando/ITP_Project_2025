const mongoose = require("mongoose");

const schema = mongoose.Schema;
const lorryModelSchema = new schema({
//id(primary key) will be automtically created when inserting data
    

    model:{
        type : String
    },
    
    

});
                            //file name,function name
const lorryModel =mongoose.model("lorrymodels" ,lorryModelSchema);

module.exports = lorryModel;