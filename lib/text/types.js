/**
 * @typedef {Object} LayoutOptions
 *
 * @property {Intl.LocalesArgument} [locales]
 * Locale(s) for use in the grapheme segmenter
 *
 * Defaults to system locale
 * @property {string[]} [features]
 * The font features
 */

/**
 * @typedef {Object} TextOptions
 *
 * @property {Size} [x]
 * X position of the text
 *
 * Defaults to this.doc.x
 * @property {Size} [y]
 * Y position of the text
 *
 * Defaults to this.doc.y
 * @property {Size} [width]
 * The max width of the content
 *
 * Defaults to the remaining document content width
 * @property {Size} [height]
 * The max height of the content
 *
 * Defaults to the remaining document content height
 * @property {Font} [font]
 * Font options for the cell
 *
 * Defaults to the current document font
 * @property {Align} [align]
 * The alignment of the text
 *
 * Defaults to left
 * @property {number} [rotation]
 * The rotation of the text (in degrees)
 *
 * This rotation is applied anti-clockwise from the top-left corner of the text.
 *
 * Defaults to 0
 * @property {string | boolean} [ellipsis]
 * What character to append to indicate overflowing text
 *
 * Defaults to false (aka ''), the text will simply truncate
 * @property {number} [horizontalScaling]
 * Ability to scale text horizontally (in percent)
 *
 * Defaults to 100
 * @property {number} [characterSpacing]
 * The amount of space between each character in the text
 *
 * Defaults to 0
 * @property {string[] | Object.<string, boolean>} [features]
 * An array of [OpenType feature tags](https://www.microsoft.com/typography/otspec/featuretags.htm) to apply.
 * Can also be provided as an object with features as keys and boolean values.
 * If not provided, a set of defaults is used.
 * To deactivate default font features, you have to explicitly set them to false (`{ liga: false }`).
 * When providing an empty array, the default font features will still be used.
 *
 * Defaults to []
 */

/**
 * @typedef {TextOptions} NormalizedTextOptions
 *
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {Font} font
 * @property {number} rotation
 * @property {string} ellipsis
 * @property {number} horizontalScaling
 * @property {number} characterSpacing
 * @property {Object.<string, boolean>} features
 */

/**
 * @typedef {Object} BoxOptions
 *
 * @property {SideDefinition<number>} [border]
 * The width of the box borders
 *
 * Defaults to 0 (no border)
 * @property {SideDefinition<PDFColor>} [borderColor]
 * The color of the box borders
 *
 * Defaults to black
 * @property {SideDefinition<number>} [borderOpacity]
 * The opacity of the box borders
 *
 * Defaults to 1
 * @property {number} [rotation]
 * The rotation of the box (in degrees)
 *
 * Defaults to 0
 * @property {PDFColor} [backgroundColor]
 * The color of the box background
 *
 * Defaults to transparent
 * @property {number} [backgroundOpacity]
 * The opacity of the box background
 *
 * Defaults to 1 (opaque)
 */

/**
 * @typedef {BoxOptions} NormalizedBoxOptions
 *
 * @property {ExpandedSideDefinition<number>} border
 * @property {ExpandedSideDefinition<PDFColor>} borderColor
 * @property {ExpandedSideDefinition<number>} borderOpacity
 * @property {number} rotation
 * @property {PDFColor} backgroundColor
 * @property {number} backgroundOpacity
 */

/**
 * @typedef {TextOptions & BoxOptions} TextBoxOptions
 *
 * @property {Size} [x]
 * X position of the text box
 *
 * Defaults to this.doc.x
 * @property {Size} [y]
 * Y position of the text box
 *
 * Defaults to this.doc.y
 * @property {SideDefinition<Wideness>} [padding]
 * Controls the padding of the text relative to the box
 *
 * Defaults to `0`
 * @property {Align} [alignContent]
 * Sets the alignment of the box's text
 *
 * Defaults to `{x: 'left', y: 'top'}`
 */

/**
 * @typedef {NormalizedTextOptions & NormalizedBoxOptions} NormalizedTextBoxOptions
 *
 * @property {ExpandedAlign} alignContent
 */
