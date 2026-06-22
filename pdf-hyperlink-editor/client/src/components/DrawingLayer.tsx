import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { LinkRect } from '../types/link';

interface DrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  links: LinkRect[];
  currentPage: number;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  selectedId: string | null;
  onLinkDrawn: (rect: Omit<LinkRect, 'id' | 'url' | 'type' | 'label'>) => void;
  onLinkSelect: (id: string) => void;
  onLinkUpdate: (id: string, changes: Partial<LinkRect>) => void;
}

const TYPE_COLORS: Record<string, { stroke: string; fill: string; active: string }> = {
  website: { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.10)', active: 'rgba(59,130,246,0.20)' },
  email: { stroke: '#10b981', fill: 'rgba(16,185,129,0.10)', active: 'rgba(16,185,129,0.20)' },
  phone: { stroke: '#8b5cf6', fill: 'rgba(139,92,246,0.10)', active: 'rgba(139,92,246,0.20)' },
  custom: { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.10)', active: 'rgba(245,158,11,0.20)' },
};

export const DrawingLayer: React.FC<Props> = ({
  links,
  currentPage,
  scale,
  canvasWidth,
  canvasHeight,
  selectedId,
  onLinkDrawn,
  onLinkSelect,
  onLinkUpdate,
}) => {
  const isDrawing = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const [newRect, setNewRect] = useState<DrawRect | null>(null);

  const pageLinks = links.filter((l) => l.page === currentPage);

  const getStagePos = (stage: Konva.Stage) => {
    return stage.getPointerPosition() ?? { x: 0, y: 0 };
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;
    onLinkSelect('');
    isDrawing.current = true;
    const pos = getStagePos(e.target.getStage()!);
    startPos.current = pos;
    setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !startPos.current) return;
    const pos = getStagePos(e.target.getStage()!);
    setNewRect({
      x: Math.min(startPos.current.x, pos.x),
      y: Math.min(startPos.current.y, pos.y),
      width: Math.abs(pos.x - startPos.current.x),
      height: Math.abs(pos.y - startPos.current.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !newRect) return;
    isDrawing.current = false;

    if (newRect.width > 8 && newRect.height > 8) {
      onLinkDrawn({
        page: currentPage,
        x: newRect.x / scale,
        y: newRect.y / scale,
        width: newRect.width / scale,
        height: newRect.height / scale,
      });
    }

    setNewRect(null);
    startPos.current = null;
  };

  return (
    <Stage
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'crosshair',
      }}
    >
      <Layer>
        {pageLinks.map((link) => {
          const colors = TYPE_COLORS[link.type] ?? TYPE_COLORS.website;
          const isSelected = selectedId === link.id;
          const dispX = link.x * scale;
          const dispY = link.y * scale;
          const dispW = link.width * scale;
          const dispH = link.height * scale;

          return (
            <React.Fragment key={link.id}>
              <Rect
                x={dispX}
                y={dispY}
                width={dispW}
                height={dispH}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 2 : 1.5}
                fill={isSelected ? colors.active : colors.fill}
                cornerRadius={2}
                draggable
                onClick={() => onLinkSelect(link.id)}
                onDragEnd={(e) => {
                  onLinkUpdate(link.id, {
                    x: e.target.x() / scale,
                    y: e.target.y() / scale,
                  });
                  e.target.x(e.target.x());
                  e.target.y(e.target.y());
                }}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = 'move';
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = 'crosshair';
                }}
              />
              {dispW > 40 && dispH > 16 && (
                <Text
                  x={dispX + 4}
                  y={dispY + 3}
                  width={dispW - 8}
                  height={dispH - 6}
                  text={link.label || link.url}
                  fontSize={10}
                  fill={colors.stroke}
                  ellipsis
                  wrap="none"
                  listening={false}
                />
              )}
            </React.Fragment>
          );
        })}

        {newRect && (
          <Rect
            x={newRect.x}
            y={newRect.y}
            width={newRect.width}
            height={newRect.height}
            stroke="#3b82f6"
            strokeWidth={1.5}
            dash={[6, 3]}
            fill="rgba(59,130,246,0.08)"
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
};
