import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface VisionCardProps {
  imageSrc: string;
  altText: string;
  title: string;
  description: string;
}

export default function VisionCard({ imageSrc, altText, title, description }: VisionCardProps) { 
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4"
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      <Image src={imageSrc} alt={altText} width={80} height={80} className="mx-auto mb-2" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
