import { useEffect, useState } from "react"

function App() {
  const fontSize = "14px"

  const [searchParams, setSearchParams] = useState(
    Object.fromEntries(new URLSearchParams(location.search).entries())
  )

  const text = searchParams?.text || ""
  const setText = (newText) => {
    setSearchParams((prev) => {
      const newParams = { ...prev, text: newText }
      history.pushState(newParams, "", "?" + new URLSearchParams(newParams))
      return newParams
    })
  }

  const lines = text.split("\n")
  const numbers = lines.map((line) => parseFloat(line))
  const sum = numbers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0)

  function arrayRange(start, stop, step = 1) {
    return Array.from(
      { length: (stop - start) / step + 1 },
      (value, index) => start + index * step
    )
  }

  useEffect(() => {
    window.addEventListener("popstate", ({ state }) => setSearchParams(state))
  }, [])

  return (
    <div style={{ fontSize, zoom: "1.5" }}>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex" }}>
          <textarea
            style={{
              fontSize,
              margin: "0px",
              resize: "none",
              outline: "none",
              userSelect: "none",
              fieldSizing: "content",
              border: "1px solid gray",
              borderRight: "none",
              borderRadius: "3px 0px 0px 3px",
            }}
            disabled={true}
            readOnly={true}
            rows={lines.length}
            value={arrayRange(1, lines.length).join("\n")}
          />
        </div>
        <div
          style={{
            display: "flex",
            overflow: "hidden",
            border: "1px solid gray",
            borderRadius: "0px 3px 3px 0px",
          }}
        >
          <textarea
            style={{
              fontSize,
              margin: "0px",
              border: "none",
              resize: "none",
              outline: "none",
            }}
            wrap="off"
            rows={lines.length}
            inputMode={
              navigator.userAgent.includes("AppleWebKit/") &&
              !navigator.userAgent.includes("Chrome/")
                ? "text"
                : "decimal"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
      <div style={{ marginTop: "8px" }}>{Number(sum.toFixed(2))} kg</div>
      <div style={{ marginTop: "4px" }}>
        {Math.floor(sum / 40)} mann {Number((sum % 40).toFixed(2))} kg
      </div>
    </div>
  )
}

export default App
