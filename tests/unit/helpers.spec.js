import { parseTextStreams } from './helpers.js';

describe('parseTextStreams', () => {
  it('should parse stream with multiple text items', () => {
    const stream = `1 0 0 -1 0 792 cm
72 76.5 m
72 74.843146 73.343146 73.5 75 73.5 c
76.656854 73.5 78 74.843146 78 76.5 c
78 78.156854 76.656854 79.5 75 79.5 c
73.343146 79.5 72 78.156854 72 76.5 c
h
f
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 87 711.384 Tm
/F1 12 Tf
[<6974656d2031> 0] TJ
ET
Q
72 90.372 m
72 88.715146 73.343146 87.372 75 87.372 c
76.656854 87.372 78 88.715146 78 90.372 c
78 92.028854 76.656854 93.372 75 93.372 c
73.343146 93.372 72 92.028854 72 90.372 c
h
f
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 87 697.512 Tm
/F1 12 Tf
[<6974656d2032> 0] TJ
ET
Q
72 104.244 m
72 102.587146 73.343146 101.244 75 101.244 c
76.656854 101.244 78 102.587146 78 104.244 c
78 105.900854 76.656854 107.244 75 107.244 c
73.343146 107.244 72 105.900854 72 104.244 c
h
f
q
1 0 0 -1 0 792 cm
BT
1 0 0 1 87 683.64 Tm
/F1 12 Tf
[<6974656d2033> 0] TJ
ET
Q
`;

    const result = parseTextStreams(stream);
    expect(result).toHaveLength(3);
    // Common fields
    expect(result[0].text).toBe('item 1');
    expect(result[0].font).toBe('F1');
    expect(result[0].fontSize).toBe(12);
    expect(result[1].text).toBe('item 2');
    expect(result[1].font).toBe('F1');
    expect(result[1].fontSize).toBe(12);
    expect(result[2].text).toBe('item 3');
    expect(result[2].font).toBe('F1');
    expect(result[2].fontSize).toBe(12);

    // Positions: x = 87, y from the Tm after Y-flip CTM (top-left origin)
    expect(result[0].x).toBeCloseTo(87, 3);
    expect(result[0].y).toBeCloseTo(80.616, 3);
    expect(result[1].x).toBeCloseTo(87, 3);
    expect(result[1].y).toBeCloseTo(94.488, 3);
    expect(result[2].x).toBeCloseTo(87, 3);
    expect(result[2].y).toBeCloseTo(108.36, 3);
  });
});
