"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import VisionCard from '@/components/VisionCard';

export default function Home() {
  const heroVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-10 pt-20">
      <main className="flex-grow"> {/* Use flex-grow to push the footer to the bottom */}
        {/* Hero Section */}
        <motion.section
          variants={heroVariants}
          initial="initial"
          animate="animate"
          className="container mx-auto relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-sm md:rounded-md shadow-lg mt-10"
        >
          <Image
            src="/mdkkuview.jpg"
            alt="MDKKU Self-Exam Bank"
            layout="fill" // Use layout="fill" for responsive images
            objectFit="cover"  // Make the image cover the container
            className="object-cover"
          />
          <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-col sm:flex-row items-end sm:items-center text-right cursor-pointer gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl md:text-5xl font-bold text-green-800 drop-shadow-md">MDKKU</h1>
            <h1 className="text-xl sm:text-2xl md:text-5xl font-bold text-white drop-shadow-md">Self-Exam Bank</h1>
          </div>
          <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 text-left">
            <h2 className="text-sm sm:text-lg text-white drop-shadow-md">จากนักศึกษาแพทย์ เพื่อนักศึกษาแพทย์</h2>
          </div>
        </motion.section>

        {/* Welcome Section */}
        <section className="py-8 px-4 text-center mx-4 sm:mx-10 font-semibold">
          <p className="text-sm sm:text-md">
            Welcome to the MDKKU Self-exam Bank, your platform for collaborative medical learning. This website is designed for medical students
            to learn from each other and enhance their learning journey together.
          </p>
        </section>

        {/* Vision Section */}
        <section className="py-8 px-4 text-center bg-gray-200">
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-800 mb-4 drop-shadow-lg">
            MSEB's Vision
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mx-4 sm:mx-12">
            <VisionCard
              imageSrc="/mdkkulogo.png"
              altText="Vision 1"
              title="Vision 1"
              description="Description of vision 1."
            />
            <VisionCard
              imageSrc="/mdkkulogo.png"
              altText="Vision 2"
              title="Vision 2"
              description="Description of vision 2."
            />
            <VisionCard
              imageSrc="/mdkkulogo.png"
              altText="Vision 3"
              title="Vision 3"
              description="Description of vision 3."
            />
          </div>
        </section>
      </main>

      <footer className="bg-green-700 text-white py-4 text-center text-sm sm:text-base">
        <p>คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</p>
      </footer>
    </div>
  );
}