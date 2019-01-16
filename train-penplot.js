import { PaperSize, Orientation } from 'penplot';
import { polylinesToSVG } from 'penplot/util/svg';
import { clipPolylinesToBox } from 'penplot/util/geom';

export const orientation = Orientation.LANDSCAPE;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  // ---- Display Parameters ----
  const [ width, height ] = dimensions;
  const margin = 1.5;
  const center = [width / 2, height / 2];

  // ---- Algorithm Parameters ----
  const inset = 1;

  // ---- Begin Algorithm ----
  let lines = [];
  lines.push(rectangle(center, width - 2*margin, height - 2*margin));


  // ---- Clip lines to the margin ----
  const box = [ margin, margin, width - margin, height - margin ];
  lines = clipPolylinesToBox(lines, box);

  // ---- Return Parameters ----
  return {
    draw,
    print,
    background: 'white',
    animate: false,
    clear: true
  };

// ---- Main Functions ---------------------------------------------------------

  function draw () {
    lines.forEach(points => {
      context.beginPath();
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }

  function print () {
    return polylinesToSVG(lines, {
      dimensions
    });
  }

// ---- Helper Functions -------------------------------------------------------

  function rectangle(center, width, height) {
    const x = center[0];
    const y = center[1];
    const half_w = width / 2;
    const half_h = height / 2;
    const min_x = x - half_w;
    const max_x = x + half_w;
    const min_y = y - half_h
    const max_y = y + half_h

    return [
      [min_x, min_y],
      [min_x, max_y],
      [max_x, max_y],
      [max_x, min_y],
      [min_x, min_y]
    ];
  }
}
