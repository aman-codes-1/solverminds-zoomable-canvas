const columns = (moveX, moveY) => [
  {
    moveX: 10 + moveX,
    moveY: 5 + moveY,
    fontSize: "22px",
    fontWeight: "normal",
  },
  {
    moveX: 10 + moveX,
    moveY: 25 + moveY,
    fontSize: "18px",
    fontWeight: "normal",
  },
  {
    moveX: 10 + moveX,
    moveY: 23 + moveY,
    fontSize: "32px",
    fontWeight: "normal",
  },
  {
    moveX: 36 + moveX,
    moveY: 16 + moveY,
    fontSize: "42px",
    fontWeight: "normal",
  },
];

const rows1 = (moveX, moveY) => [
  ["", [`$,${10 + moveX},${42 + moveY},18px`, `*,${10 + moveX},${14 + moveY},18px`], "", ""],
  [9650, [`1,${40 + moveX},${40 + moveY},14px`, `RE,${10 + moveX},${5 + moveY},18px`, `*,${60 + moveX},${5 + moveY},18px`], "", 1054],
  ["", "", "", ""],
  [9650, "", "", 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
];
const rows2 = (moveX, moveY) => [
  ["", "", "", ""],
  [9650, "", "", 1054],
  ["", [`$,${10 + moveX},${42 + moveY},18px`, `*,${10 + moveX},${14 + moveY},18px`], "", ""],
  [9650, [`1,${40 + moveX},${40 + moveY},14px`, `RE,${10 + moveX},${5 + moveY},18px`, `*,${60 + moveX},${5 + moveY},18px`], "", 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
];
const rows3 = (moveX, moveY) => [
  ["", "", [`$,${10 + moveX},${42 + moveY},18px`, `*,${10 + moveX},${14 + moveY},18px`], ""],
  [9650, "", [`1,${40 + moveX},${40 + moveY},14px`, `RE,${10 + moveX},${5 + moveY},18px`, `*,${60 + moveX},${5 + moveY},18px`], 1054],
  ["", "", "", ""],
  [9650, "", "", 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
];
const rows4 = (moveX, moveY) => [
  ["", "", "", ""],
  [9650, "", "", 1054],
  ["", "", [`$,${10 + moveX},${42 + moveY},18px`, `*,${10 + moveX},${14 + moveY},18px`], ""],
  [9650, "", [`1,${40 + moveX},${40 + moveY},14px`, `RE,${10 + moveX},${5 + moveY},18px`, `*,${60 + moveX},${5 + moveY},18px`], 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
  [9650, 174, 9702, 1054],
];

const rowsArr = [rows1, rows2, rows3, rows4];

const diffPoints = (p1, p2) => {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
};

const addPoints = (p1, p2) => {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
};

const scalePoint = (p1, scale) => {
  return { x: p1.x / scale, y: p1.y / scale };
};

export { addPoints, columns, diffPoints, rowsArr, scalePoint };
