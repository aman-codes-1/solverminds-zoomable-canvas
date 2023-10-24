import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { addPoints, columns, diffPoints, rowsArr, scalePoint } from "./helpers";

const Canvas = () => {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight - 26;
  const ORIGIN = Object.freeze({ x: 0, y: 0 });
  // adjust to device to avoid blur
  const { devicePixelRatio: ratio = 1 } = window;
  const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(ORIGIN);
  const [mousePos, setMousePos] = useState(ORIGIN);
  const [viewportTopLeft, setViewportTopLeft] = useState(ORIGIN);
  const isResetRef = useRef(false);
  const lastMousePosRef = useRef(ORIGIN);
  const lastOffsetRef = useRef(ORIGIN);

  // update last offset
  useEffect(() => {
    lastOffsetRef.current = offset;
  }, [offset]);

  // reset
  const reset = useCallback(
    (canvas, context) => {
      if (canvas && context && !isResetRef.current) {
        // adjust for device pixel density
        context.canvas.width = canvasWidth * ratio;
        context.canvas.height = canvasHeight * ratio;
        context.scale(ratio, ratio);
        setScale(1);

        // reset state and refs
        setContext(context);
        setOffset(ORIGIN);
        setMousePos(ORIGIN);
        setViewportTopLeft(ORIGIN);
        lastOffsetRef.current = ORIGIN;
        lastMousePosRef.current = ORIGIN;

        // this thing is so multiple resets in a row don't clear canvas
        isResetRef.current = true;
      }
    },
    [canvasWidth, canvasHeight]
  );

  // functions for panning
  const mouseMove = useCallback(
    (event) => {
      if (context) {
        const lastMousePos = lastMousePosRef.current;
        const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
        lastMousePosRef.current = currentMousePos;

        const mouseDiff = diffPoints(currentMousePos, lastMousePos);
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
      }
    },
    [context]
  );

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startPan = useCallback(
    (event) => {
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);
      lastMousePosRef.current = { x: event.pageX, y: event.pageY };
    },
    [mouseMove, mouseUp]
  );

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing canvas
      const renderCanvas = canvasRef.current;
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx) {
        reset(renderCanvas, renderCtx);
      }
    }
  }, [reset, canvasHeight, canvasWidth]);

  // pan when offset or scale changes
  useLayoutEffect(() => {
    if (context && lastOffsetRef.current) {
      const offsetDiff = scalePoint(
        diffPoints(offset, lastOffsetRef.current),
        scale
      );
      context.translate(offsetDiff.x, offsetDiff.y);
      setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
      isResetRef.current = false;
    }
  }, [context, offset, scale]);

  const draw = useCallback((rows, ctx, moveX, moveY, x, y, width, canWidth, canHeight) => {
    const colScale = Math.floor(width / columns(moveX, moveY).length);
    const rowScale = Math.floor(canHeight / rows.length);
    ctx.save();
    ctx.beginPath();
    for (var ly = y; ly <= canHeight; ly += rowScale) {
      if (ly === 0) {
        ctx.moveTo(x, ly);
        ctx.lineTo(x + canWidth, ly);
      } else if (ly > rowScale && ly < rowScale * 3) {
        ctx.moveTo(x, ly);
        ctx.lineTo(x + canWidth, ly);
      } else if (ly > rowScale * 3) {
        ctx.moveTo(x, ly);
        ctx.lineTo(x + canWidth, ly);
      }
      for (var lx = x; lx <= canWidth; lx += colScale) {
        ctx.moveTo(lx, y);
        ctx.lineTo(lx, y + canHeight);
        const row = Math.floor(ly / rowScale);
        const col = Math.floor(lx / colScale);
        const data = rows?.[row - 1]?.[col];
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const itemArr = item?.split(',');
            const itemStr = itemArr?.[0];
            const itemX = Number(itemArr?.[1]);
            const itemY = Number(itemArr?.[2]);
            const itemFontSize = itemArr?.[3];
            ctx.font = `${itemFontSize} Courier`;
            ctx.fillText(
              itemStr,
              lx + itemX,
              ly - itemY,
            );
          })
        }
        const rowStr = String.fromCharCode(data);
        ctx.fillStyle = "#000000";
        ctx.font = `${columns(moveX, moveY)?.[col]?.fontWeight} ${columns(moveX, moveY)?.[col]?.fontSize} Arial`;
        ctx.fillText(
          rowStr,
          lx + columns(moveX, moveY)?.[col]?.moveX,
          ly - columns(moveX, moveY)?.[col]?.moveY
        );
      }
    }
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }, []);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      context.canvas.width = context.canvas.width;
      context.setTransform(storedTransform);
      rowsArr.forEach((rows, idx) => {
        const fixedWidth = 400;
        const width = ((canvasWidth / fixedWidth) * 100);
        const moveX = width * idx;
        const moveY = 0;
        draw(rows(moveX, moveY), context, moveX, moveY, 0, 0, width, canvasWidth, canvasHeight);
      })
    // draw(rowsArr[0], context, 0, 0, 0, 0, 300, 300, canvasHeight);
    }
  }, [canvasWidth, canvasHeight, context, scale, offset, viewportTopLeft, draw]);

  // add event listener on canvas for mouse position
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }

    const handleUpdateMouse = (event) => {
      event.preventDefault();
      if (canvasRef.current) {
        const viewportMousePos = { x: event.clientX, y: event.clientY };
        const topLeftCanvasPos = {
          x: canvasRef.current.offsetLeft,
          y: canvasRef.current.offsetTop,
        };
        setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
      }
    }

    canvasElem.addEventListener("mousemove", handleUpdateMouse);
    canvasElem.addEventListener("wheel", handleUpdateMouse);
    return () => {
      canvasElem.removeEventListener("mousemove", handleUpdateMouse);
      canvasElem.removeEventListener("wheel", handleUpdateMouse);
    };
  }, []);

  // add event listener on canvas for zoom
  useEffect(() => {
    const canvasElem = canvasRef.current;
    if (canvasElem === null) {
      return;
    }
    const handleWheel = (event) => {
      event.preventDefault();
      if (context) {
        const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
        const viewportTopLeftDelta = {
          x: (mousePos.x / scale) * (1 - 1 / zoom),
          y: (mousePos.y / scale) * (1 - 1 / zoom),
        };
        const newViewportTopLeft = addPoints(
          viewportTopLeft,
          viewportTopLeftDelta
        );

        context.translate(viewportTopLeft.x, viewportTopLeft.y);
        context.scale(zoom, zoom);
        context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

        setViewportTopLeft(newViewportTopLeft);
        setScale(scale * zoom);
        isResetRef.current = false;
      }
    }

    canvasElem.addEventListener("wheel", handleWheel);
    return () => canvasElem.removeEventListener("wheel", handleWheel);
  }, [context, mousePos.x, mousePos.y, viewportTopLeft, scale]);

  return (
    <div>
      <canvas
        onMouseDown={startPan}
        ref={canvasRef}
        width={canvasWidth * ratio}
        height={canvasHeight * ratio}
        style={{
          margin: 10,
          width: canvasWidth - 20,
          height: canvasHeight,
        }}
      ></canvas>
    </div>
  );
};

export default Canvas;
