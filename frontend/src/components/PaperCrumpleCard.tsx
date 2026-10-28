// @ts-nocheck
import React, { useMemo } from 'react';
import PaperCrumple from './PaperCrumple';

export interface PaperCrumpleCardProps {
  id?: string;
  headerBadge?: string;
  stepNumber?: string | number;
  title: string;
  detail: string;
  status?: 'completed' | 'running' | 'idle' | 'warning' | 'locked' | 'paused_for_payment';
  isDark?: boolean;
  badge?: string;
  badgeBg?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
  sceneHeight?: number;
  className?: string;
}

/**
 * Draws an authentic Neo-Brutalist cyber card onto a 2D canvas and exports a high-DPI PNG
 * to serve as the crumplable 3D paper texture.
 */
function generateCardTexture(
  width: number,
  height: number,
  isDark: boolean,
  status: string,
  headerBadge: string | undefined,
  stepNumber: string | number | undefined,
  title: string,
  detail: string,
  badge?: string
): string {
  if (typeof document === 'undefined') return '';

  const scale = 2; // Crisp retina resolution
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  const isCompleted = status === 'completed';
  const isRunning = status === 'running';
  const isWarning = status === 'warning';
  const isLocked = status === 'locked';

  // 1. Background Fill
  let bgColor = isDark
    ? isRunning
      ? '#2D2208'
      : isCompleted
      ? '#142E20'
      : '#1E232B'
    : isRunning
    ? '#FFFBEB'
    : isCompleted
    ? '#F0FDF4'
    : '#FFFFFF';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Card Border
  const borderColor = isDark
    ? isRunning
      ? '#FBBF24'
      : isCompleted
      ? '#34D399'
      : '#38BDF8'
    : '#000000';
  ctx.lineWidth = 3;
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(1.5, 1.5, width - 3, height - 3);

  let currentY = 16;

  // 3. Top Header Badge (for Agent Workflow Stages)
  if (headerBadge) {
    const badgeText = headerBadge.toUpperCase();
    ctx.font = '900 11px "Space Grotesk", sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeWidth = textWidth + 16;
    const badgeHeight = 22;

    const bBg = isRunning
      ? '#38BDF8'
      : isCompleted
      ? '#6BCB77'
      : isDark
      ? '#334155'
      : '#000000';
    const bColor = isRunning ? '#000000' : isCompleted ? '#000000' : '#FFFFFF';

    ctx.fillStyle = bBg;
    ctx.fillRect(14, currentY, badgeWidth, badgeHeight);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.strokeRect(14, currentY, badgeWidth, badgeHeight);

    ctx.fillStyle = bColor;
    ctx.fillText(badgeText, 22, currentY + 15);

    // Right-aligned Status Icon Box
    const iconSize = 24;
    const iconX = width - iconSize - 14;
    const iconY = currentY - 1;

    let iconBg = isCompleted ? '#6BCB77' : isRunning ? (isDark ? '#111827' : '#000000') : (isDark ? '#1E293B' : '#F1F5F9');
    ctx.fillStyle = iconBg;
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    ctx.strokeStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(iconX, iconY, iconSize, iconSize);

    // Draw glyph
    ctx.save();
    ctx.translate(iconX + iconSize / 2, iconY + iconSize / 2);
    if (isCompleted) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-1, 4);
      ctx.lineTo(6, -4);
      ctx.stroke();
    } else if (isRunning) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 1.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    currentY += 34;
  } else {
    // Pipeline card layout (Icon on Left)
    const iconSize = 30;
    const iconX = 16;
    const iconY = currentY;

    let iconBg = '#6BCB77';
    if (isRunning) iconBg = isDark ? '#111827' : '#000000';
    else if (isWarning) iconBg = '#38BDF8';
    else if (isLocked) iconBg = isDark ? '#334155' : '#E2E8F0';
    else if (!isCompleted) iconBg = isDark ? '#1E293B' : '#F8FAFC';

    ctx.fillStyle = iconBg;
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.strokeRect(iconX, iconY, iconSize, iconSize);

    // Draw glyph
    ctx.save();
    ctx.translate(iconX + iconSize / 2, iconY + iconSize / 2);
    if (isCompleted) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-1, 5);
      ctx.lineTo(7, -5);
      ctx.stroke();
    } else if (isRunning) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 1.5);
      ctx.stroke();
    } else {
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. Title Text (Supports responsive wrap if title is long)
  const titleX = headerBadge ? 14 : 56;
  let titleY = headerBadge ? currentY + 14 : 36;
  const maxTitleWidth = width - titleX - 14;

  ctx.fillStyle = isRunning
    ? isDark
      ? '#FBBF24'
      : '#B45309'
    : isDark
    ? '#FFFFFF'
    : '#000000';
  ctx.font = '800 14px "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif';
  const prefix = stepNumber !== undefined ? `${stepNumber}. ` : '';
  const fullTitle = `${prefix}${title}`;

  // Word wrap title if needed
  const titleWords = fullTitle.split(' ');
  let titleLine = '';
  let titleLinesCount = 0;
  for (let t = 0; t < titleWords.length; t++) {
    const testTLine = titleLine + titleWords[t] + ' ';
    if (ctx.measureText(testTLine).width > maxTitleWidth && t > 0) {
      ctx.fillText(titleLine.trim(), titleX, titleY);
      titleLine = titleWords[t] + ' ';
      titleY += 18;
      titleLinesCount++;
      if (titleLinesCount >= 2) break;
    } else {
      titleLine = testTLine;
    }
  }
  if (titleLine && titleLinesCount < 2) {
    ctx.fillText(titleLine.trim(), titleX, titleY);
  }

  // 5. Detail Text (multi-line, crisp, comfortable line-height)
  ctx.fillStyle = isDark ? '#CBD5E1' : '#475569';
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';

  const detailX = titleX;
  const detailY = titleY + 18;
  const maxWidth = width - detailX - 14;
  const words = detail.split(' ');
  let line = '';
  let lineY = detailY;
  const lineHeight = 17;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), detailX, lineY);
      line = words[n] + ' ';
      lineY += lineHeight;
      linesCount++;
      if (linesCount >= 4) break;
    } else {
      line = testLine;
    }
  }
  if (linesCount < 4 && line) {
    ctx.fillText(line.trim(), detailX, lineY);
  }

  // 6. Cyber watermark stamp
  ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(0, 0, 0, 0.22)';
  ctx.font = '700 8.5px "JetBrains Mono", monospace';
  ctx.fillText('CRUMPLE // 3D', width - 82, height - 9);

  return canvas.toDataURL('image/png');
}

export const PaperCrumpleCard: React.FC<PaperCrumpleCardProps> = ({
  headerBadge,
  stepNumber,
  title,
  detail,
  status = 'completed',
  isDark = true,
  badge,
  badgeBg,
  onClick,
  width = 340,
  height = 155,
  sceneHeight = 180,
  className = ''
}) => {
  const [active3D, setActive3D] = React.useState(false);
  const isHoldingRef = React.useRef(false);

  const cardTexture = useMemo(() => {
    return generateCardTexture(width, height, isDark, status, headerBadge, stepNumber, title, detail, badge);
  }, [width, height, isDark, status, headerBadge, stepNumber, title, detail, badge]);

  const handleMouseEnter = () => {
    setActive3D(true);
  };

  const handleMouseLeave = () => {
    if (!isHoldingRef.current) {
      setActive3D(false);
    }
  };

  const handleStateChange = (state: string) => {
    if (state === 'holding' || state === 'crumpled') {
      isHoldingRef.current = true;
    } else {
      isHoldingRef.current = false;
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setActive3D(true)}
      className={`paper-crumple-card-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: `${sceneHeight}px`,
        cursor: onClick ? 'pointer' : 'grab'
      }}
      title="Hold & drag to crumple card"
    >
      {active3D ? (
        <PaperCrumple
          src={cardTexture}
          alt={`${title} card`}
          width={width}
          height={height}
          sceneHeight={sceneHeight}
          releaseBehavior="restore"
          crumpleAmount={0.82}
          crumpleDuration={0.45}
          releaseDuration={0.35}
          foldCount={6}
          foldSharpness={0.65}
          wrinkleDepth={0.7}
          creaseStrength={0.16}
          paperColor={isDark ? '#141414' : '#f5f5f0'}
          paperTexture={0.04}
          draggable={true}
          returnToOrigin={true}
          lightIntensity={isDark ? 2.4 : 1.8}
          shadow={false}
          onStateChange={handleStateChange}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: `${sceneHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <img
            src={cardTexture}
            alt={`${title} card`}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              maxWidth: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
              display: 'block'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PaperCrumpleCard;
