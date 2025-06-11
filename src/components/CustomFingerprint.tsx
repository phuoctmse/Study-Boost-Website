import React from 'react';

interface CustomFingerprintProps {
    src: string; // Đường dẫn đến file ảnh
    alt?: string; // Alt text cho ảnh
    className?: string; // Class tùy chọn để thêm style
}

const CustomFingerprint: React.FC<CustomFingerprintProps> = ({ src, alt = 'Fingerprint', className }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img src={src} alt={alt} className="w-16 h-16" /> {/* Điều chỉnh kích thước theo nhu cầu */}
        </div>
    );
};

export default CustomFingerprint; 