// import mongoose from "mongoose";

// let isConnected: boolean = false;

// export const connectToDB = async () => {
//     mongoose.set("strictQuery", true);
    
//     if (isConnected) {
//         console.log("MongoDB Supermarket is already connected");
//         return;
//     }
//     try {
//         await  mongoose.connect(process.env.MONGODB_URL || "",{
//             dbName: "supermarket_db"
//         })
        
//     } catch (error: any) {
//         console.log("MongoDB supermarket connection error:", error.message);
//     }
// }





// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL;

if (!MONGODB_URI) {
  throw new Error("❌ Please define MONGODB_URI in .env.local");
}

type GlobalMongoose = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// @ts-ignore
let cached: GlobalMongoose = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI || "", {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
