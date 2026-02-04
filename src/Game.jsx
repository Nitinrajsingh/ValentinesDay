import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import characterSprite from './assets/character-sprite.png';
import './Game.css';

const Game = ({ onClose }) => {
    const [characterPos, setCharacterPos] = useState({ x: 50, y: 50 });
    const [hearts, setHearts] = useState([]);
    const [score, setScore] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [touchStart, setTouchStart] = useState(null);

    const HEARTS_TO_WIN = 5;
    const CHARACTER_SIZE = 60;
    const HEART_SIZE = 40;
    const MOVE_SPEED = 15;

    // Generate random hearts
    useEffect(() => {
        const generateHearts = () => {
            const newHearts = [];
            for (let i = 0; i < 8; i++) {
                newHearts.push({
                    id: i,
                    x: Math.random() * (window.innerWidth - HEART_SIZE - 100) + 50,
                    y: Math.random() * (window.innerHeight - HEART_SIZE - 100) + 50,
                });
            }
            setHearts(newHearts);
        };
        generateHearts();
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (gameWon) return;

            // Hide speech bubble on first movement
            if (!gameStarted) {
                setGameStarted(true);
            }

            setCharacterPos((prev) => {
                let newX = prev.x;
                let newY = prev.y;

                switch (e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        newY = Math.max(0, prev.y - MOVE_SPEED);
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        newY = Math.min(window.innerHeight - CHARACTER_SIZE, prev.y + MOVE_SPEED);
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        newX = Math.max(0, prev.x - MOVE_SPEED);
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        newX = Math.min(window.innerWidth - CHARACTER_SIZE, prev.x + MOVE_SPEED);
                        break;
                    default:
                        return prev;
                }

                return { x: newX, y: newY };
            });
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameWon, gameStarted]);

    // Touch controls for mobile
    const handleTouchStart = (e) => {
        if (gameWon) return;

        // Hide speech bubble on first touch
        if (!gameStarted) {
            setGameStarted(true);
        }

        setTouchStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        });
    };

    const handleTouchMove = (e) => {
        if (!touchStart || gameWon) return;

        const touchEnd = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };

        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = touchEnd.y - touchStart.y;

        setCharacterPos((prev) => {
            let newX = prev.x + deltaX * 0.5;
            let newY = prev.y + deltaY * 0.5;

            newX = Math.max(0, Math.min(window.innerWidth - CHARACTER_SIZE, newX));
            newY = Math.max(0, Math.min(window.innerHeight - CHARACTER_SIZE, newY));

            return { x: newX, y: newY };
        });

        setTouchStart(touchEnd);
    };

    const handleTouchEnd = () => {
        setTouchStart(null);
    };

    // Collision detection
    useEffect(() => {
        if (gameWon) return;

        hearts.forEach((heart) => {
            const distance = Math.sqrt(
                Math.pow(characterPos.x - heart.x, 2) + Math.pow(characterPos.y - heart.y, 2)
            );

            if (distance < CHARACTER_SIZE / 2 + HEART_SIZE / 2) {
                setHearts((prev) => prev.filter((h) => h.id !== heart.id));
                setScore((prev) => prev + 1);
            }
        });
    }, [characterPos, hearts, gameWon]);

    // Check for win condition
    useEffect(() => {
        if (score >= HEARTS_TO_WIN && !gameWon) {
            setGameWon(true);
            Swal.fire({
                title: '🎉 Congratulations! 🎉',
                text: 'You won a cute gift and you\'ll get it soon! 😉',
                icon: 'success',
                confirmButtonText: 'Yay!',
                confirmButtonColor: '#ff69b4',
            }).then(() => {
                onClose();
            });
        }
    }, [score, gameWon, onClose]);

    return (
        <div
            className="game-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="game-header">
                <div className="score">Hearts Collected: {score}/{HEARTS_TO_WIN}</div>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="game-instructions">
                Use arrow keys or touch to move!
            </div>

            {/* Character */}
            <img
                src={characterSprite}
                alt="Character"
                className="character"
                style={{
                    left: `${characterPos.x}px`,
                    top: `${characterPos.y}px`,
                    width: `${CHARACTER_SIZE}px`,
                    height: `${CHARACTER_SIZE}px`,
                }}
            />

            {/* Speech bubble */}
            {!gameStarted && (
                <div
                    className="speech-bubble"
                    style={{
                        left: `${characterPos.x + CHARACTER_SIZE + 10}px`,
                        top: `${characterPos.y}px`,
                    }}
                >
                    Hi! I'm Yaryna! 💕<br />
                    I need to collect 5 hearts.<br />
                    Can you help me? 🥺
                </div>
            )}

            {/* Hearts */}
            {hearts.map((heart) => (
                <div
                    key={heart.id}
                    className="heart"
                    style={{
                        left: `${heart.x}px`,
                        top: `${heart.y}px`,
                        width: `${HEART_SIZE}px`,
                        height: `${HEART_SIZE}px`,
                    }}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
};

export default Game;
