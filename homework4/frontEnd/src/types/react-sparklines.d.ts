declare module "react-sparklines" {
    import React from "react";

    export interface SparklinesProps {
        data: number[];
        limit?: number;
        width?: number;
        height?: number;
        svgWidth?: number;
        svgHeight?: number;
        preserveAspectRatio?: string;
        margin?: number;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface SparklinesLineProps {
        color?: string;
        style?: React.CSSProperties;
    }

    export const Sparklines: React.FC<SparklinesProps>;
    export const SparklinesLine: React.FC<SparklinesLineProps>;
}