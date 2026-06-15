const newLine = "+"
const newLineEncoded = encodeURIComponent(newLine)

export function getCurrentParamsObject() {
  const currentParams = new URLSearchParams(
    location.search.replaceAll(newLine, newLineEncoded),
  )
  return Object.fromEntries(currentParams)
}

export function pushState(
  object,
  currentParamsObject = getCurrentParamsObject(),
) {
  const nextParamsObject = Object.assign(currentParamsObject, object)

  for (const key in nextParamsObject)
    if (nextParamsObject[key] === "") delete nextParamsObject[key]

  const nextParams = new URLSearchParams(nextParamsObject)

  const nextParamsStr = nextParams
    .toString()
    .replaceAll("+", "%20")
    .replaceAll(newLineEncoded, newLine)

  const url = location.pathname + (nextParamsStr ? "?" + nextParamsStr : "")

  history.pushState(nextParamsObject, "", url)
}

export function replaceState(
  object,
  currentParamsObject = getCurrentParamsObject(),
) {
  const nextParamsObject = Object.assign(currentParamsObject, object)

  for (const key in nextParamsObject)
    if (nextParamsObject[key] === "") delete nextParamsObject[key]

  const nextParams = new URLSearchParams(nextParamsObject)

  const nextParamsStr = nextParams
    .toString()
    .replaceAll("+", "%20")
    .replaceAll(newLineEncoded, newLine)

  const url = location.pathname + (nextParamsStr ? "?" + nextParamsStr : "")

  history.replaceState(nextParamsObject, "", url)
}

export function normalizeToString(value) {
  return value?.toString() || ""
}

// export function wrapStateSetter(fn) {
//   return (fnOrValue) => {
//     typeof fnOrValue === "function"
//       ? fn((prev) => fnOrValue(prev)?.toString() || "")
//       : fn(fnOrValue?.toString() || "")
//   }
// }
