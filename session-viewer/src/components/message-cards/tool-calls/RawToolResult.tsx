import { useState } from 'react'
import { CodeBlock } from './CodeBlock'

interface RawToolResultProps {
  data: unknown
}

const linkClass = 'text-sm text-gray-500 hover:underline cursor-pointer'
const linkWrapperClass = 'mt-2 text-right'

export function RawToolResult({ data }: RawToolResultProps) {
  const [expanded, setExpanded] = useState(false)
  if (data === undefined) return null

  if (!expanded) {
    return (
      <div className={linkWrapperClass}>
        <a className={linkClass} onClick={() => setExpanded(true)}>
          show raw tool result
        </a>
      </div>
    )
  }

  return (
    <>
      <hr className="border-gray-200 my-2" />
      <div className="text-sm font-medium text-gray-600 mb-2">Raw Tool Result:</div>
      <CodeBlock>{JSON.stringify(data, null, 2)}</CodeBlock>
      <div className={linkWrapperClass}>
        <a className={linkClass} onClick={() => setExpanded(false)}>
          hide raw tool result
        </a>
      </div>
    </>
  )
}
