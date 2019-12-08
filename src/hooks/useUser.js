export default function useUser() {
  return JSON.parse(localStorage.getItem("chat-app-user"))
}