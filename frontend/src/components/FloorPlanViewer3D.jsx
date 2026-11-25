import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ─── Luxury Architectural Material Palettes ──────────────────────────────────
const NATURAL_OAK = '#c49a6c';
const TRAVERTINE_TILE = '#dfd5c6';
const SLATE_TILE = '#33383e';
const CARPET_WOOD = '#d8c7b5';
const CONCRETE_FLOOR = '#787e87';
const TEAK_DECK = '#a67c52';
const POOL_WATER = '#1a8cff';
const YARD_LAWN = '#4a7c59';

/**
 * Luxury Cutaway Wall:
 * - Smooth matte cream plaster finish (#e8e2ce, h = 1.1m)
 * - Clean architectural top cap (#d6cfbe)
 * - Dynamic color lerping bound to roomWalls[roomName].color
 */
function CutawayWall({ position = [0, 0, 0], args = [4, 1.1, 0.18], color, rotation = [0, 0, 0] }) {
  const meshRef = useRef();
  const targetColor = useMemo(() => new THREE.Color(color || '#e8e2ce'), [color]);
  const [length = 4, height = 1.1, depth = 0.18] = Array.isArray(args) ? args : [4, 1.1, 0.18];

  useFrame((_, delta) => {
    if (meshRef.current?.material) {
      meshRef.current.material.color.lerp(targetColor, Math.min(delta * 5, 1.0));
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Smooth Matte Plaster Cutaway Wall */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial roughness={0.88} metalness={0.04} />
      </mesh>

      {/* Clean Architectural Top Cap */}
      <mesh position={[0, height / 2 + 0.015, 0]}>
        <boxGeometry args={[length + (length > depth ? 0.02 : 0), 0.03, depth + (depth > length ? 0.02 : 0)]} />
        <meshStandardMaterial color="#d6cfbe" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

/**
 * Aerodynamic 5-Blade BLDC Ceiling Fan with Animated Rotor Rotation.
 */
function SingleFanUnit({ offset = [0, 0, 0], speed = 1.0 }) {
  const rotorRef = useRef();

  useFrame((_, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.y += delta * 14 * speed;
    }
  });

  return (
    <group position={offset}>
      {/* Downrod */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.44, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rotating 5-Blade Rotor */}
      <group ref={rotorRef} position={[0, -0.44, 0]}>
        {/* Motor Hub */}
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.07, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Subtle Cyan LED Accent Ring */}
        <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.13, 24]} />
          <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} />
        </mesh>

        {/* 5 Aerodynamic Blades */}
        {[0, 1, 2, 3, 4].map((i) => {
          const rot = (Math.PI * 2 * i) / 5;
          return (
            <group key={i} rotation={[0, rot, 0]}>
              <mesh position={[0.42, 0, 0]} rotation={[0.08, 0, 0]}>
                <boxGeometry args={[0.58, 0.012, 0.1]} />
                <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.4} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Procedural Ceiling Fan supporting 1 or 2 fans dynamically.
 */
function CeilingFan({ position, count = 1, speed = 1.0 }) {
  if (count >= 2) {
    return (
      <group position={position}>
        <SingleFanUnit offset={[-0.95, 0, 0]} speed={speed} />
        <SingleFanUnit offset={[0.95, 0, 0]} speed={speed * 1.05} />
      </group>
    );
  }

  return (
    <group position={position}>
      <SingleFanUnit offset={[0, 0, 0]} speed={speed} />
    </group>
  );
}

/**
 * Wall-Mounted Luxury Split AC Unit with Cooling Discharge Louver.
 */
function WallSplitAC({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chassis */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.32, 0.22]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.1} />
      </mesh>
      {/* Front Bevel Inset */}
      <mesh position={[0, -0.04, 0.115]}>
        <boxGeometry args={[1.15, 0.16, 0.02]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.25} />
      </mesh>
      {/* Discharge Louver with subtle cyan illumination */}
      <mesh position={[0, -0.13, 0.07]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.1, 0.02, 0.07]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.2} roughness={0.2} />
      </mesh>
      {/* Power LED Indicator */}
      <mesh position={[0.46, 0.06, 0.115]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

/**
 * Double-Door Metallic Inverter Smart Refrigerator with Digital Screen.
 */
function DoubleDoorRefrigerator({ position }) {
  return (
    <group position={position}>
      {/* Gunmetal Chassis */}
      <mesh castShadow position={[0, 0.98, 0]}>
        <boxGeometry args={[0.96, 1.95, 0.88]} />
        <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.15} />
      </mesh>
      {/* Left French Door */}
      <mesh position={[-0.23, 1.18, 0.45]}>
        <boxGeometry args={[0.44, 1.28, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Right French Door */}
      <mesh position={[0.23, 1.18, 0.45]}>
        <boxGeometry args={[0.44, 1.28, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Digital Touchscreen & Dispenser */}
      <mesh position={[-0.23, 1.18, 0.475]}>
        <planeGeometry args={[0.22, 0.32]} />
        <meshStandardMaterial color="#050505" emissive="#00f3ff" emissiveIntensity={0.1} roughness={0.1} />
      </mesh>
      {/* Bottom Freezer Drawer */}
      <mesh position={[0, 0.36, 0.45]}>
        <boxGeometry args={[0.9, 0.54, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.15} />
      </mesh>
      {/* Stainless Handles */}
      {[-0.04, 0.04].map((hx, i) => (
        <mesh key={i} position={[hx, 1.18, 0.49]}>
          <boxGeometry args={[0.024, 0.7, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Living Room: Plush Sectional Sofa, Wool Rug & Smoked Glass Coffee Table.
 */
function LivingRoomFurniture({ position, sofaType = 'charcoal' }) {
  const isLeather = sofaType?.toLowerCase().includes('leather');
  const sofaColor = isLeather ? '#1c1917' : '#27272a';
  const sofaRoughness = isLeather ? 0.35 : 0.78;

  return (
    <group position={position}>
      {/* Low Wool Area Rug */}
      <mesh position={[0.2, 0.015, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.8, 3.2]} />
        <meshStandardMaterial color="#e7e3dc" roughness={0.95} />
      </mesh>

      {/* Main Sofa Bench */}
      <mesh castShadow position={[0, 0.26, 0]}>
        <boxGeometry args={[2.9, 0.46, 1.15]} />
        <meshStandardMaterial color={sofaColor} roughness={sofaRoughness} />
      </mesh>
      {/* L-Shape Chaise Return */}
      <mesh castShadow position={[-0.9, 0.26, 0.88]}>
        <boxGeometry args={[1.15, 0.46, 1.6]} />
        <meshStandardMaterial color={sofaColor} roughness={sofaRoughness} />
      </mesh>
      {/* Backrests */}
      <mesh castShadow position={[0, 0.68, -0.45]}>
        <boxGeometry args={[2.9, 0.46, 0.26]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[-1.34, 0.68, 0.88]}>
        <boxGeometry args={[0.26, 0.46, 1.6]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>

      {/* Decorative Accent Throw Pillows */}
      <mesh position={[0.5, 0.54, -0.2]}>
        <boxGeometry args={[0.42, 0.34, 0.16]} />
        <meshStandardMaterial color="#84CC16" roughness={0.6} />
      </mesh>
      <mesh position={[-0.4, 0.54, -0.2]}>
        <boxGeometry args={[0.42, 0.34, 0.16]} />
        <meshStandardMaterial color="#eab308" roughness={0.6} />
      </mesh>

      {/* Smoked Tinted Glass Coffee Table with Walnut Base */}
      <group position={[0.6, 0, 0.95]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[1.35, 0.05, 0.75]} />
          <meshPhysicalMaterial
            color="#27272a"
            roughness={0.08}
            metalness={0.1}
            transmission={0.88}
            thickness={0.06}
          />
        </mesh>
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.9, 0.3, 0.45]} />
          <meshStandardMaterial color="#331e13" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 75" Wall-Mounted OLED TV Unit with Ambient Back-Glow & Walnut Credenza.
 */
function TVMediaUnit({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Walnut Media Credenza */}
      <mesh castShadow position={[0, 0.24, 0]}>
        <boxGeometry args={[2.5, 0.38, 0.48]} />
        <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Marble Inlay Top */}
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[2.52, 0.03, 0.49]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>
      {/* 75" Wall-Mounted OLED TV Frame */}
      <mesh castShadow position={[0, 0.95, -0.05]}>
        <boxGeometry args={[2.0, 1.18, 0.035]} />
        <meshStandardMaterial color="#050505" metalness={0.96} roughness={0.08} />
      </mesh>
      {/* Screen Display */}
      <mesh position={[0, 0.95, -0.03]}>
        <planeGeometry args={[1.94, 1.12]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.05}
          metalness={0.9}
          emissive="#00f3ff"
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* Ambient LED Backlight Strip */}
      <pointLight position={[0, 0.95, -0.1]} intensity={0.4} distance={2.5} color="#00f3ff" />
    </group>
  );
}

/**
 * Ambient Arc Floor Lamp with Warm Parchment Shade.
 */
function AmbientFloorLamp({ position }) {
  return (
    <group position={position}>
      {/* Granite Base */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 20]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Brass Arc Stem */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 1.6, 12]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Warm Parchment Shade */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.38, 24]} />
        <meshStandardMaterial
          color="#fef08a"
          roughness={0.4}
          emissive="#ffaa44"
          emissiveIntensity={0.5}
        />
      </mesh>
      <pointLight position={[0, 1.55, 0]} intensity={0.5} distance={5} color="#ffaa44" />
    </group>
  );
}

/**
 * Master / Secondary Bedroom Suite:
 * King/Queen bed with tufted headboard, layered duvet, walnut nightstands with touch lamps, wardrobe.
 */
function BedroomSuite({ position, isKing = true }) {
  const width = isKing ? 2.15 : 1.75;
  const length = 2.2;

  return (
    <group position={position}>
      {/* Bed Base Frame */}
      <mesh castShadow position={[0, 0.24, 0]}>
        <boxGeometry args={[width, 0.4, length]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {/* Mattress */}
      <mesh castShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[width - 0.08, 0.25, length - 0.08]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.65} />
      </mesh>
      {/* Folded Layered Duvet */}
      <mesh position={[0, 0.52, 0.35]}>
        <boxGeometry args={[width - 0.1, 0.16, length * 0.62]} />
        <meshStandardMaterial color="#0284c7" roughness={0.6} />
      </mesh>
      {/* Sleeping Pillows */}
      {[-width * 0.25, width * 0.25].map((px, i) => (
        <mesh key={i} position={[px, 0.62, -length * 0.36]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[width * 0.38, 0.14, 0.36]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
      ))}
      {/* Tufted Headboard */}
      <mesh castShadow position={[0, 0.76, -length * 0.48]}>
        <boxGeometry args={[width + 0.2, 1.0, 0.18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Dual Walnut Nightstands with Warm Glowing Lamps */}
      {[-width * 0.72, width * 0.72].map((nx, i) => (
        <group key={i} position={[nx, 0, -length * 0.36]}>
          <mesh castShadow position={[0, 0.28, 0]}>
            <boxGeometry args={[0.52, 0.5, 0.46]} />
            <meshStandardMaterial color="#331e13" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.18, 16]} />
            <meshStandardMaterial color="#fef08a" emissive="#ffaa44" emissiveIntensity={0.6} />
          </mesh>
          <pointLight position={[0, 0.6, 0]} intensity={0.4} distance={2.5} color="#ffaa44" />
        </group>
      ))}

      {/* Sliding Built-in Wardrobe */}
      <mesh castShadow position={[width * 0.76, 0.88, 0.45]}>
        <boxGeometry args={[0.68, 1.72, 1.45]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Kitchen: Marble Waterfall Island Counter with Induction Cooktop & Undermount Sink.
 */
function KitchenIslandUnit({ position }) {
  return (
    <group position={position}>
      {/* Marble Waterfall Island Counter */}
      <mesh castShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[2.6, 0.9, 0.82]} />
        <meshStandardMaterial color="#ffffff" roughness={0.16} metalness={0.1} />
      </mesh>
      {/* Polished Marble Top */}
      <mesh castShadow position={[0, 0.93, 0]}>
        <boxGeometry args={[2.64, 0.06, 0.86]} />
        <meshStandardMaterial color="#ffffff" roughness={0.12} metalness={0.12} />
      </mesh>
      {/* Induction Cooktop Surface */}
      <mesh position={[0.55, 0.965, 0]}>
        <boxGeometry args={[0.75, 0.015, 0.52]} />
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Glowing Induction Burner Rings */}
      {[-0.2, 0.2].map((bx, i) => (
        <mesh key={i} position={[0.55 + bx, 0.975, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.13, 24]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Undermount Sink */}
      <mesh position={[-0.55, 0.94, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.48]} />
        <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Chrome Arch Faucet */}
      <mesh position={[-0.55, 1.12, -0.2]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.3, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.08} />
      </mesh>
    </group>
  );
}

/**
 * Dining Area: Walnut Dining Table, 4 Chairs & Linear Brass Chandelier.
 */
function DiningTableSet({ position }) {
  return (
    <group position={position}>
      {/* Walnut Dining Table Top */}
      <mesh castShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[1.6, 0.06, 1.0]} />
        <meshStandardMaterial color="#331e13" roughness={0.35} />
      </mesh>
      {/* Brass Table Legs */}
      {[-0.7, 0.7].map((tx, i) =>
        [-0.4, 0.4].map((tz, j) => (
          <mesh key={`${i}-${j}`} position={[tx, 0.22, tz]}>
            <cylinderGeometry args={[0.028, 0.028, 0.44, 8]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.95} roughness={0.15} />
          </mesh>
        ))
      )}
      {/* 4 Dining Chairs */}
      {[
        [-0.48, 0, 0.68, 0],
        [0.48, 0, 0.68, 0],
        [-0.48, 0, -0.68, Math.PI],
        [0.48, 0, -0.68, Math.PI],
      ].map(([cx, cy, cz, rot], idx) => (
        <group key={idx} position={[cx, cy, cz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.29, 0]} castShadow>
            <boxGeometry args={[0.4, 0.04, 0.38]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0.17]} castShadow>
            <boxGeometry args={[0.38, 0.38, 0.03]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Linear Brass Chandelier */}
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[1.3, 0.04, 0.08]} />
        <meshStandardMaterial color="#ca8a04" emissive="#ffaa44" emissiveIntensity={0.6} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} intensity={0.5} distance={3.5} color="#ffaa44" />
    </group>
  );
}

/**
 * Luxury Bathroom: Porcelain Soaking Tub / Jacuzzi, Dual Vanity & Glass Shower.
 */
function BathroomFixtures({ position }) {
  return (
    <group position={position}>
      {/* White Porcelain Soaking Tub / Jacuzzi Unit */}
      <group position={[-0.4, 0, 0.5]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[1.6, 0.58, 0.85]} />
          <meshStandardMaterial color="#ffffff" roughness={0.12} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.45, 0.72]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.85} roughness={0.1} />
        </mesh>
        <mesh position={[0.7, 0.65, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.35, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.05} />
        </mesh>
      </group>

      {/* Dual Floating Vanity Counter with Backlit Mirror */}
      <group position={[0.6, 0, -0.6]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.5, 0.48, 0.52]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.67, 0]}>
          <boxGeometry args={[1.52, 0.04, 0.54]} />
          <meshStandardMaterial color="#ffffff" roughness={0.12} />
        </mesh>
        {[-0.4, 0.4].map((vx, i) => (
          <mesh key={i} position={[vx, 0.74, 0]}>
            <cylinderGeometry args={[0.18, 0.14, 0.12, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
        ))}
        {/* Backlit Frameless Mirror */}
        <mesh position={[0, 1.25, -0.24]}>
          <boxGeometry args={[1.4, 0.75, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.05} />
        </mesh>
      </group>

      {/* Glass Shower Enclosure */}
      <group position={[-0.6, 0, -0.7]}>
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[0.9, 1.3, 0.02]} />
          <meshPhysicalMaterial
            color="#a5f3fc"
            transmission={0.9}
            transparent
            opacity={0.35}
            roughness={0.06}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Detailed Modern Sedan Car Mesh.
 */
function ModernSedanCar({ position, rotation = [0, 0, 0], bodyColor = '#e2e8f0' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Lower Chassis */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.8, 0.44, 4.0]} />
        <meshStandardMaterial color={bodyColor} metalness={0.88} roughness={0.15} />
      </mesh>
      {/* Aerodynamic Cabin */}
      <mesh position={[0, 0.64, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.42, 2.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Windshield Glass */}
      <mesh position={[0, 0.65, 0.95]} rotation={[-0.45, 0, 0]}>
        <planeGeometry args={[1.42, 0.52]} />
        <meshPhysicalMaterial color="#1e293b" transmission={0.7} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Rear Window Glass */}
      <mesh position={[0, 0.65, -1.35]} rotation={[0.45, 0, 0]}>
        <planeGeometry args={[1.42, 0.52]} />
        <meshPhysicalMaterial color="#1e293b" transmission={0.7} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Headlights */}
      {[-0.65, 0.65].map((hx, i) => (
        <mesh key={i} position={[hx, 0.32, 2.01]}>
          <boxGeometry args={[0.3, 0.09, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* 4 Rubber Tires with Alloy Rims */}
      {[
        [-0.92, 0.22, 1.2],
        [0.92, 0.22, 1.2],
        [-0.92, 0.22, -1.2],
        [0.92, 0.22, -1.2]
      ].map(([wx, wy, wz], i) => (
        <group key={i} position={[wx, wy, wz]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.2, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? 0.02 : -0.02, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.21, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Outdoor Teak Patio Deck & Sparkling Blue Swimming Pool.
 */
function OutdoorPoolAndDeck({ position }) {
  const waterRef = useRef();

  useFrame(({ clock }) => {
    if (waterRef.current) {
      const t = clock.getElapsedTime();
      waterRef.current.position.y = 0.08 + Math.sin(t * 1.8) * 0.008;
    }
  });

  return (
    <group position={position}>
      {/* Wooden Patio Deck */}
      <mesh position={[4.6, 0.12, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.12, 5.8]} />
        <meshStandardMaterial color={TEAK_DECK} roughness={0.55} />
      </mesh>

      {/* Travertine Pool Coping Rim */}
      <mesh position={[-1.2, 0.12, 0]}>
        <boxGeometry args={[6.2, 0.12, 3.8]} />
        <meshStandardMaterial color="#e2dacb" roughness={0.35} />
      </mesh>

      {/* Recessed Basin */}
      <mesh position={[-1.2, -0.22, 0]}>
        <boxGeometry args={[5.4, 0.5, 3.0]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} />
      </mesh>

      {/* Sparkling Blue Water Surface */}
      <mesh ref={waterRef} position={[-1.2, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 3.0]} />
        <meshPhysicalMaterial
          color={POOL_WATER}
          transmission={0.82}
          transparent
          opacity={0.75}
          roughness={0.08}
          metalness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Underwater Glow */}
      <pointLight position={[-1.2, 0.15, 0]} intensity={0.8} distance={5} color="#00f3ff" />

      {/* Modern Poolside Loungers */}
      {[-0.8, 0.8].map((lx, i) => (
        <group key={i} position={[lx - 1.2, 0.18, 2.4]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.65, 0.12, 1.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.28, -0.6]} rotation={[-0.5, 0, 0]} castShadow>
            <boxGeometry args={[0.65, 0.08, 0.65]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Rooftop Monocrystalline PV Solar Array.
 */
function SolarArray({ hasSolar }) {
  if (!hasSolar) return null;
  return (
    <group position={[0, 1.5, -2.5]}>
      <mesh rotation={[-Math.PI / 12, 0, 0]} castShadow>
        <boxGeometry args={[7.2, 0.08, 3.4]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.1} metalness={0.92} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 12, 0, 0]}>
        <boxGeometry args={[7.1, 0.02, 3.3]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * Complete Luxury 3D House Dollhouse Architecture.
 */
function HouseDollhouse({ layout, applianceList = [], onSelectRoom }) {
  const wallColor = layout?.wall_color || '#e8e2ce';
  const roomWalls = layout?.roomWalls || {};
  const hasSolar = Boolean(layout?.solar_panels);
  const rooms = layout?.rooms || [];

  // Dynamic Room Wall Colors bound to roomWalls[key].color
  const getRoomColor = (roomKey) => {
    return roomWalls[roomKey]?.color || wallColor || '#e8e2ce';
  };

  const livingWallColor = getRoomColor('livingRoom');
  const masterWallColor = getRoomColor('bedroom1');
  const bed2WallColor = getRoomColor('bedroom2');
  const kitchenWallColor = getRoomColor('kitchen');
  const bathWallColor = getRoomColor('bathroom');
  const garageWallColor = getRoomColor('garage');
  const diningWallColor = getRoomColor('diningArea');

  // Dynamic appliance lookup from state
  const getRoomAppliances = (roomName) => {
    const room = rooms.find(
      (r) =>
        r.name?.toLowerCase().includes(roomName.toLowerCase()) ||
        r.id?.toLowerCase().includes(roomName.toLowerCase())
    );
    const roomApps = room?.appliances || [];

    const dynamicItems = (applianceList || []).filter((item) => {
      const target = (item.targetRoom || item.room || '').toLowerCase();
      return target.includes(roomName.toLowerCase());
    });

    const merged = [...roomApps];
    dynamicItems.forEach((dyn) => {
      const idx = merged.findIndex((m) => m.type === dyn.type);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...dyn };
      } else {
        merged.push(dyn);
      }
    });

    return merged;
  };

  const bed2Appliances = getRoomAppliances('bedroom 2');
  const bed2FanItem = bed2Appliances.find((a) => a.type === 'ceiling_fan');
  const bed2FanCount = bed2FanItem?.count ?? 1;

  const masterAppliances = getRoomAppliances('master');
  const masterFanItem = masterAppliances.find((a) => a.type === 'ceiling_fan');
  const masterFanCount = masterFanItem?.count ?? 1;

  const livingAppliances = getRoomAppliances('living');
  const livingSofaItem = livingAppliances.find((a) => a.type === 'sofa_l_shape');
  const livingSofaType = livingSofaItem?.spec || 'charcoal';

  return (
    <group position={[0, 0, 0]}>
      {/* Outdoor Landscaped Green Yard */}
      <mesh position={[1.5, -0.22, 1.5]} receiveShadow>
        <boxGeometry args={[28, 0.22, 22]} />
        <meshStandardMaterial color={YARD_LAWN} roughness={0.88} />
      </mesh>

      {/* Main Residence Concrete Plinth */}
      <mesh position={[1.0, 0.05, -0.5]} receiveShadow>
        <boxGeometry args={[15.8, 0.32, 10.2]} />
        <meshStandardMaterial color="#1e2229" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Attached 2-Car Garage Concrete Plinth */}
      <mesh position={[9.8, 0.05, 0.5]} receiveShadow>
        <boxGeometry args={[6.2, 0.32, 7.2]} />
        <meshStandardMaterial color="#2d3139" roughness={0.35} metalness={0.25} />
      </mesh>

      {/* ── Outer Perimeter Cutaway Walls (Smooth Matte Cream Finish, h = 1.1m) ── */}
      {/* North Exterior Wall */}
      <CutawayWall position={[1.0, 0.65, -5.4]} args={[15.6, 1.1, 0.22]} color={livingWallColor} />
      {/* South Exterior Wall */}
      <CutawayWall position={[1.0, 0.65, 4.4]} args={[15.6, 1.1, 0.22]} color={kitchenWallColor} />
      {/* West Exterior Wall */}
      <CutawayWall position={[-6.8, 0.65, -0.5]} args={[0.22, 1.1, 10.0]} color={masterWallColor} />
      {/* East Demising Wall */}
      <CutawayWall position={[6.6, 0.65, -0.5]} args={[0.22, 1.1, 10.0]} color={diningWallColor} />

      {/* ── Attached 2-Car Garage Walls ── */}
      <CutawayWall position={[9.8, 0.65, -3.0]} args={[6.2, 1.1, 0.22]} color={garageWallColor} />
      <CutawayWall position={[12.8, 0.65, 0.5]} args={[0.22, 1.1, 7.2]} color={garageWallColor} />
      <CutawayWall position={[9.8, 0.65, 4.0]} args={[6.2, 1.1, 0.22]} color={garageWallColor} />

      {/* ── Interior Cutaway Partition Walls (h = 1.1m) ── */}
      {/* Wall dividing Bedrooms from Living / Bath */}
      <CutawayWall position={[-1.9, 0.65, -0.5]} args={[0.2, 1.1, 9.8]} color={masterWallColor} />
      {/* Wall dividing Master Bed from Bed 2 */}
      <CutawayWall position={[-4.3, 0.65, 0.0]} args={[4.8, 1.1, 0.2]} color={bed2WallColor} />
      {/* Wall dividing Living Room from Kitchen */}
      <CutawayWall position={[2.2, 0.65, 0.0]} args={[8.6, 1.1, 0.2]} color={kitchenWallColor} />
      {/* Wall dividing Luxury Bathroom */}
      <CutawayWall position={[-0.4, 0.65, 0.0]} args={[3.0, 1.1, 0.2]} color={bathWallColor} />

      {/* ── Room Flooring Systems ── */}
      {/* 1. Living Room: Warm Natural Oak Hardwood Planks */}
      <mesh
        position={[2.4, 0.22, -2.7]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Living Room')}
      >
        <planeGeometry args={[8.0, 4.8]} />
        <meshStandardMaterial color={NATURAL_OAK} roughness={0.35} metalness={0.08} />
      </mesh>

      {/* 2. Dining Area: Natural Oak Hardwood */}
      <mesh
        position={[4.8, 0.22, 2.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Dining Area')}
      >
        <planeGeometry args={[3.2, 3.8]} />
        <meshStandardMaterial color={NATURAL_OAK} roughness={0.35} metalness={0.08} />
      </mesh>

      {/* 3. Kitchen: Polished Travertine Tile Flooring */}
      <mesh
        position={[1.0, 0.22, 2.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Kitchen')}
      >
        <planeGeometry args={[4.2, 3.8]} />
        <meshStandardMaterial color={TRAVERTINE_TILE} roughness={0.18} metalness={0.1} />
      </mesh>

      {/* 4. Master Bedroom: Soft Carpet / Light Wood */}
      <mesh
        position={[-4.3, 0.22, -2.7]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Master Bedroom')}
      >
        <planeGeometry args={[4.8, 4.8]} />
        <meshStandardMaterial color={CARPET_WOOD} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 5. Bedroom 2: Soft Carpet / Light Wood */}
      <mesh
        position={[-4.3, 0.22, 2.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Bedroom 2')}
      >
        <planeGeometry args={[4.8, 4.2]} />
        <meshStandardMaterial color={CARPET_WOOD} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 6. Luxury Bathroom: Dark Slate Tile Floor */}
      <mesh
        position={[-0.5, 0.22, -1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Bathroom')}
      >
        <planeGeometry args={[2.6, 2.4]} />
        <meshStandardMaterial color={SLATE_TILE} roughness={0.4} metalness={0.12} />
      </mesh>

      {/* 7. Attached 2-Car Garage: Polished Concrete Floor */}
      <mesh
        position={[9.8, 0.22, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectRoom && onSelectRoom('Garage')}
      >
        <planeGeometry args={[5.8, 6.8]} />
        <meshStandardMaterial color={CONCRETE_FLOOR} roughness={0.35} metalness={0.2} />
      </mesh>

      {/* ── Luxury Furnishings & Appliances ── */}
      {/* Living Room */}
      <LivingRoomFurniture position={[2.2, 0.22, -2.4]} sofaType={livingSofaType} />
      <TVMediaUnit position={[2.4, 0.22, -5.2]} rotation={[0, 0, 0]} />
      <AmbientFloorLamp position={[5.2, 0.22, -4.2]} />
      <WallSplitAC position={[2.4, 0.95, -0.15]} rotation={[0, Math.PI, 0]} />

      {/* Dining Area */}
      <DiningTableSet position={[4.8, 0.22, 2.2]} />

      {/* Kitchen Island & Refrigerator */}
      <KitchenIslandUnit position={[1.0, 0.22, 2.0]} />
      <DoubleDoorRefrigerator position={[2.8, 0.22, 3.7]} />

      {/* Luxury Bathroom Suite */}
      <BathroomFixtures position={[-0.5, 0.22, -1.2]} />

      {/* Master Bedroom Suite */}
      <BedroomSuite position={[-4.3, 0.22, -2.7]} isKing={true} />
      <CeilingFan position={[-4.3, 1.6, -2.7]} count={masterFanCount} />
      <WallSplitAC position={[-6.6, 0.95, -2.7]} rotation={[0, Math.PI / 2, 0]} />

      {/* Bedroom 2 Suite */}
      <BedroomSuite position={[-4.3, 0.22, 2.2]} isKing={false} />
      <CeilingFan position={[-4.3, 1.6, 2.2]} count={bed2FanCount} />
      <WallSplitAC position={[-6.6, 0.95, 2.2]} rotation={[0, Math.PI / 2, 0]} />

      {/* Attached 2-Car Garage with 2 Modern Sedan Cars */}
      <ModernSedanCar position={[8.6, 0.22, 0.5]} bodyColor="#e2e8f0" />
      <ModernSedanCar position={[11.0, 0.22, 0.5]} bodyColor="#1e3a8a" />

      {/* Outdoor Patio Deck & Swimming Pool */}
      <OutdoorPoolAndDeck position={[0, 0.22, 7.4]} />

      {/* Rooftop Solar Array (when active) */}
      <SolarArray hasSolar={hasSolar} />
    </group>
  );
}

/**
 * FloorPlanViewer3D Component — Embedded Three.js / React Three Fiber Canvas.
 */
export default function FloorPlanViewer3D({
  layout,
  buildingLayout,
  layoutData,
  applianceList = [],
  simulationHour = 14,
  viewMode = 'isometric',
  onSelectZone,
}) {
  const activeLayout = layout || buildingLayout || layoutData;
  const controlsRef = useRef();

  // Dynamic Sunlight Calculation based on simulationHour (0 to 23)
  const sunPosition = useMemo(() => {
    const angle = ((simulationHour - 6) / 18) * Math.PI;
    const x = Math.cos(angle) * 24;
    const y = Math.max(4, Math.sin(angle) * 28);
    const z = 14;
    return [x, y, z];
  }, [simulationHour]);

  const sunIntensity = useMemo(() => {
    if (simulationHour < 6 || simulationHour > 19) return 0.35;
    if (simulationHour <= 8 || simulationHour >= 17) return 1.3;
    return 2.0;
  }, [simulationHour]);

  const sunColor = useMemo(() => {
    if (simulationHour < 6 || simulationHour > 19) return '#38bdf8';
    if (simulationHour <= 8 || simulationHour >= 17) return '#fde047';
    return '#ffffff';
  }, [simulationHour]);

  // Viewport camera positions
  const cameraPosition = useMemo(() => {
    if (viewMode === 'top') return [1.5, 26, 0.1];
    if (viewMode === 'front') return [1.5, 9, 24];
    return [18, 16, 18]; // Cutaway isometric 3D Dollhouse View (default)
  }, [viewMode]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 520,
        position: 'relative',
        backgroundColor: '#050505',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.9) inset',
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              width: '100%',
              height: '100%',
              minHeight: 520,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#050505',
              color: '#84cc16',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.88rem',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: '2px solid rgba(132, 204, 22, 0.2)',
                borderTopColor: '#84cc16',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ color: '#cbd5e1' }}>Loading 3D Studio Canvas...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        }
      >
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('[EcoSense 3D] WebGL context lost; preventing render break.');
            });
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={cameraPosition || [18, 16, 18]} fov={40} />
            <OrbitControls
              ref={controlsRef}
              enablePan={true}
              enableRotate={true}
              enableZoom={true}
              dampingFactor={0.08}
              minDistance={6}
              maxDistance={42}
              maxPolarAngle={Math.PI / 2.1}
            />

            {/* Soft Daylight Ambient Lighting */}
            <ambientLight intensity={simulationHour < 6 || simulationHour > 19 ? 0.4 : 0.9} color="#ffffff" />

            {/* Directional Sunlight with Soft Architectural Shadows */}
            <directionalLight
              position={sunPosition || [16, 24, 14]}
              intensity={Number.isFinite(sunIntensity) ? sunIntensity : 2.0}
              color={sunColor || '#ffffff'}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />

            {/* Sky Fill Light */}
            <directionalLight position={[-14, 14, -14]} intensity={0.4} color="#38bdf8" />

            {/* Warm Interior Point Lights */}
            <pointLight position={[2.4, 2.0, -2.7]} intensity={0.5} distance={7} color="#ffaa44" />
            <pointLight position={[-4.3, 2.0, -2.7]} intensity={0.5} distance={6} color="#ffaa44" />

            {/* 3D Dollhouse Residence with Dynamic Wall Paint & Appliances */}
            <HouseDollhouse
              layout={activeLayout}
              applianceList={applianceList}
              onSelectRoom={onSelectZone}
            />
          </Suspense>
        </Canvas>
      </Suspense>
    </div>
  );
}
