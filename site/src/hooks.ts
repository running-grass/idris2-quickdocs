import type { Handle } from "@sveltejs/kit"
import * as fs from "fs/promises"
import * as path from "path"

export const project_root = find_project_root()

// Workaround for https://github.com/sveltejs/kit/issues/4709
export const handle: Handle = async function({ event, resolve: res }) {
  const url_data_starts = event.url.pathname.indexOf("/data/")
  if (url_data_starts >= 0) {
    const relpath = event.url.pathname.slice(url_data_starts + "/data/".length)
    return new Response(await fs.readFile(path.join(await project_root, "../data", relpath)))
  }

  const response = await res(event)
  return response
}

async function find_project_root(): Promise<string> {
    let patha = path.resolve(".")
    while (!(await fs.readdir(patha)).indexOf("package.json")) {
        const pathb = path.join(patha, "..")
        if (pathb == patha) throw Error("Cannot find project root")
        patha = pathb
    }
    return patha
}
