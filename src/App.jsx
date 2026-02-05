import { useEffect, useState, useRef } from "react"
import { useSelect } from "downshift"
import debounce from "debounce"

function uppercaseFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const newLine = "\n"
const newLineReplace = ":"

function toSearchParams(params) {
  return new URLSearchParams(params)
    .toString()
    .replaceAll(encodeURIComponent(newLineReplace), newLineReplace)
}

const debounce_1_50ms = debounce((fn) => fn(), 50)
const debounce_1_500ms = debounce((fn) => fn(), 500)

const isFieldSizingSupported = CSS.supports("field-sizing", "content")

function App() {
  const textRef = useRef(null)
  const lineNoRef = useRef(null)

  const [searchParams, setSearchParams] = useState(() => {
    const params = Object.fromEntries(new URLSearchParams(location.search))
    params.text = params.text?.replaceAll(newLine, newLineReplace) || ""
    history.replaceState(params, "", "?" + toSearchParams(params))
    return params
  })

  function updateTextRefWidth() {
    if (isFieldSizingSupported) return
    textRef.current.style.width = "0px"
    textRef.current.style.width = textRef.current.scrollWidth + 1 + "px"
  }

  function updateLineNoRefWidth() {
    if (isFieldSizingSupported) return
    lineNoRef.current.style.width = "0px"
    lineNoRef.current.style.width = lineNoRef.current.scrollWidth - 2 + "px"
  }

  function updateLineNoRefContent(text) {
    const linesCount = text.split(newLineReplace).length
    lineNoRef.current.value = arrayRange(1, linesCount).join(newLine)
    updateLineNoRefWidth()
  }

  function updateBothRefWidth() {
    updateTextRefWidth()
    updateLineNoRefWidth()
  }

  const setText = (newText) => {
    debounce_1_50ms(() => {
      updateLineNoRefContent(newText)
      updateLineNoRefWidth()
    })
    updateTextRefWidth()
    setSearchParams((prev) => {
      const params = { ...prev, text: newText }
      debounce_1_500ms(() =>
        history.pushState(params, "", "?" + toSearchParams(params)),
      )
      return params
    })
  }

  const text = searchParams?.text || ""
  const lines = text.split(newLineReplace)
  const numbers = lines.map((line) => parseFloat(line))
  const sum = numbers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0)

  const sign = sum < 0 ? "−" : ""
  const absTotalKg = Math.abs(sum.toFixed(2))
  const absMann = Math.abs(Math[sum / 40 < 0 ? "ceil" : "floor"](sum / 40))
  const absRemainingKg = Math.abs((sum % 40).toFixed(2))

  function arrayRange(start, stop, step = 1) {
    return Array.from(
      { length: (stop - start) / step + 1 },
      (value, index) => start + index * step,
    )
  }

  useEffect(() => {
    updateLineNoRefContent(text)
    updateBothRefWidth()
    window.addEventListener("resize", updateBothRefWidth)
    window.addEventListener("popstate", ({ state }) => setSearchParams(state))
  }, [])

  const [lineHeight] = useState(() => {
    const textarea = document.createElement("textarea")
    textarea.rows = 1
    textarea.value = "1"
    document.body.appendChild(textarea)
    const style = getComputedStyle(textarea)
    const height = parseFloat(style.height)
    document.body.removeChild(textarea)
    return height
  })

  const items = ["text", "decimal", "numeric"]

  const {
    isOpen,
    selectedItem,
    getItemProps,
    getMenuProps,
    getToggleButtonProps,
  } = useSelect({
    items,
    initialSelectedItem: localStorage.getItem("inputMode") ?? items[0],
    onSelectedItemChange: ({ selectedItem }) =>
      selectedItem && localStorage.setItem("inputMode", selectedItem),
  })

  return (
    <div style={{ padding: "2px" }}>
      <div style={{ textWrap: "nowrap", display: "inline-flex" }}>
        <div style={{ marginRight: "6px" }}>Input mode</div>
        <button
          {...getToggleButtonProps()}
          style={{ display: isOpen ? "none" : "block" }}
        >
          {uppercaseFirstChar(selectedItem)}
        </button>
        <div
          {...getMenuProps()}
          style={{ gap: "6px", display: isOpen ? "flex" : "none" }}
        >
          {items.map((item, index) => (
            <button key={item} {...getItemProps({ item, index })}>
              {uppercaseFirstChar(item)}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        <div>
          <textarea
            wrap="off"
            ref={lineNoRef}
            disabled={true}
            readOnly={true}
            style={{
              direction: "rtl",
              overflow: "hidden",
              height: lines.length * lineHeight + "px",
            }}
          />
        </div>
        <textarea
          wrap="off"
          ref={textRef}
          rows={lines.length}
          style={{ flex: "1 1 auto" }}
          value={text.replaceAll(newLineReplace, newLine)}
          onChange={(e) =>
            setText(e.target.value.replaceAll(newLine, newLineReplace))
          }
          inputMode={selectedItem}
        />
      </div>

      <div style={{ marginTop: "8px" }}>
        {sign} {absTotalKg} kg
      </div>
      <div style={{ marginTop: "4px" }}>
        {sign} {absMann} mann {absRemainingKg} kg
      </div>
    </div>
  )
}

export default App
