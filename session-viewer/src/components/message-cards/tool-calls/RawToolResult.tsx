import { CodeBlock } from './CodeBlock'

interface RawToolResultProps {
  data: unknown
}

export function RawToolResult({ data }: RawToolResultProps) {
  if (data === undefined) return null

  return (
    <>
      <hr className="border-gray-200 my-2" />
      <div className="text-sm font-medium text-gray-600 mb-2">Raw Tool Result:</div>
      <CodeBlock>{JSON.stringify(data, null, 2)}</CodeBlock>
    </>
  )
}
