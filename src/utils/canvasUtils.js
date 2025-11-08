const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

export const resizeCanvasToContainer = (canvas, container) => {
  if (!container || !canvas) return;

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const scaleX = containerWidth / BASE_WIDTH;
  const scaleY = containerHeight / BASE_HEIGHT;
  const scale = Math.max(0.2, Math.min(scaleX, scaleY));

  canvas.setWidth(BASE_WIDTH);
  canvas.setHeight(BASE_HEIGHT);

  const vpt = [scale, 0, 0, scale, 0, 0];
  canvas.setViewportTransform(vpt);

  if (canvas.canvas && canvas.canvas.parentNode) {
    const parent = canvas.canvas.parentNode;
    parent.style.display = "flex";
    parent.style.alignItems = "center";
    parent.style.justifyContent = "center";
    parent.style.width = "100%";
    parent.style.height = "100%";
  }

  canvas.renderAll();
};

export const addObjectToCanvas = (canvas, object) => {
  if (!canvas) return;
  canvas.add(object);
  canvas.setActiveObject(object);
};

export const cloneObject = (canvas, obj) => {
  if (!canvas || !obj) return;
  obj.clone((cloned) => {
    cloned.set({ left: obj.left + 12, top: obj.top + 12 });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
  });
};

export const alignObject = (canvas, obj, edge) => {
  if (!canvas || !obj) return;
  switch (edge) {
    case "left":
      obj.set("left", 0);
      break;
    case "h-center":
      obj.set("left", (canvas.width / canvas.getZoom() - obj.getScaledWidth()) / 2);
      break;
    case "right":
      obj.set("left", canvas.width / canvas.getZoom() - obj.getScaledWidth());
      break;
    case "top":
      obj.set("top", 0);
      break;
    case "v-center":
      obj.set("top", (canvas.height / canvas.getZoom() - obj.getScaledHeight()) / 2);
      break;
    case "bottom":
      obj.set("top", canvas.height / canvas.getZoom() - obj.getScaledHeight());
      break;
    default:
      break;
  }
  canvas.requestRenderAll();
};

export const updateObjectProperty = (canvas, obj, prop, value) => {
  if (obj) {
    obj.set(prop, value);
    canvas.requestRenderAll();
  }
};