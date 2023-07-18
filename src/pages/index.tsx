import { useSession } from "next-auth/react"
import Header from "@/components/Header"
import AppBody from "@/components/AppBody"
import { useSSX } from "@spruceid/ssx-react"

export default function Home() {
  const { status } = useSession()
  const { ssxLoaded } = useSSX()

  return (
    <main className="h-screen flex flex-col">
      <Header />
      {status !== "authenticated" || !ssxLoaded ? (
        <>
          <img
            className="h-full"
            src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/61fd87cb-cd47-4284-8d35-4bc80ee150ef/d5ddfmb-a593ce36-9d3e-4ac2-96a2-1aa0f851b818.jpg/v1/fill/w_1192,h_670,q_75,strp/robot_face_by_spikesguitar2-d5ddfmb.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwic3ViIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl0sIm9iaiI6W1t7InBhdGgiOiIvZi82MWZkODdjYi1jZDQ3LTQyODQtOGQzNS00YmM4MGVlMTUwZWYvZDVkZGZtYi1hNTkzY2UzNi05ZDNlLTRhYzItOTZhMi0xYWEwZjg1MWI4MTguanBnIiwid2lkdGgiOiI8PTExOTIiLCJoZWlnaHQiOiI8PTY3MCJ9XV19.iGRjAXC41C1ZDJMRQD-7IpY0kKi2APBCLnjbKuAPT8Y"
            alt=""
          />
        </>
      ) : (
        <>
          <AppBody />
        </>
      )}
    </main>
  )
}
