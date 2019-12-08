import { useQuery } from 'graphql-hooks'
import useUser from './useUser'

const GET_USER_CHATS_QUERY = `
query GetUserChats($id: uuid!){
  users_by_pk(id: $id) {
    chats {
      chat {
        id
        name
      }
    }
  }
}
`

export default function useChats() {
  const user = useUser()
  return useQuery(GET_USER_CHATS_QUERY, {
    variables: {
      id: user ? user.id : ''
    }
  })
}