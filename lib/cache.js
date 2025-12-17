export let userCache = {}
export let chatCache = {}

export function loadCacheFromDB() {
  userCache = JSON.parse(JSON.stringify(global.db.data.users))
  chatCache = JSON.parse(JSON.stringify(global.db.data.chats))
}

export function mergeCacheToDB() {
  Object.assign(global.db.data.users, userCache)
  Object.assign(global.db.data.chats, chatCache)
}

export function clearCache() {
  userCache = {}
  chatCache = {}
}
