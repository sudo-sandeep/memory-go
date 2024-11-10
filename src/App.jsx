import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Grid from "./components/Grid";

const GRID_SIZE_OPTIONS = [2, 4, 6];

const App = () => {
  const [activeGridSize, setActiveGridSize] = useState(GRID_SIZE_OPTIONS[0]);
  const handleGridSizeChange = (newGridSize) => {
    setActiveGridSize(newGridSize);
  };
  return (
    <div className="min-h-screen bg-slate-200">
      <h1 className="font-bold text-3xl text-center py-4 text-emerald-600">
        Memory Go
      </h1>
      <p className="text-center text-xs font-semibold uppercase text-green-800">
        Test your memory with memory go
      </p>
      <div className="mt-8 border border-black w-1/2 mx-auto p-2 rounded h-[450px]">
        <h2 className="text-center text-sm font-semibold">
          Choose your grid size{" "}
        </h2>
        <div className="flex gap-4 mt-2">
          {GRID_SIZE_OPTIONS.map((item) => (
            <div
              key={uuidv4()}
              className={`py-0.5 border border-red-400  flex-1 text-center rounded-sm cursor-pointer ${
                activeGridSize === item && "bg-red-300"
              }`}
              onClick={() => handleGridSizeChange(item)}
            >
              {item} X {item}
            </div>
          ))}
        </div>
        <div className="p-4 grid place-content-center">
          <Grid size={activeGridSize}/>
        </div>
      </div>
    </div>
  );
};

export default App;
