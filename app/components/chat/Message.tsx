export default function Message({text, user}:any){
  return (
    <div>
      <strong>{user}</strong>
      <p>{text}</p>
    </div>
  )
}