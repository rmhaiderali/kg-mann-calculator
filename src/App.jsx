import { useEffect, useState, useRef } from "react"
import { UAParser } from "ua-parser-js"
import debounce from "debounce"

const userAgent = new UAParser().getResult()

const newLine = "\n"
const newLineReplace = ":"

function toSearchParams(params) {
  return new URLSearchParams(params)
    .toString()
    .replaceAll(encodeURIComponent(newLineReplace), newLineReplace)
}

const pushState = debounce((newParams) => {
  history.pushState(newParams, "", "?" + toSearchParams(newParams))
}, 500)

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
    textRef.current.style.width = "0px"
    textRef.current.style.width = textRef.current.scrollWidth + 1 + "px"
  }

  function updateLineNoRefWidth() {
    lineNoRef.current.style.width = "0px"
    lineNoRef.current.style.width = lineNoRef.current.scrollWidth + 1 + "px"
  }

  function updateBothRefWidth() {
    if (isFieldSizingSupported) return
    updateTextRefWidth()
    updateLineNoRefWidth()
  }

  const text = searchParams?.text || ""
  const setText = (newText) => {
    setSearchParams((prev) => {
      const newParams = { ...prev, text: newText }
      pushState(newParams)
      return newParams
    })
  }

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
      (value, index) => start + index * step
    )
  }

  useEffect(() => {
    updateBothRefWidth()
    window.addEventListener("resize", updateBothRefWidth)
    window.addEventListener("popstate", ({ state }) => setSearchParams(state))
  }, [])

  useEffect(() => {
    updateBothRefWidth()
  }, [text])

  return (
    <div style={{ zoom: "1.5" }}>
      <table>
        <colgroup>
          <col style={{ width: "1px" }} />
          <col style={{ width: "auto" }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={{ borderRight: "1px solid gray" }}>
              <textarea
                style={{ userSelect: "none" }}
                wrap="off"
                ref={lineNoRef}
                disabled={true}
                readOnly={true}
                rows={lines.length}
                value={arrayRange(1, lines.length).join(newLine)}
              />
            </td>
            <td>
              <textarea
                style={{
                  minWidth: "100%",
                  boxSizing: "border-box",
                }}
                wrap="off"
                ref={textRef}
                rows={lines.length}
                value={text.replaceAll(newLineReplace, newLine)}
                onChange={(e) =>
                  setText(e.target.value.replaceAll(newLine, newLineReplace))
                }
                inputMode={userAgent.os.name === "Android" ? "numeric" : "text"}
              />
            </td>
          </tr>
        </tbody>
      </table>
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
