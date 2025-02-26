import { useTexture } from "@react-three/drei";
import React, { useState, useMemo } from "react";
import SolarPanel from "../renewableModel/SolarPanel";
import { MicroHydroPowerSystemTiles, SmallWindTurbinesTiles, VerticalAxisWindTurbinesTiles, HeatPumpTiles, SolarWaterHeatingTiles, VerticalFarmingTiles } from "./Apartments";
import { Html } from "@react-three/drei";
import TechnoEconomicAnalysis from "../TechnoEconomicAnalysis";

const OfficeRoofGrid = ({ onSelect, solarPanels, setSolarPanels }) => {
  const gridWidth = 6; // 6 columns
  const gridHeight = 4; // 4 rows
  const cellSize = 2; // Each cell is 2x2 in size

  const handleClick = (row, col) => {
    const cellKey = `${row}-${col}`;
    // Toggle Solar Panel: Add if not there, remove if already placed
    if (solarPanels.some(([r, c]) => r === row && c === col)) {
      setSolarPanels(solarPanels.filter(([r, c]) => r !== row || c !== col));
    } else {
      setSolarPanels([...solarPanels, [row, col]]);
    }
  };

  return (
    <group position={[0, 18.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: gridHeight }).map((_, row) =>
        Array.from({ length: gridWidth }).map((_, col) => {
          const x = (col - (gridWidth - 1) / 2) * cellSize; // Centering the grid
          const y = (row - (gridHeight - 1) / 2) * cellSize;
          const isSelected = solarPanels.some(([r, c]) => r === row && c === col);

          return (
            <mesh
              key={`${row}-${col}`}
              position={[x, y, 0]} // Positions grid cells flat on the roof
              onClick={() => handleClick(row, col)}
            >
              <planeGeometry args={[cellSize, cellSize]} />
              <meshStandardMaterial
                color={isSelected ? "yellow" : "green"}
                transparent={true}
                opacity={isSelected ? 0 : 0.5} // Make grid transparent if panel placed
              />
            </mesh>
          );
        })
      )}

      {/* Render Solar Panels */}
      {solarPanels.map(([row, col], index) => {
        const x = (col - (gridWidth - 1) / 2) * cellSize;
        const y = (row - (gridHeight - 1) / 2) * cellSize;
        return <SolarPanel key={index} position={[x, y, 0]} />;
      })}
    </group>
  );
};

const OfficeBuilding = ({ showSolarPanels, showSolarRoofTiles, showSolarWaterHeating, showHeatPump, showSmallWindTurbines, showVerticalAxisWindTurbines, showMicroHydroPowerSystem, showVerticalFarming }) => {
  const wallTexture = useTexture("../assets/images/officewall.jpg");
  const roofTexture = useTexture("../assets/images/officeroof.jpg");
  const [solarPanels, setSolarPanels] = useState([]);
  const [solarWaterHeating, setSolarWaterHeating] = useState([]);
  const [heatPump, setHeatPump] = useState([]);
  const [smallWindTurbines, setSmallWindTurbines] = useState([]);
  const [verticalAxisWindTurbines, setVerticalAxisWindTurbines] = useState([]);
  const [microHydroPowerSystem, setMicroHydroPowerSystem] = useState([]);
  const [verticalFarming, setVerticalFarming] = useState([]);

  const hasSolarPanels = solarPanels.length > 0;
  const hasSolarWaterHeating = solarWaterHeating.length > 0;
  const hasHeatPump = heatPump.length > 0;
  const hasSmallWindTurbines = smallWindTurbines.length > 0;
  const hasVerticalAxisWindTurbines = verticalAxisWindTurbines.length > 0;
  const hasMicroHydroPowerSystem = microHydroPowerSystem.length > 0;


  return (
    <group position={[0, 1.5, 0]}>
      {/* Floors (Stacked boxes to form a tall office building) */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[0, i * 5, 0]}>
          <boxGeometry args={[12, 5, 8]} />
          <meshStandardMaterial map={wallTexture} />
        </mesh>
      ))}

      {Array.from({ length: 8 }).map((_, i) => {
        const height = i * (18 / 7); // Spread across height (-5 to 5)

        return (
          <React.Fragment key={i}>
            {/* Front Light Strip */}
            <mesh position={[0, height, 4.1]}>
              <boxGeometry args={[12, 0.2, 0.2]} /> {/* Thin Light Strip */}
              <meshStandardMaterial color={hasSolarPanels || hasSolarWaterHeating || hasHeatPump || hasSmallWindTurbines || hasVerticalAxisWindTurbines ? "yellow" : "black"} />
            </mesh>

            {/* Back Light Strip */}
            <mesh position={[0, height, -4.1]}>
              <boxGeometry args={[12, 0.2, 0.2]} />
              <meshStandardMaterial color={hasSolarPanels || hasSolarWaterHeating || hasHeatPump || hasSmallWindTurbines || hasVerticalAxisWindTurbines ? "yellow" : "black"} />
            </mesh>

            {/* Left Light Strip */}
            <mesh position={[-6.1, height, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[8, 0.2, 0.2]} />
              <meshStandardMaterial color={hasSolarPanels || hasSolarWaterHeating || hasHeatPump || hasSmallWindTurbines || hasVerticalAxisWindTurbines ? "yellow" : "black"} />
            </mesh>

            {/* Right Light Strip */}
            <mesh position={[6.1, height, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[8, 0.2, 0.2]} />
              <meshStandardMaterial color={hasSolarPanels || hasSolarWaterHeating || hasHeatPump || hasSmallWindTurbines || hasVerticalAxisWindTurbines ? "yellow" : "black"} />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* Outer Black Frame - Front, Back, Left, Right */}
      <mesh position={[0, -4, 4.1]}>
        <boxGeometry args={[12, 0.3, 0.3]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0, -4, -4.1]}>
        <boxGeometry args={[12, 0.3, 0.3]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-6.1, -4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.3, 0.3]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[6.1, -4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.3, 0.3]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Inner Water Area (Filling the entire space) */}
      <mesh position={[0, -4, 0]}>
        <boxGeometry args={[12, 0.25, 8]} />
        <meshStandardMaterial color={hasMicroHydroPowerSystem ? "blue" : "grey"} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 17.75, 0]}>
        <boxGeometry args={[12, 0.5, 8.5]} />
        <meshStandardMaterial map={roofTexture} />
      </mesh>

      {/* Show Office Roof Grid only when Solar Panels are enabled */}
      {showSolarPanels && <OfficeRoofGrid solarPanels={solarPanels} setSolarPanels={setSolarPanels} />}

      <SolarWaterHeatingTiles
        solarWaterHeating={solarWaterHeating}
        setSolarWaterHeating={setSolarWaterHeating}
        showSolarWaterHeating={showSolarWaterHeating}
      />
      <HeatPumpTiles
        heatPump={heatPump}
        setHeatPump={setHeatPump}
        showHeatPump={showHeatPump}
      />
      <SmallWindTurbinesTiles
        smallWindTurbines={smallWindTurbines}
        setSmallWindTurbines={setSmallWindTurbines}
        showSmallWindTurbines={showSmallWindTurbines}
      />
      <VerticalAxisWindTurbinesTiles
        verticalAxisWindTurbines={verticalAxisWindTurbines}
        setVerticalAxisWindTurbines={setVerticalAxisWindTurbines}
        showVerticalAxisWindTurbines={showVerticalAxisWindTurbines}
      />
      <MicroHydroPowerSystemTiles
        microHydroPowerSystem={microHydroPowerSystem}
        setMicroHydroPowerSystem={setMicroHydroPowerSystem}
        showMicroHydroPowerSystem={showMicroHydroPowerSystem}
      />
      <VerticalFarmingTiles
        verticalFarming={verticalFarming}
        setVerticalFarming={setVerticalFarming}
        showVerticalFarming={showVerticalFarming}
      />
      {/* For Analysis */}
      <Html>
        <TechnoEconomicAnalysis
          solarPanels={solarPanels}
          solarWaterHeating={solarWaterHeating}
          heatPump={heatPump}
          smallWindTurbines={smallWindTurbines}
          verticalAxisWindTurbines={verticalAxisWindTurbines}
          microHydroPowerSystem={microHydroPowerSystem}
          verticalFarming={verticalFarming}
        />
      </Html>
    </group>
  );
};

export default OfficeBuilding;
