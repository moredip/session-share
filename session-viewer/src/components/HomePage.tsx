export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full bg-gray-800 py-16 px-8 flex justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white max-w-3xl leading-tight">
          Publish your Claude Code sessions online in 5 seconds or less
        </h1>
      </div>

      <div className="w-full max-w-xl px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800">How?</h2>

        <div className="mt-6 space-y-6">
          <div className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-lg font-bold">
              1
            </span>
            <div className="text-gray-600">
              Install the Claude Code plugin:
              <pre className="mt-2 bg-gray-800 text-gray-100 px-4 py-3 rounded text-sm font-mono">
                {`/plugin marketplace add moredip/session-share
/plugin install session-share@session-share-marketplace`}
              </pre>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-lg font-bold">
              2
            </span>
            <div className="text-gray-600">
              Whenever you want to publish a session in Claude Code just call:
              <pre className="mt-2 bg-gray-800 text-gray-100 px-4 py-3 rounded text-sm font-mono">
                /publish-session
              </pre>
              and you'll get a shareable link instantly.
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">What's it look like?</h2>

          <p className="text-gray-600">
            <a href="/g/45fbc3aaf7337f4fa22d6440b9441ad0" className="text-blue-600 hover:underline">
              Here's
            </a>{' '}
            an example session.
          </p>
          <p className=" text-gray-600">
            <a href="/g/95599dbc3a863bd0febe19c323b8c24f" className="text-blue-600 hover:underline">
              Here's
            </a>{' '}
            another.
          </p>
        </div>
      </div>
    </div>
  )
}
