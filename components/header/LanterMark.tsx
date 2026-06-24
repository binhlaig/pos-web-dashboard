
import React from 'react'
import { motion, AnimatePresence } from "framer-motion";

const LanterMark = ({ size = 48, glow = false }: { size?: number; glow?: boolean }) => {

    const h = size * 1.5;
    const isNight = glow;
    
    return (
        <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="finalLanternCoreNightMergedBulbs" cx="50%" cy="48%" r="50%">
                    <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
                    <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="finalLanternBodyDayMergedBulbs" x1="6" y1="11" x2="26" y2="37" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fffaf1" />
                    <stop offset="45%" stopColor="#f5e7cf" />
                    <stop offset="100%" stopColor="#ecd5ae" />
                </linearGradient>
                <linearGradient id="finalLanternMetalDayMergedBulbs" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c58a3c" />
                    <stop offset="50%" stopColor="#a96b28" />
                    <stop offset="100%" stopColor="#8a551d" />
                </linearGradient>
                <radialGradient id="finalLanternGlassDayMergedBulbs" cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#fffdf7" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#f6ead4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#e8d0a4" stopOpacity="0.1" />
                </radialGradient>
            </defs>

            <line x1="16" y1="0" x2="16" y2="6" stroke={isNight ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
            <rect x="8" y="6" width="16" height="5" rx="2" fill={isNight ? "#b07840" : "url(#finalLanternMetalDayMergedBulbs)"} stroke={isNight ? "#d4a060" : "#7b4a18"} strokeWidth="0.8" />
            <rect x="6" y="11" width="20" height="26" rx="3" fill={isNight ? "#0e0908" : "url(#finalLanternBodyDayMergedBulbs)"} stroke={isNight ? "#9d6220" : "#a66b27"} strokeWidth="1" />
            {isNight ? (
                <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#finalLanternCoreNightMergedBulbs)" />
            ) : (
                <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#finalLanternGlassDayMergedBulbs)" />
            )}

            {[11, 16, 21].map((x) => (
                <line key={x} x1={x} y1="11" x2={x} y2="37" stroke={isNight ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity="0.95" />
            ))}

            {isNight && (
                <g>
                    <motion.ellipse
                        cx="16"
                        cy="26"
                        rx="4"
                        ry="6"
                        fill="#f59e0b"
                        opacity="0.68"
                        animate={{ ry: [6, 7.1, 5.2, 6.7, 6], cx: [16, 15.5, 16.4, 15.8, 16] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.ellipse
                        cx="16"
                        cy="27"
                        rx="2.5"
                        ry="4.2"
                        fill="#fde68a"
                        animate={{ ry: [4.2, 5, 3.6, 4.6, 4.2], cx: [16, 16.3, 15.7, 16.1, 16] }}
                        transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.ellipse
                        cx="16"
                        cy="27.5"
                        rx="1.3"
                        ry="2.2"
                        fill="white"
                        opacity="0.85"
                        animate={{ ry: [2.2, 2.7, 1.9, 2.4, 2.2] }}
                        transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
                    />
                </g>
            )}

            {!isNight && (
                <motion.g
                    animate={{ opacity: [0.78, 1, 0.82], scale: [0.98, 1.02, 0.99] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ellipse cx="16" cy="25" rx="5.2" ry="7.4" fill="#fff4cf" opacity="0.72" />
                    <ellipse cx="16" cy="25.5" rx="3.2" ry="5" fill="#ffe29a" opacity="0.56" />
                    <ellipse cx="16" cy="26" rx="1.6" ry="2.8" fill="#fffdf7" opacity="0.9" />
                </motion.g>
            )}

            <rect x="8" y="37" width="16" height="5" rx="2" fill={isNight ? "#b07840" : "url(#finalLanternMetalDayMergedBulbs)"} stroke={isNight ? "#d4a060" : "#7b4a18"} strokeWidth="0.8" />
            <line x1="16" y1="42" x2="16" y2="47" stroke={isNight ? "#d4804a" : "#8f5b24"} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="47" r="1.5" fill={isNight ? "#d4804a" : "#8f5b24"} />
        </svg>
    );
}

export default LanterMark


