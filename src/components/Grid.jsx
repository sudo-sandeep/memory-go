import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import backCardImage from "../assets/back-card.png";
import { animalPairs } from "../assets/animals";

function generateRandomArray(count) {
  // Ensure count is even
  if (count % 2 !== 0) {
    throw new Error("The count must be an even number.");
  }

  const randomArray = [];
  const usedIndexes = new Set(); // Set to track used indexes
  const pairsToSelect = count / 2; // We need half the number of pairs in the result array

  // Collect random pairs
  while (randomArray.length < count) {
    // Select a random object index from the animalPairs array
    const randomIndex = Math.floor(Math.random() * animalPairs.length);

    // Skip if the index has already been used
    if (usedIndexes.has(randomIndex)) {
      continue;
    }

    // Mark this index as used
    usedIndexes.add(randomIndex);

    // Get the selected pair
    const selectedPair = animalPairs[randomIndex];

    // Push the selected pair twice with the same id
    randomArray.push({
      initial: selectedPair.initial,
      matched: selectedPair.matched,
      id: selectedPair.id, // Same id for both images in the pair
    });
    randomArray.push({
      initial: selectedPair.initial,
      matched: selectedPair.matched,
      id: selectedPair.id, // Same id for both images in the pair
    });
  }

  // Randomly shuffle the array to mix the order of the pairs
  for (let i = randomArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomArray[i], randomArray[j]] = [randomArray[j], randomArray[i]]; // Swap elements
  }

  return randomArray;
}
const Grid = ({ size }) => {
  const [isGameEnd, setIsGameEnd] = useState(false);
  const [newGame, setNewGame] = useState(true);
  const initialGrid = useMemo(() => {
    const frontArray = generateRandomArray(size * size);
    return new Array(Math.pow(size, 2)).fill(null).map((_, index) => ({
      back: "69",
      frontImage: frontArray[index],
      isFlipped: false,
      id: uuidv4(),
      matchId: frontArray[index].id,
      isMatched: false,
      isAnimating: false,
    }));
  }, [size, newGame]);
  const [grid, setGrid] = useState(initialGrid);

  useEffect(() => {
    setGrid(initialGrid);
  }, [initialGrid]);

  const [activeCard, setActiveCard] = useState(null);

  const handleAnimation = async (card) => {
    if (!card.isAnimating) {
      const newGrid = grid.map((item) =>
        item.id === card.id
          ? { ...item, isFlipped: true, isAnimating: true }
          : item
      );
      setGrid(newGrid);
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  const handleCardFlip = async (card) => {
    await handleAnimation(card);
    let newGrid = grid;
    if (activeCard) {
      if (activeCard.id === card.id) {
        newGrid = grid.map((item) =>
          item.id === card.id ? { ...item, isFlipped: false } : item
        );
        setActiveCard(null);
      } else if (activeCard.matchId === card.matchId) {
        newGrid = grid.map((item) =>
          item.id === card.id || item.id === activeCard.id
            ? { ...item, isFlipped: true, isMatched: true }
            : item
        );
      } else {
        newGrid = grid.map((item) =>
          item.id === card.id || item.id === activeCard.id
            ? { ...item, isFlipped: false, isMatched: false }
            : item
        );
        await handleAnimation(activeCard);
      }
      setActiveCard(null);
    } else {
      newGrid = grid.map((item) =>
        item.id === card.id ? { ...item, isFlipped: !item.isFlipped } : item
      );
      setActiveCard(card);
    }
    setGrid(newGrid);
  };

  const handleAnimationOver = (card) => {
    const newGrid = grid.map((item) =>
      item.id === card.id ? { ...item, isAnimating: false } : item
    );
    setGrid(newGrid);
  };

  useEffect(() => {
    const allAreMatched = grid.every((item) => item.isMatched === true);
    if (allAreMatched) {
      setIsGameEnd(true);
    }
    // let timer;
    // if(allAreMatched){
    //   timer = setTimeout(()=>{setIsGameEnd(true)},1000)
    // }
    // return () => {
    //   clearTimeout(timer)
    // }
  }, [grid]);

  return (
    <>
      <div
        className={`border border-gray-500 rounded h-[302px] w-[302px] flex flex-wrap`}
      >
        {grid.map((item) => (
          <div
            className={`flip-card flex border border-gray-500 col-span-1 cursor-pointer place-content-center`}
            style={{ height: `${100 / size}%`, width: `${100 / size}%` }}
            key={item.id}
            onClick={() => handleCardFlip(item)}
          >
            <motion.button
              className="disabled:cursor-auto h-full w-full flip-card-inner"
              initial={false}
              animate={{ rotateY: item.isFlipped ? 180 : 360 }}
              transition={{ duration: 0.3, animationDirection: "normal" }}
              disabled={item.isMatched || item.isAnimating}
              onAnimationComplete={handleAnimationOver}
            >
              <div
                className={`flip-card-back w-full h-full ${
                  item.isMatched
                    ? "bg-green-500 text-white"
                    : "bg-cyan-950  text-white"
                } bg-cover text-4xl`}
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
      {isGameEnd && (
        <div className="text-center mt-4">
          <button
            className="border border-emerald-500 px-12 py-1 rounded hover:bg-emerald-400"
            onClick={() => {
              setNewGame(!newGame);
              setGrid(initialGrid);
            }}
          >
            Restart
          </button>
        </div>
      )}
    </>
  );
};

export default Grid;
