import "./App.css";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routers/routes/AppRoutes";
import { ErrorBoundary } from "@appsignal/react";

import Appsignal from "@appsignal/javascript"
const appsignal = new Appsignal({ key: "ef45a106-9f93-42ad-abc9-6aaca9c7456e" })

const FallbackComponent = () => (
  <div class="lg:px-24 lg:py-24 md:py-20 md:px-44 px-4 py-24 items-center flex justify-center flex-col-reverse lg:flex-row md:gap-28 gap-16">
        <div class="xl:pt-24 w-full xl:w-1/2 relative pb-12 lg:pb-0">
            <div class="relative">
                <div class="absolute">
                    <div class="">
                        <h1 class="my-2 text-gray-800 font-bold text-2xl">
                            Looks like something went wrong
                        </h1>
                        <p class="my-2 text-gray-800">Sorry about that! Please visit dashboard to get where you need to go.</p>
                        <button class="sm:w-full lg:w-auto my-2 border rounded md py-4 px-8 text-center bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50">Take me there!</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

function App() {
  return (
    <React.Fragment>
      <ErrorBoundary 
      instance={appsignal} 
      fallback={(error) => <FallbackComponent />}>
        <AppRoutes />
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </React.Fragment>
  );
}

export default App;
