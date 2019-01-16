import { PaperSize, Orientation } from 'penplot';
import { polylinesToSVG } from 'penplot/util/svg';
import { clipPolylinesToBox } from 'penplot/util/geom';

import SimplexNoise from 'simplex-noise';
import Vector from 'vector';

import polygonCrosshatching from 'polygon-crosshatching';
import poissonSampling from 'adaptive-poisson-sampling';
import flattenLineTree from 'flatten-line-tree';
import regularPolygon from 'regular-polygon';
import optimizePaths from 'optimize-paths';
import array from 'new-array';

export const orientation = Orientation.LANDSCAPE;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  // ---- Display Parameters ----
  const [ width, height ] = dimensions;
  const margin = 2.5;
  const working_width = width - margin;
  const working_height = height - margin;
  const center = [width / 2, height / 2];
  const simplex = new SimplexNoise();

  // ---- Algorithm Parameters ----
  const inset = 1;
  const num_insets = 17;
  const border_padding = 4*margin;
  const point_density = 0.5;



  // const jitter_ammount = 0.25;

  // ---- Begin Algorithm ----
  let lines = array(num_insets).map((_, i) => {
    const reduction = border_padding - i*inset
    const rect_width = working_width + reduction / 2;
    const rect_height = working_height + reduction / 2;

    const rect_buffer = [reduction + margin/2, reduction + margin/2];

    // const pointDensity = vec => { point_density * noise_function(vec) };
    // const pointDensity = vec => { point_density };

    const points = poissonSampling([rect_width, rect_height], point_density)
      .map(point => Vector.add(point, rect_buffer));

    const point_strokes = points
      .map(point => regularPolygon(7, point, 0.05))
      .map(polygon => [...polygon, polygon[0]]);

    return point_strokes;
  });

  // ---- Turn Algorithm Into Strokes ----
  // lines = lines.map(rect => rectangleStrokes(rect));

  console.log(lines)

  // ---- Clip lines to the margin ----
  const box = [ margin, margin, width - margin, height - margin ];
  // lines = clipPolylinesToBox(lines, box);


  // ---- Return Parameters ----
  return {
    draw,
    print,
    background: 'white',
    animate: false,
    clear: true
  };

// ---- Main Functions ---------------------------------------------------------

  function noise_function(vec) {
    const [x, y] = vec;
    const scale = 0.15;

    return simplex.noise2D(x * scale, y * scale);
  }

  function draw () {
    flattenLineTree(lines).forEach(points => {
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
      [max_x, min_y]
    ];
  }

  function jitteredRectangle(center, width, height, magnitude) {
    return rectangle(center, width, height).map(endpoint => {
      const rotation = 2*Math.PI * Math.random();
      return Vector.offset(endpoint, magnitude * Math.random(), rotation);
    });
  }


  function rectangleStrokes(lines) {
    return lines.concat([lines[0]]);
  }

}
