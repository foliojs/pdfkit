import { cosine, sine } from './math';

/**
 * Given a rectangle ABCD,
 * with a fixed side AB of width boundingWidth,
 * and a maxHeight BC of boundingHeight.
 *
 * Find the largest (by area) inscribed rectangle EFGH,
 * where the angle Θ is equal to rotation anti-clockwise about the x-axis
 *
 * @example
 * ```
 * <───────────boundingWidth─────────────>
 * A══════════════F══════════════════════B ˄
 * ║            ██ ███                   ║ │
 * ║        h ██      ██   h             ║ │
 * ║       t █          ██   e           ║ b
 * ║     d ██             ██   i         ║ o
 * ║   i ██                 ██   g       ║ u
 * ║  w █░░░                  ██   h     ║ n
 * ║  ██░░Θ░░░                  ██   t   ║ d
 * ║██░░░░░░░░░                   ██     ║ i
 * E█───────────────────────────────██───║ n
 * ║ ██                               ██ ║ g
 * ║   ██                               █G H
 * ║     ██                            ██║ e
 * ║       ██                        ██  ║ i
 * ║         ██                    ██    ║ g
 * ║           ██                 █      ║ h
 * ║             ██             ██       ║ t
 * ║               ██         ██         ║ │
 * ║                 ██     ██           ║ │
 * ║                   ██ ██             ║ │
 * D═════════════════════H═══════════════C ˅
 * ```
 *
 * @param {number} boundingWidth - The maximum width of the bounding box (Infinity for no limit)
 * @param {number} boundingHeight - The maximum height of the bounding box (Infinity for no limit)
 * @param {number} rotation - The rotation angle
 *
 * @returns {[width: number, height: number]}
 * - width - corresponds with length EF
 * - height - corresponds with length FG
 */
export function computeInscribedBounds(boundingWidth, boundingHeight, rotation) {
  if (boundingWidth == null) boundingWidth = Infinity;
  if (boundingHeight == null) boundingHeight = Infinity;

  // Shortcut for the base cases
  if (rotation === 0 || rotation === 180) return [boundingWidth, boundingHeight];
  if (rotation === 90 || rotation === 270) return [boundingHeight, boundingWidth];

  let textMaxWidth, textMaxHeight;

  // We use these a lot so pre-compute
  const cos = cosine(rotation);
  const sin = sine(rotation);

  // From above we can infer
  // > AF = EF * cos(Θ)
  // > FB = AB - AF
  // > FB = FG * sin(Θ)
  // Rearrange
  // > FG = FB / sin(Θ)
  // Substitute
  // > FG = (AB - EF*cos(Θ)) / sin(Θ)
  // Area of a rectangle
  // > A = EF * FG
  // Substitute
  // > A = EF * (AB - EF*cos(Θ)) / sin(Θ)
  // > dA/dEF = (AB - 2*EF*cos(Θ)) / sin(Θ)
  // Find peak at dA/dEF = 0
  // > 0 = (AB - 2*EF*cos(Θ)) / sin(Θ)
  // > EF = AB / (2*cos(Θ))
  // Substitute
  // > FG = (AB - (AB*cos(Θ)) / (2*cos(Θ))) / sin(Θ)
  // > FG = AB / (2*sin(Θ))
  //
  // Final outcome
  // Length EF = AB / (2*cos(Θ))
  // Length FG = AB / (2*sin(Θ))
  if (rotation < 90 || (rotation > 180 && rotation < 270)) {
    textMaxWidth = boundingWidth / (2 * cos);
    textMaxHeight = boundingWidth / (2 * sin);
  } else {
    textMaxHeight = boundingWidth / (2 * cos);
    textMaxWidth = boundingWidth / (2 * sin);
  }

  // If the bounding box of the text is beyond the boundingHeight
  // then we need to clamp it and recompute the bounds
  // This time we are computing the sizes based on the outer box ABCD
  const EF = sin * textMaxWidth;
  const FG = cos * textMaxHeight;
  if (EF + FG > boundingHeight) {
    // > AB = EF * cos(Θ) + FG * sin(Θ)
    // > BC = BG + GC
    // > BG = FG * cos(Θ)
    // > GC = EF * sin(Θ)
    // > BC = FG * cos(Θ) + EF * sin(Θ)
    // > AB = EF * cos(Θ) + FG * sin(Θ)
    // Substitution solve
    // > EF = (AB*cos(Θ) - BC*sin(Θ)) / (cos^2(Θ)-sin^2(Θ))
    // > FG = (BC*cos(Θ) - AB*sin(Θ)) / (cos^2(Θ)-sin^2(Θ))
    const denominator = cos * cos - sin * sin;

    if (rotation < 90 || (rotation > 180 && rotation < 270)) {
      textMaxWidth = (boundingWidth * cos - boundingHeight * sin) / denominator;
      textMaxHeight = (boundingHeight * cos - boundingWidth * sin) / denominator;
    } else {
      textMaxHeight = (boundingWidth * cos - boundingHeight * sin) / denominator;
      textMaxWidth = (boundingHeight * cos - boundingWidth * sin) / denominator;
    }
  }

  return [Math.abs(textMaxWidth), Math.abs(textMaxHeight)];
}
