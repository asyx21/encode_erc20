export const getPriceRounded = (price) => {
  if (!price || Number.isNaN(price)) return 0;
  const float = typeof price === 'string' ? parseFloat(price) : price;
  let str = '';
  if (float >= 10000) {
    str = float.toFixed(0);
  } else if (float < 10000 && float >= 1000) {
    str = float.toFixed(1);
  } else if (float < 1000 && float >= 100) {
    str = float.toFixed(2);
  } else if (float < 100 && float >= 10) {
    str = float.toFixed(3);
  } else if (float < 10 && float >= 1) {
    str = float.toFixed(4);
  } else if (float < 1 && float >= 0.1) {
    str = float.toFixed(5);
  } else {
    str = float.toFixed(6);
  }
  return +str;
};

export function getImageUrl(name, ext = 'png') {
  return new URL(`./assets/${name}.${ext}`, import.meta.url).href
}
