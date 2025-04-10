import React from 'react';
import { motion } from 'framer-motion';  // Import framer-motion for animations

export default function Tiktok() {
  return (
    <div className="flex justify-center items-center py-16 bg-gradient-to-b from-white to-gray-50">
      {/* Container with a fixed height to fit between header and footer */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}  // Initial state: opacity 0 and move up
        animate={{ opacity: 1, y: 0 }}    // Final state: opacity 1 and no vertical movement
        transition={{ duration: 1 }}       // Transition duration
        className="text-center p-6 border-2 border-gray-300 rounded-xl shadow-lg bg-white max-w-lg w-full"
      >
        <h1 className="text-2xl font-semibold text-gray-800">
          The features of TikTok Video Analysis are <span className="text-red-500">coming soon</span>
        </h1>
        <p className="mt-4 text-gray-600">Stay tuned for more updates!</p>
        <a
          href="/"
          className="text-xl text-blue-500 hover:underline mt-4 inline-block"
        >
          Go back to Home
        </a>
      </motion.div>
    </div>
  );
}