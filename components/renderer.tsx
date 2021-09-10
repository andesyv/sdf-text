import React from "react";
import Three from 'three';

interface Line {
    from: Three.Vector3;
    to: Three.Vector3;
}

export interface Props {
    lines?: Line[];
}

const Renderer: React.FC<Props> = ({lines}) => {
    return (
        <canvas>

        </canvas>
    );
};

export default Renderer;