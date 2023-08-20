export const deepClone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

export const clamp = function (val, min, max) {
  if (val < min) {
    return min;
  }
  if (val > max) {
    return max;
  }
  return val;
};

export const mergeMaps = function (mapA, mapB) {
  const result = {};
  var id;
  for (id in mapA) {
    result[id] = mapA[id];
  }
  for (id in mapB) {
    result[id] = mapB[id];
  }
  return result;
};

export const bindNativeEvent = function (source, event, callback, context) {
  const boundEventHandler = callback.bind(context);
  source.addEventListener(event, boundEventHandler, false);
  return {
    cancel: function () {
      source.removeEventListener(event, boundEventHandler, false);
    },
  };
};

export const mapToArray = function (map) {
  const arr = [];
  for (var key in map) {
    arr.push(map[key]);
  }
  return arr;
};

export const reverseMap = function (map) {
  const reversedMap = {};
  for (var key in map) {
    reversedMap[map[key]] = key;
  }
  return reversedMap;
};

var queryParams = null;
export const getQueryParam = function (key) {
  if (!queryParams) {
    queryParams = {};
    if (!document.location.search) {
      return null;
    }
    const pairs = document.location.search.substr(1).split("&");
    var pair, i;
    for (i = 0; i < pairs.length; i++) {
      pair = pairs[i].split("=");
      queryParams[pair[0].trim()] = pair[1].trim();
    }
  }
  return queryParams[key] || null;
};

export const downloadAsFile = function (filename, text, mimeType) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:" + mimeType + ";charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
