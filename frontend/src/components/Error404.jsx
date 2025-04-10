import React from 'react';
import { motion } from 'framer-motion';  // For animation

export const Error404 = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center p-8 border-4 border-gray-500 rounded-xl bg-white shadow-2xl"
      >
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-2xl text-gray-700 mb-4">
          Oops! The page you are looking for doesn't exist.
        </p>
        <p className="text-lg text-gray-500 mb-4">
          It seems like the link you followed may be broken or the page may have been removed.
        </p>
        <a
          href="/"
          className="text-xl text-blue-500 hover:underline mt-4 inline-block"
        >
          Go back to Home
        </a>
      </motion.div>
    </div>
  );
};
