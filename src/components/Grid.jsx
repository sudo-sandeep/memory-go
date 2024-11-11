import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import backCardImage from "../assets/back-card.png";
import { animalPairs } from "../assets/animals";
import Confetti from "react-confetti";
import { useWindowSize } from "../utils/hooks/useWindowSize";
function generateRandomArray(count) {
  if (count % 2 !== 0) throw new Error("The count must be an even number.");

  const randomArray = [];
  const usedIndexes = new Set();

  while (randomArray.length < count) {
    const randomIndex = Math.floor(Math.random() * animalPairs.length);
    if (usedIndexes.has(randomIndex)) continue;

    usedIndexes.add(randomIndex);
    const selectedPair = animalPairs[randomIndex];

    randomArray.push(
      { ...selectedPair, id: selectedPair.id },
      { ...selectedPair, id: selectedPair.id }
    );
  }

  // Shuffle array
  for (let i = randomArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomArray[i], randomArray[j]] = [randomArray[j], randomArray[i]];
  }

  return randomArray;
}

const Grid = ({ size }) => {
  const { width, height } = useWindowSize();
  const [confetti, setConfetti] = useState(false);
  const [isGameEnd, setIsGameEnd] = useState(false);
  const [newGame, setNewGame] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [clickLock, setClickLock] = useState(false); // Lock to prevent fast clicks

  const initialGrid = useMemo(() => {
    const frontArray = generateRandomArray(size * size);
    return frontArray.map((item, index) => ({
      back: "69",
      frontImage: item,
      isFlipped: false,
      id: uuidv4(),
      matchId: item.id,
      isMatched: false,
      isAnimating: false,
    }));
  }, [size, newGame]);

  const [grid, setGrid] = useState(initialGrid);

  useEffect(() => setGrid(initialGrid), [initialGrid]);

  const handleAnimation = async (card) => {
    if (!card.isAnimating) {
      setGrid((prevGrid) =>
        prevGrid.map((item) =>
          item.id === card.id
            ? { ...item, isFlipped: true, isAnimating: true }
            : item
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const handleCardFlip = async (card) => {
    if (clickLock || card.isFlipped || card.isMatched) return; // Prevent flipping if locked or already matched

    setClickLock(true); // Lock clicks during processing
    await handleAnimation(card);
    let updatedGrid = grid;

    if (activeCard) {
      if (activeCard.id === card.id) {
        updatedGrid = grid.map((item) =>
          item.id === card.id ? { ...item, isFlipped: false } : item
        );
        setActiveCard(null);
      } else if (activeCard.matchId === card.matchId) {
        updatedGrid = grid.map((item) =>
          item.id === card.id || item.id === activeCard.id
            ? { ...item, isFlipped: true, isMatched: true }
            : item
        );
        setActiveCard(null);
      } else {
        updatedGrid = grid.map((item) =>
          item.id === card.id || item.id === activeCard.id
            ? { ...item, isFlipped: false }
            : item
        );
        await handleAnimation(activeCard);
        setActiveCard(null);
      }
    } else {
      updatedGrid = grid.map((item) =>
        item.id === card.id ? { ...item, isFlipped: !item.isFlipped } : item
      );
      setActiveCard(card);
    }

    setGrid(updatedGrid);
    setClickLock(false); // Unlock clicks after processing
  };

  const handleAnimationOver = (card) => {
    setGrid((prevGrid) =>
      prevGrid.map((item) =>
        item.id === card.id ? { ...item, isAnimating: false } : item
      )
    );
  };

  useEffect(() => {
    let timer = null;
    if (grid.every((item) => item.isMatched)) {
      setIsGameEnd(true);
      setConfetti(true);
      timer = setTimeout(() => {
        setConfetti(false);
      }, 7000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [grid]);

  return (
    <>
      <div className="border border-gray-500 rounded aspect-square w-[152px] sm:w-[252px] md:w-[302px] flex flex-wrap">
        {grid.map((item) => (
          <div
            className="flip-card flex border border-gray-500 cursor-pointer"
            style={{ height: `${100 / size}%`, width: `${100 / size}%` }}
            key={item.id}
            onClick={() => handleCardFlip(item)}
          >
            <motion.button
              className="h-full w-full flip-card-inner"
              initial={false}
              animate={{ rotateY: item.isFlipped ? 180 : 360 }}
              transition={{ duration: 0.3 }}
              disabled={item.isMatched || item.isAnimating || clickLock}
              onAnimationComplete={() => handleAnimationOver(item)}
            >
              <div
                className={`flip-card-back w-full h-full ${
                  item.isMatched
                    ? "bg-gradient-to-r from-sky-500 to-emerald-500"
                    : "bg-cyan-950"
                } bg-cover`}
                style={{
                  backgroundImage: item.isMatched
                    ? `url(${item.frontImage.matched})`
                    : `url(${item.frontImage.initial})`,
                }}
              ></div>
              <div
                className="flip-card-front w-full h-full bg-cover"
                style={{ backgroundImage: `url(${backCardImage})` }}
              ></div>
            </motion.button>
          </div>
        ))}
      </div>
      {confetti && (
        <Confetti width={width} height={height} tweenDuration={5000} numberOfPieces={500}/>
      )}
      {isGameEnd && (
        <>
          <div>
            <h2 className="text-xl text-emerald-500 font-semibold text-center">
              You Won!
            </h2>
          </div>
          <div className="text-center">
            <button
              className="border border-emerald-500 px-12 py-1 rounded hover:bg-emerald-400 disabled:pointer-events-none"
              disabled={confetti}
              onClick={() => {
                setNewGame(!newGame);
                setGrid(initialGrid);
                setIsGameEnd(false);
                setActiveCard(null);
                setClickLock(false);
              }}
            >
              Restart
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Grid;
