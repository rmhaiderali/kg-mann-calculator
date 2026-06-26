import merge from "lodash.merge"
import debounce from "debounce"
import { useSelect } from "downshift"
import { Compartment } from "@codemirror/state"
import { useEffect, useState, useRef } from "react"
import { defaultKeymap, history } from "@codemirror/commands"
import { EditorView, lineNumbers, keymap } from "@codemirror/view"
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

let editorView = null
const inputModeCompartment = new Compartment()

function App() {
  const inputModes = ["text", "decimal", "numeric"]

  const [selectedInputMode] = useState(
    () => localStorage.getItem("inputMode") ?? inputModes[0],
  )

  const containerRef = useRef(null)

  const [lines, setLines] = useState([])
  const numbers = lines.map((line) => parseFloat(line))
  const sum = numbers.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0)

  const sign = sum < 0 ? "−" : ""
  const absTotalKg = Math.abs(sum.toFixed(2))
  const absMann = Math.abs(Math[sum / 40 < 0 ? "ceil" : "floor"](sum / 40))
  const absRemainingKg = Math.abs((sum % 40).toFixed(2))

  useEffect(() => {
    if (editorView) return

    const darkSupported = !navigator.userAgent.match(/servo/i)
    if (darkSupported) document.documentElement.classList.add("dark-supported")

    const textarea = document.createElement("textarea")
    document.body.appendChild(textarea)

    textarea.style.colorScheme = "light"
    const lightComputed = getComputedStyle(textarea)
    const lightColor = lightComputed.color
    const lightBackground = lightComputed.backgroundColor
    textarea.setAttribute("disabled", "")
    const lightDisabledComputed = getComputedStyle(textarea)
    const lightDisabledColor = lightDisabledComputed.color
    const lightDisabledBackground = lightDisabledComputed.backgroundColor
    textarea.style.colorScheme = "dark"
    const darkDisabledComputed = getComputedStyle(textarea)
    const darkDisabledColor = darkDisabledComputed.color
    const darkDisabledBackground = darkDisabledComputed.backgroundColor
    textarea.removeAttribute("disabled")
    const darkComputed = getComputedStyle(textarea)
    const darkColor = darkComputed.color
    const darkBackground = darkComputed.backgroundColor

    document.body.removeChild(textarea)

    const commonTheme = {
      ".cm-content": {
        padding: "0",
      },
      ".cm-line": {
        padding: "0 6px 0 4px",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 4px",
        minWidth: "auto",
      },
    }

    const lightTheme = EditorView.theme(
      merge({}, commonTheme, {
        ".cm-gutters": {
          color: lightDisabledColor,
          backgroundColor: lightDisabledBackground,
        },
        ".cm-content": {
          color: lightColor,
          caretColor: lightColor,
          backgroundColor: lightBackground,
        },
      }),
    )

    const darkTheme = EditorView.theme(
      merge({}, commonTheme, {
        ".cm-gutters": {
          color: darkDisabledColor,
          backgroundColor: darkDisabledBackground,
        },
        ".cm-content": {
          color: darkColor,
          caretColor: darkColor,
          backgroundColor: darkBackground,
        },
      }),
    )

    const themeCompartment = new Compartment()

    const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const currentParamsObject = getCurrentParamsObject()
    const text = normalizeToString(currentParamsObject.text)
    setLines(text.split("\n"))
    replaceState({ text }, currentParamsObject)

    const debouncePushState500ms = debounce((text) => pushState({ text }), 500)

    const onChange = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const lines = Array.from(update.state.doc)
        setLines(lines)
        if (!update.transactions[0].isUserEvent("popstate")) {
          const text = lines.join("")
          debouncePushState500ms(text)
        }
      }
    })

    editorView = new EditorView({
      doc: text,
      parent: containerRef.current,
      extensions: [
        onChange,
        lineNumbers(),
        keymap.of(defaultKeymap),
        history({ newGroupDelay: 50 }),
        themeCompartment.of(
          darkSupported && darkSchemeQuery.matches ? darkTheme : lightTheme,
        ),
        inputModeCompartment.of(
          EditorView.contentAttributes.of({ inputmode: selectedInputMode }),
        ),
      ],
    })

    darkSchemeQuery.addEventListener?.("change", ({ matches }) => {
      editorView.dispatch({
        effects: themeCompartment.reconfigure(
          darkSupported && matches ? darkTheme : lightTheme,
        ),
      })
    })

    function replaceText(text, userEvent) {
      editorView.dispatch({
        userEvent,
        changes: { from: 0, to: editorView.state.doc.length, insert: text },
      })
    }

    window.addEventListener("popstate", ({ state }) => {
      const text = normalizeToString(state.text)
      replaceText(text, "popstate")
    })
  }, [])

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
      editorView.dispatch({
        effects: inputModeCompartment.reconfigure(
          EditorView.contentAttributes.of({ inputmode: selectedItem }),
        ),
      })
    },
  })

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
      <div className="container" ref={containerRef}></div>
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
