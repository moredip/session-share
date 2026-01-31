interface RawToolResultProps {
  data: unknown
}

export function RawToolResult({ data }: RawToolResultProps) {
  if (data === undefined) return null

  return (
    <>
      <hr className="border-gray-200 my-2" />
      <div className="text-sm font-medium text-gray-600 mb-2">Raw Tool Result:</div>
      <pre className="text-xs bg-gray-50 p-3 overflow-x-auto border border-gray-200 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </>
  )
}
