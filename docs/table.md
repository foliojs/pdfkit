# Tables in PDFKit

## The basics

PDFKit makes adding tables to documents quite simple, and includes many options
to customize the display of the output.

Basic tables can be defined without configuration:

    doc.table()
       .row(['Column 1', 'Column 2', 'Column 3'])
       .row(['A', 'B', 'C'])

Here is the output:

![0]()

Tables and their cells can be configured with custom styles and fonts and colors

    doc.table({ rows: 2, height: 100, width: 200, defaultCell: {
            textColor: 'blue', 
            align: 'center'
        }})
       .row(['Column 1', 'Column 2', 'Column 3'], {backgroundColor: 'pink'})
       .row(['A', {value: 'B', fontSize: 10}, 'C'])

Here is the output:

![1]()

Internally, PDFKit keeps track of the current X and Y position of table as it
is added to the document. This way, any calls to `text` or `table` will be placed below the table row.

## Table options

- `cols` - Number of columns you wish to divide the table into, allowing the width of a cell to be calculated
- `rows` - Number of rows you wish to divide the table into, allowing the height of a cell to be calculated
- `cellHeight` - Height of a cell, If not provided it will compute it based on `height` / `rows` (If neither `rows` nor `cellHeight` is provided, the default of `2em` is used)
- `cellWidth` - Width of a cell, If not provided it will compute it based on `width` / `cols` (If neither cols nor cellWidth is provided, the default of `25%` of the table width is used)
- `x` - Optional positioning of the table
- `y` - Optional positioning of the table
- `width` - The width of the table, undefined for page content width
- `height` - The height of the table, undefined for remaining page content height
- `border` - The thickness of the tables border (Default is 0, so no table border, as the cells render it)
- `borderColor` - The border color of the table
- `defaultCell` - Any config you wish to apply to all cells

## Cell options

This extends any of the [text options](text.html#Text-Styling)

- `colspan` - How many columns this cell covers, follows the same logic as HTML `colspan`
- `rowspan` - How many rows this cell covers, follows the same logic as HTML `rowspan`
- `value` - The text value, will be cast to a string (Note that `null` and `undefined` are not rendered but the cell is still outlined)
- `padding` - The padding for the cell (default `0.25em`)
- `border` - The border for the cell (default `1pt`)
- `borderColor` - The border colors for the cell
- `backgroundColor` - The color of the cell
- `textColor` - The color of the text
- `textStroke` - The text stroke (default `0pt`)
- `textStrokeColor` - The text stroke color
