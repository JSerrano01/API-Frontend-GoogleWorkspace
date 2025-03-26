import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Control de la cámara con movimiento automático
function CameraController() {
    const controlsRef = useRef();
    const [isInteracting, setIsInteracting] = useState(false);

    const onStart = () => setIsInteracting(true);
    const onEnd = () => setIsInteracting(false);

    useFrame(() => {
        if (!isInteracting && controlsRef.current) {
            controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + 0.01);
            controlsRef.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            onStart={onStart}
            onEnd={onEnd}
        />
    );
}

// Modelo 3D sin la letra ni textos
function ModelOnly() {
    const { scene } = useGLTF("/models/google_logo.glb"); // Carga desde public/

    return <primitive object={scene} scale={0.5} position={[0, 0, 0]} />; // Escala reducida
}

const Model3D = () => {
    const [cameraPosition, setCameraPosition] = useState([0, 0, 65]); // Default en PC

    useEffect(() => {
        // Ajustar la cámara dependiendo del tamaño de la pantalla
        const updateCameraPosition = () => {
            if (window.innerWidth < 768) {
                setCameraPosition([0, 0, 100]); // Más lejos en móviles
            } else {
                setCameraPosition([0, 0, 80]); // Normal en pantallas grandes
            }
        };

        updateCameraPosition(); // Ajustar al cargar
        window.addEventListener("resize", updateCameraPosition); // Detectar cambios

        return () => window.removeEventListener("resize", updateCameraPosition);
    }, []);

    return (
        <div className="w-full h-full relative"> {/* Fondo blanco */}
            <Canvas className="w-full h-full" camera={{ position: cameraPosition }}>
                {/* Luz ambiental para iluminación general */}
                <ambientLight intensity={1.0} /> {/* Aumenta la intensidad */}

                {/* Luces direccionales para mejorar la iluminación */}
                <directionalLight position={[10, 10, 10]} intensity={5.0} />
                <directionalLight position={[-10, -10, -10]} intensity={5.0} />

                {/* Modelo 3D */}
                <Suspense fallback={null}>
                    <ModelOnly />
                </Suspense>

                {/* Control de la cámara */}
                <CameraController />
            </Canvas>

            {/* Texto "Press and drag to orbit" */}
            {/* <p className="absolute top-[85%] left-1/2 transform -translate-x-1/2 !text-lg sm:text-sm text-white z-10 font-semibold">
                Press and drag to orbit
            </p> */}
        </div>
    );
};

export default Model3D;