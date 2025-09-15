
import React from 'react';
import { TEXT } from '@/data/text';

interface ProductInfoProps {
  className?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center ${className || ''}`}>
        <h1 
            className="font-title text-9xl font-bold text-white uppercase tracking-wider"
            style={{ textShadow: '4px 4px 16px rgba(0,0,0,0.4)', lineHeight: '1.0' }}
        >
            {TEXT.common.gameTitle}
        </h1>
    </div>
  );
};

export default ProductInfo;