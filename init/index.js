const mongoose=require("mongoose");
const initData =require("./data.js");
const Listing= require("../models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main()
.then(()=>{
    console.log("connnected to db");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB = async () =>{
    console.log(initData);
    console.log(initData.data);
    await Listing.deleteMany({});
     initData.data=initData.data.map((obj)=>({...obj,owner:"6a251742290bef45ba7025e2"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
initDB();