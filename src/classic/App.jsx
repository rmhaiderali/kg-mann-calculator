import { useEffect, useState, useRef } from "react"
import { useSelect } from "downshift"
import debounce from "debounce"
import {
  pushState,
  replaceState,
  normalizeToString,
  getCurrentParamsObject,
} from "../common/query-state.js"
import rawCss from "../common/raw.css?raw"

function uppercaseFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const debounce_1_50ms = debounce((fn) => fn(), 50)
const debounce_1_500ms = debounce((fn) => fn(), 500)

const isFieldSizingSupported = CSS.supports("field-sizing", "content")

const lineHeight = 24

function App() {
  const textRef = useRef(null)
  const lineNoRef = useRef(null)

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

  function updateTextRefContent(text) {
    textRef.current.value = text
  }

  function updateLineNoRefContent(text) {
    const linesCount = text.split("\n").length
    lineNoRef.current.value = arrayRange(1, linesCount).join("\n")
  }

  const [text, setText] = useState("")

  const lines = text.split("\n")
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
    if (!navigator.userAgent.match(/servo/i))
      document.documentElement.classList.add("dark-supported")

    const currentParamsObject = getCurrentParamsObject()
    const text = normalizeToString(currentParamsObject.text)
    setText(text)
    replaceState({ text }, currentParamsObject)

    updateTextRefContent(text)
    updateLineNoRefContent(text)

    updateTextRefWidth()
    updateLineNoRefWidth()

    window.addEventListener("popstate", ({ state }) => {
      const text = normalizeToString(state.text)
      setText(text)

      updateTextRefContent(text)
      updateLineNoRefContent(text)

      updateTextRefWidth()
      updateLineNoRefWidth()
    })
  }, [])

  const inputModes = ["text", "decimal", "numeric"]
  const [selectedInputMode] = useState(
    () => localStorage.getItem("inputMode") ?? inputModes[0],
  )

  const {
    isOpen,
    selectedItem,
    getItemProps,
    getMenuProps,
    getToggleButtonProps,
  } = useSelect({
    items: inputModes,
    initialSelectedItem: selectedInputMode,
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return
      localStorage.setItem("inputMode", selectedItem)
    },
  })

  const textAreaHeight = lines.length * lineHeight + "px"

  return (
    <div style={{ padding: "2px" }}>
      <style>{rawCss}</style>
      <div style={{ textWrap: "nowrap", display: "inline-flex" }}>
        <div style={{ marginRight: "6px" }}>Input mode</div>
        <button
          {...getToggleButtonProps()}
          onBlur={() => {}}
          style={{ display: isOpen ? "none" : "block" }}
        >
          {uppercaseFirstChar(selectedItem)}
        </button>
        <div {...getMenuProps()} style={{ display: isOpen ? "flex" : "none" }}>
          {[selectedItem]
            .concat(inputModes.filter((item) => item !== selectedItem))
            .map((item, index) => (
              <button
                key={item}
                {...getItemProps({ item })}
                style={{ marginLeft: index ? "6px" : "0" }}
              >
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
              height: textAreaHeight,
            }}
          />
        </div>
        <textarea
          wrap="off"
          value={text}
          ref={textRef}
          rows={lines.length}
          style={{ flex: "1 1 auto", height: textAreaHeight }}
          onChange={(e) => {
            const text = e.target.value
            setText(text)
            updateTextRefWidth()
            debounce_1_50ms(() => {
              updateLineNoRefContent(text)
              updateLineNoRefWidth()
            })
            debounce_1_500ms(() => pushState({ text }))
          }}
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
