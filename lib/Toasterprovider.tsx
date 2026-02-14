"use client";
import toast, { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      position="top-right"
      
      toastOptions={{ // Define default options
        className: "",
        
        duration: 5000,
        style: {
          background: "#363636",
          color: "#fff",
        }, success: {
          duration: 3000,
        },
  
      }}
    />
  );
};

export default ToasterProvider;